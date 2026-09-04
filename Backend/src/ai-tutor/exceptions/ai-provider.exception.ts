import {
  BadGatewayException,
  RequestTimeoutException,
  ServiceUnavailableException,
} from '@nestjs/common';

export class AiProviderUnavailableException extends ServiceUnavailableException {
  constructor(
    message = 'AI Tutor service is temporarily unavailable. No AI provider is configured.',
  ) {
    super({
      statusCode: 503,
      error: 'AI_TUTOR_PROVIDER_UNAVAILABLE',
      message,
    });
  }
}

export class AiProviderTimeoutException extends RequestTimeoutException {
  constructor(message = 'AI Tutor request timed out. Please try again.') {
    super({
      statusCode: 408,
      error: 'AI_PROVIDER_TIMEOUT',
      message,
    });
  }
}

export class AiProviderErrorException extends BadGatewayException {
  constructor(message = 'AI Tutor encountered an upstream generation error.') {
    super({
      statusCode: 502,
      error: 'AI_PROVIDER_ERROR',
      message,
    });
  }
}
