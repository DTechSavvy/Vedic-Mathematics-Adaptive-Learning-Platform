import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SutraController } from './sutra.controller';
import { SutraService } from './sutra.service';

@Module({
  imports: [PrismaModule],
  controllers: [SutraController],
  providers: [SutraService],
  exports: [SutraService],
})
export class SutraModule {}
