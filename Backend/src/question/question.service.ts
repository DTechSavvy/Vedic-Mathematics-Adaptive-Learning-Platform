import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ExplanationService } from './explanation.service';
import { AchievementService } from '../achievement/achievement.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService, private explanationService: ExplanationService, private readonly achievementService: AchievementService) {}

  async generateQuestion(templateId: number, userId: number) {
    const template =
      await this.prisma.questionTemplate.findUnique({
        where: {
          id: templateId,
        },
      });

    if (!template) {
      throw new NotFoundException(
        'Template not found',
      );
    }

    switch (template.templateType) {
      case 'ADD_WITHOUT_CARRY':
        return this.generateAdditionQuestion(
          template,
          userId,
        );

      case 'NIKHILAM_SUBTRACTION':
        return this.generateNikhilamQuestion(
         template,
         userId,
        );

      case 'DOT_METHOD_ADDITION':
        return this.generateDotMethodQuestion(
         template,
         userId,
        );

      case 'BASE_MULTIPLICATION':
        return this.generateBaseMultiplicationQuestion(
         template,
         userId,
        );

      case 'URDHVA_MULTIPLICATION':
        return this.generateUrdhvaQuestion(
         template,
         userId,
        );

      case 'SERIES_ONES_MULTIPLICATION':
        return this.generateSeriesOnesQuestion(
         template,
         userId,
        );

      case 'SERIES_NINES_MULTIPLICATION':
        return this.generateSeriesNinesQuestion(
         template,
         userId,
        );

      case 'SQUARE_ENDING_FIVE':
        return this.generateSquareEndingFiveQuestion(
         template,
         userId,
        );

      case 'SQUARE_BASE_METHOD':
        return this.generateSquareBaseQuestion(
         template,
         userId,
        );

      case 'DWANDWA_YOGA':
        return this.generateDwandwaQuestion(
         template,
         userId,
        );

      case 'YAVADUNAM_CUBE':
        return this.generateCubeQuestion(
         template,
         userId,
        );

      case 'SQUARE_ROOT_TWO':
        return this.generateRootTwoQuestion(
         template,
         userId,
        );

      case 'FRACTION_ADDITION':
        return this.generateFractionAdditionQuestion(
         template,
         userId,
        );

      case 'FRACTION_SUBTRACTION':
        return this.generateFractionSubtractionQuestion(
         template,
         userId,
        );

      case 'VINCULUM_DIVISION':
        return this.generateVinculumDivisionQuestion(
         template,
         userId,
        );

      case 'BAUDHAYANA_THEOREM':
        return this.generateBaudhayanaQuestion(
         template,
         userId,
        );

      case 'FACTOR_QUADRATIC':
        return this.generateQuadraticQuestion(
         template,
         userId,
        );

      case 'CONCEPT_OF_PI':
        return this.generatePiQuestion(
         template,
         userId,
        );

      case 'CIRCLING_SQUARE':
        return this.generateCirclingSquareQuestion(
         template,
         userId,
        );

      default:
        throw new NotFoundException(
          'Generator not implemented for this template',
        );
    }
  }

  private async generateAdditionQuestion(
    template: any,
    userId: number,
  ) {
    const min = template.minValue ?? 10;
    const max = template.maxValue ?? 99;

    const num1 =
      Math.floor(
        Math.random() * (max - min + 1),
      ) + min;

    const num2 =
      Math.floor(
        Math.random() * (max - min + 1),
      ) + min;

    const generatedQuestion =
      await this.prisma.generatedQuestion.create({
        data: {
          userId,
          templateId: template.id,
          question: `${num1} + ${num2}`,
          correctAnswer: String(num1 + num2),
        },
      });

    return {
      questionId: generatedQuestion.id,
      question: generatedQuestion.question,
    };
  }
  private async generateNikhilamQuestion(
  template: any,
  userId: number,
  ) {
  const bases = [
    10,
    100,
    1000,
  ];

  const base =
    bases[
      Math.floor(
        Math.random() * bases.length,
      )
    ];

  const number =
    Math.floor(
      Math.random() * (base - 1),
    ) + 1;

  const answer =
    base - number;

  const generatedQuestion =
    await this.prisma.generatedQuestion.create({
      data: {
        userId,

        templateId: template.id,

        question: `${base} - ${number}`,

        correctAnswer:
          String(answer),
      },
    });

  return {
    questionId:
      generatedQuestion.id,

    question:
      generatedQuestion.question,
   };
 }
 private async generateDotMethodQuestion(
  template: any,
  userId: number,
  ) {
  const min = 10;
  const max = 99;

  const num1 =
    Math.floor(
      Math.random() * (max - min + 1),
    ) + min;

  const num2 =
    Math.floor(
      Math.random() * (max - min + 1),
    ) + min;

  const generatedQuestion =
    await this.prisma.generatedQuestion.create({
      data: {
        userId,

        templateId: template.id,

        question: `${num1} + ${num2}`,

        correctAnswer: String(
          num1 + num2,
        ),
      },
    });

  return {
    questionId:
      generatedQuestion.id,

    question:
      generatedQuestion.question,
  };
 }
 private async generateBaseMultiplicationQuestion(
  template: any,
  userId: number,
) {
  const values = [
    91, 92, 93, 94, 95,
    96, 97, 98, 99,
  ];

  const num1 =
    values[
      Math.floor(
        Math.random() *
          values.length,
      )
    ];

  const num2 =
    values[
      Math.floor(
        Math.random() *
          values.length,
      )
    ];

  const generatedQuestion =
    await this.prisma.generatedQuestion.create({
      data: {
        userId,

        templateId: template.id,

        question: `${num1} × ${num2}`,

        correctAnswer: String(
          num1 * num2,
        ),
      },
    });

  return {
    questionId:
      generatedQuestion.id,

    question:
      generatedQuestion.question,
  };
 }
 private async generateUrdhvaQuestion(
  template: any,
  userId: number,
) {
  const num1 =
    Math.floor(
      Math.random() * 90,
    ) + 10;

  const num2 =
    Math.floor(
      Math.random() * 90,
    ) + 10;

  const generatedQuestion =
    await this.prisma.generatedQuestion.create({
      data: {
        userId,

        templateId: template.id,

        question: `${num1} × ${num2}`,

        correctAnswer: String(
          num1 * num2,
        ),
      },
    });

  return {
    questionId:
      generatedQuestion.id,

    question:
      generatedQuestion.question,
  };
 }
 private async generateSeriesOnesQuestion(
  template: any,
  userId: number,
) {
  const number =
    Math.floor(
      Math.random() * 900,
    ) + 100;

  const generatedQuestion =
    await this.prisma.generatedQuestion.create({
      data: {
        userId,

        templateId: template.id,

        question: `${number} × 111`,

        correctAnswer: String(
          number * 111,
        ),
      },
    });

  return {
    questionId:
      generatedQuestion.id,

    question:
      generatedQuestion.question,
  };
 }
 private async generateSeriesNinesQuestion(
  template: any,
  userId: number,
) {
  const number =
    Math.floor(
      Math.random() * 900,
    ) + 100;

  const generatedQuestion =
    await this.prisma.generatedQuestion.create({
      data: {
        userId,

        templateId: template.id,

        question: `${number} × 999`,

        correctAnswer: String(
          number * 999,
        ),
      },
    });

  return {
    questionId:
      generatedQuestion.id,

    question:
      generatedQuestion.question,
  };
 }
 private async generateSquareEndingFiveQuestion(
  template: any,
  userId: number,
) {
  const prefixes = [
    1, 2, 3, 4,
    5, 6, 7, 8, 9,
  ];

  const prefix =
    prefixes[
      Math.floor(
        Math.random() *
          prefixes.length,
      )
    ];

  const number =
    prefix * 10 + 5;

  const generatedQuestion =
    await this.prisma.generatedQuestion.create({
      data: {
        userId,

        templateId: template.id,

        question: `${number}²`,

        correctAnswer: String(
          number * number,
        ),
      },
    });

  return {
    questionId:
      generatedQuestion.id,

    question:
      generatedQuestion.question,
  };
 }
 private async generateSquareBaseQuestion(
  template: any,
  userId: number,
) {
  const values = [
    91, 92, 93, 94,
    95, 96, 97, 98, 99,
  ];

  const number =
    values[
      Math.floor(
        Math.random() *
          values.length,
      )
    ];

  const generatedQuestion =
    await this.prisma.generatedQuestion.create({
      data: {
        userId,

        templateId: template.id,

        question: `${number}²`,

        correctAnswer: String(
          number * number,
        ),
      },
    });

  return {
    questionId:
      generatedQuestion.id,

    question:
      generatedQuestion.question,
  };
 }
 private async generateDwandwaQuestion(
  template: any,
  userId: number,
) {
  const number =
    Math.floor(
      Math.random() * 90,
    ) + 10;

  const generatedQuestion =
    await this.prisma.generatedQuestion.create({
      data: {
        userId,

        templateId: template.id,

        question: `${number}²`,

        correctAnswer: String(
          number * number,
        ),
      },
    });

  return {
    questionId:
      generatedQuestion.id,

    question:
      generatedQuestion.question,
  };
 }
 private async generateCubeQuestion(
  template: any,
  userId: number,
) {
  const values = [
    95,
    96,
    97,
    98,
    99,
    101,
    102,
    103,
    104,
    105,
  ];

  const number =
    values[
      Math.floor(
        Math.random() *
          values.length,
      )
    ];

  const generatedQuestion =
    await this.prisma.generatedQuestion.create({
      data: {
        userId,

        templateId: template.id,

        question: `${number}³`,

        correctAnswer: String(
          Math.pow(number, 3),
        ),
      },
    });

  return {
    questionId:
      generatedQuestion.id,

    question:
      generatedQuestion.question,
  };
 }
 private async generateRootTwoQuestion(
  template: any,
  userId: number,
) {
  const generatedQuestion =
    await this.prisma.generatedQuestion.create({
      data: {
        userId,

        templateId: template.id,

        question:
          'Find √2 correct to 4 decimal places',

        correctAnswer:
          '1.4142',
      },
    });

  return {
    questionId:
      generatedQuestion.id,

    question:
      generatedQuestion.question,
  };
 }
 private async generateFractionAdditionQuestion(
  template: any,
  userId: number,
) {
  const denominator =
    Math.floor(
      Math.random() * 8,
    ) + 2;

  const numerator1 =
    Math.floor(
      Math.random() *
        (denominator - 1),
    ) + 1;

  const numerator2 =
    Math.floor(
      Math.random() *
        (denominator - 1),
    ) + 1;

  const answer =
    `${numerator1 + numerator2}/${denominator}`;

  const generatedQuestion =
    await this.prisma.generatedQuestion.create({
      data: {
        userId,

        templateId: template.id,

        question:
          `${numerator1}/${denominator} + ${numerator2}/${denominator}`,

        correctAnswer:
          answer,
      },
    });

  return {
    questionId:
      generatedQuestion.id,

    question:
      generatedQuestion.question,
  };
 }
 private async generateFractionSubtractionQuestion(
  template: any,
  userId: number,
) {
  const denominator =
    Math.floor(
      Math.random() * 8,
    ) + 2;

  const numerator1 =
    Math.floor(
      Math.random() *
        (denominator - 1),
    ) + 1;

  const numerator2 =
    Math.floor(
      Math.random() * numerator1,
    );

  const answer =
    `${numerator1 - numerator2}/${denominator}`;

  const generatedQuestion =
    await this.prisma.generatedQuestion.create({
      data: {
        userId,

        templateId: template.id,

        question:
          `${numerator1}/${denominator} - ${numerator2}/${denominator}`,

        correctAnswer:
          answer,
      },
    });

  return {
    questionId:
      generatedQuestion.id,

    question:
      generatedQuestion.question,
  };
 }
 private async generateVinculumDivisionQuestion(
  template: any,
  userId: number,
) {
  const divisor =
    Math.floor(
      Math.random() * 8,
    ) + 2;

  const quotient =
    Math.floor(
      Math.random() * 12,
    ) + 1;

  const dividend =
    divisor * quotient;

  const generatedQuestion =
    await this.prisma.generatedQuestion.create({
      data: {
        userId,

        templateId: template.id,

        question:
          `${dividend} ÷ ${divisor}`,

        correctAnswer:
          String(quotient),
      },
    });

  return {
    questionId:
      generatedQuestion.id,

    question:
      generatedQuestion.question,
  };
 }
 private async generateBaudhayanaQuestion(
  template: any,
  userId: number,
) {
  const triples = [
    [3, 4, 5],
    [5, 12, 13],
    [8, 15, 17],
    [7, 24, 25],
  ];

  const triple =
    triples[
      Math.floor(
        Math.random() *
          triples.length,
      )
    ];

  const generatedQuestion =
    await this.prisma.generatedQuestion.create({
      data: {
        userId,

        templateId: template.id,

        question:
          `If a = ${triple[0]} and b = ${triple[1]}, find c`,

        correctAnswer:
          String(triple[2]),
      },
    });

  return {
    questionId:
      generatedQuestion.id,

    question:
      generatedQuestion.question,
  };
 }
 private async generateQuadraticQuestion(
  template: any,
  userId: number,
) {
  const pairs = [
    [2, 3],
    [3, 4],
    [4, 5],
    [2, 5],
    [3, 5],
  ];

  const pair =
    pairs[
      Math.floor(
        Math.random() *
          pairs.length,
      )
    ];

  const a = pair[0];
  const b = pair[1];

  const middle =
    a + b;

  const constant =
    a * b;

  const generatedQuestion =
    await this.prisma.generatedQuestion.create({
      data: {
        userId,

        templateId: template.id,

        question:
          `Factor: x² + ${middle}x + ${constant}`,

        correctAnswer:
          `(x+${a})(x+${b})`,
      },
    });

  return {
    questionId:
      generatedQuestion.id,

    question:
      generatedQuestion.question,
  };
 }
 private async generatePiQuestion(
  template: any,
  userId: number,
) {
  const radii = [
    7,
    14,
    21,
    28,
  ];

  const radius =
    radii[
      Math.floor(
        Math.random() *
          radii.length,
      )
    ];

  const circumference =
    2 *
    (22 / 7) *
    radius;

  const generatedQuestion =
    await this.prisma.generatedQuestion.create({
      data: {
        userId,

        templateId: template.id,

        question:
          `Find circumference when radius = ${radius}`,

        correctAnswer:
          String(circumference),
      },
    });

  return {
    questionId:
      generatedQuestion.id,

    question:
      generatedQuestion.question,
  };
 }
 private async generateCirclingSquareQuestion(
  template: any,
  userId: number,
) {
  const sides = [
    2,
    4,
    6,
    8,
    10,
  ];

  const side =
    sides[
      Math.floor(
        Math.random() *
          sides.length,
      )
    ];

  const radius =
    Number(
      (
        (side *
          Math.sqrt(2)) /
        2
      ).toFixed(2),
    );

  const generatedQuestion =
    await this.prisma.generatedQuestion.create({
      data: {
        userId,

        templateId: template.id,

        question:
          `Find circle radius for square side ${side}`,

        correctAnswer:
          String(radius),
      },
    });

  return {
    questionId:
      generatedQuestion.id,

    question:
      generatedQuestion.question,
  };
 }

  async submitAnswer(
    questionId: number,
    answer: string,
    userId: number,
  ) {
    const question =
      await this.prisma.generatedQuestion.findUnique({
        where: {
          id: questionId,
        },
      });

    if (!question) {
      throw new NotFoundException(
        'Question not found',
      );
    }

    if (question.userId !== userId) {
      throw new ForbiddenException('You can only submit answers to your own questions.');
    }

    const isCorrect =
      question.correctAnswer === answer;
    const template =
  await this.prisma.questionTemplate.findUnique({
    where: {
      id: question.templateId,
    },
  });
  let explanation;

  if (
  template?.templateType ===
  'ADD_WITHOUT_CARRY'
) {
  const [num1, num2] =
    question.question
      .split('+')
      .map((n) => Number(n.trim()));

  explanation =
    this.explanationService
      .generateAdditionExplanation(
        num1,
        num2,
      );
}

if (
  template?.templateType ===
  'NIKHILAM_SUBTRACTION'
) {
  const [base, number] =
    question.question
      .split('-')
      .map((n) => Number(n.trim()));

  explanation =
    this.explanationService
      .generateNikhilamExplanation(
        base,
        number,
      );
 }
 if (
  template?.templateType ===
  'DOT_METHOD_ADDITION'
  ) {
  const [num1, num2] =
    question.question
      .split('+')
      .map((n) =>
        Number(n.trim()),
      );

  explanation =
    this.explanationService
      .generateDotMethodExplanation(
        num1,
        num2,
      );
  }
  if (
  template?.templateType ===
  'BASE_MULTIPLICATION'
) {
  const [num1, num2] =
    question.question
      .split('×')
      .map((n) =>
        Number(n.trim()),
      );

  explanation =
    this.explanationService
      .generateBaseMultiplicationExplanation(
        num1,
        num2,
      );
 }
 if (
  template?.templateType ===
  'URDHVA_MULTIPLICATION'
) {
  const [num1, num2] =
    question.question
      .split('×')
      .map((n) =>
        Number(n.trim()),
      );

  explanation =
    this.explanationService
      .generateUrdhvaExplanation(
        num1,
        num2,
      );
 }
 if (
  template?.templateType ===
  'SERIES_ONES_MULTIPLICATION'
) {
  const number =
    Number(
      question.question
        .split('×')[0]
        .trim(),
    );

  explanation =
    this.explanationService
      .generateSeriesOnesExplanation(
        number,
      );
 }
 if (
  template?.templateType ===
  'SERIES_NINES_MULTIPLICATION'
) {
  const number =
    Number(
      question.question
        .split('×')[0]
        .trim(),
    );

  explanation =
    this.explanationService
      .generateSeriesNinesExplanation(
        number,
      );
 }
 if (
  template?.templateType ===
  'SQUARE_ENDING_FIVE'
) {
  const number =
    Number(
      question.question.replace(
        '²',
        '',
      ),
    );

  explanation =
    this.explanationService
      .generateSquareEndingFiveExplanation(
        number,
      );
 }
 if (
  template?.templateType ===
  'SQUARE_BASE_METHOD'
) {
  const number =
    Number(
      question.question.replace(
        '²',
        '',
      ),
    );

  explanation =
    this.explanationService
      .generateSquareBaseExplanation(
        number,
      );
 }
 if (
  template?.templateType ===
  'DWANDWA_YOGA'
) {
  const number =
    Number(
      question.question.replace(
        '²',
        '',
      ),
    );

  explanation =
    this.explanationService
      .generateDwandwaExplanation(
        number,
      );
 }
 if (
  template?.templateType ===
  'YAVADUNAM_CUBE'
) {
  const number =
    Number(
      question.question.replace(
        '³',
        '',
      ),
    );

  explanation =
    this.explanationService
      .generateCubeExplanation(
        number,
      );
 }
 if (
  template?.templateType ===
  'SQUARE_ROOT_TWO'
) {
  explanation =
    this.explanationService
      .generateRootTwoExplanation();
 }
 if (
  template?.templateType ===
  'FRACTION_ADDITION'
) {
  const parts =
    question.question.match(
      /(\d+)\/(\d+)\s\+\s(\d+)\/(\d+)/,
    );

  if (parts) {
    const numerator1 =
      Number(parts[1]);

    const denominator =
      Number(parts[2]);

    const numerator2 =
      Number(parts[3]);

    explanation =
      this.explanationService
        .generateFractionAdditionExplanation(
          numerator1,
          numerator2,
          denominator,
        );
  }
 }
 if (
  template?.templateType ===
  'FRACTION_SUBTRACTION'
) {
  const parts =
    question.question.match(
      /(\d+)\/(\d+)\s-\s(\d+)\/(\d+)/,
    );

  if (parts) {
    const numerator1 =
      Number(parts[1]);

    const denominator =
      Number(parts[2]);

    const numerator2 =
      Number(parts[3]);

    explanation =
      this.explanationService
        .generateFractionSubtractionExplanation(
          numerator1,
          numerator2,
          denominator,
        );
  }
 }
 if (
  template?.templateType ===
  'VINCULUM_DIVISION'
) {
  const parts =
    question.question.match(
      /(\d+)\s÷\s(\d+)/,
    );

  if (parts) {
    const dividend =
      Number(parts[1]);

    const divisor =
      Number(parts[2]);

    explanation =
      this.explanationService
        .generateVinculumDivisionExplanation(
          dividend,
          divisor,
        );
  }
 }
 if (
  template?.templateType ===
  'BAUDHAYANA_THEOREM'
) {
  const parts =
    question.question.match(
      /a = (\d+) and b = (\d+)/,
    );

  if (parts) {
    const a =
      Number(parts[1]);

    const b =
      Number(parts[2]);

    explanation =
      this.explanationService
        .generateBaudhayanaExplanation(
          a,
          b,
        );
  }
 }
 if (
  template?.templateType ===
  'FACTOR_QUADRATIC'
) {
  const parts =
    question.question.match(
      /x² \+ (\d+)x \+ (\d+)/,
    );

  if (parts) {
    const middle =
      Number(parts[1]);

    const constant =
      Number(parts[2]);

    let a = 1;
    let b = constant;

    for (
      let i = 1;
      i <= constant;
      i++
    ) {
      if (
        i *
          (constant / i) ===
          constant &&
        i +
          constant / i ===
          middle
      ) {
        a = i;
        b = constant / i;
        break;
      }
    }

    explanation =
      this.explanationService
        .generateQuadraticExplanation(
          a,
          b,
        );
  }
 }
 if (
  template?.templateType ===
  'CONCEPT_OF_PI'
) {
  const parts =
    question.question.match(
      /radius = (\d+)/,
    );

  if (parts) {
    const radius =
      Number(parts[1]);

    explanation =
      this.explanationService
        .generatePiExplanation(
          radius,
        );
  }
 }
 if (
  template?.templateType ===
  'CIRCLING_SQUARE'
) {
  const parts =
    question.question.match(
      /side (\d+)/,
    );

  if (parts) {
    const side =
      Number(parts[1]);

    explanation =
      this.explanationService
        .generateCirclingSquareExplanation(
          side,
        );
  }
 }

    const now = new Date();

    const timeTakenSeconds = Math.floor(
     (now.getTime() -
       question.createdAt.getTime()) /
        1000,
);
   console.log('ANSWER =', answer); 
  console.log('TYPE =', typeof answer);

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
    },
  });
  if (isCorrect) {

  const correctCount =
    await this.prisma.questionAttempt.count({
      where: {
        userId: question.userId,
        isCorrect: true,
      },
    });

  if (correctCount === 1) {

    await this.achievementService
      .unlockAchievement(
        question.userId,
        'First Steps',
        'Answered first question correctly.',
      );
   }
 }
  const earnedXP =
   isCorrect ? 10 : 2;

  const speedBonus =
   timeTakenSeconds <= 10
    ? 5
    : 0;

  const totalXP =
   earnedXP + speedBonus;

  const user =
  await this.prisma.user.findUnique({
    where: {
      id: question.userId,
    },
  });

let updatedLevel = 1;
let updatedStreak = 0;

if (user) {

  const updatedXP =
    user.xp + totalXP;

  updatedLevel =
    Math.floor(
      updatedXP / 100,
    ) + 1;

  const today = new Date();

  updatedStreak =
   user.streak || 0;

if (user.lastActiveDate) {

  const lastDate =
    new Date(user.lastActiveDate);

  const diffDays =
    Math.floor(
      (
        today.getTime() -
        lastDate.getTime()
      ) /
      (1000 * 60 * 60 * 24),
    );

  if (diffDays === 1) {

    updatedStreak += 1;

  } else if (diffDays > 1) {

    updatedStreak = 1;
  
  } else {

    updatedStreak = user.streak;
  }

} 

  await this.prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      xp: updatedXP,
      level: updatedLevel,
      streak: updatedStreak,
      lastActiveDate: today,
    },
  });
 }
  
if (template) {
  const attempts =
    await this.prisma.questionAttempt.findMany({
      where: {
        userId: question.userId,
        templateId: question.templateId,
      },
    });

  const totalAttempts =
    attempts.length;

  const correctAttempts =
    attempts.filter(
      (attempt) => attempt.isCorrect,
    ).length;

  const mastery =
    totalAttempts === 0
      ? 0
      : Number(
          (
            (correctAttempts /
              totalAttempts) *
            100
          ).toFixed(2),
        );

  await this.prisma.userProgress.upsert({
    where: {
      userId_topicId: {
        userId: question.userId,
        topicId: template.topicId,
      },
    },
    update: {
      mastery,
      completed: mastery >= 80,
    },
    create: {
      userId: question.userId,
      topicId: template.topicId,
      mastery,
      completed: mastery >= 80,
    },
  });
}

    await this.prisma.generatedQuestion.update({
      where: {
        id: questionId,
      },
      data: {
        isAnswered: true,
      },
    });

    return {
  correct: isCorrect,

  correctAnswer:
    question.correctAnswer,

  feedback: isCorrect
    ? 'Excellent!'
    : 'Incorrect answer.',

  explanation,

  earnedXP: totalXP,
  level: updatedLevel,
  streak: updatedStreak,
    };
  }
}