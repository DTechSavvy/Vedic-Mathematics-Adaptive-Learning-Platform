import { Injectable, Logger } from '@nestjs/common';
import { TutorMode } from '../enums/tutor-mode.enum';
import { MathVerificationResult } from '../interfaces/math-verification.interface';

@Injectable()
export class GuardrailService {
  private readonly logger = new Logger(GuardrailService.name);
  private readonly MAX_RESPONSE_LENGTH = 3500;

  applyGuardrails(params: {
    rawResponse: string;
    mode: TutorMode;
    mathVerification?: MathVerificationResult | null;
  }): string {
    let content = params.rawResponse ? params.rawResponse.trim() : '';

    // 1. Reject empty or abnormally short response
    if (content.length < 10) {
      return "I'm here to help you with Vedic Mathematics! Could you please tell me more about the problem or concept you'd like to explore?";
    }

    // 2. Cap abnormal output size
    if (content.length > this.MAX_RESPONSE_LENGTH) {
      this.logger.warn(
        `Response length ${content.length} exceeded limit. Truncating.`,
      );
      content = content.slice(0, this.MAX_RESPONSE_LENGTH);
      const lastPeriod = content.lastIndexOf('.');
      if (lastPeriod > 1000) {
        content = content.slice(0, lastPeriod + 1);
      }
    }

    // 3. Prevent system prompt & secret leaks
    content = this.sanitizeSensitiveLeaks(content);

    // 4. Enforce HINT mode constraint: Never expose the final answer
    if (
      params.mode === TutorMode.HINT &&
      params.mathVerification?.parsedResult !== null &&
      params.mathVerification?.parsedResult !== undefined
    ) {
      content = this.redactFinalAnswerInHintMode(
        content,
        params.mathVerification.parsedResult,
      );
    }

    // 5. Correctness consistency guard in CHECK_ANSWER mode
    if (
      params.mode === TutorMode.CHECK_ANSWER &&
      params.mathVerification?.isCorrect === false
    ) {
      content = this.enforceIncorrectnessConsistency(content);
    }

    return content;
  }

  private sanitizeSensitiveLeaks(text: string): string {
    const sensitivePatterns = [
      /GEMINI_API_KEY/gi,
      /JWT_SECRET/gi,
      /DATABASE_URL/gi,
      /SYSTEM PROMPT/gi,
      /CORE TUTOR POLICIES:/gi,
      /IMMUNITY TO PROMPT INJECTION/gi,
    ];

    let sanitized = text;
    for (const pattern of sensitivePatterns) {
      if (pattern.test(sanitized)) {
        sanitized = sanitized.replace(pattern, '[REDACTED]');
      }
    }

    return sanitized;
  }

  private redactFinalAnswerInHintMode(
    text: string,
    finalAnswer: number,
  ): string {
    const answerStr = String(finalAnswer);
    // If the answer is a single digit (e.g. 2, 5), full redaction is risky as it might be a step or base.
    // Only redact multi-digit specific answers or explicit answer phrases.
    if (answerStr.length >= 2) {
      const explicitAnswerPatterns = [
        new RegExp(
          `(?:the\\s*answer\\s*is|final\\s*answer|gives\\s*us|equals?)\\s*[:=]?\\s*\\b${answerStr}\\b`,
          'gi',
        ),
        new RegExp(`=\\s*\\b${answerStr}\\b`, 'g'),
      ];

      for (const pat of explicitAnswerPatterns) {
        if (pat.test(text)) {
          text = text.replace(
            pat,
            'will lead you right to the final answer! What do you get?',
          );
        }
      }
    }

    return text;
  }

  private enforceIncorrectnessConsistency(text: string): string {
    // If our deterministic solver verified that the answer is incorrect, but the LLM hallucinated "Correct!":
    if (
      /^(?:that's|that\s*is|you\s*are)\s*(?:completely|absolutely)?\s*correct/i.test(
        text,
      )
    ) {
      return text.replace(
        /^(?:that's|that\s*is|you\s*are)\s*(?:completely|absolutely)?\s*correct/i,
        'Let us double check that carefully',
      );
    }
    return text;
  }
}
