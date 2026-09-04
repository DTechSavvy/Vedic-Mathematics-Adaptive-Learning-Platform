import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CurriculumService } from './curriculum.service';

@Controller('curriculum')
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Get('topics/:id')
  getTopicCurriculum(@Param('id', ParseIntPipe) id: number) {
    return this.curriculumService.getTopicCurriculum(id);
  }

  @Get('search')
  searchCurriculum(@Query('q') query: string) {
    if (!query) return [];
    return this.curriculumService.searchCurriculum(query);
  }
}
