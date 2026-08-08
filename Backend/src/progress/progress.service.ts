import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async getUserProgress(userId: number) {
    const attempts =
      await this.prisma.questionAttempt.findMany({
        where: {
          userId,
        },
      });

    const totalQuestions =
      attempts.length;

    const correctAnswers =
      attempts.filter(
        (attempt) => attempt.isCorrect,
      ).length;

    const wrongAnswers =
      totalQuestions - correctAnswers;

    const accuracy =
      totalQuestions === 0
        ? 0
        : Number(
            (
              (correctAnswers /
                totalQuestions) *
              100
            ).toFixed(2),
          );

    return {
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      accuracy,
    };
  }
  async getTopicProgress(userId: number) {
  const progress =
    await this.prisma.userProgress.findMany({
      where: {
        userId,
      },
      include: {
        topic: true,
      },
    });

  return progress.map((item) => ({
    topic: item.topic.title,
    mastery: item.mastery,
    completed: item.completed,
  }));
 }
 async getRecommendation(userId: number) {
  const progress =
    await this.prisma.userProgress.findMany({
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
      recommendation:
        'Start learning Introduction to Vedic Mathematics.',
    };
  }

  const weakestTopic = progress[0];

  return {
    weakTopic:
      weakestTopic.topic.title,

    mastery:
      weakestTopic.mastery,

    recommendation:
      `Practice ${weakestTopic.topic.title} before moving forward.`,
  };
 }
 async getSpeedAnalytics(userId: number) {
  const attempts =
    await this.prisma.questionAttempt.findMany({
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
      fastestTime: 0,
      slowestTime: 0,
      totalAttempts: 0,
    };
  }

  const times =
    attempts.map(
      (attempt) => attempt.timeTakenSeconds ?? 0,
    );

  const averageTime =
    Math.round(
      times.reduce(
        (sum, time) => sum + time,
        0,
      ) / times.length,
    );

  const fastestTime =
    Math.min(...times);

  const slowestTime =
    Math.max(...times);

  return {
    averageTime,
    fastestTime,
    slowestTime,
    totalAttempts: attempts.length,
  };
 }
 async getSpeedImprovement(userId: number) {
  const attempts =
    await this.prisma.questionAttempt.findMany({
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
      message:
        'At least 10 attempts required for speed analysis.',
    };
  }

  const firstFive =
    attempts.slice(0, 5);

  const lastFive =
    attempts.slice(-5);

  const firstAverage =
    firstFive.reduce(
      (sum, attempt) =>
        sum + (attempt.timeTakenSeconds ?? 0),
      0,
    ) / firstFive.length;

  const lastAverage =
    lastFive.reduce(
      (sum, attempt) =>
        sum + (attempt.timeTakenSeconds ?? 0),
      0,
    ) / lastFive.length;

  const improvement =
    (
      ((firstAverage - lastAverage) /
        firstAverage) *
      100
    ).toFixed(2);

  return {
    firstAverage:
      Number(firstAverage.toFixed(2)),
    lastAverage:
      Number(lastAverage.toFixed(2)),
    improvementPercent:
      Number(improvement),
  };
 }
 async getTopicAnalytics(userId: number) {
  const attempts =
    await this.prisma.questionAttempt.findMany({
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

  const analyticsMap = new Map();

  for (const attempt of attempts) {
    const topic = attempt.template.topic;

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

    const data =
      analyticsMap.get(topic.id);

    data.questionsSolved++;

    if (attempt.isCorrect) {
      data.correctAnswers++;
    }

    if (attempt.timeTakenSeconds !== null) {
      data.totalTime +=
        attempt.timeTakenSeconds;

      data.timedAttempts++;
    }
  }

  return Array.from(
    analyticsMap.values(),
  ).map((topic) => {
    const accuracy =
      topic.questionsSolved > 0
        ? Math.round(
            (topic.correctAnswers /
              topic.questionsSolved) *
              100,
          )
        : 0;

    const averageTime =
      topic.timedAttempts > 0
        ? Math.round(
            topic.totalTime /
              topic.timedAttempts,
          )
        : 0;

    return {
      topicId: topic.topicId,
      topic: topic.topic,
      questionsSolved:
        topic.questionsSolved,
      correctAnswers:
        topic.correctAnswers,
      accuracy,
      averageTime,
    };
  });
 }
 async getMentalAgility(userId: number) {
  const attempts =
    await this.prisma.questionAttempt.findMany({
      where: {
        userId,
      },
    });

  if (attempts.length === 0) {
    return {
      mentalAgilityScore: 0,
    };
  }

  const correctAnswers =
    attempts.filter(
      (attempt) => attempt.isCorrect,
    ).length;

  const accuracy =
    (correctAnswers /
      attempts.length) *
    100;

  const timedAttempts =
    attempts.filter(
      (attempt) =>
        attempt.timeTakenSeconds !== null,
    );

  const averageTime =
    timedAttempts.length > 0
      ? timedAttempts.reduce(
          (sum, attempt) =>
            sum +
            (attempt.timeTakenSeconds ?? 0),
          0,
        ) / timedAttempts.length
      : 100;

  const speedScore =
    Math.max(
      0,
      100 - averageTime,
    );

  const mentalAgilityScore =
    Math.round(
      accuracy * 0.7 +
        speedScore * 0.3,
    );

  return {
    accuracy:
      Number(
        accuracy.toFixed(2),
      ),
    averageTime:
      Number(
        averageTime.toFixed(2),
      ),
    speedScore:
      Number(
        speedScore.toFixed(2),
      ),
    mentalAgilityScore,
  };
 }
}