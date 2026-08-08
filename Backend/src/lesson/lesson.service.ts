import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonService {
  constructor(private prisma: PrismaService) {}

  async getLessons(topicId: number) {
    return this.prisma.lesson.findMany({
      where: {
        topicId,
      },
    });
  }

  async getLesson(id: number) {
    return this.prisma.lesson.findUnique({
      where: {
        id,
      },
    });
  }
}