import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LearningStateService } from './learning-state.service';

interface AuthenticatedRequest {
  user: { userId: number };
}

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly learningStateService: LearningStateService) {}

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  getDashboardOverview(@Request() req: AuthenticatedRequest) {
    return this.learningStateService.getDashboardOverview(req.user.userId);
  }
}
