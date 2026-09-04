import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModuleService {
  constructor(private prisma: PrismaService) {}

  async getModules(courseId: number) {
    return this.prisma.module.findMany({
      where: {
        courseId,
      },
    });
  }
}