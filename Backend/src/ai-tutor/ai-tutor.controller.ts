import { Controller, Post, Body } from '@nestjs/common';
import { Param, ParseIntPipe } from '@nestjs/common';
import { AiTutorService } from './ai-tutor.service';
import type { StudentProfile } from './interfaces/student-profile.interface';
import type { TutorResponse } from './interfaces/tutor-response.interface';

@Controller('ai-tutor')
export class AiTutorController {
  constructor(
    private readonly aiTutorService: AiTutorService,
  ) {}

  @Post('generate-response')
  async generateTutorResponse(
    @Body() studentProfile: StudentProfile,
  ): Promise<TutorResponse> {
    return this.aiTutorService.generateTutorResponse(
      studentProfile,
    );
  }
  @Post(':userId')
  async generateTutorResponseForUser(
    @Param(
     'userId',
     ParseIntPipe,
  )
    userId: number,
) {
    return this.aiTutorService
      .generateTutorResponseForUser(
       userId,
    );
  }
}