import { Controller, Get, Param } from '@nestjs/common';
import { TopicService } from './topic.service';

@Controller('modules')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Get(':id/topics')
  getTopics(@Param('id') id: string) {
    return this.topicService.getTopics(Number(id));
  }
}