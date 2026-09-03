import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { QuestionService } from './question.service';

@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get('generate/:templateId')
  @UseGuards(JwtAuthGuard)
  generateQuestion(@Param('templateId') templateId: string, @Request() req) {
    return this.questionService.generateQuestion(Number(templateId), req.user.userId);
  }

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  submitAnswer(@Body() dto: SubmitAnswerDto, @Request() req) {
    return this.questionService.submitAnswer(dto.questionId, dto.answer, req.user.userId);
  }
}
