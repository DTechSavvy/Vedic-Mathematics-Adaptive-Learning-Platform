import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExplanationService } from './explanation.service';
import { AchievementService } from '../achievement/achievement.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  PracticeDifficulty,
  PracticeDifficultyService,
} from './practice-difficulty.service';
import { sutraPracticeMappings } from './sutra-practice';
import { generateSutraQuestionContent } from './sutra-question-generators';
import { TechniqueSelectionService } from './technique-selection.service';
import { MasteryService } from '../progress/mastery.service';
import { GamificationService } from '../gamification/gamification.service';
import { GoalsService } from '../gamification/goals.service';

import { QuestionValidationGateService } from './question-validation-gate.service';

interface TemplateWithTopic {
  id: number;
  title: string;
  templateType: string;
  difficulty: string;
  minValue?: number | null;
  maxValue?: number | null;
  topicId: number;
  topic?: {
    id: number;
    title: string;
    technique?: string | null;
    sutra?: string | null;
  } | null;
}

@Injectable()
export class QuestionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly explanationService: ExplanationService,
    private readonly achievementService: AchievementService,
    private readonly practiceDifficultyService: PracticeDifficultyService,
    private readonly techniqueSelectionService: TechniqueSelectionService,
    private readonly masteryService: MasteryService,
    private readonly gamificationService: GamificationService,
    private readonly goalsService: GoalsService,
    private readonly questionValidationGateService: QuestionValidationGateService,
  ) {}

  async generateTopicQuestion(
    topicId: number,
    userId: number,
    requestedDifficulty?: string,
    requestedQuestionType?: string,
  ) {
    const difficulty =
      await this.practiceDifficultyService.validateDifficultyAccess(
        userId,
        requestedDifficulty,
      );

    const template = await this.prisma.questionTemplate.findFirst({
      where: { topicId },
      orderBy: { id: 'asc' },
      include: { topic: true },
    });

    if (!template) {
      throw new NotFoundException(
        'No practice template is configured for this topic',
      );
    }

    if (requestedQuestionType === 'TECHNIQUE_SELECTION') {
      const content =
        await this.techniqueSelectionService.generateTechniqueQuestion(
          userId,
          topicId,
          template.topic?.sutra || undefined,
          difficulty,
        );
      const generatedQuestion = await this.prisma.generatedQuestion.create({
        data: {
          userId,
          templateId: template.id,
          question: content.question,
          correctAnswer: content.correctAnswer,
        },
      });
      return {
        questionId: generatedQuestion.id,
        id: generatedQuestion.id,
        question: generatedQuestion.question,
        templateId: template.id,
        difficulty,
        topicId: template.topicId,
        technique: content.technique,
        sutra: content.sutraName,
        questionType: content.questionType,
        cognitiveCategory: content.cognitiveCategory,
        options: content.options,
        explanationSteps: content.explanationSteps,
        pedagogicalSteps: content.explanationSteps,
      };
    }

    // If topic links to a Sutra, use the difficulty-aware sutra generator
    const sutraName = template.topic?.sutra || '';
    const sutraMapping = sutraPracticeMappings.find(
      (m) =>
        m.sutraName.toLowerCase() === sutraName.toLowerCase() ||
        sutraName.toLowerCase().includes(m.sutraName.toLowerCase()),
    );

    if (sutraMapping) {
      return this.generateQuestionForSutra(
        sutraMapping.sutraId,
        userId,
        difficulty,
        requestedQuestionType,
      );
    }

    return this.generateQuestion(
      template.id,
      userId,
      difficulty,
      requestedQuestionType,
    );
  }

  async generateQuestionForSutra(
    sutraId: string,
    userId: number,
    requestedDifficulty?: string,
    requestedQuestionType?: string,
  ) {
    const mapping = sutraPracticeMappings.find(
      (item) => item.sutraId === sutraId,
    );
    if (!mapping) {
      throw new NotFoundException(`Sutra with ID "${sutraId}" was not found.`);
    }

    const difficulty =
      await this.practiceDifficultyService.validateDifficultyAccess(
        userId,
        requestedDifficulty,
      );

    // Ensure a matching QuestionTemplate exists in the database
    let template = await this.prisma.questionTemplate.findFirst({
      where: { templateType: mapping.templateType },
      include: { topic: true },
    });

    if (!template) {
      const topic =
        (await this.prisma.topic.findFirst({
          where: {
            OR: [
              { sutra: { contains: mapping.sutraName, mode: 'insensitive' } },
              { title: { contains: mapping.sutraName, mode: 'insensitive' } },
            ],
          },
        })) || (await this.prisma.topic.findFirst());

      const topicId = topic ? topic.id : 1;
      const prismaDiff =
        difficulty === 'EXPERT' || difficulty === 'ADVANCED'
          ? 'HARD'
          : difficulty === 'MEDIUM'
            ? 'MEDIUM'
            : 'EASY';

      template = await this.prisma.questionTemplate.create({
        data: {
          topicId,
          title: `${mapping.sutraName} Practice`,
          templateType: mapping.templateType,
          difficulty: prismaDiff,
          explanation: `Automated practice for ${mapping.sutraName}`,
        },
        include: { topic: true },
      });
    }

    if (requestedQuestionType === 'TECHNIQUE_SELECTION') {
      const content =
        await this.techniqueSelectionService.generateTechniqueQuestion(
          userId,
          template.topicId,
          sutraId,
          difficulty,
        );
      const generatedQuestion = await this.prisma.generatedQuestion.create({
        data: {
          userId,
          templateId: template.id,
          question: content.question,
          correctAnswer: content.correctAnswer,
        },
      });
      return {
        questionId: generatedQuestion.id,
        id: generatedQuestion.id,
        question: generatedQuestion.question,
        templateId: template.id,
        difficulty,
        topicId: template.topicId,
        technique: content.technique,
        sutra: content.sutraName,
        questionType: content.questionType,
        cognitiveCategory: content.cognitiveCategory,
        options: content.options,
        explanationSteps: content.explanationSteps,
        pedagogicalSteps: content.explanationSteps,
      };
    }

    const content = generateSutraQuestionContent(
      sutraId,
      difficulty,
      requestedQuestionType,
    );

    const generatedQuestion = await this.prisma.generatedQuestion.create({
      data: {
        userId,
        templateId: template.id,
        question: content.question,
        correctAnswer: content.correctAnswer,
      },
    });

    return {
      questionId: generatedQuestion.id,
      id: generatedQuestion.id, // For seamless frontend compatibility
      question: generatedQuestion.question,
      templateId: template.id,
      difficulty,
      topicId: template.topicId,
      technique: content.technique,
      sutra: content.sutraName,
      questionType: content.questionType,
      cognitiveCategory: content.cognitiveCategory,
      options: content.options,
      explanationSteps: content.explanationSteps,
      pedagogicalSteps: content.pedagogicalSteps,
      visual: content.visual,
    };
  }

  async generateQuestion(
    templateId: number,
    userId: number,
    requestedDifficulty?: string,
    requestedQuestionType?: string,
  ) {
    const difficulty =
      await this.practiceDifficultyService.validateDifficultyAccess(
        userId,
        requestedDifficulty,
      );

    const template = (await this.prisma.questionTemplate.findUnique({
      where: { id: templateId },
      include: { topic: true },
    })) as TemplateWithTopic | null;

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Check if template maps to one of our 16 Sutras
    const sutraMapping = sutraPracticeMappings.find(
      (m) => m.templateType === template.templateType,
    );

    if (requestedQuestionType === 'TECHNIQUE_SELECTION') {
      const content =
        await this.techniqueSelectionService.generateTechniqueQuestion(
          userId,
          template.topicId,
          sutraMapping?.sutraId,
          difficulty,
        );
      const generated = await this.prisma.generatedQuestion.create({
        data: {
          userId,
          templateId: template.id,
          question: content.question,
          correctAnswer: content.correctAnswer,
        },
      });
      return {
        questionId: generated.id,
        id: generated.id,
        question: generated.question,
        templateId: template.id,
        difficulty,
        topicId: template.topicId,
        technique: content.technique,
        sutra: content.sutraName,
        questionType: content.questionType,
        cognitiveCategory: content.cognitiveCategory,
        options: content.options,
        explanationSteps: content.explanationSteps,
        pedagogicalSteps: content.explanationSteps,
      };
    }
    if (sutraMapping) {
      const content = generateSutraQuestionContent(
        sutraMapping.sutraId,
        difficulty,
        requestedQuestionType,
      );
      const generated = await this.prisma.generatedQuestion.create({
        data: {
          userId,
          templateId: template.id,
          question: content.question,
          correctAnswer: content.correctAnswer,
        },
      });
      return {
        questionId: generated.id,
        id: generated.id,
        question: generated.question,
        templateId: template.id,
        difficulty,
        topicId: template.topicId,
        technique: content.technique,
        sutra: content.sutraName,
        questionType: content.questionType,
        cognitiveCategory: content.cognitiveCategory,
        options: content.options,
        explanationSteps: content.explanationSteps,
        pedagogicalSteps: content.pedagogicalSteps,
        visual: content.visual,
      };
    }

    // Legacy template fallbacks
    switch (template.templateType) {
      case 'ADD_WITHOUT_CARRY':
        return this.generateAdditionQuestion(template, userId, difficulty);
      case 'NIKHILAM_SUBTRACTION':
        return this.generateNikhilamQuestion(template, userId, difficulty);
      case 'DOT_METHOD_ADDITION':
        return this.generateDotMethodQuestion(template, userId, difficulty);
      case 'BASE_MULTIPLICATION':
        return this.generateBaseMultiplicationQuestion(
          template,
          userId,
          difficulty,
        );
      case 'URDHVA_MULTIPLICATION':
        return this.generateUrdhvaQuestion(template, userId, difficulty);
      case 'SERIES_ONES_MULTIPLICATION':
        return this.generateSeriesOnesQuestion(template, userId, difficulty);
      case 'SERIES_NINES_MULTIPLICATION':
        return this.generateSeriesNinesQuestion(template, userId, difficulty);
      case 'SQUARE_ENDING_FIVE':
        return this.generateSquareEndingFiveQuestion(
          template,
          userId,
          difficulty,
        );
      case 'SQUARE_BASE_METHOD':
        return this.generateSquareBaseQuestion(template, userId, difficulty);
      case 'DWANDWA_YOGA':
        return this.generateDwandwaQuestion(template, userId, difficulty);
      case 'YAVADUNAM_CUBE':
        return this.generateCubeQuestion(template, userId, difficulty);
      case 'SQUARE_ROOT_TWO':
        return this.generateRootTwoQuestion(template, userId);
      case 'FRACTION_ADDITION':
        return this.generateFractionAdditionQuestion(template, userId);
      case 'FRACTION_SUBTRACTION':
        return this.generateFractionSubtractionQuestion(template, userId);
      case 'VINCULUM_DIVISION':
        return this.generateVinculumDivisionQuestion(template, userId);
      case 'BAUDHAYANA_THEOREM':
        return this.generateBaudhayanaQuestion(template, userId);
      case 'FACTOR_QUADRATIC':
        return this.generateQuadraticQuestion(template, userId, difficulty);
      case 'CONCEPT_OF_PI':
        return this.generatePiQuestion(template, userId);
      case 'CIRCLING_SQUARE':
        return this.generateCirclingSquareQuestion(template, userId);
      case 'CONCEPT_CHECK':
        return this.generateConceptCheckQuestion(template, userId);
      default:
        return this.generateAdditionQuestion(template, userId, difficulty);
    }
  }

  // --- Specific Legacy Generators with strict typing ---

  private async generateAdditionQuestion(
    template: TemplateWithTopic,
    userId: number,
    difficulty: PracticeDifficulty,
  ) {
    const min =
      difficulty === 'EASY' ? 10 : difficulty === 'MEDIUM' ? 100 : 1000;
    const max =
      difficulty === 'EASY' ? 99 : difficulty === 'MEDIUM' ? 999 : 9999;
    const num1 = Math.floor(Math.random() * (max - min + 1)) + min;
    const num2 = Math.floor(Math.random() * (max - min + 1)) + min;

    const generatedQuestion = await this.prisma.generatedQuestion.create({
      data: {
        userId,
        templateId: template.id,
        question: `${num1} + ${num2}`,
        correctAnswer: String(num1 + num2),
      },
    });

    return {
      questionId: generatedQuestion.id,
      id: generatedQuestion.id,
      question: generatedQuestion.question,
      templateId: template.id,
      difficulty,
      topicId: template.topicId,
      technique: template.topic?.technique ?? template.title,
      sutra: template.topic?.sutra ?? null,
      questionType: 'DIRECT_CALCULATION',
    };
  }

  private async generateNikhilamQuestion(
    template: TemplateWithTopic,
    userId: number,
    difficulty: PracticeDifficulty,
  ) {
    const bases =
      difficulty === 'EASY'
        ? [100]
        : difficulty === 'MEDIUM'
          ? [1000]
          : [10000];
    const base = bases[Math.floor(Math.random() * bases.length)];
    const number = Math.floor(Math.random() * (base - 10)) + 10;
    const answer = base - number;

    const generatedQuestion = await this.prisma.generatedQuestion.create({
      data: {
        userId,
        templateId: template.id,
        question: `${base} - ${number}`,
        correctAnswer: String(answer),
      },
    });

    return {
      questionId: generatedQuestion.id,
      id: generatedQuestion.id,
      question: generatedQuestion.question,
      templateId: template.id,
      difficulty,
      topicId: template.topicId,
      technique: 'Nikhilam Subtraction',
      sutra: 'Nikhilam Navatashcaramam Dashatah',
      questionType: 'DIRECT_CALCULATION',
    };
  }

  private async generateDotMethodQuestion(
    template: TemplateWithTopic,
    userId: number,
    difficulty: PracticeDifficulty,
  ) {
    const min = difficulty === 'EASY' ? 10 : 100;
    const max = difficulty === 'EASY' ? 99 : 999;
    const num1 = Math.floor(Math.random() * (max - min + 1)) + min;
    const num2 = Math.floor(Math.random() * (max - min + 1)) + min;

    const generatedQuestion = await this.prisma.generatedQuestion.create({
      data: {
        userId,
        templateId: template.id,
        question: `${num1} + ${num2}`,
        correctAnswer: String(num1 + num2),
      },
    });

    return {
      questionId: generatedQuestion.id,
      id: generatedQuestion.id,
      question: generatedQuestion.question,
      templateId: template.id,
      difficulty,
      topicId: template.topicId,
      technique: 'Dot Method Addition',
      sutra: null,
      questionType: 'DIRECT_CALCULATION',
    };
  }

  private async generateBaseMultiplicationQuestion(
    template: TemplateWithTopic,
    userId: number,
    difficulty: PracticeDifficulty,
  ) {
    const values =
      difficulty === 'EASY'
        ? [96, 97, 98, 99]
        : difficulty === 'MEDIUM'
          ? [91, 92, 93, 94, 95]
          : [102, 103, 104, 105, 106];
    const num1 = values[Math.floor(Math.random() * values.length)];
    const num2 = values[Math.floor(Math.random() * values.length)];

    const generatedQuestion = await this.prisma.generatedQuestion.create({
      data: {
        userId,
        templateId: template.id,
        question: `${num1} × ${num2}`,
        correctAnswer: String(num1 * num2),
      },
    });

    return {
      questionId: generatedQuestion.id,
      id: generatedQuestion.id,
      question: generatedQuestion.question,
      templateId: template.id,
      difficulty,
      topicId: template.topicId,
      technique: 'Base Method Multiplication',
      sutra: 'Nikhilam Navatashcaramam Dashatah',
      questionType: 'DIRECT_CALCULATION',
    };
  }

  private async generateUrdhvaQuestion(
    template: TemplateWithTopic,
    userId: number,
    difficulty: PracticeDifficulty,
  ) {
    const min = difficulty === 'EASY' ? 11 : 21;
    const max = difficulty === 'EASY' ? 32 : 99;
    const num1 = Math.floor(Math.random() * (max - min + 1)) + min;
    const num2 = Math.floor(Math.random() * (max - min + 1)) + min;

    const generatedQuestion = await this.prisma.generatedQuestion.create({
      data: {
        userId,
        templateId: template.id,
        question: `${num1} × ${num2}`,
        correctAnswer: String(num1 * num2),
      },
    });

    return {
      questionId: generatedQuestion.id,
      id: generatedQuestion.id,
      question: generatedQuestion.question,
      templateId: template.id,
      difficulty,
      topicId: template.topicId,
      technique: 'Urdhva Tiryak Multiplication',
      sutra: 'Urdhva-Tiryagbhyam',
      questionType: 'DIRECT_CALCULATION',
    };
  }

  private async generateSeriesOnesQuestion(
    template: TemplateWithTopic,
    userId: number,
    difficulty: PracticeDifficulty,
  ) {
    const min = difficulty === 'EASY' ? 12 : 123;
    const max = difficulty === 'EASY' ? 89 : 899;
    const num = Math.floor(Math.random() * (max - min + 1)) + min;

    const generatedQuestion = await this.prisma.generatedQuestion.create({
      data: {
        userId,
        templateId: template.id,
        question: `${num} × 11`,
        correctAnswer: String(num * 11),
      },
    });

    return {
      questionId: generatedQuestion.id,
      id: generatedQuestion.id,
      question: generatedQuestion.question,
      templateId: template.id,
      difficulty,
      topicId: template.topicId,
      technique: 'Multiplication by Series of 1s',
      sutra: null,
      questionType: 'DIRECT_CALCULATION',
    };
  }

  private async generateSeriesNinesQuestion(
    template: TemplateWithTopic,
    userId: number,
    difficulty: PracticeDifficulty,
  ) {
    const num =
      difficulty === 'EASY'
        ? Math.floor(Math.random() * 80) + 12
        : Math.floor(Math.random() * 800) + 120;
    const multiplier = difficulty === 'EASY' ? 99 : 999;

    const generatedQuestion = await this.prisma.generatedQuestion.create({
      data: {
        userId,
        templateId: template.id,
        question: `${num} × ${multiplier}`,
        correctAnswer: String(num * multiplier),
      },
    });

    return {
      questionId: generatedQuestion.id,
      id: generatedQuestion.id,
      question: generatedQuestion.question,
      templateId: template.id,
      difficulty,
      topicId: template.topicId,
      technique: 'Multiplication by Series of 9s',
      sutra: 'Ekanyunena Purvena',
      questionType: 'DIRECT_CALCULATION',
    };
  }

  private async generateSquareEndingFiveQuestion(
    template: TemplateWithTopic,
    userId: number,
    difficulty: PracticeDifficulty,
  ) {
    const d =
      difficulty === 'EASY'
        ? Math.floor(Math.random() * 9) + 1
        : Math.floor(Math.random() * 10) + 11;
    const n = d * 10 + 5;

    const generatedQuestion = await this.prisma.generatedQuestion.create({
      data: {
        userId,
        templateId: template.id,
        question: `${n}²`,
        correctAnswer: String(n * n),
      },
    });

    return {
      questionId: generatedQuestion.id,
      id: generatedQuestion.id,
      question: generatedQuestion.question,
      templateId: template.id,
      difficulty,
      topicId: template.topicId,
      technique: 'Squares Ending in 5',
      sutra: 'Ekadhikena Purvena',
      questionType: 'DIRECT_CALCULATION',
    };
  }

  private async generateSquareBaseQuestion(
    template: TemplateWithTopic,
    userId: number,
    difficulty: PracticeDifficulty,
  ) {
    const base = 100;
    const deviation =
      difficulty === 'EASY'
        ? Math.floor(Math.random() * 8) + 1
        : Math.floor(Math.random() * 15) + 1;
    const isAbove = Math.random() > 0.5;
    const number = isAbove ? base + deviation : base - deviation;

    const generatedQuestion = await this.prisma.generatedQuestion.create({
      data: {
        userId,
        templateId: template.id,
        question: `${number}²`,
        correctAnswer: String(number * number),
      },
    });

    return {
      questionId: generatedQuestion.id,
      id: generatedQuestion.id,
      question: generatedQuestion.question,
      templateId: template.id,
      difficulty,
      topicId: template.topicId,
      technique: 'Squares Using Base Method',
      sutra: 'Yavadunam',
      questionType: 'DIRECT_CALCULATION',
    };
  }

  private async generateDwandwaQuestion(
    template: TemplateWithTopic,
    userId: number,
    difficulty: PracticeDifficulty,
  ) {
    const number =
      difficulty === 'EASY'
        ? Math.floor(Math.random() * 50) + 11
        : Math.floor(Math.random() * 80) + 21;
    const generatedQuestion = await this.prisma.generatedQuestion.create({
      data: {
        userId,
        templateId: template.id,
        question: `${number}²`,
        correctAnswer: String(number * number),
      },
    });

    return {
      questionId: generatedQuestion.id,
      id: generatedQuestion.id,
      question: generatedQuestion.question,
      templateId: template.id,
      difficulty,
      topicId: template.topicId,
      technique: 'Dwandwa Yoga Sutra',
      sutra: 'Duplex Method',
      questionType: 'DIRECT_CALCULATION',
    };
  }

  private async generateCubeQuestion(
    template: TemplateWithTopic,
    userId: number,
    difficulty: PracticeDifficulty,
  ) {
    const base = 10;
    const deviation =
      difficulty === 'EASY'
        ? Math.floor(Math.random() * 4) + 1
        : Math.floor(Math.random() * 8) + 1;
    const number = base + deviation;

    const generatedQuestion = await this.prisma.generatedQuestion.create({
      data: {
        userId,
        templateId: template.id,
        question: `${number}³`,
        correctAnswer: String(number * number * number),
      },
    });

    return {
      questionId: generatedQuestion.id,
      id: generatedQuestion.id,
      question: generatedQuestion.question,
      templateId: template.id,
      difficulty,
      topicId: template.topicId,
      technique: 'Cubing Using Yavadunam Sutra',
      sutra: 'Yavadunam',
      questionType: 'DIRECT_CALCULATION',
    };
  }

  private async generateRootTwoQuestion(
    template: TemplateWithTopic,
    userId: number,
  ) {
    const generatedQuestion = await this.prisma.generatedQuestion.create({
      data: {
        userId,
        templateId: template.id,
        question: 'Approximate value of √2 up to 5 decimal places',
        correctAnswer: '1.41421',
      },
    });

    return {
      questionId: generatedQuestion.id,
      id: generatedQuestion.id,
      question: generatedQuestion.question,
      templateId: template.id,
      difficulty: 'EASY',
      topicId: template.topicId,
      technique: 'Square Root of 2',
      sutra: null,
      questionType: 'DIRECT_CALCULATION',
    };
  }

  private async generateFractionAdditionQuestion(
    template: TemplateWithTopic,
    userId: number,
  ) {
    const den = Math.floor(Math.random() * 8) + 3;
    const num1 = Math.floor(Math.random() * (den - 1)) + 1;
    const num2 = Math.floor(Math.random() * (den - 1)) + 1;

    const generatedQuestion = await this.prisma.generatedQuestion.create({
      data: {
        userId,
        templateId: template.id,
        question: `${num1}/${den} + ${num2}/${den}`,
        correctAnswer: `${num1 + num2}/${den}`,
      },
    });

    return {
      questionId: generatedQuestion.id,
      id: generatedQuestion.id,
      question: generatedQuestion.question,
      templateId: template.id,
      difficulty: 'EASY',
      topicId: template.topicId,
      technique: 'Fraction Addition',
      sutra: null,
      questionType: 'DIRECT_CALCULATION',
    };
  }

  private async generateFractionSubtractionQuestion(
    template: TemplateWithTopic,
    userId: number,
  ) {
    const den = Math.floor(Math.random() * 8) + 3;
    const num1 = Math.floor(Math.random() * (den - 2)) + 2;
    const num2 = Math.floor(Math.random() * (num1 - 1)) + 1;

    const generatedQuestion = await this.prisma.generatedQuestion.create({
      data: {
        userId,
        templateId: template.id,
        question: `${num1}/${den} - ${num2}/${den}`,
        correctAnswer: `${num1 - num2}/${den}`,
      },
    });

    return {
      questionId: generatedQuestion.id,
      id: generatedQuestion.id,
      question: generatedQuestion.question,
      templateId: template.id,
      difficulty: 'EASY',
      topicId: template.topicId,
      technique: 'Fraction Subtraction',
      sutra: null,
      questionType: 'DIRECT_CALCULATION',
    };
  }

  private async generateVinculumDivisionQuestion(
    template: TemplateWithTopic,
    userId: number,
  ) {
    const divisor = 9;
    const dividend = Math.floor(Math.random() * 80) + 10;
    const quotient = Math.floor(dividend / divisor);

    const generatedQuestion = await this.prisma.generatedQuestion.create({
      data: {
        userId,
        templateId: template.id,
        question: `${dividend} ÷ ${divisor}`,
        correctAnswer: String(quotient),
      },
    });

    return {
      questionId: generatedQuestion.id,
      id: generatedQuestion.id,
      question: generatedQuestion.question,
      templateId: template.id,
      difficulty: 'EASY',
      topicId: template.topicId,
      technique: 'Vinculum Method Division',
      sutra: null,
      questionType: 'DIRECT_CALCULATION',
    };
  }

  private async generateBaudhayanaQuestion(
    template: TemplateWithTopic,
    userId: number,
  ) {
    const triples = [
      [3, 4, 5],
      [5, 12, 13],
      [6, 8, 10],
      [8, 15, 17],
    ];
    const triple = triples[Math.floor(Math.random() * triples.length)];

    const generatedQuestion = await this.prisma.generatedQuestion.create({
      data: {
        userId,
        templateId: template.id,
        question: `Find hypotenuse c when a = ${triple[0]} and b = ${triple[1]}`,
        correctAnswer: String(triple[2]),
      },
    });

    return {
      questionId: generatedQuestion.id,
      id: generatedQuestion.id,
      question: generatedQuestion.question,
      templateId: template.id,
      difficulty: 'EASY',
      topicId: template.topicId,
      technique: 'Baudhayana Theorem',
      sutra: null,
      questionType: 'DIRECT_CALCULATION',
    };
  }

  private async generateQuadraticQuestion(
    template: TemplateWithTopic,
    userId: number,
    difficulty: PracticeDifficulty,
  ) {
    const a = Math.floor(Math.random() * 4) + 1;
    const b = a + Math.floor(Math.random() * 3) + 1;
    const middle = a + b;
    const constant = a * b;

    const generatedQuestion = await this.prisma.generatedQuestion.create({
      data: {
        userId,
        templateId: template.id,
        question: `Factor x² + ${middle}x + ${constant} into (x + a)(x + b)`,
        correctAnswer: `(x + ${a})(x + ${b})`,
      },
    });

    return {
      questionId: generatedQuestion.id,
      id: generatedQuestion.id,
      question: generatedQuestion.question,
      templateId: template.id,
      difficulty,
      topicId: template.topicId,
      technique: 'Factoring Quadratic Equations',
      sutra: 'Gunitasamuchayah',
      questionType: 'DIRECT_CALCULATION',
    };
  }

  private async generatePiQuestion(
    template: TemplateWithTopic,
    userId: number,
  ) {
    const radii = [7, 14, 21, 28];
    const radius = radii[Math.floor(Math.random() * radii.length)];
    const circumference = 2 * (22 / 7) * radius;

    const generatedQuestion = await this.prisma.generatedQuestion.create({
      data: {
        userId,
        templateId: template.id,
        question: `Find circumference of circle with radius = ${radius} (π ≈ 22/7)`,
        correctAnswer: String(circumference),
      },
    });

    return {
      questionId: generatedQuestion.id,
      id: generatedQuestion.id,
      question: generatedQuestion.question,
      templateId: template.id,
      difficulty: 'EASY',
      topicId: template.topicId,
      technique: 'Concept of Pi',
      sutra: null,
      questionType: 'DIRECT_CALCULATION',
    };
  }

  private async generateCirclingSquareQuestion(
    template: TemplateWithTopic,
    userId: number,
  ) {
    const sides = [2, 4, 6, 8, 10];
    const side = sides[Math.floor(Math.random() * sides.length)];
    const radius = Number(((side * Math.sqrt(2)) / 2).toFixed(2));

    const generatedQuestion = await this.prisma.generatedQuestion.create({
      data: {
        userId,
        templateId: template.id,
        question: `Find circle radius for square side ${side}`,
        correctAnswer: String(radius),
      },
    });

    return {
      questionId: generatedQuestion.id,
      id: generatedQuestion.id,
      question: generatedQuestion.question,
      templateId: template.id,
      difficulty: 'EASY',
      topicId: template.topicId,
      technique: 'Circling a Square',
      sutra: null,
      questionType: 'DIRECT_CALCULATION',
    };
  }

  private async generateConceptCheckQuestion(
    template: TemplateWithTopic,
    userId: number,
  ) {
    const checks: Record<string, { question: string; answer: string }> = {
      'History of Vedic Mathematics': {
        question: 'Who authored the book Vedic Mathematics?',
        answer: 'Bharati Krishna Tirthaji',
      },
      'Features of Vedic Mathematics': {
        question: 'What does a Sutra provide in this course?',
        answer: 'mathematical principle',
      },
      'Applications of Vedic Mathematics': {
        question: 'Does every Sutra apply to every mathematical problem?',
        answer: 'no',
      },
      'Sutras and Upsutras': {
        question: 'How many core Sutras are in the canonical list?',
        answer: '16',
      },
    };
    const check = checks[template.topic?.title || ''];
    if (!check) {
      throw new NotFoundException(
        'Concept-check content is not configured for this topic',
      );
    }

    const generatedQuestion = await this.prisma.generatedQuestion.create({
      data: {
        userId,
        templateId: template.id,
        question: check.question,
        correctAnswer: check.answer,
      },
    });

    return {
      questionId: generatedQuestion.id,
      id: generatedQuestion.id,
      question: generatedQuestion.question,
      templateId: template.id,
      difficulty: 'EASY',
      topicId: template.topicId,
      technique: template.topic?.technique ?? template.title,
      sutra: template.topic?.sutra ?? null,
      questionType: 'CONCEPT_CHECK',
    };
  }

  // --- SUBMIT ANSWER & PERSISTENCE ---

  async submitAnswer(questionId: number, answer: string, userId: number) {
    const question = await this.prisma.generatedQuestion.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    if (question.userId !== userId) {
      throw new ForbiddenException(
        'You can only submit answers to your own questions.',
      );
    }

    const isCorrect = this.answersMatch(question.correctAnswer, answer);
    const isDuplicateQuestion = question.isAnswered;

    const template = (await this.prisma.questionTemplate.findUnique({
      where: { id: question.templateId },
      include: { topic: true },
    })) as TemplateWithTopic | null;

    const explanation = this.buildExplanation(
      question.question,
      question.correctAnswer,
      template,
    );

    const now = new Date();
    const timeTakenSeconds = Math.max(
      1,
      Math.floor((now.getTime() - question.createdAt.getTime()) / 1000),
    );

    // Determine practice difficulty
    const diffMap: Record<string, 'EASY' | 'MEDIUM' | 'ADVANCED' | 'EXPERT'> = {
      EASY: 'EASY',
      MEDIUM: 'MEDIUM',
      HARD: 'ADVANCED',
      ADVANCED: 'ADVANCED',
      EXPERT: 'EXPERT',
    };
    const attemptDifficulty = diffMap[template?.difficulty || 'EASY'] || 'EASY';

    // Persist QuestionAttempt with complete immutable metadata
    await this.prisma.questionAttempt.create({
      data: {
        userId: question.userId,
        templateId: question.templateId,
        generatedQuestion: question.question,
        generatedQuestionId: question.id,
        userAnswer: answer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        timeTakenSeconds,
        questionType: (template as any)?.templateType || 'CALCULATION',
        difficulty: attemptDifficulty,
        sutraId: (template as any)?.topic?.sutra || undefined,
        isValidAttempt: !isDuplicateQuestion,
      },
    });

    // Mark question as answered
    await this.prisma.generatedQuestion.update({
      where: { id: questionId },
      data: { isAnswered: true },
    });

    // 1. Evaluate Practice Rewards (Coins, XP, Streaks, Anti-farming, auditable CoinTransaction)
    const rewardResult = await this.gamificationService.evaluatePracticeRewards({
      userId: question.userId,
      isCorrect,
      difficulty: attemptDifficulty,
      timeTakenSeconds,
      isDuplicateQuestion,
    });

    // 2. Update Multi-Dimensional Mastery Progress (50+ attempts, 75%+ accuracy, tier coverage)
    let topicMastery: any = null;
    if (template) {
      topicMastery = await this.masteryService.updateProgressAfterAttempt(
        question.userId,
        template.topicId,
      );

      // Milestone rewards for mastering Topic
      if (topicMastery.isMastered) {
        await this.gamificationService.awardMasteryMilestone(
          question.userId,
          'TOPIC',
          template.topicId,
          template.topic?.title || 'Topic',
        );
      }

      // Check Sutra mastery milestone
      if (template.topic?.sutra) {
        const sutraMastery = await this.masteryService.getSutraMastery(
          question.userId,
          template.topic.sutra,
        );
        if (sutraMastery?.isMastered) {
          await this.gamificationService.awardMasteryMilestone(
            question.userId,
            'SUTRA',
            template.topic.sutra,
            template.topic.sutra,
          );
        }
      }
    }

    // 3. Record Daily & Weekly Goal progress
    await this.goalsService.recordProgress(question.userId, {
      questionsSolved: 1,
      correctCount: isCorrect ? 1 : 0,
      studyTimeSeconds: timeTakenSeconds,
    });

    // 4. Idempotently evaluate 100 Achievements
    const newlyUnlockedAchievements =
      await this.achievementService.evaluateAchievements(question.userId);

    // 5. Fetch updated User profile
    const refreshedUser = await this.prisma.user.findUnique({
      where: { id: question.userId },
      select: {
        coins: true,
        stars: true,
        wisdomStones: true,
        xp: true,
        level: true,
        streak: true,
      },
    });

    let mistakeDiagnostic: string | undefined = undefined;
    if (!isCorrect) {
      mistakeDiagnostic = this.diagnoseMistake(
        question.question,
        question.correctAnswer,
        answer,
        template?.templateType,
      );
    }

    const feedback = isCorrect
      ? 'Excellent! Outstanding Vedic calculation. 🎉'
      : mistakeDiagnostic
        ? `Review Vedic Rule: ${mistakeDiagnostic}`
        : 'Not quite, but every mistake is an opportunity to learn.';

    return {
      correct: isCorrect,
      correctAnswer: question.correctAnswer,
      feedback,
      explanation: {
        ...explanation,
        mistakeDiagnostic,
      },
      technique: template?.topic?.technique ?? template?.title ?? null,
      sutra: template?.topic?.sutra ?? null,
      earnedXP: rewardResult.earnedXP,
      earnedCoins: rewardResult.earnedCoins,
      streakBonusXP: rewardResult.streakBonusXP,
      isDuplicateQuestion: rewardResult.isDuplicateQuestion,
      isDiminishedReward: rewardResult.isDiminishedReward,
      totalCoins: refreshedUser?.coins ?? 0,
      coins: refreshedUser?.coins ?? 0,
      stars: refreshedUser?.stars ?? 0,
      wisdomStones: refreshedUser?.wisdomStones ?? 0,
      level: refreshedUser?.level ?? 1,
      streak: refreshedUser?.streak ?? 0,
      xp: refreshedUser?.xp ?? 0,
      topicStatus: topicMastery?.status ?? 'PRACTICING',
      topicMasteryScore: topicMastery?.masteryScore ?? 0,
      isTopicMastered: topicMastery?.isMastered ?? false,
      newlyUnlockedAchievements,
    };
  }

  private diagnoseMistake(
    questionText: string,
    correctAnswer: string,
    userAnswer: string,
    templateType?: string,
  ): string {
    const userClean = userAnswer.trim();
    const correctClean = correctAnswer.trim();

    // 1. Missing zero-padding in base multiplication or complement
    if (
      (templateType === 'BASE_MULTIPLICATION' ||
        templateType === 'SQUARE_BASE_METHOD') &&
      correctClean.length > userClean.length &&
      correctClean.replace(/^0+/, '') === userClean.replace(/^0+/, '')
    ) {
      return 'Notice the base has 2 zeros! The right-hand deficiency product must be zero-padded to 2 digits (e.g. 06 instead of 6).';
    }

    if (
      templateType === 'BASE_MULTIPLICATION' &&
      userClean.length === correctClean.length - 1 &&
      userClean.startsWith(correctClean.slice(0, 2))
    ) {
      return 'Check the right-hand column: remember to pad with a leading zero if the deviation product has fewer digits than the base zeros!';
    }

    // 2. Square ending in 5: user multiplied d * d instead of d * (d + 1)
    if (templateType === 'SQUARE_ENDING_FIVE') {
      const match = questionText.match(/(\d+)²/);
      if (match) {
        const num = parseInt(match[1], 10);
        const d = Math.floor(num / 10);
        const wrongAns = `${d * d}25`;
        if (userClean === wrongAns) {
          return `You computed ${d} × ${d} = ${d * d} before appending 25. Remember Ekadhikena Purvena requires 'one more than previous': ${d} × ${d + 1} = ${d * (d + 1)}!`;
        }
      }
    }

    // 3. Series of 9s (Ekanyunena): forgot to reduce by 1
    if (templateType === 'SERIES_NINES_MULTIPLICATION') {
      return 'Remember Ekanyunena Purvena: first subtract 1 from the multiplicand to get the left part, then subtract that left part from 99/999!';
    }

    // 4. Paravartya Transposition: sign mistake
    if (templateType === 'PARAVARTYA_TRANSPOSITION') {
      if (
        (userClean.startsWith('-') && !correctClean.startsWith('-')) ||
        (!userClean.startsWith('-') && correctClean.startsWith('-'))
      ) {
        return 'Sign reversal rule: Remember Paravartya Yojayet (Transpose and Apply) requires changing the sign when crossing the equality!';
      }
    }

    return 'Check your step-by-step arithmetic against the Vedic Sutra rule.';
  }

  private buildExplanation(
    questionText: string,
    correctAnswer: string,
    template: TemplateWithTopic | null,
  ): { steps: string[]; visual?: Record<string, unknown> } {
    const templateType = template?.templateType || '';

    if (
      questionText.toLowerCase().includes('which vedic sutra') ||
      questionText.toLowerCase().includes('which sutra') ||
      questionText.toLowerCase().includes('which classical vedic') ||
      questionText.toLowerCase().includes('which vedic method')
    ) {
      return {
        steps: [
          `Pattern Recognition: Analyze the structure of the given problem.`,
          `Optimal Strategy: The ideal Vedic principle for this problem is "${correctAnswer}".`,
          `Application: Applying this technique provides the most direct calculation with minimal intermediate steps.`,
        ],
      };
    }

    // Sutra-specific explanations
    if (templateType === 'SQUARE_ENDING_FIVE') {
      const numMatch = questionText.match(/(\d+)/);
      const num = numMatch ? Number(numMatch[1]) : 35;
      const d = Math.floor(num / 10);
      return {
        steps: [
          `Take the preceding part before 5: ${d}.`,
          `Multiply by one more than itself: ${d} × ${d + 1} = ${d * (d + 1)}.`,
          `Append 25: ${correctAnswer}.`,
        ],
      };
    }

    if (templateType === 'BASE_MULTIPLICATION') {
      return {
        steps: [
          'Identify base 100 and record deviations from the base.',
          'Cross-subtract one factor with the other deficiency.',
          'Multiply the deficiencies to obtain the right-hand digits.',
          `Combine parts to arrive at ${correctAnswer}.`,
        ],
      };
    }

    if (templateType === 'URDHVA_MULTIPLICATION') {
      return {
        steps: [
          'Multiply vertically right for the units column.',
          'Cross-multiply and add partial products for tens column.',
          'Multiply vertically left for the hundreds/thousands column.',
          `Accumulate carries to obtain final product: ${correctAnswer}.`,
        ],
      };
    }

    if (templateType === 'PARAVARTYA_TRANSPOSITION') {
      return {
        steps: [
          'Apply the rule "Transpose and Apply" (Paravartya Yojayet).',
          'Transpose constant terms to the opposite side with sign reversal.',
          'Divide by the variable coefficient to isolate x.',
          `Result: ${correctAnswer}.`,
        ],
      };
    }

    if (templateType === 'SHUNYAM_EQUATION') {
      return {
        steps: [
          'Identify the repeated aggregate expression in the equation.',
          'By Shunyam Saamyasamuccaye, equate the common aggregate to zero.',
          `Solve to find x = ${correctAnswer}.`,
        ],
      };
    }

    if (templateType === 'PROPORTIONAL_SYSTEM') {
      return {
        steps: [
          'Compare the ratios of variable coefficients and constant terms.',
          'Because the ratio matches, by (Anurupye) Shunyamanyat, the other variable vanishes.',
          `Result: ${correctAnswer}.`,
        ],
      };
    }

    if (templateType === 'ADD_SUBTRACT_SYSTEM') {
      return {
        steps: [
          'Add the two symmetric equations to obtain a simplified (x + y) relation.',
          'Subtract the two equations to obtain a simplified (x - y) relation.',
          `Combine both to solve for the values: ${correctAnswer}.`,
        ],
      };
    }

    if (templateType === 'COMPLETION_METHOD') {
      return {
        steps: [
          'Apply Puranapuranabhyam by completing to the nearest round decade or completing the square.',
          'Compensate on the other term or side to preserve exact numerical equality.',
          `Final verified value: ${correctAnswer}.`,
        ],
      };
    }

    if (templateType === 'RATE_OF_CHANGE') {
      return {
        steps: [
          'Apply Chalana-Kalanabhyam to determine the rate of change (derivative).',
          'Evaluate or set to zero according to the problem requirement.',
          `Result: ${correctAnswer}.`,
        ],
      };
    }

    if (templateType === 'SQUARE_BASE_METHOD') {
      return {
        steps: [
          'Determine the deficiency or excess from the nearest power of 10 base.',
          'Adjust the original number by the deficiency or excess for the left part.',
          'Square the deviation for the right part, padding to match base digits.',
          `Combine to reach ${correctAnswer}.`,
        ],
      };
    }

    if (templateType === 'PART_AND_WHOLE') {
      return {
        steps: [
          'Apply Vyashtisamanstih: decompose the complex whole into friendly component parts.',
          'Evaluate each partial product or factor separately.',
          `Recombine parts to restore the total: ${correctAnswer}.`,
        ],
      };
    }

    if (templateType === 'REMAINDER_METHOD') {
      return {
        steps: [
          'Apply Shesanyankena Charamena to examine divisibility and remainder.',
          'Verify quotient and remainder relationship.',
          `Remainder: ${correctAnswer}.`,
        ],
      };
    }

    if (templateType === 'PENULTIMATE_ULTIMATE') {
      return {
        steps: [
          'Identify penultimate digit b and ultimate digit c.',
          'Calculate the weighted expression 2b + c.',
          `Result: ${correctAnswer}.`,
        ],
      };
    }

    if (templateType === 'SERIES_NINES_MULTIPLICATION') {
      return {
        steps: [
          'Subtract 1 from the multiplicand to obtain the left part.',
          'Subtract the multiplicand from the base (all from 9 and last from 10) for the right part.',
          `Combine parts to form ${correctAnswer}.`,
        ],
      };
    }

    if (
      templateType === 'GUNITASAMUCHAYAH_FACTOR' ||
      templateType === 'FACTOR_QUADRATIC'
    ) {
      return {
        steps: [
          'Find two numbers whose product equals the constant term and sum equals the middle coefficient.',
          'Express in linear factor form (x + a)(x + b).',
          `Verify using Gunitasamuchayah that Sc equals Sp. Correct factors: ${correctAnswer}.`,
        ],
      };
    }

    if (templateType === 'GUNAKASAMUCHAYAH_FACTOR') {
      return {
        steps: [
          'Inspect common factors or cross-multiply coefficients of quadratic terms.',
          `Group terms into factored form: ${correctAnswer}.`,
        ],
      };
    }

    // Default fallback steps
    return {
      steps: [
        'Analyze the problem structure and identify the appropriate Vedic principle.',
        `Work through the mental steps carefully to obtain the verified result: ${correctAnswer}.`,
      ],
    };
  }

  private answersMatch(expected: string, received: string): boolean {
    if (!expected || !received) return false;

    const normalize = (value: string) =>
      value.trim().toLowerCase().replace(/,/g, '').replace(/\s+/g, ' ');

    const normExp = normalize(expected);
    const normRec = normalize(received);

    if (normExp === normRec) return true;

    // Check factor commutativity e.g. (x + 2)(x + 3) vs (x + 3)(x + 2)
    const factorRegex = /^\(([^)]+)\)\(([^)]+)\)$/;
    const expFactors = normExp.replace(/\s/g, '').match(factorRegex);
    const recFactors = normRec.replace(/\s/g, '').match(factorRegex);
    if (expFactors && recFactors) {
      const expSet = [expFactors[1], expFactors[2]].sort().join('');
      const recSet = [recFactors[1], recFactors[2]].sort().join('');
      if (expSet === recSet) return true;
    }

    // Check variable prefix e.g. "x = 4" vs "4"
    const expNum = normExp.replace(/^[a-z]\s*=\s*/, '').trim();
    const recNum = normRec.replace(/^[a-z]\s*=\s*/, '').trim();
    if (expNum === recNum) return true;

    // Strip trailing unit labels e.g. "7225 m²" -> "7225", "9506 kg" -> "9506"
    const expStripped = expNum
      .replace(/\s*(kg|m|sq mm|sq m|meters|rupees|dollars|seats)\b.*$/i, '')
      .trim();
    const recStripped = recNum
      .replace(/\s*(kg|m|sq mm|sq m|meters|rupees|dollars|seats)\b.*$/i, '')
      .trim();
    if (expStripped === recStripped && expStripped.length > 0) return true;

    // Numerical / fraction comparison
    const parseNum = (val: string): number | null => {
      const frac = val.match(/^(-?\d+)\/(\d+)$/);
      if (frac && Number(frac[2]) !== 0)
        return Number(frac[1]) / Number(frac[2]);
      const n = Number(val);
      return isNaN(n) ? null : n;
    };

    const expN = parseNum(expStripped);
    const recN = parseNum(recStripped);
    if (expN !== null && recN !== null) {
      return Math.abs(expN - recN) < 1e-6;
    }

    return false;
  }
}
