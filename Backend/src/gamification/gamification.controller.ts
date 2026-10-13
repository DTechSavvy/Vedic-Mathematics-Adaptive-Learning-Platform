import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GamificationService } from './gamification.service';
import { RewardsShopService } from './rewards-shop.service';
import { WisdomTreeService } from './wisdom-tree.service';
import { GoalsService } from './goals.service';
import { PrismaService } from '../prisma/prisma.service';

interface AuthenticatedRequest {
  user: {
    userId: number;
    email: string;
  };
}

@Controller()
export class GamificationController {
  constructor(
    private readonly gamificationService: GamificationService,
    private readonly rewardsShopService: RewardsShopService,
    private readonly wisdomTreeService: WisdomTreeService,
    private readonly goalsService: GoalsService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('rewards/overview')
  async getRewardsOverview(@Request() req: AuthenticatedRequest) {
    const userId = req.user.userId;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true,
        coins: true,
        stars: true,
        wisdomStones: true,
        streak: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const [wisdomTree, dailyGoals, weeklyMissions, recentTransactions] =
      await Promise.all([
        this.wisdomTreeService.getWisdomTreeForUser(userId),
        this.goalsService.getDailyGoals(userId),
        this.goalsService.getWeeklyMissions(userId),
        this.prisma.coinTransaction.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 8,
        }),
      ]);

    const userBalances = {
      coins: user.coins,
      stars: user.stars,
      wisdomStones: user.wisdomStones,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
    };

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        ...userBalances,
      },
      balances: userBalances,
      wisdomTree,
      dailyGoals,
      weeklyMissions,
      recentTransactions,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('rewards/store')
  async getStoreCatalog(@Request() req: AuthenticatedRequest) {
    return this.rewardsShopService.getCatalogWithBalances(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('rewards/purchase')
  async purchaseStoreItem(
    @Request() req: AuthenticatedRequest,
    @Body('itemId') itemId: string,
  ) {
    if (!itemId || typeof itemId !== 'string') {
      throw new BadRequestException('Valid itemId is required');
    }
    return this.rewardsShopService.purchaseItem(req.user.userId, itemId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('rewards/entitlements')
  async getEntitlements(@Request() req: AuthenticatedRequest) {
    return this.rewardsShopService.getUserEntitlements(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('rewards/use-hint')
  async useHint(
    @Request() req: AuthenticatedRequest,
    @Body('questionId') questionId: number,
  ) {
    return this.rewardsShopService.useHintToken(req.user.userId, Number(questionId) || 0);
  }

  @UseGuards(JwtAuthGuard)
  @Post('rewards/use-solution')
  async useSolution(
    @Request() req: AuthenticatedRequest,
    @Body('questionId') questionId: number,
  ) {
    if (!questionId) {
      throw new BadRequestException('Valid questionId is required to reveal a pedagogical solution.');
    }
    return this.rewardsShopService.useSolutionToken(req.user.userId, Number(questionId));
  }

  @UseGuards(JwtAuthGuard)
  @Post('rewards/use-retry')
  async useRetry(
    @Request() req: AuthenticatedRequest,
    @Body('questionId') questionId?: number,
  ) {
    return this.rewardsShopService.useRetryToken(req.user.userId, questionId ? Number(questionId) : undefined);
  }

  @UseGuards(JwtAuthGuard)
  @Post('rewards/apply-item')
  async applyItem(
    @Request() req: AuthenticatedRequest,
    @Body('itemId') itemId: string,
    @Body('payload') payload?: any,
  ) {
    if (!itemId || typeof itemId !== 'string') {
      throw new BadRequestException('Valid itemId is required.');
    }
    return this.rewardsShopService.applyItem(req.user.userId, itemId, payload);
  }

  // --- Wisdom Tree routes (supports both /wisdom-tree and /rewards/wisdom-tree) ---
  @UseGuards(JwtAuthGuard)
  @Get('wisdom-tree')
  async getWisdomTree(@Request() req: AuthenticatedRequest) {
    return this.wisdomTreeService.getWisdomTreeForUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('rewards/wisdom-tree')
  async getRewardsWisdomTree(@Request() req: AuthenticatedRequest) {
    return this.wisdomTreeService.getWisdomTreeForUser(req.user.userId);
  }

  // --- Daily Goals routes ---
  @UseGuards(JwtAuthGuard)
  @Get('goals/daily')
  async getDailyGoals(@Request() req: AuthenticatedRequest) {
    return this.goalsService.getDailyGoals(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('rewards/goals/daily')
  async getRewardsDailyGoals(@Request() req: AuthenticatedRequest) {
    return this.goalsService.getDailyGoals(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('rewards/goals/claim')
  async claimDailyGoal(
    @Request() req: AuthenticatedRequest,
    @Body('goalId') goalId: string,
  ) {
    if (!goalId) {
      throw new BadRequestException('Valid goalId is required');
    }
    return this.goalsService.claimDailyGoalReward(req.user.userId, goalId);
  }

  // --- Weekly Missions routes ---
  @UseGuards(JwtAuthGuard)
  @Get('missions/weekly')
  async getWeeklyMissions(@Request() req: AuthenticatedRequest) {
    return this.goalsService.getWeeklyMissions(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('rewards/missions/weekly')
  async getRewardsWeeklyMissions(@Request() req: AuthenticatedRequest) {
    return this.goalsService.getWeeklyMissions(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('rewards/missions/claim')
  async claimWeeklyMission(
    @Request() req: AuthenticatedRequest,
    @Body('missionId') missionId: string,
  ) {
    if (!missionId) {
      throw new BadRequestException('Valid missionId is required');
    }
    return this.goalsService.claimWeeklyMissionReward(req.user.userId, missionId);
  }
}
