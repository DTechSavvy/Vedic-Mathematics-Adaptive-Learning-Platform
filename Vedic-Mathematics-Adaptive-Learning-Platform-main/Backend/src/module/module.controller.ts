import { Controller, Get, Param } from '@nestjs/common';
import { ModuleService } from './module.service';

@Controller('courses')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Get(':id/modules')
  getModules(@Param('id') id: string) {
    return this.moduleService.getModules(Number(id));
  }
}