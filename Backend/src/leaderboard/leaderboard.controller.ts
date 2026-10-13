import { Controller, Get, Query, Req } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import type {
  LeaderboardMetric,
  LeaderboardWindow,
} from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async getLeaderboard(
    @Query('window') window?: string,
    @Query('metric') metric?: string,
    @Query('userId') userId?: string,
    @Req() req?: any,
  ) {
    const effectiveUserId = userId ? parseInt(userId, 10) : req?.user?.userId;
    return this.leaderboardService.getLeaderboard(
      effectiveUserId,
      (window as LeaderboardWindow) || 'allTime',
      (metric as LeaderboardMetric) || 'score',
    );
  }
}
