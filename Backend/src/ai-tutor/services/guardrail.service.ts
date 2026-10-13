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

  /**
   * Domain check: Verifies if student input is completely off-topic (e.g. asking for unrelated coding, politics, recipes, video games, etc.)
   */
  isOffTopic(message: string): { isOffTopic: boolean; redirectResponse?: string } {
    if (!message || message.trim().length === 0) {
      return { isOffTopic: false };
    }

    const text = message.trim().toLowerCase();

    // Whitelist: common conversational greetings and Vedic / math terms
    const mathWhitelist = [
      'hi', 'hello', 'hey', 'namaste', 'greetings', 'help', 'who are you', 'what can you do',
      'math', 'sutra', 'nikhilam', 'urdhva', 'ekadhikena', 'paravartya', 'yavadunam', 'dwandwa',
      'vinculum', 'anurupyena', 'multiply', 'divide', 'square', 'cube', 'root', 'addition',
      'subtraction', 'fraction', 'algebra', 'decimal', 'number', 'calculate', 'formula',
      'problem', 'hint', 'solve', 'practice', 'quiz', 'exam', 'step', 'vedic', 'speed',
    ];

    const hasMathTerm = mathWhitelist.some((w) => text.includes(w)) || /\d+/.test(text);

    // If it contains math words or digits or is a greeting, it's NOT off-topic
    if (hasMathTerm) {
      return { isOffTopic: false };
    }

    // Explicit off-topic categories
    const offTopicPatterns = [
      /\b(?:recipe|cook|bake|cake|pasta|pizza|ingredients|dinner|lunch|breakfast)\b/i,
      /\b(?:president|prime minister|election|parliament|congress|democrat|republican|political|politics)\b/i,
      /\b(?:movie|actor|actress|hollywood|bollywood|film|cinema|netflix|series)\b/i,
      /\b(?:football|cricket|soccer|nba|messi|ronaldo|ipl|fifa|world cup)\b/i,
      /\b(?:fortnite|minecraft|gta|roblox|playstation|xbox|video game)\b/i,
      /\b(?:write\s+(?:a\s+)?(?:python|javascript|java|c\+\+|html|css|php)\s+(?:script|code|program|scraper|app))\b/i,
      /\b(?:crypto|bitcoin|ethereum|stock\s*market|forex|investing)\b/i,
    ];

    for (const pattern of offTopicPatterns) {
      if (pattern.test(text)) {
        return {
          isOffTopic: true,
          redirectResponse:
            "I specialize exclusively in **Vedic Mathematics** and high-speed mental calculation! " +
            "While I cannot assist with non-mathematical topics like cooking, politics, sports, or entertainment, " +
            "I would love to help you master lightning-fast mental math. Would you like to explore a Vedic Sutra like *Nikhilam* (base multiplication) or *Urdhva Tiryagbhyam* (crosswise calculation)?",
        };
      }
    }

    return { isOffTopic: false };
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
