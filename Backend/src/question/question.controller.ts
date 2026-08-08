import { Controller, Get, Param } from '@nestjs/common';
import { QuestionService } from './question.service';
import { Body, Post } from '@nestjs/common';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import {UseGuards,Request,} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('questions')
export class QuestionController {
  constructor(
    private readonly questionService: QuestionService,
  ) {}

  @Get('generate/:templateId')
@UseGuards(JwtAuthGuard)
generateQuestion(
  @Param('templateId') templateId: string,
  @Request() req,
) {
  return this.questionService.generateQuestion(
    Number(templateId),
    req.user.userId,
  );
}
  @Post('submit')
submitAnswer(
  @Body() dto: SubmitAnswerDto,
) {
  return this.questionService.submitAnswer(
    dto.questionId,
    dto.answer,
  );
 }
}
