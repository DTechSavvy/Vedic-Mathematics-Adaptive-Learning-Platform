import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AchievementService } from './achievement.service';

@Module({
  imports: [PrismaModule],

  providers: [AchievementService],

  exports: [AchievementService],
})
export class AchievementModule {}
