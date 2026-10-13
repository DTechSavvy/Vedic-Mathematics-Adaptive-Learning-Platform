import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type LeaderboardWindow = 'weekly' | 'monthly' | 'allTime';
export type LeaderboardMetric = 'score' | 'xp' | 'accuracy' | 'sutras' | 'streak';

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  level: number;
  xp: number;
  streak: number;
  coins: number;
  stars: number;
  wisdomStones: number;
  accuracy: number;
  attemptsCount: number;
  masteredTopicsCount: number;
  masteredSutrasCount: number;
  learningScore: number;
  wisdomTreeStage: string;
  wisdomTreeEmoji: string;
  wisdomTreeBand: number;
}

export interface LeaderboardResponse {
  window: LeaderboardWindow;
  metric: LeaderboardMetric;
  totalParticipants: number;
  entries: LeaderboardEntry[];
  currentUserRank?: {
    rank: number;
    entry: LeaderboardEntry;
  } | null;
}

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaderboard(
    currentUserId?: number,
    window: LeaderboardWindow = 'allTime',
    metric: LeaderboardMetric = 'score',
  ): Promise<LeaderboardResponse> {
    const users = await this.prisma.user.findMany({
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

    let dateFilter: Date | undefined;
    const now = new Date();
    if (window === 'weekly') {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (window === 'monthly') {
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Fetch attempts for all users (filtered by date if window is weekly or monthly)
    const attempts = await this.prisma.questionAttempt.findMany({
      where: dateFilter ? { createdAt: { gte: dateFilter } } : undefined,
      select: {
        userId: true,
        isCorrect: true,
        template: {
          select: {
            difficulty: true,
          },
        },
      },
    });

    // Fetch user progress for topic mastery
    const userProgresses = await this.prisma.userProgress.findMany({
      where: { completed: true },
      select: {
        userId: true,
        topicId: true,
      },
    });

    // Group attempts by user
    const attemptsByUser = new Map<
      number,
      { total: number; correct: number; tierPoints: number }
    >();
    for (const a of attempts) {
      let rec = attemptsByUser.get(a.userId);
      if (!rec) {
        rec = { total: 0, correct: 0, tierPoints: 0 };
        attemptsByUser.set(a.userId, rec);
      }
      rec.total += 1;
      if (a.isCorrect) rec.correct += 1;

      // Tier weighting anti-farming
      const diff = a.template?.difficulty || 'EASY';
      if (diff === 'EASY') rec.tierPoints += 0.5;
      else if (diff === 'MEDIUM') rec.tierPoints += 1.5;
      else if (diff === 'HARD' || diff === 'ADVANCED') rec.tierPoints += 3.5;
      else if (diff === 'EXPERT') rec.tierPoints += 6.0;
    }

    // Group mastered topics by user
    const masteredTopicsByUser = new Map<number, Set<number>>();
    for (const up of userProgresses) {
      let set = masteredTopicsByUser.get(up.userId);
      if (!set) {
        set = new Set();
        masteredTopicsByUser.set(up.userId, set);
      }
      set.add(up.topicId);
    }

    // Compute entries
    const entries: LeaderboardEntry[] = users.map((user) => {
      const stats = attemptsByUser.get(user.id) || {
        total: 0,
        correct: 0,
        tierPoints: 0,
      };
      const accuracy =
        stats.total > 0
          ? Math.round((stats.correct / stats.total) * 100)
          : 0;

      const masteredTopicsCount = (
        masteredTopicsByUser.get(user.id) || new Set()
      ).size;

      // Estimate mastered sutras (proportional to mastered topics)
      const masteredSutrasCount = Math.min(
        16,
        Math.floor(masteredTopicsCount * (16 / 23)),
      );

      // Balanced Learning Score
      const streakBonus = (user.streak || 0) * 5;
      const accuracyScore = stats.total >= 5 ? accuracy * 2 : 0;
      const masteryScore =
        masteredTopicsCount * 40 + masteredSutrasCount * 60;
      const volumeScore = Math.min(500, Math.round(stats.tierPoints * 4));
      const xpScore = Math.round(user.xp * 0.15);

      const learningScore =
        accuracyScore + masteryScore + volumeScore + streakBonus + xpScore;

      const displayName =
        user.name && user.name.trim().length > 0
          ? user.name
          : user.email.split('@')[0];

      const effectiveLevel = Math.max(1, user.level || 1);
      const bandNumber = Math.min(10, Math.ceil(effectiveLevel / 10));
      const BANDS_MAP: Record<number, { stage: string; emoji: string }> = {
        1: { stage: 'Seedling', emoji: '🌱' },
        2: { stage: 'Sprout', emoji: '🌿' },
        3: { stage: 'Sapling', emoji: '🪴' },
        4: { stage: 'Young Bough', emoji: '🌲' },
        5: { stage: 'Spreading Canopy', emoji: '🌳' },
        6: { stage: 'Blooming Arbor', emoji: '🌸' },
        7: { stage: 'Kalpavriksha', emoji: '🌺' },
        8: { stage: 'Cosmic Banyan', emoji: '🌟' },
        9: { stage: 'Golden Ashvattha', emoji: '👑' },
        10: { stage: 'Paramatma Tree', emoji: '🕉️' },
      };
      const wisdomInfo = BANDS_MAP[bandNumber] || { stage: 'Seedling', emoji: '🌱' };

      return {
        rank: 0, // Assigned after sorting
        userId: user.id,
        name: displayName,
        level: user.level || 1,
        xp: user.xp || 0,
        streak: user.streak || 0,
        coins: user.coins || 0,
        stars: user.stars || 0,
        wisdomStones: user.wisdomStones || 0,
        accuracy,
        attemptsCount: stats.total,
        masteredTopicsCount,
        masteredSutrasCount,
        learningScore,
        wisdomTreeStage: wisdomInfo.stage,
        wisdomTreeEmoji: wisdomInfo.emoji,
        wisdomTreeBand: bandNumber,
      };
    });

    // Sort by selected metric
    entries.sort((a, b) => {
      switch (metric) {
        case 'xp':
          return b.xp - a.xp || b.learningScore - a.learningScore;
        case 'accuracy':
          // Require at least 5 attempts to rank by pure accuracy, else fall back to score
          if (a.attemptsCount >= 5 && b.attemptsCount < 5) return -1;
          if (b.attemptsCount >= 5 && a.attemptsCount < 5) return 1;
          return b.accuracy - a.accuracy || b.attemptsCount - a.attemptsCount;
        case 'sutras':
          return (
            b.masteredSutrasCount - a.masteredSutrasCount ||
            b.masteredTopicsCount - a.masteredTopicsCount
          );
        case 'streak':
          return b.streak - a.streak || b.xp - a.xp;
        case 'score':
        default:
          return b.learningScore - a.learningScore || b.xp - a.xp;
      }
    });

    // Assign 1-indexed ranks
    entries.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    // Find current user's rank
    let currentUserRank: { rank: number; entry: LeaderboardEntry } | null =
      null;
    if (currentUserId) {
      const found = entries.find((e) => e.userId === currentUserId);
      if (found) {
        currentUserRank = {
          rank: found.rank,
          entry: found,
        };
      }
    }

    return {
      window,
      metric,
      totalParticipants: entries.length,
      entries: entries.slice(0, 50),
      currentUserRank,
    };
  }
}
