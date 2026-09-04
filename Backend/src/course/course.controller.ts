import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CourseService } from './course.service';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.findOne(id);
  }

  @Get(':id/full')
  findOneWithModules(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.findOneWithModules(id);
  }
}
