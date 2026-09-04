import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { LessonService } from './lesson.service';

@Controller()
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get('topics/:id/lessons')
  getLessons(@Param('id', ParseIntPipe) id: number) {
    return this.lessonService.getLessons(id);
  }

  @Get('lessons/:id')
  getLesson(@Param('id', ParseIntPipe) id: number) {
    return this.lessonService.getLesson(id);
  }

  @Get('lessons/:id/content')
  getLessonContent(@Param('id', ParseIntPipe) id: number) {
    return this.lessonService.getLessonContent(id);
  }
}
