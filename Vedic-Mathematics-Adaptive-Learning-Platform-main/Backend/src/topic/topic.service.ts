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
}