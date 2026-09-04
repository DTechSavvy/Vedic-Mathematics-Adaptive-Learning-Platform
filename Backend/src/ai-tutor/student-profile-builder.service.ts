import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MistakeAnalyzerService } from './services/mistake-analyzer.service';

@Injectable()
export class StudentProfileBuilderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mistakeAnalyzer: MistakeAnalyzerService,
  ) {}

  async build(userId: number) {
    const progress = await this.prisma.userProgress.findMany({
      where: {
        userId,
      },
      include: {
        topic: true,
      },
    });

    const attempts = await this.prisma.questionAttempt.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalAttempts = attempts.length;

    const correctAttempts = attempts.filter(
      (attempt) => attempt.isCorrect,
    ).length;

    const accuracy =
      totalAttempts === 0
        ? 0
        : Number(((correctAttempts / totalAttempts) * 100).toFixed(2));

    const recentWrongAttempts = attempts
      .filter((attempt) => !attempt.isCorrect)
      .slice(0, 10);

    const recentMistakes = recentWrongAttempts.map(
      (attempt) =>
        ` Question: ${attempt.generatedQuestion}
    Student: ${attempt.userAnswer}
    Correct: ${attempt.correctAnswer}`,
    );

    const mistakeAnalysis = await Promise.all(
      recentWrongAttempts.map((attempt) =>
        this.mistakeAnalyzer.analyzeMistake(
          'General',
          attempt.generatedQuestion,
          attempt.userAnswer,
          attempt.correctAnswer,
        ),
      ),
    );

    const averageTime =
      attempts.length === 0
        ? 0
        : Math.round(
            attempts.reduce(
              (sum, attempt) => sum + (attempt.timeTakenSeconds || 0),
              0,
            ) / attempts.length,
          );

    const mastery =
      progress.length === 0
        ? 0
        : Number(
            (
              progress.reduce((sum, p) => sum + p.mastery, 0) / progress.length
            ).toFixed(2),
          );

    const weakTopics = progress
      .filter((p) => p.mastery < 60)
      .map((p) => p.topic.title);

    const strongTopics = progress
      .filter((p) => p.mastery >= 80)
      .map((p) => p.topic.title);

    return {
      userId,
      mastery,
      accuracy,
      averageTime,
      weakTopics,
      strongTopics,
      recentMistakes,
      mistakeAnalysis,
    };
  }
}
