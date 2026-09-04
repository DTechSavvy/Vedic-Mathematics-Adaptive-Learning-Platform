import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiTutorService } from './ai-tutor.service';
import { SendTutorMessageDto } from './dto/tutor-message.dto';
import { StructuredTutorResponseDto } from './dto/tutor-response.dto';
import type { StudentProfile } from './interfaces/student-profile.interface';
import { TutorResponse } from './interfaces/tutor-response.interface';
import { ConversationService } from './services/conversation.service';

import { AiRateLimitGuard } from './guards/ai-rate-limit.guard';

@Controller('ai-tutor')
@UseGuards(JwtAuthGuard)
export class AiTutorController {
  constructor(
    private readonly aiTutorService: AiTutorService,
    private readonly conversationService: ConversationService,
  ) {}

  /**
   * Primary Production Endpoint: Process an interactive student tutor message
   * Authenticated user is resolved strictly from verified JWT
   */
  @Post('message')
  @UseGuards(AiRateLimitGuard)
  async sendMessage(
    @Request() req: any,
    @Body() dto: SendTutorMessageDto,
  ): Promise<StructuredTutorResponseDto> {
    return this.aiTutorService.processMessage(req.user.userId, dto);
  }

  /**
   * List recent conversations belonging to the authenticated student
   */
  @Get('conversations')
  async listConversations(
    @Request() req: any,
    @Query('limit') limit?: string,
  ) {
    const take = limit ? Math.min(Math.max(Number(limit), 1), 50) : 20;
    return this.conversationService.getUserConversations(req.user.userId, take);
  }

  /**
   * Retrieve a specific conversation and its messages with strict ownership check
   */
  @Get('conversations/:id')
  async getConversation(
    @Request() req: any,
    @Param('id') conversationId: string,
  ) {
    return this.conversationService.getConversationWithMessages(
      conversationId,
      req.user.userId,
    );
  }

  // ==========================================
  // Legacy Endpoints preserved for compatibility
  // ==========================================

  @Post('generate-response')
  async generateTutorResponse(
    @Body() studentProfile: StudentProfile,
  ): Promise<TutorResponse> {
    return this.aiTutorService.generateTutorResponse(studentProfile);
  }

  @Post('me')
  async generateTutorResponseForMe(@Request() req: any) {
    return this.aiTutorService.generateTutorResponseForUser(req.user.userId);
  }

  @Post(':userId')
  async generateTutorResponseForUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req: any,
  ) {
    if (req.user.userId !== userId) {
      throw new ForbiddenException('You can only access your own AI tutor profile.');
    }

    return this.aiTutorService.generateTutorResponseForUser(userId);
  }
}