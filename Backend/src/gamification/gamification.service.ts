import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RewardEvaluationResult {
  earnedXP: number;
  earnedCoins: number;
  earnedStars: number;
  earnedStones: number;
  speedBonus: number;
  streakBonusCoins: number;
  streakBonusXP: number;
  isDuplicateQuestion: boolean;
  isDiminishedReward: boolean;
  milestoneRewards: Array<{
    type: string;
    description: string;
    coins: number;
    stars: number;
    stones: number;
  }>;
  totalCoins: number;
  totalStars: number;
  totalStones: number;
  totalXP: number;
  level: number;
  streak: number;
}

export interface PracticeRewardOptions {
  userId: number;
  isCorrect: boolean;
  difficulty: string;
  timeTakenSeconds: number;
  isDuplicateQuestion?: boolean;
}

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Evaluates practice rewards with strict anti-farming policies.
   */
  async evaluatePracticeRewards(
    userIdOrOptions: number | PracticeRewardOptions,
    isCorrectArg?: boolean,
    difficultyArg?: string,
    timeTakenSecondsArg?: number,
    isDuplicateQuestionArg?: boolean,
  ): Promise<RewardEvaluationResult> {
    const opts: PracticeRewardOptions =
      typeof userIdOrOptions === 'object'
        ? userIdOrOptions
        : {
            userId: userIdOrOptions,
            isCorrect: !!isCorrectArg,
            difficulty: difficultyArg || 'EASY',
            timeTakenSeconds: timeTakenSecondsArg || 10,
            isDuplicateQuestion: !!isDuplicateQuestionArg,
          };

    const { userId, isCorrect, difficulty, timeTakenSeconds } = opts;
    const isDuplicateQuestion = !!opts.isDuplicateQuestion;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    // 1. Anti-Farming: Check for identical question re-submission
    if (isDuplicateQuestion) {
      this.logger.warn(`User ${userId} attempted duplicate question submission; granting 0 rewards.`);
      return {
        earnedXP: 0,
        earnedCoins: 0,
        earnedStars: 0,
        earnedStones: 0,
        speedBonus: 0,
        streakBonusCoins: 0,
        streakBonusXP: 0,
        isDuplicateQuestion: true,
        isDiminishedReward: true,
        milestoneRewards: [],
        totalCoins: user.coins,
        totalStars: user.stars,
        totalStones: user.wisdomStones,
        totalXP: user.xp,
        level: user.level,
        streak: user.streak,
      };
    }

    // 2. Base XP and Coin Calculation by Difficulty Tier
    let baseXP = 0;
    let baseCoins = 0;

    if (isCorrect) {
      switch (difficulty) {
        case 'EXPERT':
          baseXP = 40;
          baseCoins = 10;
          break;
        case 'ADVANCED':
        case 'HARD':
          baseXP = 25;
          baseCoins = 7;
          break;
        case 'MEDIUM':
          baseXP = 15;
          baseCoins = 4;
          break;
        case 'EASY':
        default:
          baseXP = 10;
          baseCoins = 2;
          break;
      }
    } else {
      // Meaningful participation XP only, no coins
      baseXP = 2;
      baseCoins = 0;
    }

    // 3. Anti-Farming: Diminishing returns on excessive Easy problems
    let isDiminishedReward = false;
    if (isCorrect && difficulty === 'EASY') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayEasyCount = await this.prisma.questionAttempt.count({
        where: {
          userId,
          isCorrect: true,
          createdAt: { gte: today },
          template: { difficulty: 'EASY' },
        },
      });

      if (todayEasyCount > 30) {
        baseCoins = 0; // capped out for easy farming
        baseXP = Math.max(1, Math.floor(baseXP * 0.2));
        isDiminishedReward = true;
      } else if (todayEasyCount > 20) {
        baseCoins = 1; // diminished returns
        baseXP = Math.max(5, Math.floor(baseXP * 0.5));
        isDiminishedReward = true;
      }
    }

    // 4. Anti-Bot / Speed Bonus Guard: Answers under 1.5s receive no speed bonus or speed coin
    let speedBonus = 0;
    if (isCorrect && timeTakenSeconds >= 2 && timeTakenSeconds <= 12) {
      speedBonus = 5;
    }

    const earnedXP = baseXP + speedBonus;
    let earnedCoins = baseCoins;
    let earnedStars = 0;
    let earnedStones = 0;
    const milestoneRewards: RewardEvaluationResult['milestoneRewards'] = [];

    // 5. Calendar-day Streak Evaluation & Bonus Coins
    const now = new Date();
    let updatedStreak = user.streak || 0;
    let streakBonusCoins = 0;

    if (user.lastActiveDate) {
      const lastDate = new Date(user.lastActiveDate);
      const getUtcMidnight = (d: Date) =>
        Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      const diffDays = Math.round(
        (getUtcMidnight(now) - getUtcMidnight(lastDate)) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 1) {
        updatedStreak += 1;
        // Check milestone streak rewards
        streakBonusCoins = this.getStreakMilestoneCoins(updatedStreak);
      } else if (diffDays > 1) {
        updatedStreak = 1;
      }
      // diffDays === 0: streak remains same for today
    } else {
      updatedStreak = 1;
    }

    earnedCoins += streakBonusCoins;

    // 6. Persist CoinTransaction audit record if coins earned
    if (earnedCoins > 0) {
      await this.prisma.coinTransaction.create({
        data: {
          userId,
          amount: earnedCoins,
          type: 'EARN',
          source: streakBonusCoins > 0 ? 'STREAK_AND_PRACTICE' : 'PRACTICE_CORRECT',
          referenceId: `practice-${now.getTime()}`,
        },
      });
    }

    // 7. Update User balances atomically
    const newXP = user.xp + earnedXP;
    const newCoins = user.coins + earnedCoins;
    const newStars = user.stars + earnedStars;
    const newStones = user.wisdomStones + earnedStones;
    const newLevel = Math.floor(newXP / 100) + 1;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXP,
        coins: newCoins,
        stars: newStars,
        wisdomStones: newStones,
        level: newLevel,
        streak: updatedStreak,
        lastActiveDate: now,
      },
    });

    return {
      earnedXP,
      earnedCoins,
      earnedStars,
      earnedStones,
      speedBonus,
      streakBonusCoins,
      streakBonusXP: 0,
      isDuplicateQuestion: false,
      isDiminishedReward,
      milestoneRewards,
      totalCoins: newCoins,
      totalStars: newStars,
      totalStones: newStones,
      totalXP: newXP,
      level: newLevel,
      streak: updatedStreak,
    };
  }

  /**
   * Universal milestone reward helper for Topic or Sutra mastery.
   */
  async awardMasteryMilestone(
    userId: number,
    type: 'TOPIC' | 'SUTRA',
    identifier: number | string,
    name?: string,
  ) {
    if (type === 'TOPIC') {
      return this.awardTopicMasteryMilestone(userId, Number(identifier));
    } else {
      return this.awardSutraMasteryMilestone(userId, String(identifier));
    }
  }

  /**
   * One-time milestone reward for mastering a Topic.
   */
  async awardTopicMasteryMilestone(userId: number, topicId: number) {
    const existing = await this.prisma.coinTransaction.findFirst({
      where: {
        userId,
        source: 'TOPIC_MASTERED',
        referenceId: `topic-${topicId}`,
      },
    });

    if (existing) return; // Idempotent: already claimed

    const rewardCoins = 50;
    const rewardStars = 1;
    const rewardStones = 1;

    await this.prisma.$transaction([
      this.prisma.coinTransaction.create({
        data: {
          userId,
          amount: rewardCoins,
          type: 'BONUS',
          source: 'TOPIC_MASTERED',
          referenceId: `topic-${topicId}`,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          coins: { increment: rewardCoins },
          stars: { increment: rewardStars },
          wisdomStones: { increment: rewardStones },
        },
      }),
    ]);

    this.logger.log(`Awarded Topic Mastery Milestone to User ${userId} for Topic ${topicId}`);
  }

  /**
   * One-time milestone reward for mastering a Sutra.
   */
  async awardSutraMasteryMilestone(userId: number, sutraId: string) {
    const existing = await this.prisma.coinTransaction.findFirst({
      where: {
        userId,
        source: 'SUTRA_MASTERED',
        referenceId: `sutra-${sutraId}`,
      },
    });

    if (existing) return;

    const rewardCoins = 75;
    const rewardStars = 1;
    const rewardStones = 1;

    await this.prisma.$transaction([
      this.prisma.coinTransaction.create({
        data: {
          userId,
          amount: rewardCoins,
          type: 'BONUS',
          source: 'SUTRA_MASTERED',
          referenceId: `sutra-${sutraId}`,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          coins: { increment: rewardCoins },
          stars: { increment: rewardStars },
          wisdomStones: { increment: rewardStones },
        },
      }),
    ]);

    this.logger.log(`Awarded Sutra Mastery Milestone to User ${userId} for Sutra ${sutraId}`);
  }

  /**
   * Awards coins for studying curriculum lessons.
   */
  async awardLessonStudyReward(userId: number, lessonId: number, type: 'SECTION' | 'FULL_LESSON') {
    const source = type === 'FULL_LESSON' ? 'LESSON_COMPLETED' : 'LESSON_SECTION';
    const amount = type === 'FULL_LESSON' ? 15 : 5;
    const refId = `lesson-${lessonId}-${type}`;

    const existing = await this.prisma.coinTransaction.findFirst({
      where: { userId, source, referenceId: refId },
    });

    if (existing) return; // One-time per lesson/section

    await this.prisma.$transaction([
      this.prisma.coinTransaction.create({
        data: {
          userId,
          amount,
          type: 'EARN',
          source,
          referenceId: refId,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          coins: { increment: amount },
        },
      }),
    ]);
  }

  private getStreakMilestoneCoins(streak: number): number {
    switch (streak) {
      case 3:
        return 10;
      case 7:
        return 25;
      case 14:
        return 50;
      case 30:
        return 100;
      case 60:
        return 200;
      case 100:
        return 500;
      default:
        return 5; // Daily active practice bonus
    }
  }
}
