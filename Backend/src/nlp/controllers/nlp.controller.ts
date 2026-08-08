import { Body, Controller, Post } from '@nestjs/common';
import { NLPService } from '../nlp.service';
import { AnalyzeTextDto } from '../dto/analyze-text.dto';

@Controller('nlp')
export class NlpController {

  constructor(private readonly nlpService: NLPService) {}

  @Post('analyze')
  analyze(
    @Body() dto: AnalyzeTextDto,
  ) {
    return this.nlpService.analyze(dto.text);
  }
}