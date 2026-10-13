import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { userId: number };
}

@Controller('achievements')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAchievements(@Request() req: AuthenticatedRequest) {
    return this.achievementService.getAchievementsForUser(req.user.userId);
  }

  @Post('evaluate')
  @UseGuards(JwtAuthGuard)
  async evaluateAchievements(@Request() req: AuthenticatedRequest) {
    const newlyUnlocked = await this.achievementService.evaluateAchievements(
      req.user.userId,
    );
    const achievements = await this.achievementService.getAchievementsForUser(
      req.user.userId,
    );
    return {
      newlyUnlocked,
      achievements,
    };
  }
}
