import { Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { ExplanationService } from './explanation.service';
import { AchievementModule } from '../achievement/achievement.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, AchievementModule],
  controllers: [QuestionController],
  providers: [QuestionService, ExplanationService],
})
export class QuestionModule {}
