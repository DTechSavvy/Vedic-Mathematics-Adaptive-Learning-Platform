import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TopicService } from './topic.service';

@Controller()
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Get('modules/:id/topics')
  getTopics(@Param('id', ParseIntPipe) id: number) {
    return this.topicService.getTopics(id);
  }

  @Get('topics/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.topicService.findOne(id);
  }

  @Get('topics/:id/full')
  findOneWithLessons(@Param('id', ParseIntPipe) id: number) {
    return this.topicService.findOneWithLessons(id);
  }
}
