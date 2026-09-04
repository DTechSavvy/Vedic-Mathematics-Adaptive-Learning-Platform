import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CurriculumService {
  constructor(private prisma: PrismaService) {}

  async getLessonForTutor(lessonId: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        examples: {
          orderBy: { order: 'asc' },
        },
        topic: true,
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    return lesson;
  }

  async getTopicCurriculum(topicId: number) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          include: {
            examples: true,
          },
        },
      },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${topicId} not found`);
    }

    return topic;
  }

  async searchCurriculum(query: string) {
    return this.prisma.lesson.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { explanation: { contains: query, mode: 'insensitive' } },
          { technique: { contains: query, mode: 'insensitive' } },
          { sutra: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        topic: true,
      },
      take: 5,
    });
  }
}
