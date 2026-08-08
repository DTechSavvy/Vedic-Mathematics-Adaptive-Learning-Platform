import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AiTutorController } from './ai-tutor.controller';
import { AiTutorService } from './ai-tutor.service';
import { StudentProfileBuilderService } from './student-profile-builder.service';

import { DoubtSolverService } from './services/doubt-solver.service';
import { MistakeAnalyzerService } from './services/mistake-analyzer.service';
import { StudyPlannerService } from './services/study-planner.service';
import { RecommendationService } from './services/recommendation.service';
import { MotivationService } from './services/motivation.service';

@Module({
  imports: [PrismaModule],
  controllers: [AiTutorController],
  providers: [
    AiTutorService,
    StudentProfileBuilderService,
    DoubtSolverService,
    MistakeAnalyzerService,
    StudyPlannerService,
    RecommendationService,
    MotivationService,
  ],
  exports: [AiTutorService],
})
export class AiTutorModule {}