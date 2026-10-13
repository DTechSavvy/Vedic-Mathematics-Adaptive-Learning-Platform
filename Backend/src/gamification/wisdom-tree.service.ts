import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface WisdomTreeBand {
  bandNumber: number;
  levelRange: string;
  name: string;
  description: string;
  emoji: string;
  stageName: string;
}

export interface WisdomTreeMilestone {
  level: number;
  title: string;
  perk: string;
  isUnlocked: boolean;
  emoji: string;
}

export interface WisdomTreeLevel {
  level: number;
  title: string;
  bandName: string;
  bandNumber: number;
  cumulativeXp: number;
  perk: string;
  isUnlocked: boolean;
  isCurrent: boolean;
}

export interface WisdomTreeDetails {
  currentLevel: number;
  currentTitle: string;
  currentBand: string;
  bandNumber: number;
  currentXp: number;
  totalXP: number;
  masteryBonusXP: number;
  effectiveXP: number;
  currentLevelFloorXP: number;
  nextLevelThresholdXP: number;
  xpInCurrentLevel: number;
  xpNeededForNextLevel: number;
  progressPercent: number;
  progressPercentage: number;
  masteredTopicsCount: number;
  bonusXpEarned: number;
  bandDetails: WisdomTreeBand;
  bands: WisdomTreeBand[];
  milestones: WisdomTreeMilestone[];
  levels: WisdomTreeLevel[];
}

@Injectable()
export class WisdomTreeService {
  constructor(private readonly prisma: PrismaService) {}

  readonly BANDS: WisdomTreeBand[] = [
    {
      bandNumber: 1,
      levelRange: 'Levels 1–10',
      name: 'Vedic Foundations',
      description: 'The ancient seed takes root in the fertile soil of mental awareness.',
      emoji: '🌱',
      stageName: 'Seedling',
    },
    {
      bandNumber: 2,
      levelRange: 'Levels 11–20',
      name: 'Number Sense & Rekha',
      description: 'First green shoots emerge through columnar dot methods and digit sums.',
      emoji: '🌿',
      stageName: 'Sprout',
    },
    {
      bandNumber: 3,
      levelRange: 'Levels 21–30',
      name: 'High-Speed Addition & Subtraction',
      description: 'Strong roots anchor deep through Nikhilam complements and left-to-right calculation.',
      emoji: '🪴',
      stageName: 'Sapling',
    },
    {
      bandNumber: 4,
      levelRange: 'Levels 31–40',
      name: 'Miracle Multiplication',
      description: 'Sturdy branches expand symmetrically through Urdhva-Tiryagbhyam criss-cross patterns.',
      emoji: '🌲',
      stageName: 'Young Bough',
    },
    {
      bandNumber: 5,
      levelRange: 'Levels 41–50',
      name: 'Division & Vinculum',
      description: 'A wide canopy develops through Paravartya transposition and bar number mastery.',
      emoji: '🌳',
      stageName: 'Spreading Canopy',
    },
    {
      bandNumber: 6,
      levelRange: 'Levels 51–60',
      name: 'Lightning Squares & Duplex',
      description: 'Luminous blossoms appear as Dwandwa Yoga Duplex calculations flow in single lines.',
      emoji: '🌸',
      stageName: 'Blooming Arbor',
    },
    {
      bandNumber: 7,
      levelRange: 'Levels 61–70',
      name: 'Rapid Cubes & Roots',
      description: 'Abundant mathematical fruit ripens through Yavadunam deficiency cubes and square roots.',
      emoji: '🍎',
      stageName: 'Fruitful Tree',
    },
    {
      bandNumber: 8,
      levelRange: 'Levels 71–80',
      name: 'Vedic Algebra & Factoring',
      description: 'Ancient thick trunk hardens as quadratic equations dissolve in instant inspection.',
      emoji: '🛡️',
      stageName: 'Ancient Oak',
    },
    {
      bandNumber: 9,
      levelRange: 'Levels 81–90',
      name: 'Sacred Geometry & Baudhayana',
      description: 'Cosmic geometry unfolds through Shulbasutra diagonals, circle squaring, and Pi ratios.',
      emoji: '🌌',
      stageName: 'Sacred Grove',
    },
    {
      bandNumber: 10,
      levelRange: 'Levels 91–100',
      name: 'Supreme Vedic Mastery',
      description: 'The legendary Kalpavriksha: the wish-granting Tree of Supreme Vedic Knowledge.',
      emoji: '🕉️',
      stageName: 'Kalpavriksha (Cosmic Tree)',
    },
  ];

  /**
   * Calculates the XP threshold required to reach level L (1 to 100).
   * Nonlinear progressive curve:
   * Level 1: 0
   * Level 2: 100
   * Level 10: 1,800
   * Level 25: 7,500
   * Level 50: 25,000
   * Level 75: 55,000
   * Level 100: 100,000
   */
  getXPThresholdForLevel(level: number): number {
    if (level <= 1) return 0;
    if (level >= 100) return 100000;

    const l = level - 1;
    return Math.round(10 * l * l + 80 * l);
  }

  /**
   * Retrieves the comprehensive Wisdom Tree progression state for a user.
   */
  async getWisdomTreeForUser(userId: number): Promise<WisdomTreeDetails> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true },
    });

    const masteredTopicsCount = await this.prisma.userProgress.count({
      where: { userId, completed: true },
    });

    const baseXP = user?.xp || 0;
    // Each verified mastered topic contributes a +250 XP bonus towards the Wisdom Tree
    const masteryBonusXP = masteredTopicsCount * 250;
    const effectiveXP = baseXP + masteryBonusXP;

    // Calculate level 1 to 100
    let currentLevel = 1;
    for (let l = 1; l <= 100; l++) {
      if (effectiveXP >= this.getXPThresholdForLevel(l)) {
        currentLevel = l;
      } else {
        break;
      }
    }

    const currentLevelFloorXP = this.getXPThresholdForLevel(currentLevel);
    const nextLevelThresholdXP =
      currentLevel >= 100 ? currentLevelFloorXP : this.getXPThresholdForLevel(currentLevel + 1);

    const xpInCurrentLevel = effectiveXP - currentLevelFloorXP;
    const xpSpan = nextLevelThresholdXP - currentLevelFloorXP;

    const progressPercentage =
      currentLevel >= 100 || xpSpan <= 0
        ? 100
        : Math.min(100, Math.round((xpInCurrentLevel / xpSpan) * 100));

    const xpNeededForNextLevel = Math.max(0, nextLevelThresholdXP - effectiveXP);

    // Current Band
    const bandIndex = Math.min(9, Math.floor((currentLevel - 1) / 10));
    const currentBand = this.BANDS[bandIndex];

    // Canonical Milestones
    const milestoneLevels = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const milestones: WisdomTreeMilestone[] = milestoneLevels.map((lvl) => {
      const bIdx = Math.min(9, Math.floor((lvl - 1) / 10));
      return {
        level: lvl,
        title: `Level ${lvl} Milestone`,
        perk: this.getPerkForLevel(lvl),
        isUnlocked: currentLevel >= lvl,
        emoji: this.BANDS[bIdx].emoji,
      };
    });

    // Build complete 100-Level Grid
    const levels: WisdomTreeLevel[] = [];
    for (let l = 1; l <= 100; l++) {
      const bIdx = Math.min(9, Math.floor((l - 1) / 10));
      const b = this.BANDS[bIdx];
      levels.push({
        level: l,
        title: l === 1 ? 'Seedling Inception' : l === 100 ? 'Kalpavriksha Supreme' : `${b.stageName} Step ${((l - 1) % 10) + 1}`,
        bandName: b.name,
        bandNumber: b.bandNumber,
        cumulativeXp: this.getXPThresholdForLevel(l),
        perk: this.getPerkForLevel(l),
        isUnlocked: currentLevel >= l,
        isCurrent: currentLevel === l,
      });
    }

    return {
      currentLevel,
      currentTitle: `${currentBand.stageName} (Level ${currentLevel})`,
      currentBand: currentBand.name,
      bandNumber: currentBand.bandNumber,
      currentXp: effectiveXP,
      totalXP: baseXP,
      masteryBonusXP,
      effectiveXP,
      currentLevelFloorXP,
      nextLevelThresholdXP,
      xpInCurrentLevel,
      xpNeededForNextLevel,
      progressPercent: progressPercentage,
      progressPercentage,
      masteredTopicsCount,
      bonusXpEarned: masteryBonusXP,
      bandDetails: currentBand,
      bands: this.BANDS,
      milestones,
      levels,
    };
  }

  private getPerkForLevel(level: number): string {
    switch (level) {
      case 5:
        return 'Unlocked: Daily Goal Boost Token (+25% goal rewards)';
      case 10:
        return 'Unlocked: "Foundation Scholar" Badge & Sprout Tree Appearance';
      case 20:
        return 'Unlocked: Practice Pack Discount (10% off in Store)';
      case 30:
        return 'Unlocked: Criss-Cross Golden Branch Theme';
      case 40:
        return 'Unlocked: Transposition Scholar Insignia';
      case 50:
        return 'Unlocked: "Vedic Arborist" Title & Blooming Canopy Skin';
      case 60:
        return 'Unlocked: Duplex Lightning Profile Animation';
      case 70:
        return 'Unlocked: Yavadunam Golden Fruit Icon';
      case 80:
        return 'Unlocked: Ancient Oak Profile Frame';
      case 90:
        return 'Unlocked: Sacred Geometry Shimmer';
      case 100:
        return 'Unlocked: Kalpavriksha Cosmic Glow & Supreme Vedic Master Grand Halo';
      default:
        return 'Unlocked: Enhanced Vedic Tree Growth & Milestone Badge';
    }
  }
}
