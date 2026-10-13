import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DailyGoalItem {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
  rewardClaimed: boolean;
  rewardXp: number;
  rewardCoins: number;
  icon: string;
}

export interface WeeklyMissionItem {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
  rewardClaimed: boolean;
  rewardXp: number;
  rewardCoins: number;
  rewardStars: number;
  icon: string;
}

@Injectable()
export class GoalsService {
  private readonly logger = new Logger(GoalsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private getTodayString(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private getMondayString(): string {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d.setDate(diff));
    return `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, '0')}-${String(mon.getDate()).padStart(2, '0')}`;
  }

  /**
   * Generates dynamic, personalized daily goals derived from real learner state:
   * unfinished lessons, recent errors, today's practice volume, and accuracy.
   */
  async getDailyGoals(userId: number): Promise<DailyGoalItem[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateStr = this.getTodayString();

    const [attemptsToday, incompleteLesson, recentWrong, dbGoalRecords] = await Promise.all([
      this.prisma.questionAttempt.findMany({
        where: {
          userId,
          createdAt: { gte: today },
          isValidAttempt: true,
        },
        include: {
          template: {
            include: { topic: true },
          },
        },
      }),
      this.prisma.lessonProgress.findFirst({
        where: {
          userId,
          status: { in: ['OPENED', 'IN_PROGRESS'] },
        },
        include: {
          lesson: {
            include: { topic: true },
          },
        },
      }),
      this.prisma.questionAttempt.findFirst({
        where: {
          userId,
          isCorrect: false,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          template: {
            include: { topic: true },
          },
        },
      }),
      this.prisma.dailyGoalProgress.findMany({
        where: {
          userId,
          date: dateStr,
        },
      }),
    ]);

    const solvedCount = attemptsToday.length;
    const correctCount = attemptsToday.filter((a) => a.isCorrect).length;
    const todayAccuracy = solvedCount === 0 ? 0 : Math.round((correctCount / solvedCount) * 100);

    const timeSpentSeconds = attemptsToday.reduce(
      (sum, a) => sum + (a.timeTakenSeconds || 15),
      0,
    );
    const timeSpentMinutes = Math.min(60, Math.round(timeSpentSeconds / 60));

    // Determine 4 dynamic goals:
    // Goal 1: Practice volume (10 questions)
    const goal1: DailyGoalItem = {
      id: 'goal-solve-ten',
      title: 'Practice Consistency',
      description: 'Solve at least 10 valid practice problems today.',
      target: 10,
      current: Math.min(10, solvedCount),
      unit: 'problems',
      completed: solvedCount >= 10,
      rewardClaimed: false,
      rewardXp: 150,
      rewardCoins: 250,
      icon: '🎯',
    };

    // Goal 2: Accuracy benchmark (80% accuracy over at least 5 questions)
    const goal2: DailyGoalItem = {
      id: 'goal-accuracy-80',
      title: 'Vedic Precision',
      description: 'Maintain 80%+ accuracy across at least 5 problems.',
      target: 80,
      current: solvedCount >= 5 ? todayAccuracy : Math.min(todayAccuracy, 79),
      unit: '%',
      completed: solvedCount >= 5 && todayAccuracy >= 80,
      rewardClaimed: false,
      rewardXp: 200,
      rewardCoins: 350,
      icon: '🏹',
    };

    // Goal 3: Study time or unfinished lesson
    let goal3: DailyGoalItem;
    if (incompleteLesson) {
      const lessonTitle = incompleteLesson.lesson.title;
      const completedToday = incompleteLesson.status === 'COMPLETED';
      goal3 = {
        id: 'goal-complete-lesson',
        title: `Complete ${lessonTitle.length > 25 ? lessonTitle.slice(0, 22) + '...' : lessonTitle}`,
        description: `Finish the instructional lesson and review worked examples for ${incompleteLesson.lesson.topic?.title || 'technique'}.`,
        target: 1,
        current: completedToday ? 1 : 0,
        unit: 'lesson',
        completed: completedToday,
        rewardClaimed: false,
        rewardXp: 180,
        rewardCoins: 300,
        icon: '📖',
      };
    } else {
      goal3 = {
        id: 'goal-study-session',
        title: 'Active Vedic Study',
        description: 'Spend at least 15 minutes in mental math computation.',
        target: 15,
        current: Math.min(15, timeSpentMinutes),
        unit: 'mins',
        completed: timeSpentMinutes >= 15,
        rewardClaimed: false,
        rewardXp: 150,
        rewardCoins: 250,
        icon: '⏱️',
      };
    }

    // Goal 4: Review weak sutra or mistake
    let goal4: DailyGoalItem;
    if (recentWrong && recentWrong.template?.topic) {
      const weakTitle = recentWrong.template.topic.title;
      const solvedWeakToday = attemptsToday.some(
        (a) => a.template?.topicId === recentWrong.template.topicId && a.isCorrect,
      );
      goal4 = {
        id: 'goal-review-mistake',
        title: `Master ${weakTitle.length > 22 ? weakTitle.slice(0, 20) + '...' : weakTitle}`,
        description: `Correctly solve at least 1 problem in ${weakTitle} to overcome your recent calculation trap.`,
        target: 1,
        current: solvedWeakToday ? 1 : 0,
        unit: 'correction',
        completed: solvedWeakToday,
        rewardClaimed: false,
        rewardXp: 220,
        rewardCoins: 400,
        icon: '🔄',
      };
    } else {
      goal4 = {
        id: 'goal-multi-tier',
        title: 'Tier Exploration',
        description: 'Solve questions across at least 2 distinct difficulty tiers.',
        target: 2,
        current: new Set(attemptsToday.map((a) => a.difficulty).filter(Boolean)).size,
        unit: 'tiers',
        completed: new Set(attemptsToday.map((a) => a.difficulty).filter(Boolean)).size >= 2,
        rewardClaimed: false,
        rewardXp: 200,
        rewardCoins: 350,
        icon: '🧗',
      };
    }

    const candidateGoals = [goal1, goal2, goal3, goal4];

    // Synchronize with database DailyGoalProgress records
    for (const g of candidateGoals) {
      const existing = dbGoalRecords.find((r) => r.goalType === g.id);
      if (existing) {
        g.rewardClaimed = existing.rewardClaimed;
        // Update progress if not yet completed in DB or current is higher
        if (existing.currentVal !== g.current || existing.completed !== g.completed) {
          await this.prisma.dailyGoalProgress.update({
            where: { id: existing.id },
            data: {
              currentVal: g.current,
              targetVal: g.target,
              completed: g.completed,
            },
          });
        }
      } else {
        await this.prisma.dailyGoalProgress.create({
          data: {
            userId,
            date: dateStr,
            goalType: g.id,
            currentVal: g.current,
            targetVal: g.target,
            completed: g.completed,
            rewardClaimed: false,
          },
        });
      }
    }

    return candidateGoals;
  }

  /**
   * Retrieves active weekly missions for the learner.
   */
  async getWeeklyMissions(userId: number): Promise<WeeklyMissionItem[]> {
    const now = new Date();
    const monday = new Date(now);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);

    const weekStr = `week-${this.getMondayString()}`;

    const [weeklyAttempts, dbMissionRecords] = await Promise.all([
      this.prisma.questionAttempt.findMany({
        where: {
          userId,
          createdAt: { gte: monday },
          isValidAttempt: true,
        },
        include: {
          template: {
            include: { topic: true },
          },
        },
      }),
      this.prisma.dailyGoalProgress.findMany({
        where: {
          userId,
          date: weekStr,
        },
      }),
    ]);

    const totalSolved = weeklyAttempts.length;
    const correctSolved = weeklyAttempts.filter((a) => a.isCorrect).length;
    const weeklyAccuracy = totalSolved === 0 ? 0 : Math.round((correctSolved / totalSolved) * 100);

    const distinctTopics = new Set(
      weeklyAttempts.map((a) => a.template?.topicId).filter(Boolean),
    );

    const distinctDifficulties = new Set(
      weeklyAttempts.map((a) => a.difficulty || a.template?.difficulty).filter(Boolean),
    );

    const missions: WeeklyMissionItem[] = [
      {
        id: 'mission-sutra-explorer',
        title: 'Curriculum Explorer',
        description: 'Practice questions across at least 4 distinct topics this week.',
        target: 4,
        current: Math.min(4, distinctTopics.size),
        unit: 'topics',
        completed: distinctTopics.size >= 4,
        rewardClaimed: false,
        rewardXp: 500,
        rewardCoins: 1000,
        rewardStars: 1,
        icon: '🧭',
      },
      {
        id: 'mission-accuracy-builder',
        title: 'Weekly Accuracy Master',
        description: 'Achieve 80%+ accuracy across at least 30 attempts this week.',
        target: 30,
        current: totalSolved >= 30 && weeklyAccuracy >= 80 ? 30 : Math.min(30, totalSolved),
        unit: 'attempts',
        completed: totalSolved >= 30 && weeklyAccuracy >= 80,
        rewardClaimed: false,
        rewardXp: 750,
        rewardCoins: 1500,
        rewardStars: 2,
        icon: '💎',
      },
      {
        id: 'mission-deep-practice',
        title: 'Deep Practice Marathon',
        description: 'Solve 50 valid practice problems throughout the week.',
        target: 50,
        current: Math.min(50, totalSolved),
        unit: 'questions',
        completed: totalSolved >= 50,
        rewardClaimed: false,
        rewardXp: 800,
        rewardCoins: 1800,
        rewardStars: 2,
        icon: '🏃',
      },
      {
        id: 'mission-difficulty-climber',
        title: 'Tier Climber',
        description: 'Solve problems across Easy, Medium, and Advanced tiers.',
        target: 3,
        current: Math.min(3, distinctDifficulties.size),
        unit: 'tiers',
        completed: distinctDifficulties.size >= 3,
        rewardClaimed: false,
        rewardXp: 600,
        rewardCoins: 1200,
        rewardStars: 1,
        icon: '🧗',
      },
    ];

    for (const m of missions) {
      const existing = dbMissionRecords.find((r) => r.goalType === m.id);
      if (existing) {
        m.rewardClaimed = existing.rewardClaimed;
        if (existing.currentVal !== m.current || existing.completed !== m.completed) {
          await this.prisma.dailyGoalProgress.update({
            where: { id: existing.id },
            data: {
              currentVal: m.current,
              targetVal: m.target,
              completed: m.completed,
            },
          });
        }
      } else {
        await this.prisma.dailyGoalProgress.create({
          data: {
            userId,
            date: weekStr,
            goalType: m.id,
            currentVal: m.current,
            targetVal: m.target,
            completed: m.completed,
            rewardClaimed: false,
          },
        });
      }
    }

    return missions;
  }

  /**
   * Atomically claims a verified daily goal reward.
   */
  async claimDailyGoalReward(userId: number, goalId: string) {
    const dateStr = this.getTodayString();

    const record = await this.prisma.dailyGoalProgress.findUnique({
      where: {
        userId_date_goalType: {
          userId,
          date: dateStr,
          goalType: goalId,
        },
      },
    });

    if (!record) {
      throw new NotFoundException(`Goal '${goalId}' not found for today.`);
    }

    if (!record.completed) {
      throw new BadRequestException('Goal criteria have not been satisfied yet.');
    }

    if (record.rewardClaimed) {
      throw new BadRequestException('Goal reward has already been claimed today.');
    }

    // Determine rewards
    const goals = await this.getDailyGoals(userId);
    const goal = goals.find((g) => g.id === goalId);
    const rewardCoins = goal?.rewardCoins || 250;
    const rewardXp = goal?.rewardXp || 150;

    // Atomic transaction: mark claimed, award coins & XP, create CoinTransaction
    const [updatedRecord, updatedUser] = await this.prisma.$transaction([
      this.prisma.dailyGoalProgress.update({
        where: { id: record.id },
        data: { rewardClaimed: true },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          coins: { increment: rewardCoins },
          xp: { increment: rewardXp },
        },
      }),
      this.prisma.coinTransaction.create({
        data: {
          userId,
          amount: rewardCoins,
          type: 'EARN',
          source: 'DAILY_GOAL',
          referenceId: goalId,
        },
      }),
    ]);

    this.logger.log(`User ${userId} claimed daily goal '${goalId}' (+${rewardCoins} coins, +${rewardXp} XP)`);

    return {
      success: true,
      message: `Goal reward claimed! +${rewardCoins} V-Coins, +${rewardXp} XP!`,
      rewardCoins,
      rewardXp,
      remainingCoins: updatedUser.coins,
      remainingXp: updatedUser.xp,
    };
  }

  /**
   * Atomically claims a verified weekly mission reward.
   */
  async claimWeeklyMissionReward(userId: number, missionId: string) {
    const weekStr = `week-${this.getMondayString()}`;

    const record = await this.prisma.dailyGoalProgress.findUnique({
      where: {
        userId_date_goalType: {
          userId,
          date: weekStr,
          goalType: missionId,
        },
      },
    });

    if (!record) {
      throw new NotFoundException(`Mission '${missionId}' not found for this week.`);
    }

    if (!record.completed) {
      throw new BadRequestException('Mission criteria have not been satisfied yet.');
    }

    if (record.rewardClaimed) {
      throw new BadRequestException('Mission reward has already been claimed this week.');
    }

    const missions = await this.getWeeklyMissions(userId);
    const mission = missions.find((m) => m.id === missionId);
    const rewardCoins = mission?.rewardCoins || 1000;
    const rewardXp = mission?.rewardXp || 500;
    const rewardStars = mission?.rewardStars || 1;

    const [updatedRecord, updatedUser] = await this.prisma.$transaction([
      this.prisma.dailyGoalProgress.update({
        where: { id: record.id },
        data: { rewardClaimed: true },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          coins: { increment: rewardCoins },
          xp: { increment: rewardXp },
          stars: { increment: rewardStars },
        },
      }),
      this.prisma.coinTransaction.create({
        data: {
          userId,
          amount: rewardCoins,
          type: 'EARN',
          source: 'WEEKLY_MISSION',
          referenceId: missionId,
        },
      }),
    ]);

    this.logger.log(`User ${userId} claimed weekly mission '${missionId}' (+${rewardCoins} coins, +${rewardStars} stars)`);

    return {
      success: true,
      message: `Mission reward claimed! +${rewardCoins} V-Coins, +${rewardStars} Stars, +${rewardXp} XP!`,
      rewardCoins,
      rewardXp,
      rewardStars,
      remainingCoins: updatedUser.coins,
      remainingStars: updatedUser.stars,
      remainingXp: updatedUser.xp,
    };
  }

  /**
   * Hook for recording real-time progress events.
   */
  async recordProgress(userId: number, _progress: any) {
    // Automatically derived on demand
    return { success: true };
  }
}
