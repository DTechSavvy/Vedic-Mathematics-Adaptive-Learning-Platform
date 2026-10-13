import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
  private client: GoogleGenerativeAI | null = null;
  private readonly apiKey: string | undefined;
  private readonly modelName: string;
  private readonly timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    const rawKey = this.configService.get<string>('GEMINI_API_KEY');
    this.apiKey = rawKey ? rawKey.trim() : undefined;
    this.modelName =
      this.configService.get<string>('AI_MODEL_NAME') || 'gemini-2.5-flash';
    this.timeoutMs =
      Number(this.configService.get<number>('AI_PROVIDER_TIMEOUT_MS')) || 30000;

    // Graceful initialization: Never crash server startup if key is missing!
    if (
      this.apiKey &&
      this.apiKey !== '' &&
      !this.apiKey.includes('your-gemini-api-key')
    ) {
      try {
        this.client = new GoogleGenerativeAI(this.apiKey);
        this.logger.log(
          `GeminiProvider initialized with model: ${this.modelName}`,
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `Failed to instantiate GoogleGenerativeAI SDK: ${message}`,
        );
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
    if (!this.client) {
      throw new AiProviderUnavailableException(
        'Gemini client is not initialized',
      );
    }

    try {
      const model = this.client.getGenerativeModel({
        model: this.modelName,
        systemInstruction: request.systemPrompt,
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () =>
            reject(
              new AiProviderTimeoutException(
                `Gemini request exceeded ${this.timeoutMs}ms`,
              ),
            ),
          this.timeoutMs,
        );
      });

      const parts: any[] = [];
      if (request.inlineImage) {
        parts.push({
          inlineData: {
            data: request.inlineImage.data,
            mimeType: request.inlineImage.mimeType,
          },
        });
      }
      parts.push({ text: request.userPrompt });

      const generatePromise = model.generateContent({
        contents: [{ role: 'user', parts }],
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
    } catch (err: unknown) {
      if (err instanceof AiProviderTimeoutException) {
        throw err;
      }

      const errorObj = err as Record<string, unknown> | null;
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof errorObj?.message === 'string'
            ? errorObj.message
            : 'Unknown Gemini error';
      const status =
        typeof errorObj?.status === 'number' ? errorObj.status : undefined;
      const errorName =
        typeof errorObj?.name === 'string' ? errorObj.name : 'unknown';

      const isNetworkFailure =
        errorName === 'TypeError' ||
        /fetch failed|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN/i.test(
          errorMessage,
        );
      const isRetryable =
        retriesLeft > 0 &&
        (isNetworkFailure ||
          status === 429 ||
          status === 503 ||
          (status !== undefined && status >= 500) ||
          errorMessage.includes('429') ||
          errorMessage.includes('503'));

      if (isRetryable) {
        this.logger.warn(
          `Retrying Gemini request after transient error: ${errorMessage}`,
        );
        await new Promise((res) =>
          setTimeout(res, retriesLeft === 1 ? 500 : 1000),
        );
        return this.executeWithRetry(request, startTime, retriesLeft - 1);
      }

      this.logger.error(
        `Gemini provider error [${status || errorName}]: ${errorMessage}`,
        err instanceof Error ? err.stack : undefined,
      );
      throw new AiProviderErrorException(
        'The AI Tutor could not generate a response. Please try again shortly.',
      );
    }
  }
}
