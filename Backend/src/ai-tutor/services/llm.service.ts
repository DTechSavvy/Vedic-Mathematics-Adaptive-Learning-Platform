import { Injectable, Logger } from '@nestjs/common';
import { GeminiProvider } from '../providers/gemini.provider';
import {
  LlmProvider,
  LlmRequest,
  LlmResponse,
} from '../interfaces/llm-provider.interface';

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private activeProvider: LlmProvider;

  constructor(private readonly geminiProvider: GeminiProvider) {
    // Default to Gemini provider
    this.activeProvider = this.geminiProvider;
  }

  isAvailable(): boolean {
    return this.activeProvider.isAvailable();
  }

  getProviderName(): string {
    return this.activeProvider.providerName;
  }

  async generateResponse(request: LlmRequest): Promise<LlmResponse> {
    return this.activeProvider.generate(request);
  }
}
