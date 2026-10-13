import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { QuestionService } from './question.service';
import { PracticeDifficultyService } from './practice-difficulty.service';

interface AuthenticatedRequest {
  user: { userId: number };
}

@Controller('questions')
export class QuestionController {
  constructor(
    private readonly questionService: QuestionService,
    private readonly practiceDifficultyService: PracticeDifficultyService,
  ) {}

  @Get('difficulty-access')
  @UseGuards(JwtAuthGuard)
  getDifficultyAccess(@Request() req: AuthenticatedRequest) {
    return this.practiceDifficultyService.getDifficultyAccess(req.user.userId);
  }

  @Get('generate/:templateId')
  @UseGuards(JwtAuthGuard)
  generateQuestion(
    @Param('templateId') templateId: string,
    @Query('difficulty') difficulty: string | undefined,
    @Query('questionType') questionType: string | undefined,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.questionService.generateQuestion(
      Number(templateId),
      req.user.userId,
      difficulty,
      questionType,
    );
  }

  @Get('generate/topic/:topicId')
  @UseGuards(JwtAuthGuard)
  generateTopicQuestion(
    @Param('topicId') topicId: string,
    @Query('difficulty') difficulty: string | undefined,
    @Query('questionType') questionType: string | undefined,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.questionService.generateTopicQuestion(
      Number(topicId),
      req.user.userId,
      difficulty,
      questionType,
    );
  }

  @Get('generate/sutra/:sutraId')
  @UseGuards(JwtAuthGuard)
  generateSutraQuestion(
    @Param('sutraId') sutraId: string,
    @Query('difficulty') difficulty: string | undefined,
    @Query('questionType') questionType: string | undefined,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.questionService.generateQuestionForSutra(
      sutraId,
      req.user.userId,
      difficulty,
      questionType,
    );
  }

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  submitAnswer(
    @Body() dto: SubmitAnswerDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.questionService.submitAnswer(
      dto.questionId,
      dto.answer,
      req.user.userId,
    );
  }
}
