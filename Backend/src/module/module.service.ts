import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModuleService {
  constructor(private prisma: PrismaService) {}

  async getModules(courseId: number) {
    return this.prisma.module.findMany({
      where: {
        courseId,
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: number) {
    const module = await this.prisma.module.findUnique({
      where: { id },
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }

    return module;
  }

  async findOneWithTopics(id: number) {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: {
        topics: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }

    return module;
  }
}
