import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ModuleService } from './module.service';

@Controller()
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Get('courses/:id/modules')
  getModules(@Param('id', ParseIntPipe) id: number) {
    return this.moduleService.getModules(id);
  }

  @Get('modules/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.moduleService.findOne(id);
  }

  @Get('modules/:id/full')
  findOneWithTopics(@Param('id', ParseIntPipe) id: number) {
    return this.moduleService.findOneWithTopics(id);
  }
}
