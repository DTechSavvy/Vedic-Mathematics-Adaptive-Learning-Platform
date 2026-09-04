import { Injectable } from '@nestjs/common';

import { NLPOrchestratorService } from './services/nlp-orchestrator.service';

@Injectable()
export class NLPService {
  constructor(private readonly orchestrator: NLPOrchestratorService) {}

  analyze(text: string) {
    return this.orchestrator.analyze(text);
  }
}
