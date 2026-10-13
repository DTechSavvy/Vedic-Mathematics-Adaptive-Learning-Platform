import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { SutraService } from './sutra.service';

@Controller('sutras')
export class SutraController {
  constructor(private readonly sutraService: SutraService) {}

  @Get()
  async getAllSutras() {
    return this.sutraService.findAll();
  }

  @Get(':sutraId')
  async getSutraById(@Param('sutraId') sutraId: string) {
    const sutra = await this.sutraService.findById(sutraId);
    if (!sutra) {
      throw new NotFoundException(`Sutra with id "${sutraId}" was not found.`);
    }
    return sutra;
  }
}
