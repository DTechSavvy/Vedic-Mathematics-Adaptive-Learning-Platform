import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MasteryService, TopicMasteryDetails, SutraMasteryDetails } from './mastery.service';
import { PracticeDifficultyService, DifficultyAccessStatus } from '../question/practice-difficulty.service';
import { WisdomTreeService } from '../gamification/wisdom-tree.service';
import { GoalsService } from '../gamification/goals.service';
import { RewardsShopService } from '../gamification/rewards-shop.service';

export interface AuthoritativeLearningState {
  user: {
    id: number;
    name: string;
    email: string;
    xp: number;
    level: number;
    streak: number;
    coins: number;
    stars: number;
    wisdomStones: number;
    learningLevel: string;
  };
  summary: {
    totalTopicsCount: number;
    masteredTopicsCount: number;
    totalSutrasCount: number;
    masteredSutrasCount: number;
    averageMastery: number;
    totalPracticeAttempts: number;
    totalCorrectAttempts: number;
    overallAccuracy: number;
  };
  topics: TopicMasteryDetails[];
  sutras: SutraMasteryDetails[];
  difficultyAccess: DifficultyAccessStatus;
  wisdomTree: any;
  dailyGoals: any[];
  weeklyMissions: any[];
  entitlements: Record<string, { balance: number; activeUntil: string | null; isActive: boolean }>;
  recommendation: {
    recommendedTopicId?: number;
    recommendedTopicTitle?: string;
    action: string;
    reason: string;
  };
}

@Injectable()
export class LearningStateService {
  private readonly logger = new Logger(LearningStateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly masteryService: MasteryService,
    private readonly practiceDifficultyService: PracticeDifficultyService,
    private readonly wisdomTreeService: WisdomTreeService,
    private readonly goalsService: GoalsService,
    private readonly rewardsShopService: RewardsShopService,
  ) {}

  /**
   * Derives the single, authoritative learning state for a learner across all dimensions.
   */
  async getAuthoritativeState(userId: number): Promise<AuthoritativeLearningState> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true,
        streak: true,
        lastActiveDate: true,
        coins: true,
        stars: true,
        wisdomStones: true,
        learningLevel: true,
      },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Real-time Streak Evaluation:
    // If user missed 1 or more continuous days, streak MUST become 0 in real time!
    let effectiveStreak = user.streak || 0;
    if (user.lastActiveDate && effectiveStreak > 0) {
      const lastDate = new Date(user.lastActiveDate);
      const getUtcMidnight = (d: Date) =>
        Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      const now = new Date();
      const diffDays = Math.round(
        (getUtcMidnight(now) - getUtcMidnight(lastDate)) / (1000 * 60 * 60 * 24),
      );

      if (diffDays > 1) {
        // Missed one or more days in continuous flow -> reset streak to 0
        effectiveStreak = 0;
        await this.prisma.user.update({
          where: { id: userId },
          data: { streak: 0 },
        });
        user.streak = 0;
        this.logger.log(
          `User #${userId} missed consecutive days (${diffDays} days passed). Streak reset to 0.`,
        );
      }
    }

    // Concurrent authoritative computation
    const [topics, sutras, difficultyAccess, wisdomTree, dailyGoals, weeklyMissions, entitlements] =
      await Promise.all([
        this.masteryService.getAllTopicsMastery(userId),
        this.masteryService.getAllSutrasMastery(userId),
        this.practiceDifficultyService.getDifficultyAccess(userId),
        this.wisdomTreeService.getWisdomTreeForUser(userId),
        this.goalsService.getDailyGoals(userId),
        this.goalsService.getWeeklyMissions(userId),
        this.rewardsShopService.getUserEntitlements(userId),
      ]);

    const totalTopicsCount = topics.length;
    const masteredTopicsCount = topics.filter((t) => t.isMastered).length;
    const totalSutrasCount = sutras.length;
    const masteredSutrasCount = sutras.filter((s) => s.isMastered).length;

    const totalPracticeAttempts = topics.reduce((sum, t) => sum + t.validPracticeCount, 0);
    const totalCorrectAttempts = topics.reduce((sum, t) => sum + t.correctAttempts, 0);
    const overallAccuracy =
      totalPracticeAttempts === 0
        ? 0
        : Number(((totalCorrectAttempts / totalPracticeAttempts) * 100).toFixed(1));

    const averageMastery =
      totalTopicsCount === 0
        ? 0
        : Math.round(topics.reduce((sum, t) => sum + t.masteryScore, 0) / totalTopicsCount);

    // Pedagogical Recommendation:
    // Priority 1: Unfinished started content
    // Priority 2: Developing topic with practice < 50
    // Priority 3: Low accuracy topic
    // Priority 4: First unmastered topic
    let recommendedTopic = topics.find((t) => t.status === 'LEARNING');
    let recommendationReason = 'Complete lesson content to unlock rigorous practice.';

    if (!recommendedTopic) {
      recommendedTopic = topics.find((t) => t.status === 'PRACTICING');
      recommendationReason = 'Satisfy practice volume requirements towards mastery.';
    }
    if (!recommendedTopic) {
      recommendedTopic = topics.find((t) => t.status === 'DEVELOPING');
      recommendationReason = 'Refine accuracy and tier coverage to fulfill hard mastery gates.';
    }
    if (!recommendedTopic) {
      recommendedTopic = topics.find((t) => !t.isMastered);
      recommendationReason = 'Begin studying foundational concepts for this topic.';
    }
    if (!recommendedTopic && topics.length > 0) {
      recommendedTopic = topics[0];
      recommendationReason = 'All topics mastered! Maintain mental acuity with review sets.';
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        coins: user.coins,
        stars: user.stars,
        wisdomStones: user.wisdomStones,
        learningLevel: user.learningLevel,
      },
      summary: {
        totalTopicsCount,
        masteredTopicsCount,
        totalSutrasCount,
        masteredSutrasCount,
        averageMastery,
        totalPracticeAttempts,
        totalCorrectAttempts,
        overallAccuracy,
      },
      topics,
      sutras,
      difficultyAccess,
      wisdomTree,
      dailyGoals,
      weeklyMissions,
      entitlements,
      recommendation: {
        recommendedTopicId: recommendedTopic?.topicId,
        recommendedTopicTitle: recommendedTopic?.topicTitle,
        action: recommendedTopic?.recommendedAction || 'Continue your Vedic journey.',
        reason: recommendationReason,
      },
    };
  }

  /**
   * Aggregated payload specifically optimized for the main Dashboard.
   */
  async getDashboardOverview(userId: number) {
    const state = await this.getAuthoritativeState(userId);
    return {
      profile: {
        id: state.user.id,
        name: state.user.name,
        email: state.user.email,
        xp: state.user.xp,
        level: state.user.level,
        streak: state.user.streak,
        coins: state.user.coins,
        stars: state.user.stars,
        wisdomStones: state.user.wisdomStones,
        learningLevel: state.user.learningLevel,
      },
      stats: {
        totalQuestions: state.summary.totalPracticeAttempts,
        correctAnswers: state.summary.totalCorrectAttempts,
        accuracy: state.summary.overallAccuracy,
        studyTimeMinutes: Math.round(state.summary.totalPracticeAttempts * 1.5),
        canonicalTopicsCount: state.summary.totalTopicsCount,
        masteredTopicsCount: state.summary.masteredTopicsCount,
        canonicalSutrasCount: state.summary.totalSutrasCount,
        masteredSutrasCount: state.summary.masteredSutrasCount,
        averageMastery: state.summary.averageMastery,
      },
      recentTopics: state.topics.slice(0, 6),
      sutras: state.sutras,
      difficultyAccess: state.difficultyAccess,
      dailyGoals: state.dailyGoals,
      weeklyMissions: state.weeklyMissions,
      wisdomTree: state.wisdomTree,
      recommendation: state.recommendation,
    };
  }

  /**
   * Aggregated payload for the Progress page.
   */
  async getProgressOverview(userId: number) {
    const state = await this.getAuthoritativeState(userId);
    return {
      summary: state.summary,
      topics: state.topics,
      sutras: state.sutras,
      difficultyAccess: state.difficultyAccess,
      wisdomTree: state.wisdomTree,
      recommendation: state.recommendation,
    };
  }
}
