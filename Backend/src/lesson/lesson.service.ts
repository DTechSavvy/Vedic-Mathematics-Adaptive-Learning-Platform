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
<<<<<<< Updated upstream
}
=======

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
}
>>>>>>> Stashed changes
