import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface MessageMetadata {
  intent?: string;
  mode?: string;
  math?: any;
  latencyMs?: number;
  modelName?: string;
  providerName?: string;
}

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);
  private readonly DEFAULT_HISTORY_LIMIT = 8;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves an existing conversation ensuring strict ownership, or creates a new one.
   */
  async getOrCreateConversation(
    userId: number,
    conversationId?: string | null,
    contextParams?: {
      topicId?: number;
      moduleId?: number;
      courseId?: number;
      title?: string;
    },
  ) {
    if (conversationId) {
      const existing = await (this.prisma as any).tutorConversation.findUnique({
        where: { id: conversationId },
      });

      if (!existing) {
        throw new NotFoundException(
          `Conversation ${conversationId} not found.`,
        );
      }

      // STRICT OWNERSHIP CHECK: A user must NEVER read or continue another user's conversation!
      if (existing.userId !== userId) {
        throw new ForbiddenException(
          'Access denied: You do not own this conversation.',
        );
      }

      return existing;
    }

    // Create a new conversation
    return (this.prisma as any).tutorConversation.create({
      data: {
        userId,
        topicId: contextParams?.topicId,
        moduleId: contextParams?.moduleId,
        courseId: contextParams?.courseId,
        title: contextParams?.title || 'Vedic Mathematics Session',
      },
    });
  }

  /**
   * Persist a message in the conversation
   */
  async addMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    meta?: MessageMetadata,
  ) {
    try {
      const message = await (this.prisma as any).tutorMessage.create({
        data: {
          conversationId,
          role,
          content,
          intent: meta?.intent,
          mode: meta?.mode,
          metadata: meta ? (meta as any) : undefined,
        },
      });

      // Touch updatedAt on conversation
      await (this.prisma as any).tutorConversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      return message;
    } catch (err: any) {
      this.logger.error(
        `Failed to persist tutor message: ${err.message}`,
        err.stack,
      );
      throw err;
    }
  }

  /**
   * Retrieve bounded recent conversation history for LLM prompt context
   */
  async getRecentMessages(
    conversationId: string,
    limit = this.DEFAULT_HISTORY_LIMIT,
  ): Promise<{ role: string; content: string; intent?: string }[]> {
    try {
      const messages = await (this.prisma as any).tutorMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      // Reverse to return in chronological order
      return messages.reverse().map((m: any) => ({
        role: m.role,
        content: m.content,
        intent: m.intent || undefined,
      }));
    } catch (err: any) {
      this.logger.warn(`Failed to retrieve recent messages: ${err.message}`);
      return [];
    }
  }

  /**
   * Retrieve conversations for authenticated user
   */
  async getUserConversations(userId: number, limit = 20) {
    return (this.prisma as any).tutorConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Preview latest message
        },
      },
    });
  }

  /**
   * Retrieve complete conversation with messages, enforcing authenticated ownership
   */
  async getConversationWithMessages(
    conversationId: string,
    userId: number,
    messageLimit = 50,
  ) {
    const conversation = await (
      this.prisma as any
    ).tutorConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: messageLimit,
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation ${conversationId} not found.`);
    }

    if (conversation.userId !== userId) {
      throw new ForbiddenException(
        'Access denied: You do not own this conversation.',
      );
    }

    return conversation;
  }
}
