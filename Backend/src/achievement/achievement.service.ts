import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AchievementService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async unlockAchievement(
    userId: number,
    title: string,
    description: string,
  ) {

    const existing =
      await this.prisma.achievement.findFirst({
        where: {
          userId,
          title,
        },
      });

    if (existing) {
      return;
    }

    await this.prisma.achievement.create({
      data: {
        userId,
        title,
        description,
      },
    });
  }
}