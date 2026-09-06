import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TopicService {
  constructor(private prisma: PrismaService) {}

  async getTopics(moduleId: number) {
    return this.prisma.topic.findMany({
      where: {
        moduleId,
      },
    });
  }
<<<<<<< Updated upstream
}
=======

  async findOne(id: number) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }

    return topic;
  }

  async findOneWithLessons(id: number) {
    const topic = await this.prisma.topic.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
        templates: true,
      },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }

    return topic;
  }
}
>>>>>>> Stashed changes
