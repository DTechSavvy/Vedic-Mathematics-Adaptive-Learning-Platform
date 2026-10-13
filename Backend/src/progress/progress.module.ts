import { Module } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { DashboardController } from './dashboard.controller';
import { LearningStateService } from './learning-state.service';
import { PrismaModule } from '../prisma/prisma.module';
import { QuestionModule } from '../question/question.module';
import { MasteryModule } from './mastery.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [PrismaModule, QuestionModule, MasteryModule, GamificationModule],
  providers: [ProgressService, LearningStateService],
  controllers: [ProgressController, DashboardController],
  exports: [ProgressService, LearningStateService],
})
export class ProgressModule {}

