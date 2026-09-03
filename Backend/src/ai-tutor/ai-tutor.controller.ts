import {
  Body,
  Controller,
  ForbiddenException,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiTutorService } from './ai-tutor.service';
import type { StudentProfile } from './interfaces/student-profile.interface';
import type { TutorResponse } from './interfaces/tutor-response.interface';

@Controller('ai-tutor')
export class AiTutorController {
  constructor(private readonly aiTutorService: AiTutorService) {}

  @Post('generate-response')
  @UseGuards(JwtAuthGuard)
  async generateTutorResponse(@Body() studentProfile: StudentProfile, @Request() req): Promise<TutorResponse> {
    return this.aiTutorService.generateTutorResponse(studentProfile);
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  async generateTutorResponseForMe(@Request() req) {
    return this.aiTutorService.generateTutorResponseForUser(req.user.userId);
  }

  @Post(':userId')
  @UseGuards(JwtAuthGuard)
  async generateTutorResponseForUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req,
  ) {
    if (req.user.userId !== userId) {
      throw new ForbiddenException('You can only access your own AI tutor profile.');
    }

    return this.aiTutorService.generateTutorResponseForUser(userId);
  }
}