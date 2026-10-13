import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MasteryService } from './mastery.service';

@Module({
  imports: [PrismaModule],
  providers: [MasteryService],
  exports: [MasteryService],
})
export class MasteryModule {}
