import { Injectable } from '@nestjs/common';
import { NLPService } from '../../nlp/nlp.service';
import { TutorIntent } from '../enums/tutor-intent.enum';
import { TutorMode } from '../enums/tutor-mode.enum';
import { TutorNlpResult } from '../interfaces/tutor-nlp-result.interface';

interface VedicMapping {
  technique: string;
  sutra: string;
  keywords: string[];
}

const VEDIC_MAPPINGS: VedicMapping[] = [
  {
    technique: 'Nikhilam',
    sutra: 'Nikhilam Navatashcaramam Dashatah',
    keywords: ['nikhilam', 'all from 9', 'last from 10', 'base method', 'deficiency', 'surplus'],
  },
  {
    technique: 'Urdhva Tiryagbhyam',
    sutra: 'Urdhva Tiryagbhyam',
    keywords: ['urdhva', 'tiryagbhyam', 'vertically and crosswise', 'vertical and crosswise', 'crosswise'],
  },
  {
    technique: 'Ekadhikena Purvena',
    sutra: 'Ekadhikena Purvena',
    keywords: ['ekadhikena', 'purvena', 'by one more than the previous', 'ending in 5', 'square ending 5'],
  },
  {
    technique: 'Paravartya Yojayet',
    sutra: 'Paravartya Yojayet',
    keywords: ['paravartya', 'yojayet', 'transpose and apply', 'division near base'],
  },
  {
    technique: 'Yavadunam',
    sutra: 'Yavadunam Tavadunikritya Varganca Yojayet',
    keywords: ['yavadunam', 'by the deficiency', 'squaring near base', 'cube near base'],
  },
  {
    technique: 'Dwandwa Yoga',
    sutra: 'Dwandwa Yoga',
    keywords: ['dwandwa', 'duplex', 'duplex method', 'square roots duplex'],
  },
  {
    technique: 'Vinculum',
    sutra: 'Nikhilam Vinculum',
    keywords: ['vinculum', 'bar numbers', 'negative digits'],
  },
  {
    technique: 'Anurupyena',
    sutra: 'Anurupyena',
    keywords: ['anurupyena', 'proportionately', 'sub-base', 'sub base'],
  },
  {
    technique: 'Sankalana Vyavakalanabhyam',
    sutra: 'Sankalana Vyavakalanabhyam',
    keywords: ['sankalana', 'vyavakalanabhyam', 'by addition and by subtraction', 'simultaneous equations'],
  },
];

@Injectable()
export class TutorNlpService {
  constructor(private readonly nlpService: NLPService) {}

  async process(text: string, requestedMode?: TutorMode): Promise<TutorNlpResult> {
    const normalizedInput = text.trim();
    const lower = normalizedInput.toLowerCase();

    // 1. Run core NLP pipeline
    let coreNlp: any = null;
    try {
      coreNlp = this.nlpService.analyze(normalizedInput);
    } catch {
      // Fallback if NLP service encounters any unexpected issue
      coreNlp = null;
    }

    // 2. Extract mathematical expression
    const mathExpression = this.extractMathExpression(normalizedInput);

    // 3. Extract student answer
    const studentAnswer = this.extractStudentAnswer(normalizedInput);

    // 4. Identify Vedic technique & sutra
    const { technique, sutra } = this.extractVedicTechnique(normalizedInput, coreNlp);

    // 5. Detect student difficulty / struggle
    const studentDifficulty = this.detectDifficulty(lower, coreNlp);

    // 6. Detect intent & recommended mode
    const { intent, mode, confidence } = this.determineIntentAndMode(
      normalizedInput,
      lower,
      studentAnswer,
      mathExpression,
      technique,
      studentDifficulty,
      requestedMode,
      coreNlp,
    );

    // 7. Collect extracted entities
    const entities: string[] = [];
    if (coreNlp?.semantics?.entities?.entities) {
      entities.push(...coreNlp.semantics.entities.entities);
    }
    if (technique) entities.push(technique);
    if (sutra) entities.push(sutra);

    const detectedTopic = coreNlp?.semantics?.topic?.topic || (technique ? 'Vedic Mathematics' : null);

    return {
      rawText: normalizedInput,
      intent,
      confidence,
      detectedTopic,
      technique,
      sutra,
      mathExpression,
      studentAnswer,
      studentDifficulty,
      recommendedMode: requestedMode || mode,
      entities: Array.from(new Set(entities)),
    };
  }

  private extractMathExpression(text: string): string | null {
    // Normalizing mathematical operators for consistency
    const sanitized = text
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\s*([xX])\s*(\d+)/g, ' * $2');

    // Patterns matching expressions like: 98 * 97, 996 * 994, 23 + 45, 75^2, 100 - 15, sqrt(144)
    const patterns = [
      /\b\d+(?:\.\d+)?\s*[\+\-\*\/\^]\s*\d+(?:\.\d+)?(?:\s*[\+\-\*\/\^]\s*\d+(?:\.\d+)?)*\b/,
      /\b\d+\s*\^\s*2\b/,
      /\b(?:square|sqr|sqrt)\s*(?:of)?\s*(\d+)\b/i,
    ];

    for (const pattern of patterns) {
      const match = sanitized.match(pattern);
      if (match) {
        if (pattern === patterns[2] && match[1]) {
          return `sqrt(${match[1]})`;
        }
        return match[0].trim();
      }
    }

    return null;
  }

  private extractStudentAnswer(text: string): string | null {
    // Patterns where student states their answer
    const patterns = [
      /(?:i\s*got|i\s*get|got|my\s*answer\s*is|answer\s*is|is\s*it|getting|came\s*up\s*with)\s*[:=]?\s*(-?\d+(?:\.\d+)?)/i,
      /(?:is|am\s*i\s*right\s*with)\s*(-?\d+(?:\.\d+)?)\s*(?:correct|right|\?)/i,
      /=\s*(-?\d+(?:\.\d+)?)\s*(?:\?|is\s*that|correct)?$/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  private extractVedicTechnique(
    text: string,
    coreNlp: any,
  ): { technique: string | null; sutra: string | null } {
    const lower = text.toLowerCase();

    for (const item of VEDIC_MAPPINGS) {
      for (const keyword of item.keywords) {
        if (lower.includes(keyword)) {
          return { technique: item.technique, sutra: item.sutra };
        }
      }
    }

    // Check NLP entities
    const extractedTechs: string[] = coreNlp?.semantics?.entities?.techniques || [];
    if (extractedTechs.length > 0) {
      const tech = extractedTechs[0];
      const found = VEDIC_MAPPINGS.find((m) => m.technique.toLowerCase() === tech.toLowerCase());
      return {
        technique: tech,
        sutra: found?.sutra || null,
      };
    }

    return { technique: null, sutra: null };
  }

  private detectDifficulty(lower: string, coreNlp: any): boolean {
    const struggleKeywords = [
      "don't understand",
      'dont understand',
      'not understanding',
      'confused',
      'stuck',
      'hard',
      'difficult',
      'lost',
      'help me',
      'struggling',
      'why does',
      'why becomes',
      'cant get',
      "can't get",
      'no idea',
    ];

    for (const kw of struggleKeywords) {
      if (lower.includes(kw)) {
        return true;
      }
    }

    if (
      coreNlp?.semantics?.emotion?.emotion === 'Confused' ||
      coreNlp?.semantics?.emotion?.emotion === 'Frustrated'
    ) {
      return true;
    }

    return false;
  }

  private determineIntentAndMode(
    text: string,
    lower: string,
    studentAnswer: string | null,
    mathExpression: string | null,
    technique: string | null,
    studentDifficulty: boolean,
    requestedMode: TutorMode | undefined,
    coreNlp: any,
  ): { intent: TutorIntent; mode: TutorMode; confidence: number } {
    // 1. Explicit Check Answer
    if (
      studentAnswer !== null ||
      lower.includes('is that correct') ||
      lower.includes('check my answer') ||
      lower.includes('did i get it right') ||
      lower.includes('is this right')
    ) {
      return {
        intent: TutorIntent.CHECK_ANSWER,
        mode: TutorMode.CHECK_ANSWER,
        confidence: 0.95,
      };
    }

    // 2. Explicit Hint Request
    if (
      lower.includes('hint') ||
      lower.includes('clue') ||
      lower.includes('nudge') ||
      lower.includes('just a hint') ||
      lower.includes('give me a hint')
    ) {
      return {
        intent: TutorIntent.ASK_HINT,
        mode: TutorMode.HINT,
        confidence: 0.95,
      };
    }

    // 3. Explicit Solution Request
    if (
      lower.includes('full solution') ||
      lower.includes('complete solution') ||
      lower.includes('tell me the answer') ||
      lower.includes('solve it for me') ||
      lower.includes('just give me the solution') ||
      lower.includes('show full answer')
    ) {
      return {
        intent: TutorIntent.ASK_SOLUTION,
        mode: TutorMode.SOLUTION,
        confidence: 0.95,
      };
    }

    // 4. Mistake Explanation
    if (
      lower.includes('why did i get') ||
      lower.includes('where did i go wrong') ||
      lower.includes('my mistake') ||
      lower.includes("what's wrong with") ||
      lower.includes('why is it wrong')
    ) {
      return {
        intent: TutorIntent.EXPLAIN_MISTAKE,
        mode: TutorMode.EXPLAIN,
        confidence: 0.9,
      };
    }

    // 5. Next step request
    if (
      lower.includes('next step') ||
      lower.includes('what should i do next') ||
      lower.includes('what do i do now') ||
      lower.includes('what is the first step') ||
      lower.includes('first step')
    ) {
      return {
        intent: TutorIntent.ASK_NEXT_STEP,
        mode: TutorMode.GUIDED,
        confidence: 0.9,
      };
    }

    // 6. Practice Request
    if (
      lower.includes('practice') ||
      lower.includes('give me a problem') ||
      lower.includes('give me a question') ||
      lower.includes('quiz me') ||
      lower.includes('test me')
    ) {
      return {
        intent: TutorIntent.PRACTICE_REQUEST,
        mode: TutorMode.PRACTICE,
        confidence: 0.9,
      };
    }

    // 7. Example Request
    if (
      lower.includes('example') ||
      lower.includes('sample problem') ||
      lower.includes('demonstrate') ||
      lower.includes('show me one')
    ) {
      return {
        intent: TutorIntent.ASK_EXAMPLE,
        mode: TutorMode.EXPLAIN,
        confidence: 0.88,
      };
    }

    // 8. Concept or Sutra Request
    if (
      lower.includes('what is') ||
      lower.includes('explain') ||
      lower.includes('teach me') ||
      lower.includes('how does') ||
      lower.includes('tell me about') ||
      lower.includes('meaning of') ||
      technique !== null
    ) {
      const isSutra =
        lower.includes('sutra') ||
        technique !== null ||
        VEDIC_MAPPINGS.some((m) => lower.includes(m.technique.toLowerCase()));
      return {
        intent: isSutra ? TutorIntent.ASK_SUTRA : TutorIntent.ASK_CONCEPT,
        mode: TutorMode.CONCEPT,
        confidence: 0.88,
      };
    }

    // 9. If expression exists with difficulty indicator, explain concept/method
    if (mathExpression && studentDifficulty) {
      return {
        intent: TutorIntent.ASK_CONCEPT,
        mode: TutorMode.EXPLAIN,
        confidence: 0.85,
      };
    }

    // 10. Fallback to NLP module intent or general
    if (coreNlp?.semantics?.intent?.intent) {
      const nlpIntent = coreNlp.semantics.intent.intent;
      if (nlpIntent === 'NeedPractice') {
        return { intent: TutorIntent.PRACTICE_REQUEST, mode: TutorMode.PRACTICE, confidence: 0.75 };
      }
      if (nlpIntent === 'AskDoubt' || nlpIntent === 'ExplainTopic') {
        return { intent: TutorIntent.ASK_CONCEPT, mode: TutorMode.EXPLAIN, confidence: 0.75 };
      }
    }

    return {
      intent: TutorIntent.GENERAL_LEARNING_QUERY,
      mode: requestedMode || TutorMode.GUIDED,
      confidence: 0.6,
    };
  }
}
