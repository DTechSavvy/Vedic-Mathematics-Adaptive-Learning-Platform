import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type PracticeDifficulty = 'EASY' | 'MEDIUM' | 'ADVANCED' | 'EXPERT';

export interface DifficultyAccessItem {
  difficulty: PracticeDifficulty;
  available: boolean;
  unlocked: boolean;
  lockedReason?: string;
  reason?: string;
  currentCount: number;
  requiredCount: number;
  isDefault: boolean;
}

export interface DifficultyAccessStatus {
  userLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  difficulties: Record<PracticeDifficulty, DifficultyAccessItem>;
  access: DifficultyAccessItem[];
  unlockedDifficulties: PracticeDifficulty[];
}

@Injectable()
export class PracticeDifficultyService {
  constructor(private readonly prisma: PrismaService) {}

  async getDifficultyAccess(userId: number): Promise<DifficultyAccessStatus> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, learningLevel: true },
    });

    const rawLevel = (user?.learningLevel || 'BEGINNER').toUpperCase();
    const userLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' =
      rawLevel === 'ADVANCED'
        ? 'ADVANCED'
        : rawLevel === 'INTERMEDIATE'
          ? 'INTERMEDIATE'
          : 'BEGINNER';

    const attempts = await this.prisma.questionAttempt.findMany({
      where: {
        userId,
        isValidAttempt: true,
      },
      include: {
        template: true,
      },
    });

    const totalValidAttempts = attempts.length;

    const easyAttempts = attempts.filter(
      (a) => (a.difficulty || a.template?.difficulty) === 'EASY',
    );
    const easyCorrect = easyAttempts.filter((a) => a.isCorrect).length;
    const easyAccuracy =
      easyAttempts.length === 0
        ? 0
        : Math.round((easyCorrect / easyAttempts.length) * 100);

    const mediumAttempts = attempts.filter(
      (a) => (a.difficulty || a.template?.difficulty) === 'MEDIUM',
    );
    const mediumCorrect = mediumAttempts.filter((a) => a.isCorrect).length;
    const mediumAccuracy =
      mediumAttempts.length === 0
        ? 0
        : Math.round((mediumCorrect / mediumAttempts.length) * 100);

    const advancedAttempts = attempts.filter(
      (a) =>
        (a.difficulty || a.template?.difficulty) === 'ADVANCED' ||
        (a.difficulty || a.template?.difficulty) === 'HARD',
    );
    const advancedCorrect = advancedAttempts.filter((a) => a.isCorrect).length;
    const advancedAccuracy =
      advancedAttempts.length === 0
        ? 0
        : Math.round((advancedCorrect / advancedAttempts.length) * 100);

    const EASY_COUNT_FOR_MEDIUM = 20;
    const EASY_ACCURACY_FOR_MEDIUM = 70;

    const TOTAL_FOR_ADVANCED = 50;
    const MEDIUM_COUNT_FOR_ADVANCED = 15;
    const MEDIUM_ACCURACY_FOR_ADVANCED = 70;

    const TOTAL_FOR_EXPERT = 100;
    const ADVANCED_COUNT_FOR_EXPERT = 25;
    const ADVANCED_ACCURACY_FOR_EXPERT = 75;

    const easyAvailable = true;

    // Medium evaluation
    let mediumAvailable = false;
    let mediumReason: string | undefined;
    if (easyAttempts.length < EASY_COUNT_FOR_MEDIUM) {
      const remaining = EASY_COUNT_FOR_MEDIUM - easyAttempts.length;
      mediumReason = `Solve ${remaining} more Easy challenge${remaining === 1 ? '' : 's'} (current: ${easyAttempts.length}/${EASY_COUNT_FOR_MEDIUM}) with ≥70% accuracy to unlock Medium fluency.`;
    } else if (easyAccuracy < EASY_ACCURACY_FOR_MEDIUM) {
      mediumReason = `Increase Easy accuracy to ≥70% (currently ${easyAccuracy}%) across your foundational attempts to unlock Medium fluency.`;
    } else {
      mediumAvailable = true;
    }

    // Advanced evaluation
    let advancedAvailable = false;
    let advancedReason: string | undefined;
    if (!mediumAvailable) {
      advancedReason = 'Unlock and master Medium difficulty first.';
    } else if (totalValidAttempts < TOTAL_FOR_ADVANCED) {
      const remaining = TOTAL_FOR_ADVANCED - totalValidAttempts;
      advancedReason = `Complete ${remaining} more practice question${remaining === 1 ? '' : 's'} (total: ${totalValidAttempts}/${TOTAL_FOR_ADVANCED}) to build sufficient reasoning experience.`;
    } else if (mediumAttempts.length < MEDIUM_COUNT_FOR_ADVANCED) {
      const remaining = MEDIUM_COUNT_FOR_ADVANCED - mediumAttempts.length;
      advancedReason = `Solve ${remaining} more Medium challenge${remaining === 1 ? '' : 's'} (current: ${mediumAttempts.length}/${MEDIUM_COUNT_FOR_ADVANCED}) to qualify for Advanced reasoning.`;
    } else if (mediumAccuracy < MEDIUM_ACCURACY_FOR_ADVANCED) {
      advancedReason = `Achieve ≥70% accuracy in Medium challenges (currently ${mediumAccuracy}%) to unlock Advanced tier.`;
    } else {
      advancedAvailable = true;
    }

    // Expert evaluation
    let expertAvailable = false;
    let expertReason: string | undefined;
    if (!advancedAvailable) {
      expertReason = 'Unlock and master Advanced difficulty first.';
    } else if (totalValidAttempts < TOTAL_FOR_EXPERT) {
      const remaining = TOTAL_FOR_EXPERT - totalValidAttempts;
      expertReason = `Complete ${remaining} more practice challenge${remaining === 1 ? '' : 's'} (total: ${totalValidAttempts}/${TOTAL_FOR_EXPERT}) to unlock Expert mastery.`;
    } else if (advancedAttempts.length < ADVANCED_COUNT_FOR_EXPERT) {
      const remaining = ADVANCED_COUNT_FOR_EXPERT - advancedAttempts.length;
      expertReason = `Solve ${remaining} more Advanced challenge${remaining === 1 ? '' : 's'} (current: ${advancedAttempts.length}/${ADVANCED_COUNT_FOR_EXPERT}) to qualify for Expert synthesis.`;
    } else if (advancedAccuracy < ADVANCED_ACCURACY_FOR_EXPERT) {
      expertReason = `Achieve ≥75% accuracy in Advanced challenges (currently ${advancedAccuracy}%) to unlock Expert mastery.`;
    } else {
      expertAvailable = true;
    }

    // Default recommended difficulty based on current unlocked tier and user preference
    const defaultDiff: PracticeDifficulty =
      expertAvailable && userLevel === 'ADVANCED'
        ? 'EXPERT'
        : advancedAvailable && (userLevel === 'ADVANCED' || userLevel === 'INTERMEDIATE')
          ? 'ADVANCED'
          : mediumAvailable
            ? 'MEDIUM'
            : 'EASY';

    const easyItem: DifficultyAccessItem = {
      difficulty: 'EASY',
      available: easyAvailable,
      unlocked: easyAvailable,
      currentCount: easyAttempts.length,
      requiredCount: 0,
      isDefault: defaultDiff === 'EASY',
    };

    const mediumItem: DifficultyAccessItem = {
      difficulty: 'MEDIUM',
      available: mediumAvailable,
      unlocked: mediumAvailable,
      lockedReason: mediumReason,
      reason: mediumReason,
      currentCount: easyAttempts.length,
      requiredCount: EASY_COUNT_FOR_MEDIUM,
      isDefault: defaultDiff === 'MEDIUM',
    };

    const advancedItem: DifficultyAccessItem = {
      difficulty: 'ADVANCED',
      available: advancedAvailable,
      unlocked: advancedAvailable,
      lockedReason: advancedReason,
      reason: advancedReason,
      currentCount: totalValidAttempts,
      requiredCount: TOTAL_FOR_ADVANCED,
      isDefault: defaultDiff === 'ADVANCED',
    };

    const expertItem: DifficultyAccessItem = {
      difficulty: 'EXPERT',
      available: expertAvailable,
      unlocked: expertAvailable,
      lockedReason: expertReason,
      reason: expertReason,
      currentCount: totalValidAttempts,
      requiredCount: TOTAL_FOR_EXPERT,
      isDefault: defaultDiff === 'EXPERT',
    };

    const difficultiesMap: Record<PracticeDifficulty, DifficultyAccessItem> = {
      EASY: easyItem,
      MEDIUM: mediumItem,
      ADVANCED: advancedItem,
      EXPERT: expertItem,
    };

    const accessList: DifficultyAccessItem[] = [
      easyItem,
      mediumItem,
      advancedItem,
      expertItem,
    ];

    const unlockedDifficulties = accessList
      .filter((item) => item.available)
      .map((item) => item.difficulty);

    return {
      userLevel,
      difficulties: difficultiesMap,
      access: accessList,
      unlockedDifficulties,
    };
  }

  async validateDifficultyAccess(
    userId: number,
    requestedDifficulty?: string,
  ): Promise<PracticeDifficulty> {
    const status = await this.getDifficultyAccess(userId);

    if (!requestedDifficulty || requestedDifficulty.trim() === '') {
      const defaultItem = Object.values(status.difficulties).find(
        (d) => d.isDefault,
      );
      return defaultItem ? defaultItem.difficulty : 'EASY';
    }

    const upper = requestedDifficulty
      .trim()
      .toUpperCase() as PracticeDifficulty;
    const tier = status.difficulties[upper];

    if (!tier) {
      throw new ForbiddenException(
        `Invalid difficulty level "${requestedDifficulty}". Choose EASY, MEDIUM, ADVANCED, or EXPERT.`,
      );
    }

    if (!tier.available) {
      throw new ForbiddenException(
        tier.lockedReason ||
          `Difficulty level "${upper}" is locked for your current progress.`,
      );
    }

    return upper;
  }
}
