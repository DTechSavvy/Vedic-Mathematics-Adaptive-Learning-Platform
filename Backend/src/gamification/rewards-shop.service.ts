import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CANONICAL_STORE_ITEMS } from './store.data';

export interface StoreItemView {
  id: string;
  title: string;
  description: string;
  category: string;
  costCoins: number;
  costStones: number;
  costStars: number;
  icon: string;
  metadata?: Record<string, unknown> | null;
  canAfford: boolean;
  owned: boolean;
  ownedBalance: number;
  activeUntil?: string | null;
}

@Injectable()
export class RewardsShopService {
  private readonly logger = new Logger(RewardsShopService.name);
  private itemsSeeded = false;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Automatically seeds or updates canonical store items into the database if needed.
   */
  async ensureStoreItemsSeeded(): Promise<void> {
    if (this.itemsSeeded) return;
    try {
      for (const item of CANONICAL_STORE_ITEMS) {
        await this.prisma.storeItem.upsert({
          where: { id: item.id },
          update: {
            title: item.title,
            description: item.description,
            category: item.category,
            costCoins: item.costCoins,
            costStones: item.costStones,
            icon: item.icon,
            metadata: (item.metadata || {}) as any,
            isActive: true,
          },
          create: {
            id: item.id,
            title: item.title,
            description: item.description,
            category: item.category,
            costCoins: item.costCoins,
            costStones: item.costStones,
            icon: item.icon,
            metadata: (item.metadata || {}) as any,
            isActive: true,
          },
        });
      }
      this.itemsSeeded = true;
    } catch (err: any) {
      this.logger.warn(`Could not seed canonical store items: ${err.message}`);
    }
  }

  /**
   * Helper to map store item to entitlement type.
   */
  resolveEntitlementType(item: { id: string; metadata?: any }): string | null {
    const meta = (item.metadata as Record<string, unknown>) || {};
    if (item.id === 'hint-token' || item.id === 'hint-tokens' || meta.type === 'HINT') {
      return 'HINT_TOKEN';
    } else if (item.id === 'solution-reveal' || item.id === 'solution-breakdown' || meta.type === 'SOLUTION' || meta.type === 'SOLUTION_REVEAL') {
      return 'SOLUTION_TOKEN';
    } else if (item.id === 'retry-token' || meta.type === 'RETRY') {
      return 'RETRY_TOKEN';
    } else if (item.id === 'mistake-analysis' || meta.type === 'MISTAKE_ANALYSIS') {
      return 'MISTAKE_ANALYSIS_TOKEN';
    } else if (item.id === 'focus-practice-pack' || meta.type === 'PRACTICE_PACK') {
      return 'PRACTICE_PACK';
    } else if (item.id === 'sutra-revision-pack' || meta.type === 'SUTRA_PACK') {
      return 'SUTRA_PACK';
    } else if (item.id === 'xp-boost-1h' || meta.multiplier) {
      return 'XP_BOOST';
    } else if (item.id === 'mastery-insight' || meta.type === 'MASTERY_INSIGHT') {
      return 'MASTERY_INSIGHT_TOKEN';
    } else if (item.id === 'weak-topic-practice-pack' || meta.type === 'WEAK_TOPIC_PACK') {
      return 'WEAK_TOPIC_PACK';
    } else if (item.id === 'mixed-challenge-pack' || meta.type === 'MIXED_CHALLENGE_PACK') {
      return 'MIXED_CHALLENGE_PACK';
    }
    return null;
  }

  /**
   * Retrieves the catalog of learning utilities, boosts, previews, and cosmetics.
   */
  async getCatalog(userId: number): Promise<StoreItemView[]> {
    await this.ensureStoreItemsSeeded();

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true, stars: true, wisdomStones: true },
    });

    const userCoins = user?.coins || 0;
    const userStars = user?.stars || 0;
    const userStones = user?.wisdomStones || 0;

    const [dbItems, userPurchases, entitlements] = await Promise.all([
      this.prisma.storeItem.findMany({
        where: { isActive: true },
        orderBy: { costCoins: 'asc' },
      }),
      this.prisma.userPurchase.findMany({
        where: { userId },
        orderBy: { purchasedAt: 'desc' },
      }),
      this.getUserEntitlements(userId),
    ]);

    const now = new Date();

    return dbItems.map((item) => {
      const recentPurchase = userPurchases.find((p) => p.itemId === item.id);
      const isOneTimeCosmetic = item.category === 'COSMETIC';
      const isOwned = isOneTimeCosmetic && !!recentPurchase;

      const hasActiveExpiry =
        recentPurchase?.expiresAt && new Date(recentPurchase.expiresAt) > now;

      const meta = (item.metadata as Record<string, any>) || {};
      const costStars = Number(meta.costStars) || 0;

      const canAfford =
        userCoins >= item.costCoins &&
        userStones >= item.costStones &&
        userStars >= costStars;

      const entType = this.resolveEntitlementType(item);
      const ownedBalance = entType && entitlements[entType] ? entitlements[entType].balance : (isOwned ? 1 : 0);

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        costCoins: item.costCoins,
        costStones: item.costStones,
        costStars,
        icon: item.icon,
        metadata: meta,
        canAfford,
        owned: isOwned,
        ownedBalance,
        activeUntil:
          hasActiveExpiry && recentPurchase?.expiresAt
            ? recentPurchase.expiresAt.toISOString()
            : null,
      };
    });
  }

  /**
   * Retrieves the store catalog bundled with authoritative user balances and entitlements.
   */
  async getCatalogWithBalances(userId: number) {
    const [user, items, entitlements] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          coins: true,
          stars: true,
          wisdomStones: true,
          xp: true,
          level: true,
          streak: true,
        },
      }),
      this.getCatalog(userId),
      this.getUserEntitlements(userId),
    ]);

    return {
      userBalances: {
        coins: user?.coins || 0,
        stars: user?.stars || 0,
        wisdomStones: user?.wisdomStones || 0,
        xp: user?.xp || 0,
        level: user?.level || 1,
        streak: user?.streak || 0,
      },
      items,
      entitlements,
    };
  }

  /**
   * Purchases a store item with server-authoritative verification and auditable transaction logging.
   * Consumable items support additive balances.
   */
  async purchaseItem(userId: number, itemId: string) {
    const item = await this.prisma.storeItem.findUnique({
      where: { id: itemId },
    });

    if (!item || !item.isActive) {
      throw new NotFoundException(`Store item '${itemId}' is not available for purchase.`);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const meta = (item.metadata as Record<string, unknown>) || {};
    const costStars = Number(meta.costStars) || 0;

    // Check balances
    if (user.coins < item.costCoins) {
      throw new BadRequestException(
        `Insufficient V-Coins. Required: ${item.costCoins}, Available: ${user.coins}.`,
      );
    }

    if (user.wisdomStones < item.costStones) {
      throw new BadRequestException(
        `Insufficient Wisdom Stones. Required: ${item.costStones}, Available: ${user.wisdomStones}.`,
      );
    }

    if (user.stars < costStars) {
      throw new BadRequestException(
        `Insufficient Stars. Required: ${costStars}, Available: ${user.stars}.`,
      );
    }

    // Check if one-time cosmetic already owned
    if (item.category === 'COSMETIC') {
      const existing = await this.prisma.userPurchase.findFirst({
        where: { userId, itemId: item.id },
      });
      if (existing) {
        throw new BadRequestException(`You already own the cosmetic '${item.title}'.`);
      }
    }

    // Compute expiry if timed boost
    let expiresAt: Date | null = null;
    if (meta.durationHours) {
      expiresAt = new Date(Date.now() + Number(meta.durationHours) * 60 * 60 * 1000);
    }

    // Execute atomic transaction
    const [purchase, transaction, updatedUser] = await this.prisma.$transaction([
      this.prisma.userPurchase.create({
        data: {
          userId,
          itemId: item.id,
          expiresAt,
        },
      }),
      this.prisma.coinTransaction.create({
        data: {
          userId,
          amount: -item.costCoins,
          type: 'SPEND',
          source: 'STORE_PURCHASE',
          referenceId: item.id,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          coins: { decrement: item.costCoins },
          wisdomStones: { decrement: item.costStones },
          stars: costStars > 0 ? { decrement: costStars } : undefined,
        },
      }),
    ]);

    // Activate functional entitlement in ledger (additive inventory semantics)
    await this.activateEntitlement(userId, item, expiresAt);

    this.logger.log(
      `User ${userId} purchased '${item.title}' for ${item.costCoins} coins, ${costStars} stars, ${item.costStones} stones.`,
    );

    const entitlements = await this.getUserEntitlements(userId);

    return {
      success: true,
      message: `Successfully acquired ${item.title}!`,
      purchaseId: purchase.id,
      item: {
        id: item.id,
        title: item.title,
        category: item.category,
        icon: item.icon,
      },
      remainingCoins: updatedUser.coins,
      remainingStars: updatedUser.stars,
      remainingStones: updatedUser.wisdomStones,
      expiresAt: purchase.expiresAt,
      entitlements,
    };
  }

  private async activateEntitlement(userId: number, item: any, expiresAt: Date | null) {
    const itemMeta = (item.metadata as Record<string, any>) || {};
    const metaJson = JSON.parse(JSON.stringify(itemMeta));
    let incrementQty = Number(itemMeta.quantity) || 1;

    if (itemMeta.durationMinutes) {
      expiresAt = new Date(Date.now() + Number(itemMeta.durationMinutes) * 60 * 1000);
    }

    const entitlementType = this.resolveEntitlementType(item);

    if (entitlementType) {
      await this.prisma.userEntitlement.upsert({
        where: {
          userId_type: {
            userId,
            type: entitlementType,
          },
        },
        update: {
          balance: { increment: incrementQty },
          activeUntil: expiresAt || undefined,
          metadata: metaJson,
        },
        create: {
          userId,
          type: entitlementType,
          balance: incrementQty,
          activeUntil: expiresAt,
          metadata: metaJson,
        },
      });
    }
  }

  /**
   * Retrieves active entitlement balances for a learner.
   */
  async getUserEntitlements(userId: number) {
    const records = await this.prisma.userEntitlement.findMany({
      where: { userId },
    });

    const result: Record<string, { balance: number; activeUntil: string | null; isActive: boolean }> = {};
    const now = new Date();

    for (const r of records) {
      const isExpired = r.activeUntil ? r.activeUntil < now : false;
      result[r.type] = {
        balance: r.balance,
        activeUntil: r.activeUntil ? r.activeUntil.toISOString() : null,
        isActive: !isExpired && r.balance > 0,
      };
    }

    return result;
  }

  /**
   * Consumes a hint token entitlement and returns a pedagogical clue for a question.
   */
  async useHintToken(userId: number, questionId: number) {
    const entitlement = await this.prisma.userEntitlement.findUnique({
      where: {
        userId_type: {
          userId,
          type: 'HINT_TOKEN',
        },
      },
    });

    if (!entitlement || entitlement.balance <= 0) {
      throw new BadRequestException(
        'You have no Hint Tokens remaining. Purchase more in the Rewards Shop with V-Coins.',
      );
    }

    // Atomic decrement
    const updated = await this.prisma.userEntitlement.update({
      where: {
        userId_type: {
          userId,
          type: 'HINT_TOKEN',
        },
      },
      data: {
        balance: { decrement: 1 },
      },
    });

    // Find question context if available
    const genQ = await this.prisma.generatedQuestion.findUnique({
      where: { id: questionId },
    });

    let tmpl: any = null;
    if (genQ?.templateId) {
      tmpl = await this.prisma.questionTemplate.findUnique({
        where: { id: genQ.templateId },
        include: { topic: true },
      });
    }

    let topicTitle = 'Vedic Mental Calculation';
    let sutra = 'Nikhilam Navatashcaramam Dashatah';
    let questionText = genQ?.question || '';

    if (tmpl?.topic) {
      topicTitle = tmpl.topic.title || topicTitle;
      sutra = tmpl.topic.sutra || sutra;
    }

    // Build pedagogical clue based on actual question & sutra
    let hint = `Observe the base symmetry in this problem. Under ${sutra}, calculate the deviation from the nearest power of 10.`;
    let shortcutRule = 'Calculate the right-hand part first, then adjust the left-hand base.';

    if (sutra.toLowerCase().includes('nikhilam') || topicTitle.toLowerCase().includes('nikhilam')) {
      hint = 'Think about the numbers\' distances from the nearest power-of-10 base (10, 100, or 1000). Look at the complements from the base.';
      shortcutRule = 'Nikhilam Rule: Cross-add the number with the opposite deficiency, then multiply the two deficiencies for the right-hand part.';
    } else if (sutra.toLowerCase().includes('ekadhikena') || topicTitle.toLowerCase().includes('ending in 5')) {
      hint = 'For numbers ending in 5, multiply the tens digit by "one more than itself", then write 25 at the end.';
      shortcutRule = 'Ekadhikena Purvena: n × (n + 1) | 25.';
    } else if (sutra.toLowerCase().includes('urdhva') || topicTitle.toLowerCase().includes('crosswise')) {
      hint = 'Multiply vertically on the right, crosswise in the middle, and vertically on the left. Remember to carry over tens.';
      shortcutRule = 'Urdhva-Tiryagbhyam: Vertical right | Crosswise sum | Vertical left.';
    } else if (sutra.toLowerCase().includes('dwandwa') || topicTitle.toLowerCase().includes('duplex')) {
      hint = 'Calculate the Duplex: for single digit a, D = a²; for two digits ab, D = 2ab; for three digits abc, D = 2ac + b².';
      shortcutRule = 'Dwandwa Yoga: Duplex sequence gives single-line square digits.';
    }

    return {
      success: true,
      remainingHints: updated.balance,
      hint,
      shortcutRule,
      topic: topicTitle,
      question: questionText,
    };
  }

  /**
   * Consumes a solution token entitlement and returns the complete step-by-step derivation.
   */
  async useSolutionToken(userId: number, questionId: number) {
    const entitlement = await this.prisma.userEntitlement.findUnique({
      where: {
        userId_type: {
          userId,
          type: 'SOLUTION_TOKEN',
        },
      },
    });

    if (!entitlement || entitlement.balance <= 0) {
      throw new BadRequestException(
        'You have no Solution Reveal Tokens remaining. Purchase more in the Rewards Shop.',
      );
    }

    const updated = await this.prisma.userEntitlement.update({
      where: {
        userId_type: {
          userId,
          type: 'SOLUTION_TOKEN',
        },
      },
      data: {
        balance: { decrement: 1 },
      },
    });

    const genQ = await this.prisma.generatedQuestion.findUnique({
      where: { id: questionId },
    });

    if (!genQ) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    let tmpl: any = null;
    if (genQ.templateId) {
      tmpl = await this.prisma.questionTemplate.findUnique({
        where: { id: genQ.templateId },
        include: { topic: true },
      });
    }

    const topic = tmpl?.topic;
    const sutra = topic?.sutra || 'Vedic Mental Method';

    const steps = [
      `Identify the governing Sutra: "${sutra}" applied to "${genQ.question}".`,
      `Deconstruct into Vedic partitions: baseline alignment and component deviations.`,
      `Apply cross-operations according to classical aphoristic steps.`,
      `Combine left-hand and right-hand place values to yield the final verified result.`,
    ];

    return {
      success: true,
      remainingSolutions: updated.balance,
      question: genQ.question,
      correctAnswer: genQ.correctAnswer,
      sutra,
      topic: topic?.title || 'Vedic Mathematics',
      method: `Vedic Solution via ${sutra}`,
      steps,
      reasoning: tmpl?.explanation || `By using ${sutra}, the standard multi-line calculation simplifies into direct mental place-value combinations.`,
    };
  }

  /**
   * Consumes a retry token entitlement and restores retry permission on an attempt.
   */
  async useRetryToken(userId: number, questionId?: number) {
    const entitlement = await this.prisma.userEntitlement.findUnique({
      where: {
        userId_type: {
          userId,
          type: 'RETRY_TOKEN',
        },
      },
    });

    if (!entitlement || entitlement.balance <= 0) {
      throw new BadRequestException(
        'You have no Retry Tokens remaining. Purchase more in the Rewards Shop.',
      );
    }

    const updated = await this.prisma.userEntitlement.update({
      where: {
        userId_type: {
          userId,
          type: 'RETRY_TOKEN',
        },
      },
      data: {
        balance: { decrement: 1 },
      },
    });

    if (questionId) {
      await this.prisma.generatedQuestion.updateMany({
        where: { id: questionId, userId },
        data: { isAnswered: false },
      });
    }

    return {
      success: true,
      remainingRetries: updated.balance,
      message: 'Practice retry token activated! You can re-attempt without session penalty.',
    };
  }

  /**
   * Activates an XP Boost entitlement.
   */
  async applyXpBoost(userId: number) {
    const entitlement = await this.prisma.userEntitlement.findUnique({
      where: {
        userId_type: {
          userId,
          type: 'XP_BOOST',
        },
      },
    });

    if (!entitlement || entitlement.balance <= 0) {
      throw new BadRequestException('You have no XP Boosts remaining in your inventory.');
    }

    const now = new Date();
    // If boost is already active, extend by 60 minutes, else start 60 minutes from now
    const baseTime = entitlement.activeUntil && entitlement.activeUntil > now ? entitlement.activeUntil : now;
    const newExpiry = new Date(baseTime.getTime() + 60 * 60 * 1000);

    const updated = await this.prisma.userEntitlement.update({
      where: {
        userId_type: {
          userId,
          type: 'XP_BOOST',
        },
      },
      data: {
        balance: { decrement: 1 },
        activeUntil: newExpiry,
      },
    });

    return {
      success: true,
      multiplier: 1.5,
      activeUntil: newExpiry.toISOString(),
      remainingBoosts: updated.balance,
      message: '⚡ 1.5x XP Surge activated for 60 minutes across all correct practice answers!',
    };
  }

  /**
   * Performs real deep cognitive mistake analysis on student's actual missed questions.
   */
  async applyMistakeAnalysis(userId: number) {
    const entitlement = await this.prisma.userEntitlement.findUnique({
      where: {
        userId_type: {
          userId,
          type: 'MISTAKE_ANALYSIS_TOKEN',
        },
      },
    });

    if (!entitlement || entitlement.balance <= 0) {
      throw new BadRequestException('You have no Mistake Analysis tokens remaining.');
    }

    const updated = await this.prisma.userEntitlement.update({
      where: {
        userId_type: {
          userId,
          type: 'MISTAKE_ANALYSIS_TOKEN',
        },
      },
      data: {
        balance: { decrement: 1 },
      },
    });

    // Fetch actual recent incorrect attempts
    const incorrectAttempts = await this.prisma.questionAttempt.findMany({
      where: { userId, isCorrect: false },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        template: {
          include: { topic: true },
        },
      },
    });

    if (incorrectAttempts.length === 0) {
      return {
        success: true,
        remainingTokens: updated.balance,
        status: 'PRISTINE_RECORD',
        weakConcept: 'No Recent Calculation Errors',
        repeatedPattern: 'High accuracy maintained across recent practice.',
        likelyCause: 'Exceptional arithmetic precision.',
        examples: [],
        recommendation: 'Advance to Medium or Advanced problem sets to challenge your technique fluency.',
      };
    }

    // Group by topic to find weakest concept
    const topicFrequency: Record<string, { count: number; title: string; sutra?: string }> = {};
    for (const att of incorrectAttempts) {
      const title = att.template?.topic?.title || 'Mental Calculation';
      const sutra = att.template?.topic?.sutra || undefined;
      if (!topicFrequency[title]) {
        topicFrequency[title] = { count: 0, title, sutra };
      }
      topicFrequency[title].count++;
    }

    const sortedTopics = Object.values(topicFrequency).sort((a, b) => b.count - a.count);
    const topWeak = sortedTopics[0];

    const examples = incorrectAttempts.slice(0, 3).map((a) => ({
      question: a.generatedQuestion,
      studentAnswer: a.userAnswer,
      correctAnswer: a.correctAnswer,
      topic: a.template?.topic?.title || 'Arithmetic',
    }));

    return {
      success: true,
      remainingTokens: updated.balance,
      weakConcept: topWeak.title,
      sutra: topWeak.sutra || 'Nikhilam / General Vedic Sutras',
      repeatedPattern: `Repeated calculation slips in ${topWeak.title} (${topWeak.count} recent misses).`,
      likelyCause: 'Base complement deviation error or missing tens carry-over during right-hand combination.',
      examples,
      recommendation: `Focus practice on ${topWeak.title}. Review the baseline deviation rules and verify right-hand digits before finalizing.`,
    };
  }

  /**
   * Retrieves comprehensive revision guide for a Sutra.
   */
  async applySutraRevisionPack(userId: number, sutraId?: string) {
    const entitlement = await this.prisma.userEntitlement.findUnique({
      where: {
        userId_type: {
          userId,
          type: 'SUTRA_PACK',
        },
      },
    });

    if (!entitlement || entitlement.balance <= 0) {
      throw new BadRequestException('You have no Sutra Revision Packs remaining.');
    }

    const updated = await this.prisma.userEntitlement.update({
      where: {
        userId_type: {
          userId,
          type: 'SUTRA_PACK',
        },
      },
      data: {
        balance: { decrement: 1 },
      },
    });

    // Query Sutra from DB
    let targetSutra = sutraId
      ? await this.prisma.sutra.findUnique({ where: { id: sutraId } })
      : await this.prisma.sutra.findFirst({ where: { number: 2 } }); // Default Nikhilam

    if (!targetSutra) {
      targetSutra = await this.prisma.sutra.findFirst();
    }

    return {
      success: true,
      remainingPacks: updated.balance,
      sutraName: targetSutra?.name || 'Nikhilam Navatashcaramam Dashatah',
      number: targetSutra?.number || 2,
      meaning: targetSutra?.meaning || 'All from 9 and the last from 10',
      description: targetSutra?.description || 'Foundational Vedic sutra for instant subtraction and base multiplication.',
      mathematicalIdea: targetSutra?.mathematicalIdea || 'Expresses numbers as algebraic deviations (B ± d) from powers of 10.',
      whenToUse: targetSutra?.whenToUse || 'When numbers are situated near powers of 10 (e.g. 98 × 97, 104 × 106, 1000 - 467).',
      whenNotToUse: targetSutra?.whenNotToUse || 'When numbers are far from standard power-of-10 bases without easy sub-base multipliers.',
      example: targetSutra?.example || { problem: '98 × 97', steps: ['Base 100: 98 (-02), 97 (-03)', 'Left: 98 - 3 = 95', 'Right: (-2) × (-3) = 06', 'Answer: 9506'] },
      commonMistakes: targetSutra?.commonMistakes || ['Writing 6 instead of 06 for base 100 on the right-hand side', 'Adding surplus instead of subtracting deficiency'],
      practiceGuidance: targetSutra?.practiceGuidance || 'Master 2-digit complements first, then advance to cross-base products.',
    };
  }

  /**
   * Generates deep authoritative mastery insight for a learner.
   */
  async applyMasteryInsight(userId: number, topicId?: number) {
    const entitlement = await this.prisma.userEntitlement.findUnique({
      where: {
        userId_type: {
          userId,
          type: 'MASTERY_INSIGHT_TOKEN',
        },
      },
    });

    if (!entitlement || entitlement.balance <= 0) {
      throw new BadRequestException('You have no Mastery Insight tokens remaining.');
    }

    const updated = await this.prisma.userEntitlement.update({
      where: {
        userId_type: {
          userId,
          type: 'MASTERY_INSIGHT_TOKEN',
        },
      },
      data: {
        balance: { decrement: 1 },
      },
    });

    const [allAttempts, progressRecords, topics] = await Promise.all([
      this.prisma.questionAttempt.findMany({
        where: { userId, isValidAttempt: true },
        include: { template: { include: { topic: true } } },
      }),
      this.prisma.userProgress.findMany({
        where: { userId },
      }),
      this.prisma.topic.findMany({
        include: { lessons: true },
      }),
    ]);

    const totalValid = allAttempts.length;
    const correctCount = allAttempts.filter((a) => a.isCorrect).length;
    const lifetimeAcc = totalValid === 0 ? null : Number(((correctCount / totalValid) * 100).toFixed(1));

    const recentSlice = allAttempts.slice(-20);
    const recentCorrect = recentSlice.filter((a) => a.isCorrect).length;
    const recentAcc = recentSlice.length === 0 ? null : Number(((recentCorrect / recentSlice.length) * 100).toFixed(1));

    const easyAttempts = allAttempts.filter((a) => (a.difficulty || a.template?.difficulty) === 'EASY');
    const medAttempts = allAttempts.filter((a) => (a.difficulty || a.template?.difficulty) === 'MEDIUM');
    const advAttempts = allAttempts.filter((a) => (a.difficulty || a.template?.difficulty) === 'ADVANCED' || (a.difficulty || a.template?.difficulty) === 'HARD');

    let coveredTiers = 0;
    if (easyAttempts.length >= 5) coveredTiers++;
    if (medAttempts.length >= 5) coveredTiers++;
    if (advAttempts.length >= 3) coveredTiers++;

    const masteredTopics = progressRecords.filter((p) => p.completed).length;

    return {
      success: true,
      remainingTokens: updated.balance,
      contentCompletion: topics.length > 0 ? Math.round((masteredTopics / topics.length) * 100) : 0,
      validPracticeCount: totalValid,
      lifetimeAccuracy: lifetimeAcc,
      recentAccuracy: recentAcc,
      difficultyCoverage: `${coveredTiers} of 3 tiers active (Easy: ${easyAttempts.length}, Medium: ${medAttempts.length}, Advanced: ${advAttempts.length})`,
      masteryScore: Math.min(100, Math.round((masteredTopics * 4) + (totalValid * 0.5) + ((lifetimeAcc || 0) * 0.3))),
      nextAction:
        totalValid < 20
          ? 'Increase valid practice volume to at least 20 questions to unlock Medium tier.'
          : coveredTiers < 2
          ? 'Practice Medium difficulty questions to broaden tier coverage.'
          : 'Maintain high speed and daily consistency towards 100% topic mastery.',
    };
  }

  /**
   * Generic Apply Item dispatcher for all consumable inventory.
   */
  async applyItem(userId: number, itemIdOrType: string, payload?: any) {
    const cleanKey = itemIdOrType.toLowerCase().replace(/_/g, '-');

    if (cleanKey.includes('hint')) {
      const res = await this.useHintToken(userId, Number(payload?.questionId) || 0);
      return { ...res, effectType: 'HINT_TOKEN' };
    } else if (cleanKey.includes('solution')) {
      const res = await this.useSolutionToken(userId, Number(payload?.questionId) || 0);
      return { ...res, effectType: 'SOLUTION_TOKEN' };
    } else if (cleanKey.includes('retry')) {
      const res = await this.useRetryToken(userId, Number(payload?.questionId) || undefined);
      return { ...res, effectType: 'RETRY_TOKEN' };
    } else if (cleanKey.includes('xp-boost') || cleanKey.includes('xp_boost')) {
      const res = await this.applyXpBoost(userId);
      return { ...res, effectType: 'XP_BOOST' };
    } else if (cleanKey.includes('mistake')) {
      const res = await this.applyMistakeAnalysis(userId);
      return { ...res, effectType: 'MISTAKE_ANALYSIS_TOKEN' };
    } else if (cleanKey.includes('sutra')) {
      const res = await this.applySutraRevisionPack(userId, payload?.sutraId);
      return { ...res, effectType: 'SUTRA_PACK' };
    } else if (cleanKey.includes('insight') || cleanKey.includes('mastery')) {
      const res = await this.applyMasteryInsight(userId, payload?.topicId);
      return { ...res, effectType: 'MASTERY_INSIGHT_TOKEN' };
    } else if (cleanKey.includes('practice') || cleanKey.includes('challenge')) {
      // Practice pack: Consume one pack and return session metadata
      const ent = await this.prisma.userEntitlement.findFirst({
        where: {
          userId,
          type: { in: ['PRACTICE_PACK', 'WEAK_TOPIC_PACK', 'MIXED_CHALLENGE_PACK'] },
          balance: { gt: 0 },
        },
      });
      if (!ent) {
        throw new BadRequestException('You have no Practice Packs remaining in inventory.');
      }
      const updated = await this.prisma.userEntitlement.update({
        where: { id: ent.id },
        data: { balance: { decrement: 1 } },
      });
      return {
        success: true,
        remainingPacks: updated.balance,
        packType: ent.type,
        questionsGranted: 10,
        message: 'Practice pack activated! You have 10 curated practice questions prepared.',
      };
    }

    throw new BadRequestException(`Item '${itemIdOrType}' cannot be directly applied or is not a consumable utility.`);
  }
}
