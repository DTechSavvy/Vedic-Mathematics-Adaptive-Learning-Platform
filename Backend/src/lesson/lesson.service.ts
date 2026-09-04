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
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }
}
