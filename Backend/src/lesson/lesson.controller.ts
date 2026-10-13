import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LearningContentService } from './learning-content.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { userId: number };
}

@Controller()
export class LessonController {
  constructor(
    private readonly lessonService: LessonService,
    private readonly learningContentService: LearningContentService,
  ) {}

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

  @Get('lessons/:id/progress')
  @UseGuards(JwtAuthGuard)
  getLessonProgress(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.lessonService.getLessonProgress(req.user.userId, id);
  }

  @Post('lessons/:id/start')
  @UseGuards(JwtAuthGuard)
  startLesson(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.lessonService.startLesson(req.user.userId, id);
  }

  @Post('lessons/:id/complete')
  @UseGuards(JwtAuthGuard)
  completeLesson(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.lessonService.completeLesson(req.user.userId, id);
  }

  // ==========================================
  // Multi-Page Learning Content Architecture
  // ==========================================

  @Get('lessons/:id/pages')
  getLessonPages(
    @Param('id', ParseIntPipe) id: number,
    @Request() req?: any,
  ) {
    const userId = req?.user?.userId;
    return this.learningContentService.getLessonPages(id, userId);
  }

  @Get('lessons/:id/pages/:pageId')
  getPageDetails(
    @Param('id', ParseIntPipe) lessonId: number,
    @Param('pageId') pageId: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.userId;
    return this.learningContentService.getPageDetails(lessonId, pageId, userId);
  }

  @Post('lessons/:id/pages/:pageId/start')
  @UseGuards(JwtAuthGuard)
  startPage(
    @Param('pageId', ParseIntPipe) pageId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.learningContentService.startPage(req.user.userId, pageId);
  }

  @Post('lessons/:id/pages/:pageId/complete')
  @UseGuards(JwtAuthGuard)
  completePage(
    @Param('pageId', ParseIntPipe) pageId: number,
    @Request() req: AuthenticatedRequest,
    @Body() body?: { timeSpentSeconds?: number },
  ) {
    return this.learningContentService.completePage(
      req.user.userId,
      pageId,
      body?.timeSpentSeconds,
    );
  }

  @Post('lessons/:id/resume')
  @UseGuards(JwtAuthGuard)
  resumeLesson(
    @Param('id', ParseIntPipe) lessonId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.learningContentService.resumeLesson(req.user.userId, lessonId);
  }

  @Get('topics/:id/resources')
  getTopicResources(@Param('id', ParseIntPipe) topicId: number) {
    return this.learningContentService.getTopicResources(topicId);
  }
}
