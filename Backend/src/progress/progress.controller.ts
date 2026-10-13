import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { LearningStateService } from './learning-state.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { userId: number };
}

@Controller('progress')
export class ProgressController {
  constructor(
    private progressService: ProgressService,
    private learningStateService: LearningStateService,
  ) {}

  @Get('state')
  @UseGuards(JwtAuthGuard)
  getAuthoritativeState(@Request() req: AuthenticatedRequest) {
    return this.learningStateService.getAuthoritativeState(req.user.userId);
  }

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  getOverview(@Request() req: AuthenticatedRequest) {
    return this.learningStateService.getProgressOverview(req.user.userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyProgress(@Request() req: AuthenticatedRequest) {
    return this.progressService.getUserProgress(req.user.userId);
  }
  @Get('topics')
  @UseGuards(JwtAuthGuard)
  getTopicProgress(@Request() req: AuthenticatedRequest) {
    return this.progressService.getTopicProgress(req.user.userId);
  }
  @Get('recommendation')
  @UseGuards(JwtAuthGuard)
  getRecommendation(@Request() req: AuthenticatedRequest) {
    return this.progressService.getRecommendation(req.user.userId);
  }
  @Get('speed')
  @UseGuards(JwtAuthGuard)
  getSpeedAnalytics(@Request() req: AuthenticatedRequest) {
    return this.progressService.getSpeedAnalytics(req.user.userId);
  }
  @Get('speed-improvement')
  @UseGuards(JwtAuthGuard)
  getSpeedImprovement(@Request() req: AuthenticatedRequest) {
    return this.progressService.getSpeedImprovement(req.user.userId);
  }
  @Get('topic-analytics')
  @UseGuards(JwtAuthGuard)
  getTopicAnalytics(@Request() req: AuthenticatedRequest) {
    return this.progressService.getTopicAnalytics(req.user.userId);
  }
  @Get('mental-agility')
  @UseGuards(JwtAuthGuard)
  getMentalAgility(@Request() req: AuthenticatedRequest) {
    return this.progressService.getMentalAgility(req.user.userId);
  }

  @Get('sutras')
  @UseGuards(JwtAuthGuard)
  getSutraProgress(@Request() req: AuthenticatedRequest) {
    return this.progressService.getSutraProgress(req.user.userId);
  }

  @Get('difficulty')
  @UseGuards(JwtAuthGuard)
  getDifficultyProgress(@Request() req: AuthenticatedRequest) {
    return this.progressService.getDifficultyProgress(req.user.userId);
  }
}
