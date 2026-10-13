import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GamificationService } from './gamification.service';
import { RewardsShopService } from './rewards-shop.service';
import { WisdomTreeService } from './wisdom-tree.service';
import { GoalsService } from './goals.service';
import { GamificationController } from './gamification.controller';

@Module({
  imports: [PrismaModule],
  controllers: [GamificationController],
  providers: [
    GamificationService,
    RewardsShopService,
    WisdomTreeService,
    GoalsService,
  ],
  exports: [
    GamificationService,
    RewardsShopService,
    WisdomTreeService,
    GoalsService,
  ],
})
export class GamificationModule {}
