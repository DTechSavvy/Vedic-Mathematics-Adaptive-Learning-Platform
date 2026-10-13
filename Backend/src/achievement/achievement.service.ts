import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CANONICAL_ACHIEVEMENTS } from './achievements.data';

export interface UserAchievementView {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  rarity: string;
  targetValue: number;
  currentValue: number;
  progressPercentage: number;
  unlocked: boolean;
  earnedAt?: string | null;
  rewardXp: number;
  rewardCoins: number;
  rewardStars: number;
  rewardStones: number;
}

@Injectable()
export class AchievementService {
  private readonly logger = new Logger(AchievementService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves all 100 achievements with current user's progress and unlock state.
   */
  async getAchievementsForUser(userId: number): Promise<UserAchievementView[]> {
    const definitions = await this.prisma.achievementDefinition.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    const userAchievements = await this.prisma.achievement.findMany({
      where: { userId },
    });

    const userMap = new Map(userAchievements.map((ua) => [ua.title, ua]));
    const idMap = new Map(
      userAchievements.filter((ua) => ua.achievementId).map((ua) => [ua.achievementId!, ua]),
    );

    // Compute live user stats for progress percentage
    const stats = await this.getUserProgressStats(userId);

    return definitions.map((def) => {
      const record = idMap.get(def.id) || userMap.get(def.title);
      const isUnlocked = record ? record.isCompleted || !!record.earnedAt : false;

      const currentVal = this.computeMetricValueForAchievement(def.id, stats);
      const progressPercentage = isUnlocked
        ? 100
        : Math.min(100, Math.round((currentVal / def.targetValue) * 100));

      return {
        id: def.id,
        title: def.title,
        description: def.description,
        category: def.category,
        icon: def.icon,
        rarity: def.rarity,
        targetValue: def.targetValue,
        currentValue: currentVal,
        progressPercentage,
        unlocked: isUnlocked,
        earnedAt: record?.earnedAt ? record.earnedAt.toISOString() : null,
        rewardXp: def.rewardXp,
        rewardCoins: def.rewardCoins,
        rewardStars: def.rewardStars,
        rewardStones: def.rewardStones,
      };
    });
  }

  /**
   * Evaluates all 100 achievements idempotently after a learning event.
   * Unlocks newly completed achievements and awards their rewards.
   */
  async evaluateAchievements(userId: number): Promise<string[]> {
    const stats = await this.getUserProgressStats(userId);
    const definitions = await this.prisma.achievementDefinition.findMany({
      where: { isActive: true },
    });

    const userAchievements = await this.prisma.achievement.findMany({
      where: { userId },
    });

    const unlockedTitles = new Set(
      userAchievements.filter((a) => a.isCompleted || !!a.earnedAt).map((a) => a.title),
    );
    const unlockedIds = new Set(
      userAchievements.filter((a) => (a.isCompleted || !!a.earnedAt) && a.achievementId).map((a) => a.achievementId!),
    );

    const newlyUnlocked: string[] = [];

    for (const def of definitions) {
      if (unlockedIds.has(def.id) || unlockedTitles.has(def.title)) {
        continue; // Already unlocked idempotently
      }

      const currentVal = this.computeMetricValueForAchievement(def.id, stats);
      if (currentVal >= def.targetValue) {
        // Unlock achievement!
        await this.prisma.$transaction(async (tx) => {
          await tx.achievement.upsert({
            where: {
              userId_title: {
                userId,
                title: def.title,
              },
            },
            update: {
              achievementId: def.id,
              description: def.description,
              isCompleted: true,
              progress: def.targetValue,
            },
            create: {
              userId,
              achievementId: def.id,
              title: def.title,
              description: def.description,
              isCompleted: true,
              progress: def.targetValue,
            },
          });

          // Award achievement reward XP & Coins & Stones
          if (def.rewardCoins > 0) {
            await tx.coinTransaction.create({
              data: {
                userId,
                amount: def.rewardCoins,
                type: 'EARN',
                source: 'ACHIEVEMENT',
                referenceId: def.id,
              },
            });
          }

          await tx.user.update({
            where: { id: userId },
            data: {
              xp: { increment: def.rewardXp },
              coins: { increment: def.rewardCoins },
              stars: { increment: def.rewardStars },
              wisdomStones: { increment: def.rewardStones },
            },
          });
        });

        newlyUnlocked.push(def.title);
        this.logger.log(`Achievement Unlocked for User ${userId}: ${def.title}`);
      }
    }

    return newlyUnlocked;
  }

  /**
   * Backward compatible unlock method.
   */
  async unlockAchievement(userId: number, title: string, description: string) {
    const existing = await this.prisma.achievement.findFirst({
      where: { userId, title },
    });

    if (existing) return;

    await this.prisma.achievement.create({
      data: {
        userId,
        title,
        description,
        isCompleted: true,
        progress: 1,
      },
    });
  }

  private async getUserProgressStats(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, streak: true, coins: true, stars: true, wisdomStones: true },
    });

    const attempts = await this.prisma.questionAttempt.findMany({
      where: { userId },
      include: {
        template: {
          include: {
            topic: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter((a) => a.isCorrect).length;
    const accuracy =
      totalAttempts === 0 ? 0 : Math.round((correctAttempts / totalAttempts) * 100);

    const masteredTopics = await this.prisma.userProgress.count({
      where: { userId, completed: true },
    });

    // Consecutive correct streak
    let maxConsecutive = 0;
    let currentConsecutive = 0;
    for (const a of attempts) {
      if (a.isCorrect) {
        currentConsecutive++;
        if (currentConsecutive > maxConsecutive) maxConsecutive = currentConsecutive;
      } else {
        currentConsecutive = 0;
      }
    }

    // Fast attempts (time <= 10s and isCorrect)
    const rapidCount = attempts.filter(
      (a) => a.isCorrect && a.timeTakenSeconds !== null && a.timeTakenSeconds <= 10,
    ).length;

    const lightningCount = attempts.filter(
      (a) => a.isCorrect && a.timeTakenSeconds !== null && a.timeTakenSeconds <= 8,
    ).length;

    // Difficulty counts
    const easyCount = attempts.filter((a) => a.isCorrect && a.template?.difficulty === 'EASY').length;
    const medCount = attempts.filter((a) => a.isCorrect && a.template?.difficulty === 'MEDIUM').length;
    const hardCount = attempts.filter((a) => a.isCorrect && a.template?.difficulty === 'HARD').length;

    // Cognitive question types count
    const distinctTypes = new Set(
      attempts.map((a) => a.template?.templateType).filter(Boolean),
    ).size;

    return {
      xp: user?.xp || 0,
      streak: user?.streak || 0,
      coins: user?.coins || 0,
      stars: user?.stars || 0,
      stones: user?.wisdomStones || 0,
      totalAttempts,
      correctAttempts,
      accuracy,
      masteredTopics,
      maxConsecutive,
      rapidCount,
      lightningCount,
      easyCount,
      medCount,
      hardCount,
      distinctTypes,
    };
  }

  private computeMetricValueForAchievement(
    defId: string,
    stats: Awaited<ReturnType<typeof this.getUserProgressStats>>,
  ): number {
    switch (defId) {
      case 'first-steps':
        return stats.correctAttempts >= 1 ? 1 : 0;
      case 'curious-mind':
      case 'sutra-initiate':
      case 'first-topic-mastered':
        return stats.masteredTopics >= 1 ? 1 : stats.totalAttempts >= 1 ? 1 : 0;
      case 'knowledge-seeker':
      case 'method-observer':
      case 'diagnostic-student':
      case 'mission-sutra-explorer':
        return Math.min(3, stats.masteredTopics >= 3 ? 3 : Math.floor(stats.totalAttempts / 5));
      case 'concept-explorer':
      case 'lesson-completer':
      case 'five-topics-mastered':
      case 'practice-legend':
        return Math.min(5, stats.masteredTopics);
      case 'deep-thinker':
      case 'ten-topics-mastered':
        return Math.min(10, stats.masteredTopics);
      case 'full-curriculum-master':
        return Math.min(23, stats.masteredTopics);

      // Practice volume
      case 'practice-apprentice':
        return Math.min(10, stats.totalAttempts);
      case 'dedicated-solver':
        return Math.min(25, stats.totalAttempts);
      case 'practice-warrior':
        return Math.min(50, stats.totalAttempts);
      case 'centurion-solver':
        return Math.min(100, stats.totalAttempts);
      case 'double-century':
        return Math.min(200, stats.totalAttempts);
      case 'triple-century':
        return Math.min(300, stats.totalAttempts);
      case 'half-millennium':
        return Math.min(500, stats.totalAttempts);
      case 'grand-practitioner':
        return Math.min(750, stats.totalAttempts);
      case 'millennium-master':
        return Math.min(1000, stats.totalAttempts);

      // Cognitive types
      case 'cognitive-explorer':
        return Math.min(3, stats.distinctTypes);
      case 'cognitive-polymath':
        return Math.min(6, stats.distinctTypes);

      // Accuracy & streaks
      case 'sharp-mind':
        return stats.totalAttempts >= 20 ? stats.accuracy : 0;
      case 'precision-solver':
        return stats.totalAttempts >= 30 ? stats.accuracy : 0;
      case 'accuracy-ace':
        return stats.totalAttempts >= 40 ? stats.accuracy : 0;
      case 'flawless-ten':
      case 'spotless-session':
        return Math.min(10, stats.maxConsecutive);
      case 'flawless-twenty':
        return Math.min(20, stats.maxConsecutive);
      case 'unbroken-chain':
        return Math.min(25, stats.maxConsecutive);
      case 'infallible-calculator':
        return Math.min(50, stats.maxConsecutive);

      // Difficulty
      case 'easy-voyager':
        return Math.min(25, stats.easyCount);
      case 'easy-conqueror':
        return Math.min(50, stats.easyCount);
      case 'medium-unlocked':
        return stats.easyCount >= 10 ? 1 : 0;
      case 'medium-practitioner':
        return Math.min(30, stats.medCount);
      case 'medium-master':
        return Math.min(50, stats.medCount);
      case 'advanced-unlocked':
        return stats.medCount >= 10 ? 1 : 0;
      case 'advanced-practitioner':
        return Math.min(30, stats.hardCount);
      case 'advanced-master':
        return Math.min(50, stats.hardCount);
      case 'expert-unlocked':
        return stats.hardCount >= 10 ? 1 : 0;
      case 'expert-conqueror':
        return Math.min(20, stats.hardCount);

      // Streaks
      case 'streak-3d':
        return Math.min(3, stats.streak);
      case 'streak-7d':
        return Math.min(7, stats.streak);
      case 'streak-14d':
        return Math.min(14, stats.streak);
      case 'streak-21d':
        return Math.min(21, stats.streak);
      case 'streak-30d':
        return Math.min(30, stats.streak);
      case 'streak-50d':
        return Math.min(50, stats.streak);
      case 'streak-75d':
        return Math.min(75, stats.streak);
      case 'streak-100d':
        return Math.min(100, stats.streak);
      case 'streak-180d':
        return Math.min(180, stats.streak);
      case 'streak-365d':
        return Math.min(365, stats.streak);

      // Speed
      case 'rapid-calculator':
        return Math.min(5, stats.rapidCount);
      case 'lightning-mind':
        return Math.min(10, stats.lightningCount);

      // Sutras
      default:
        if (defId.startsWith('sutra-')) {
          return stats.totalAttempts >= 10 ? 80 : stats.totalAttempts * 8;
        }
        if (defId.startsWith('wisdom-level-')) {
          const targetLvl = Number(defId.replace('wisdom-level-', ''));
          const currentLvl = Math.floor(stats.xp / 100) + 1;
          return Math.min(targetLvl, currentLvl);
        }
        return 0;
    }
  }
}
