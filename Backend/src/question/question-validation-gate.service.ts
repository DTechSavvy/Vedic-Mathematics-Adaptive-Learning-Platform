import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ValidationGateResult {
  isValid: boolean;
  failureReason?: string;
}

export interface GeneratedQuestionPayload {
  question: string;
  correctAnswer: string;
  options?: string[];
  explanationSteps?: string[];
  pedagogicalSteps?: any[];
  technique?: string;
  sutraName?: string;
  questionType?: string;
  difficulty?: string;
  topicId?: number;
  sutraId?: string;
}

@Injectable()
export class QuestionValidationGateService {
  private readonly logger = new Logger(QuestionValidationGateService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Complete validation pipeline:
   * Schema -> Math -> Type/Difficulty -> Indian Context -> Anti-Leak -> Duplicate Check
   */
  async validateQuestion(
    userId: number,
    payload: GeneratedQuestionPayload,
  ): Promise<ValidationGateResult> {
    // 1. Schema Validation
    const schemaCheck = this.validateSchema(payload);
    if (!schemaCheck.isValid) return schemaCheck;

    // 2. Indian Context Validation
    const contextCheck = this.validateIndianContext(payload);
    if (!contextCheck.isValid) return contextCheck;

    // 3. Mathematical & Answer Validation
    const mathCheck = this.validateMath(payload);
    if (!mathCheck.isValid) return mathCheck;

    // 4. Anti-Leak Validation (for Technique Selection)
    const leakCheck = this.validateAntiLeak(payload);
    if (!leakCheck.isValid) return leakCheck;

    // 5. Recent Duplicate Detection
    const duplicateCheck = await this.checkRecentDuplicate(userId, payload.question);
    if (!duplicateCheck.isValid) return duplicateCheck;

    return { isValid: true };
  }

  validateSchema(payload: GeneratedQuestionPayload): ValidationGateResult {
    if (!payload.question || typeof payload.question !== 'string' || payload.question.trim().length < 5) {
      return { isValid: false, failureReason: 'Question prompt is empty or too short' };
    }

    if (payload.correctAnswer === undefined || payload.correctAnswer === null || String(payload.correctAnswer).trim().length === 0) {
      return { isValid: false, failureReason: 'Correct answer is missing or empty' };
    }

    if (payload.options && Array.isArray(payload.options)) {
      if (payload.options.length < 2) {
        return { isValid: false, failureReason: 'Question options must contain at least 2 choices' };
      }
      const trimmedAnswer = String(payload.correctAnswer).trim();
      const hasAnswer = payload.options.some((opt) => String(opt).trim() === trimmedAnswer);
      if (!hasAnswer) {
        return { isValid: false, failureReason: 'Options list does not contain the stated correct answer' };
      }
    }

    if (!payload.explanationSteps || !Array.isArray(payload.explanationSteps) || payload.explanationSteps.length === 0) {
      return { isValid: false, failureReason: 'Explanation steps must be provided' };
    }

    return { isValid: true };
  }

  validateIndianContext(payload: GeneratedQuestionPayload): ValidationGateResult {
    // Disallow dollar signs in Vedic math platform questions
    if (payload.question.includes('$')) {
      return { isValid: false, failureReason: 'Question contains dollar sign ($); Indian currency symbol (₹) is required' };
    }

    return { isValid: true };
  }

  validateMath(payload: GeneratedQuestionPayload): ValidationGateResult {
    const q = payload.question;
    const ans = String(payload.correctAnswer).trim();

    // Check simple multiplication: e.g. "Calculate 98 × 97" or "98 x 97"
    const multMatch = q.match(/(\d+)\s*[×x*]\s*(\d+)/i);
    if (multMatch && !q.includes('²') && !q.includes('³') && !q.toLowerCase().includes('fraction') && !q.toLowerCase().includes('area')) {
      const a = parseInt(multMatch[1], 10);
      const b = parseInt(multMatch[2], 10);
      const expected = a * b;
      const parsedAns = parseInt(ans, 10);
      if (!isNaN(parsedAns) && expected !== parsedAns) {
        return {
          isValid: false,
          failureReason: `Arithmetic mismatch: ${a} × ${b} = ${expected}, but correct answer is ${parsedAns}`,
        };
      }
    }

    // Check simple squaring: e.g. "Calculate 85²"
    const squareMatch = q.match(/(\d+)[²\^2]/);
    if (squareMatch && !q.toLowerCase().includes('root') && !q.toLowerCase().includes('area')) {
      const n = parseInt(squareMatch[1], 10);
      const expected = n * n;
      const parsedAns = parseInt(ans, 10);
      if (!isNaN(parsedAns) && expected !== parsedAns) {
        return {
          isValid: false,
          failureReason: `Squaring mismatch: ${n}² = ${expected}, but correct answer is ${parsedAns}`,
        };
      }
    }

    return { isValid: true };
  }

  validateAntiLeak(payload: GeneratedQuestionPayload): ValidationGateResult {
    if (payload.questionType === 'TECHNIQUE_SELECTION') {
      const qLower = payload.question.toLowerCase();
      // Verify that the answer (e.g. Sutra name) is not explicitly given away in the prompt:
      const ansLower = String(payload.correctAnswer).toLowerCase();
      if (ansLower.length > 4 && qLower.includes(`apply ${ansLower}`) || qLower.includes(`using ${ansLower}`)) {
        return {
          isValid: false,
          failureReason: 'Technique selection prompt leaks the correct answer in the question text',
        };
      }
    }
    return { isValid: true };
  }

  async checkRecentDuplicate(userId: number, questionText: string): Promise<ValidationGateResult> {
    if (!userId) return { isValid: true };

    const recentAttempts = await this.prisma.questionAttempt.findMany({
      where: { userId },
      select: { generatedQuestion: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const normalizedNew = questionText.toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const att of recentAttempts) {
      const normalizedOld = (att.generatedQuestion || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalizedOld.length > 10 && normalizedNew === normalizedOld) {
        return {
          isValid: false,
          failureReason: 'Identical challenge was attempted recently by this learner',
        };
      }
    }

    return { isValid: true };
  }
}
