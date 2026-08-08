import { Controller, Get } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {

  constructor(
    private readonly leaderboardService:
      LeaderboardService,
  ) {}

  @Get()
  async getLeaderboard() {

    return this.leaderboardService
      .getLeaderboard();
  }
}