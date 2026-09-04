import { Controller, Get, Param } from '@nestjs/common';
import { LessonService } from './lesson.service';

@Controller()
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get('topics/:id/lessons')
  getLessons(@Param('id') id: string) {
    return this.lessonService.getLessons(Number(id));
  }

  @Get('lessons/:id')
  getLesson(@Param('id') id: string) {
    return this.lessonService.getLesson(Number(id));
  }
}