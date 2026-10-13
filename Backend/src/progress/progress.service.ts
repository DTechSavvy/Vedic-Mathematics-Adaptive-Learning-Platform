import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PracticeDifficultyService } from '../question/practice-difficulty.service';
import { sutraPracticeMappings } from '../question/sutra-practice';
import { MasteryService } from './mastery.service';

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly practiceDifficultyService: PracticeDifficultyService,
    private readonly masteryService: MasteryService,
  ) {}

  async getUserProgress(userId: number) {
    const attempts = await this.prisma.questionAttempt.findMany({
      where: {
        userId,
      },
    });

    const totalQuestions = attempts.length;

    const correctAnswers = attempts.filter(
      (attempt) => attempt.isCorrect,
    ).length;

    const wrongAnswers = totalQuestions - correctAnswers;

    const accuracy =
      totalQuestions === 0
        ? 0
        : Number(((correctAnswers / totalQuestions) * 100).toFixed(2));

    return {
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      accuracy,
    };
  }

  async getTopicProgress(userId: number) {
    const masteries = await this.masteryService.getAllTopicsMastery(userId);
    return masteries.map((m) => ({
      topicId: m.topicId,
      topic: m.topicTitle,
      courseTitle: m.courseTitle,
      mastery: m.masteryScore,
      completed: m.isMastered,
      status: m.status,
      contentCompletion: m.contentCompletion,
      contentStatus: m.contentStatus,
      validPracticeCount: m.validPracticeCount,
      totalAttempts: m.totalAttempts,
      correctAttempts: m.correctAttempts,
      accuracy: m.accuracy,
      recentAccuracy: m.recentAccuracy,
      difficultyCoverage: m.difficultyCoverage,
      isMastered: m.isMastered,
      recommendedAction: m.recommendedAction,
    }));
  }

  async getRecommendation(userId: number) {
    const progress = await this.prisma.userProgress.findMany({
      where: {
        userId,
      },
      include: {
        topic: true,
      },
      orderBy: {
        mastery: 'asc',
      },
    });

    if (progress.length === 0) {
      return {
        recommendation: 'Start learning Introduction to Vedic Mathematics.',
      };
    }

    const weakestTopic = progress[0];

    return {
      weakTopic: weakestTopic.topic.title,
      mastery: weakestTopic.mastery,
      recommendation: `Practice ${weakestTopic.topic.title} before moving forward.`,
    };
  }

  async getSpeedAnalytics(userId: number) {
    const attempts = await this.prisma.questionAttempt.findMany({
      where: {
        userId,
        timeTakenSeconds: {
          not: null,
        },
      },
    });

    if (attempts.length === 0) {
      return {
        averageTime: 0,
        averageSpeedSeconds: 0,
        fastestTime: 0,
        slowestTime: 0,
        totalAttempts: 0,
      };
    }

    const times = attempts.map((attempt) => attempt.timeTakenSeconds ?? 0);

    const averageTime = Math.round(
      times.reduce((sum, time) => sum + time, 0) / times.length,
    );

    const fastestTime = Math.min(...times);
    const slowestTime = Math.max(...times);

    return {
      averageTime,
      averageSpeedSeconds: averageTime, // For frontend compatibility
      fastestTime,
      slowestTime,
      totalAttempts: attempts.length,
    };
  }

  async getSpeedImprovement(userId: number) {
    const attempts = await this.prisma.questionAttempt.findMany({
      where: {
        userId,
        timeTakenSeconds: {
          not: null,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (attempts.length < 10) {
      return {
        message: 'At least 10 attempts required for speed analysis.',
      };
    }

    const firstFive = attempts.slice(0, 5);
    const lastFive = attempts.slice(-5);

    const firstAverage =
      firstFive.reduce(
        (sum, attempt) => sum + (attempt.timeTakenSeconds ?? 0),
        0,
      ) / firstFive.length;

    const lastAverage =
      lastFive.reduce(
        (sum, attempt) => sum + (attempt.timeTakenSeconds ?? 0),
        0,
      ) / lastFive.length;

    const improvement = (
      ((firstAverage - lastAverage) / firstAverage) *
      100
    ).toFixed(2);

    return {
      firstAverage: Number(firstAverage.toFixed(2)),
      lastAverage: Number(lastAverage.toFixed(2)),
      improvementPercent: Number(improvement),
    };
  }

  async getTopicAnalytics(userId: number) {
    const attempts = await this.prisma.questionAttempt.findMany({
      where: {
        userId,
      },
      include: {
        template: {
          include: {
            topic: true,
          },
        },
      },
    });

    interface TopicAnalyticsRecord {
      topicId: number;
      topic: string;
      questionsSolved: number;
      correctAnswers: number;
      totalTime: number;
      timedAttempts: number;
    }

    const analyticsMap = new Map<number, TopicAnalyticsRecord>();

    for (const attempt of attempts) {
      const topic = attempt.template?.topic;
      if (!topic) continue;

      if (!analyticsMap.has(topic.id)) {
        analyticsMap.set(topic.id, {
          topicId: topic.id,
          topic: topic.title,
          questionsSolved: 0,
          correctAnswers: 0,
          totalTime: 0,
          timedAttempts: 0,
        });
      }

      const data = analyticsMap.get(topic.id);
      if (!data) continue;

      data.questionsSolved++;

      if (attempt.isCorrect) {
        data.correctAnswers++;
      }

      if (attempt.timeTakenSeconds !== null) {
        data.totalTime += attempt.timeTakenSeconds;
        data.timedAttempts++;
      }
    }

    return Array.from(analyticsMap.values()).map((topic) => {
      const accuracy =
        topic.questionsSolved > 0
          ? Math.round((topic.correctAnswers / topic.questionsSolved) * 100)
          : 0;

      const averageTime =
        topic.timedAttempts > 0
          ? Math.round(topic.totalTime / topic.timedAttempts)
          : 0;

      return {
        topicId: topic.topicId,
        topic: topic.topic,
        questionsSolved: topic.questionsSolved,
        correctAnswers: topic.correctAnswers,
        accuracy,
        averageTime,
      };
    });
  }

  async getMentalAgility(userId: number) {
    const attempts = await this.prisma.questionAttempt.findMany({
      where: {
        userId,
      },
    });

    if (attempts.length === 0) {
      return {
        score: 0,
        mentalAgilityScore: 0,
        accuracy: 0,
        averageTime: 0,
        averageSpeedSeconds: 0,
        speedScore: 0,
      };
    }

    const correctAnswers = attempts.filter(
      (attempt) => attempt.isCorrect,
    ).length;

    const accuracy = (correctAnswers / attempts.length) * 100;

    const timedAttempts = attempts.filter(
      (attempt) => attempt.timeTakenSeconds !== null,
    );

    const averageTime =
      timedAttempts.length > 0
        ? timedAttempts.reduce(
            (sum, attempt) => sum + (attempt.timeTakenSeconds ?? 0),
            0,
          ) / timedAttempts.length
        : 100;

    const speedScore = Math.max(0, 100 - averageTime);

    const mentalAgilityScore = Math.round(accuracy * 0.7 + speedScore * 0.3);

    return {
      accuracy: Number(accuracy.toFixed(2)),
      averageTime: Number(averageTime.toFixed(2)),
      averageSpeedSeconds: Number(averageTime.toFixed(2)),
      speedScore: Number(speedScore.toFixed(2)),
      mentalAgilityScore,
      score: mentalAgilityScore, // For frontend compatibility
    };
  }

  async getSutraProgress(userId: number) {
    const sutraMasteries =
      await this.masteryService.getAllSutrasMastery(userId);
    return sutraMasteries.map((s) => ({
      sutraId: s.sutraId,
      sutraName: s.sutraName,
      sanskritName: s.sanskritName,
      englishMeaning: s.englishMeaning,
      attemptsCount: s.totalAttempts,
      correctCount: s.correctAttempts,
      accuracy: s.accuracy,
      recentAccuracy: s.recentAccuracy,
      mastery: s.masteryScore,
      status: s.status,
      isMastered: s.isMastered,
      difficultyCoverage: s.difficultyCoverage,
      recommendedAction: s.recommendedAction,
    }));
  }

  async getDifficultyProgress(userId: number) {
    const attempts = await this.prisma.questionAttempt.findMany({
      where: { userId },
      include: {
        template: true,
      },
    });

    const difficultyAccess =
      await this.practiceDifficultyService.getDifficultyAccess(userId);

    const tiers = ['EASY', 'MEDIUM', 'ADVANCED', 'EXPERT'] as const;

    const result: Record<string, unknown> = {};

    for (const tier of tiers) {
      const tierAttempts = attempts.filter((att) => {
        const tDiff = att.template?.difficulty;
        if (tier === 'EASY' && tDiff === 'EASY') return true;
        if (tier === 'MEDIUM' && tDiff === 'MEDIUM') return true;
        if ((tier === 'ADVANCED' || tier === 'EXPERT') && tDiff === 'HARD')
          return true;
        return false;
      });

      const totalAttempts = tierAttempts.length;
      const correctAttempts = tierAttempts.filter((a) => a.isCorrect).length;
      const accuracy =
        totalAttempts === 0
          ? 0
          : Math.round((correctAttempts / totalAttempts) * 100);

      const accessItem = difficultyAccess.access.find(
        (a) => a.difficulty === tier,
      );

      result[tier] = {
        difficulty: tier,
        totalAttempts,
        correctAttempts,
        accuracy,
        unlocked: accessItem ? accessItem.unlocked : false,
        available: accessItem ? accessItem.available : false,
        reason: accessItem ? accessItem.reason : undefined,
      };
    }

    return result;
  }

  async getOverview(userId: number) {
    const overview = await this.getUserProgress(userId);
    const topics = await this.getTopicProgress(userId);
    const sutras = await this.getSutraProgress(userId);
    const difficulty = await this.getDifficultyProgress(userId);
    const speed = await this.getSpeedAnalytics(userId);
    const mentalAgility = await this.getMentalAgility(userId);
    const recommendation = await this.getRecommendation(userId);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true,
        streak: true,
        coins: true,
        stars: true,
        wisdomStones: true,
      },
    });

    return {
      user,
      overview,
      recommendation,
      topics: {
        total: topics.length,
        mastered: topics.filter((t) => t.isMastered).length,
        developing: topics.filter((t) => t.status === 'DEVELOPING').length,
        practicing: topics.filter((t) => t.status === 'PRACTICING').length,
        items: topics,
      },
      sutras: {
        total: sutras.length,
        mastered: sutras.filter((s) => s.isMastered).length,
        items: sutras,
      },
      difficulty,
      speed,
      mentalAgility,
    };
  }
}
