import { Controller, Post } from '@nestjs/common';
import { GoldenTestService } from './golden-test.service';

@Controller('nlp/testing')
export class GoldenTestController {
  constructor(private readonly tester: GoldenTestService) {}

  @Post('golden')
  async run() {
    await this.tester.run();

    return {
      message: 'Golden dataset executed successfully.',
    };
  }
}
