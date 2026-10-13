import { Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { ExplanationService } from './explanation.service';
import { PracticeDifficultyService } from './practice-difficulty.service';
import { TechniqueSelectionService } from './technique-selection.service';
import { QuestionValidationGateService } from './question-validation-gate.service';
import { AchievementModule } from '../achievement/achievement.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SutraModule } from '../sutra/sutra.module';
import { MasteryModule } from '../progress/mastery.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [
    PrismaModule,
    AchievementModule,
    SutraModule,
    MasteryModule,
    GamificationModule,
  ],
  controllers: [QuestionController],
  providers: [
    QuestionService,
    ExplanationService,
    PracticeDifficultyService,
    TechniqueSelectionService,
    QuestionValidationGateService,
  ],
  exports: [
    QuestionService,
    PracticeDifficultyService,
    TechniqueSelectionService,
    QuestionValidationGateService,
  ],
})
export class QuestionModule {}
