import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService) {}

  async getLessons(topicId: number) {
    return this.prisma.lesson.findMany({
      where: {
        topicId,
      },
      orderBy: { order: 'asc' },
    });
  }

  async getLesson(id: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: {
        id,
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }

  async getLessonContent(id: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        examples: {
          orderBy: { order: 'asc' },
        },
        prerequisiteLesson: true,
        topic: {
          include: {
            templates: true,
            module: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }

  async getLessonProgress(userId: number, lessonId: number) {
    const progress = await this.prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    return (
      progress || {
        userId,
        lessonId,
        status: 'NOT_STARTED',
        openedAt: null,
        completedAt: null,
      }
    );
  }

  async startLesson(userId: number, lessonId: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    const existing = await this.prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    if (existing?.status === 'COMPLETED') {
      return existing;
    }

    const newStatus = existing ? 'IN_PROGRESS' : 'OPENED';

    return this.prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        status: newStatus,
      },
      create: {
        userId,
        lessonId,
        status: newStatus,
      },
    });
  }

  async completeLesson(userId: number, lessonId: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    const existing = await this.prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    const wasAlreadyCompleted = existing?.status === 'COMPLETED';

    const updated = await this.prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      create: {
        userId,
        lessonId,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    // Reward lesson completion XP if completed for the first time
    if (!wasAlreadyCompleted) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: 40 },
          coins: { increment: 15 },
        },
      });
    }

    return updated;
  }
}
