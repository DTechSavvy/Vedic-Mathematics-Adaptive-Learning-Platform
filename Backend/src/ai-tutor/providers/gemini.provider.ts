import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiProviderErrorException,
  AiProviderTimeoutException,
  AiProviderUnavailableException,
} from '../exceptions/ai-provider.exception';
import {
  LlmProvider,
  LlmRequest,
  LlmResponse,
} from '../interfaces/llm-provider.interface';

@Injectable()
export class GeminiProvider implements LlmProvider {
  readonly providerName = 'GoogleGemini';
  private readonly logger = new Logger(GeminiProvider.name);
  private client: any = null;
  private readonly apiKey: string | undefined;
  private readonly modelName: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.modelName = this.configService.get<string>('AI_MODEL_NAME') || 'gemini-2.0-flash';
    this.timeoutMs = Number(this.configService.get<number>('AI_PROVIDER_TIMEOUT_MS')) || 30000;

    // Graceful initialization: Never crash server startup if key is missing!
    if (this.apiKey && this.apiKey.trim() !== '' && !this.apiKey.includes('your-gemini-api-key')) {
      try {
        // Dynamic or safe import
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        this.client = new GoogleGenerativeAI(this.apiKey);
        this.logger.log(`GeminiProvider initialized with model: ${this.modelName}`);
      } catch (err: any) {
        this.logger.warn(`Failed to instantiate GoogleGenerativeAI SDK: ${err.message}`);
        this.client = null;
      }
    } else {
      this.logger.warn(
        'GeminiProvider: GEMINI_API_KEY not configured. AI Tutor will return controlled service-unavailable errors without crashing.',
      );
    }
  }

  isAvailable(): boolean {
    return Boolean(
      this.client &&
        this.apiKey &&
        this.apiKey.trim() !== '' &&
        !this.apiKey.includes('your-gemini-api-key'),
    );
  }

  async generate(request: LlmRequest): Promise<LlmResponse> {
    if (!this.isAvailable()) {
      throw new AiProviderUnavailableException(
        'AI Tutor provider is not configured. Please set GEMINI_API_KEY.',
      );
    }

    const startTime = Date.now();
    return this.executeWithRetry(request, startTime, 1);
  }

  private async executeWithRetry(
    request: LlmRequest,
    startTime: number,
    retriesLeft: number,
  ): Promise<LlmResponse> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.modelName,
        systemInstruction: request.systemPrompt,
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new AiProviderTimeoutException(`Gemini request exceeded ${this.timeoutMs}ms`)),
          this.timeoutMs,
        );
      });

      const generatePromise = model.generateContent({
        contents: [{ role: 'user', parts: [{ text: request.userPrompt }] }],
        generationConfig: {
          temperature: request.temperature ?? 0.3,
          maxOutputTokens: request.maxTokens ?? 1500,
        },
      });

      const result = await Promise.race([generatePromise, timeoutPromise]);
      const latencyMs = Date.now() - startTime;
      const content = result.response.text();

      return {
        content,
        providerName: this.providerName,
        modelName: this.modelName,
        latencyMs,
      };
    } catch (err: any) {
      if (err instanceof AiProviderTimeoutException) {
        throw err;
      }

      // Check if retryable (e.g. rate limit 429, service unavailable 503)
      const isRetryable =
        retriesLeft > 0 &&
        (err.status === 429 || err.status === 503 || err.message?.includes('429') || err.message?.includes('503'));

      if (isRetryable) {
        this.logger.warn(`Retrying Gemini request after transient error: ${err.message}`);
        await new Promise((res) => setTimeout(res, 1000));
        return this.executeWithRetry(request, startTime, retriesLeft - 1);
      }

      this.logger.error(`Gemini provider error: ${err.message}`, err.stack);
      throw new AiProviderErrorException(
        'The AI Tutor could not generate a response. Please try again shortly.',
      );
    }
  }
}
