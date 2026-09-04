import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaderboard() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        xp: true,
        level: true,
        streak: true,
      },

      orderBy: {
        xp: 'desc',
      },

      take: 10,
    });
  }
}
