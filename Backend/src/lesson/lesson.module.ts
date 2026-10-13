import { Module } from '@nestjs/common';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import { LearningContentService } from './learning-content.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LessonController],
  providers: [LessonService, LearningContentService],
  exports: [LessonService, LearningContentService],
})
export class LessonModule {}
