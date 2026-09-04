import { Controller, Get, Request, UseGuards } from '@nestjs/common';

import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('progress')
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyProgress(@Request() req) {
    return this.progressService.getUserProgress(req.user.userId);
  }
  @Get('topics')
  @UseGuards(JwtAuthGuard)
  getTopicProgress(@Request() req) {
    return this.progressService.getTopicProgress(req.user.userId);
  }
  @Get('recommendation')
  @UseGuards(JwtAuthGuard)
  getRecommendation(@Request() req) {
    return this.progressService.getRecommendation(req.user.userId);
  }
  @Get('speed')
  @UseGuards(JwtAuthGuard)
  getSpeedAnalytics(@Request() req) {
    return this.progressService.getSpeedAnalytics(req.user.userId);
  }
  @Get('speed-improvement')
  @UseGuards(JwtAuthGuard)
  getSpeedImprovement(@Request() req) {
    return this.progressService.getSpeedImprovement(req.user.userId);
  }
  @Get('topic-analytics')
  @UseGuards(JwtAuthGuard)
  getTopicAnalytics(@Request() req) {
    return this.progressService.getTopicAnalytics(req.user.userId);
  }
  @Get('mental-agility')
  @UseGuards(JwtAuthGuard)
  getMentalAgility(@Request() req) {
    return this.progressService.getMentalAgility(req.user.userId);
  }
}
