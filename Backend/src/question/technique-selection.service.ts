import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface TechniqueProblemDefinition {
  id: string;
  sourceTopicId: number;
  testedSutraId: string;
  testedSutraName: string;
  question: string;
  correctAnswer: string;
  distractors: string[];
  difficulty: 'EASY' | 'MEDIUM' | 'ADVANCED' | 'EXPERT';
  explanationSteps: string[];
}

@Injectable()
export class TechniqueSelectionService {
  private readonly logger = new Logger(TechniqueSelectionService.name);

  // In-memory ring buffer for recent source topic selections per user
  private readonly userRecentTopics = new Map<number, number[]>();

  constructor(private readonly prisma: PrismaService) {}

  private readonly techniqueBank: TechniqueProblemDefinition[] = [
    // 1. Ekadhikena Purvena (Squaring ending in 5) -> Topic 16 / Sutra-01
    {
      id: 'tech-01-square-5',
      sourceTopicId: 16, // Squares Ending in 5
      testedSutraId: 'sutra-01',
      testedSutraName: 'Ekadhikena Purvena',
      question:
        'Which Vedic Sutra enables instantaneous single-line mental calculation of 85² by multiplying preceding digits by "one more"?',
      correctAnswer: 'Ekadhikena Purvena',
      distractors: ['Paravartya Yojayet', 'Shesanyankena Charamena', 'Ekanyunena Purvena'],
      difficulty: 'EASY',
      explanationSteps: [
        '85 ends in 5, fitting the exact condition of Ekadhikena Purvena ("By one more than the previous one").',
        'Preceding digit 8 is multiplied by (8 + 1) = 72, and 25 is appended: 72 | 25 = 7225.',
      ],
    },
    {
      id: 'tech-01-square-5-med',
      sourceTopicId: 16, // Squares Ending in 5
      testedSutraId: 'sutra-01',
      testedSutraName: 'Ekadhikena Purvena',
      question:
        'To calculate 115² mentally without long multiplication, which classical Vedic method is ideal?',
      correctAnswer: 'Ekadhikena Purvena',
      distractors: ['Yavadunam', 'Puranapuranabhyam', 'Anurupye Shunyamanyat'],
      difficulty: 'MEDIUM',
      explanationSteps: [
        'The number 115 ends in 5. Preceding part is 11.',
        'Multiply 11 by (11 + 1) = 132, and append 25: 13225.',
      ],
    },

    // 2. Nikhilam Navatashcaramam Dashatah (Base Multiplication) -> Topic 10 / Sutra-02
    {
      id: 'tech-02-base-mult-easy',
      sourceTopicId: 10, // Base Method Multiplication
      testedSutraId: 'sutra-02',
      testedSutraName: 'Nikhilam Navatashcaramam Dashatah',
      question:
        'Which Vedic method provides the optimal shortcut to multiply 996 × 994 based on proximity to base 1000?',
      correctAnswer: 'Nikhilam Navatashcaramam Dashatah',
      distractors: ['Urdhva-Tiryagbhyam', 'Ekanyunena Purvena', 'Chalana-Kalanabhyam'],
      difficulty: 'EASY',
      explanationSteps: [
        'Both numbers are close to base 1000 with small negative deviations (-4 and -6).',
        'Nikhilam ("All from 9 and last from 10") provides cross-subtraction and deviation multiplication.',
      ],
    },
    {
      id: 'tech-02-base-mult-med',
      sourceTopicId: 10, // Base Method Multiplication
      testedSutraId: 'sutra-02',
      testedSutraName: 'Nikhilam Navatashcaramam Dashatah',
      question:
        'To multiply 1008 × 1012 mentally in a single step using base 1000 surpluses, which Sutra governs?',
      correctAnswer: 'Nikhilam Navatashcaramam Dashatah',
      distractors: ['Sankalana-Vyavakalanabhyam', 'Vyashtisamanstih', 'Gunakasamuchayah'],
      difficulty: 'MEDIUM',
      explanationSteps: [
        'Deviations from 1000 are +8 and +12.',
        'Cross-addition gives 1020, and product of deviations gives 96: 1008 × 1012 = 1,020,096.',
      ],
    },

    // 3. Urdhva-Tiryagbhyam (Universal Multiplication) -> Topic 11 / Sutra-03
    {
      id: 'tech-03-urdhva-easy',
      sourceTopicId: 11, // Urdhva Tiryak Multiplication
      testedSutraId: 'sutra-03',
      testedSutraName: 'Urdhva-Tiryagbhyam',
      question:
        'To multiply two arbitrary 2-digit numbers like 43 × 57 without base proximity, which universal Sutra is required?',
      correctAnswer: 'Urdhva-Tiryagbhyam',
      distractors: ['Ekadhikena Purvena', 'Yavadunam', 'Shunyam Saamyasamuccaye'],
      difficulty: 'EASY',
      explanationSteps: [
        'Neither 43 nor 57 is close to a standard power of 10 base.',
        'Urdhva-Tiryagbhyam ("Vertically and Crosswise") is the universal algorithm for all digit lengths.',
      ],
    },
    {
      id: 'tech-03-urdhva-med',
      sourceTopicId: 11, // Urdhva Tiryak Multiplication
      testedSutraId: 'sutra-03',
      testedSutraName: 'Urdhva-Tiryagbhyam',
      question:
        'Which Vedic technique multiplies 432 × 567 in a 5-step cross-product symmetric pattern?',
      correctAnswer: 'Urdhva-Tiryagbhyam',
      distractors: ['Paravartya Yojayet', 'Ekanyunena Purvena', 'Nikhilam Navatashcaramam Dashatah'],
      difficulty: 'MEDIUM',
      explanationSteps: [
        '3-digit by 3-digit multiplication follows vertical, 2-cross, 3-cross, 2-cross, vertical stages.',
        'This is the classical application of Urdhva-Tiryagbhyam.',
      ],
    },

    // 4. Paravartya Yojayet (Division & Transposition) -> Topic 14 / Sutra-04
    {
      id: 'tech-04-paravartya-easy',
      sourceTopicId: 14, // Vinculum Method Division
      testedSutraId: 'sutra-04',
      testedSutraName: 'Paravartya Yojayet',
      question:
        'When dividing algebraic polynomials or arithmetic numbers with divisors slightly above base (e.g. dividing by 112), which Sutra transposes sign digits?',
      correctAnswer: 'Paravartya Yojayet',
      distractors: ['Ekadhikena Purvena', 'Yavadunam', 'Gunitasamuchayah'],
      difficulty: 'EASY',
      explanationSteps: [
        'Paravartya Yojayet means "Transpose and Apply".',
        'Signs of divisor digits exceeding the base are inverted for single-line synthetic division.',
      ],
    },

    // 5. Shunyam Saamyasamuccaye (Zero Equivalence) -> Topic 20 / Sutra-05
    {
      id: 'tech-05-shunyam-med',
      sourceTopicId: 20, // Factoring Quadratic Equations
      testedSutraId: 'sutra-05',
      testedSutraName: 'Shunyam Saamyasamuccaye',
      question:
        'To solve an equation like (x + 2) + (x + 3) = (x + 1) + (x + 4) instantly by recognizing symmetrical sums, which Sutra applies?',
      correctAnswer: 'Shunyam Saamyasamuccaye',
      distractors: ['Chalana-Kalanabhyam', 'Urdhva-Tiryagbhyam', 'Ekanyunena Purvena'],
      difficulty: 'MEDIUM',
      explanationSteps: [
        'Shunyam Saamyasamuccaye states "When the Collection is the Same, It is Zero".',
        'When algebraic sum conditions match, the variable expression equates directly to zero.',
      ],
    },

    // 6. Yavadunam (Base Squaring) -> Topic 15 / Sutra-10
    {
      id: 'tech-10-yavadunam-easy',
      sourceTopicId: 15, // Squares Using Base Method
      testedSutraId: 'sutra-10',
      testedSutraName: 'Yavadunam',
      question:
        'To calculate 96² by identifying the deficiency from 100 (which is 4) and subtracting 4 then appending 16, which Sutra is being used?',
      correctAnswer: 'Yavadunam',
      distractors: ['Ekadhikena Purvena', 'Urdhva-Tiryagbhyam', 'Sopaantyadvayamantyam'],
      difficulty: 'EASY',
      explanationSteps: [
        '96 has deficiency 4 from 100. Yavadunam says "By the Deficiency, lessen it by that much and set up the square of deficiency": 96 - 4 = 92 | 4² = 16 -> 9216.',
      ],
    },

    // 7. Ekanyunena Purvena (Multiplication by 9s) -> Topic 13 / Sutra-14
    {
      id: 'tech-14-ekanyunena-easy',
      sourceTopicId: 13, // Multiplication by Series of 9s
      testedSutraId: 'sutra-14',
      testedSutraName: 'Ekanyunena Purvena',
      question:
        'Which Sutra calculates 654 × 999 instantaneously by subtracting 1 from the multiplicand and taking the 9s complement?',
      correctAnswer: 'Ekanyunena Purvena',
      distractors: ['Ekadhikena Purvena', 'Urdhva-Tiryagbhyam', 'Gunakasamuchayah'],
      difficulty: 'EASY',
      explanationSteps: [
        'Multiplying by strings of 9s is the specific domain of Ekanyunena Purvena ("By One Less than the Previous").',
        '654 - 1 = 653, complement is 999 - 653 = 346 -> 653,346.',
      ],
    },

    // 8. Series of 1s Multiplication -> Topic 12 / Sutra-01
    {
      id: 'tech-12-ones-easy',
      sourceTopicId: 12, // Multiplication by Series of 1s
      testedSutraId: 'sutra-01',
      testedSutraName: 'Neighbor Addition Scheme',
      question:
        'To calculate 534 × 11 by writing 4, adding (4+3)=7, (3+5)=8, and leading 5 -> 5874, which Vedic algorithmic scheme is applied?',
      correctAnswer: 'Neighbor Addition Scheme',
      distractors: ['Base Deficiency Method', 'Vinculum Bar Inversion', 'Duplex Subtraction'],
      difficulty: 'EASY',
      explanationSteps: [
        'Multiplication by series of 1s proceeds by sliding windows of neighboring digit additions.',
      ],
    },

    // 9. Dwandwa Yoga (Duplex Squaring) -> Topic 17 / Sutra-01
    {
      id: 'tech-17-duplex-med',
      sourceTopicId: 17, // Dwandwa Yoga Sutra
      testedSutraId: 'sutra-01',
      testedSutraName: 'Dwandwa Yoga (Duplex Method)',
      question:
        'To square a general 3-digit number like 324² using D(3), D(32), D(324), D(24), D(4), which method is utilized?',
      correctAnswer: 'Dwandwa Yoga (Duplex Method)',
      distractors: ['Yavadunam', 'Nikhilam Navatashcaramam Dashatah', 'Shunyam Saamyasamuccaye'],
      difficulty: 'MEDIUM',
      explanationSteps: [
        'Dwandwa Yoga (Duplex Combination) defines single digit D(a)=a², double digit D(ab)=2ab, etc.',
        'This computes arbitrary square roots and squares in a straight line.',
      ],
    },

    // 10. Baudhayana Theorem -> Topic 21 / Sutra-01
    {
      id: 'tech-21-baudhayana-easy',
      sourceTopicId: 21, // Baudhayana Theorem
      testedSutraId: 'sutra-01',
      testedSutraName: 'Baudhayana Shulbasutra',
      question:
        'Which ancient Vedic geometric text contains the earliest statement: "The diagonal of a rectangle produces both areas which its sides produce separately"?',
      correctAnswer: 'Baudhayana Shulbasutra',
      distractors: ['Lilavati', 'Surya Siddhanta', 'Aryabhatiya'],
      difficulty: 'EASY',
      explanationSteps: [
        'Baudhayana Shulbasutra (~800 BCE) formulates the classical Indian geometric theorem of diagonal squares centuries before Pythagoras.',
      ],
    },
  ];

  /**
   * Generates a technique selection question that intentionally avoids the current practice topic / Sutra.
   */
  async generateTechniqueQuestion(
    userId: number,
    currentPracticeTopicId?: number,
    currentSutraId?: string,
    requestedDifficulty?: string,
  ) {
    // 1. Get user recent history
    const userHistory = this.userRecentTopics.get(userId) || [];

    // 2. Filter eligible pool:
    // MUST NOT match currentPracticeTopicId
    // MUST NOT match currentSutraId if practicing a sutra
    let candidates = this.techniqueBank.filter((t) => {
      if (currentPracticeTopicId && t.sourceTopicId === currentPracticeTopicId) {
        return false;
      }
      if (currentSutraId && t.testedSutraId === currentSutraId) {
        return false;
      }
      return true;
    });

    if (candidates.length === 0) {
      // Fallback if topic IDs clash
      candidates = this.techniqueBank.filter((t) =>
        currentPracticeTopicId ? t.sourceTopicId !== currentPracticeTopicId : true,
      );
    }

    // 3. Filter out recently used source topics if alternatives exist
    const nonRecent = candidates.filter((c) => !userHistory.includes(c.sourceTopicId));
    const pool = nonRecent.length > 0 ? nonRecent : candidates;

    // 4. Try matching requested difficulty if available
    let diffFiltered = pool;
    if (requestedDifficulty && requestedDifficulty !== 'ALL') {
      const match = pool.filter((p) => p.difficulty === requestedDifficulty);
      if (match.length > 0) {
        diffFiltered = match;
      }
    }

    // 5. Select a random candidate
    const selected = diffFiltered[Math.floor(Math.random() * diffFiltered.length)];

    // 6. Update user recent history (ring buffer of 5)
    const updatedHistory = [selected.sourceTopicId, ...userHistory.filter((id) => id !== selected.sourceTopicId)].slice(0, 5);
    this.userRecentTopics.set(userId, updatedHistory);

    // 7. Shuffle options
    const allOptions = [selected.correctAnswer, ...selected.distractors];
    const shuffledOptions = this.shuffleArray(allOptions);

    this.logger.log(
      `Generated TECHNIQUE_SELECTION: currentTopic=${currentPracticeTopicId || 'none'} -> sourceTopic=${selected.sourceTopicId}, testedSutra=${selected.testedSutraName}`,
    );

    return {
      question: selected.question,
      correctAnswer: selected.correctAnswer,
      options: shuffledOptions,
      explanationSteps: selected.explanationSteps,
      questionType: 'TECHNIQUE_SELECTION',
      cognitiveCategory: 'COGNITIVE_SELECTION',
      // MASKED: Do not leak the target technique or sutra in metadata before user answers!
      technique: 'Strategy Identification',
      sutraName: 'Identify optimal Sutra',
      practiceTopicId: currentPracticeTopicId,
      sourceTopicId: selected.sourceTopicId,
      testedSutraId: selected.testedSutraId,
      difficulty: selected.difficulty,
    };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}
