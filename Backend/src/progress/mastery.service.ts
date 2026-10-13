import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { sutraPracticeMappings } from '../question/sutra-practice';

export type TopicLearningStatus =
  | 'NOT_STARTED'
  | 'LEARNING'
  | 'PRACTICING'
  | 'DEVELOPING'
  | 'MASTERED'
  | 'REVIEW_REQUIRED';

export interface TopicMasteryDetails {
  topicId: number;
  topicTitle: string;
  moduleId: number;
  courseTitle: string;
  contentCompletion: number; // 0 to 100%
  contentStatus: 'NOT_STARTED' | 'OPENED' | 'IN_PROGRESS' | 'COMPLETED';
  validPracticeCount: number;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number | null;
  recentAttempts: number;
  recentCorrect: number;
  recentAccuracy: number | null;
  difficultyCoverage: {
    easyAttempts: number;
    easyAccuracy: number;
    mediumAttempts: number;
    mediumAccuracy: number;
    advancedAttempts: number;
    advancedAccuracy: number;
    expertAttempts: number;
    expertAccuracy: number;
    coveredTiers: number; // out of 3 (Easy, Medium, Advanced)
  };
  questionTypesUsed: string[];
  masteryScore: number; // 0 to 100
  status: TopicLearningStatus;
  isMastered: boolean;
  recommendedAction: string;
}

export interface SutraMasteryDetails {
  sutraId: string;
  sutraNumber: number;
  sutraName: string;
  sanskritName: string;
  englishMeaning: string;
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number | null;
  recentAccuracy: number | null;
  masteryScore: number;
  status: 'NOT_STARTED' | 'PRACTICING' | 'DEVELOPING' | 'MASTERED' | 'REVIEW_REQUIRED';
  isMastered: boolean;
  difficultyCoverage: string[];
  recommendedAction?: string;
}

@Injectable()
export class MasteryService {
  private readonly logger = new Logger(MasteryService.name);

  // Core pedagogical thresholds
  private readonly MIN_PRACTICE_VOLUME = 50;
  private readonly MIN_OVERALL_ACCURACY = 75; // 75%
  private readonly MIN_RECENT_ACCURACY = 80; // 80% over last 20
  private readonly RECENT_WINDOW_SIZE = 20;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates comprehensive multi-dimensional mastery for a given user and topic.
   * Enforces Content Completion -> Practice Volume -> Accuracy -> Difficulty -> Question-Types.
   */
  async calculateTopicMastery(userId: number, topicId: number): Promise<TopicMasteryDetails> {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
        lessons: {
          select: { id: true },
        },
      },
    });

    if (!topic) {
      throw new Error(`Topic with ID ${topicId} not found`);
    }

    // Step 1: Content Completion Evaluation
    let contentCompletion = 0;
    let contentStatus: 'NOT_STARTED' | 'OPENED' | 'IN_PROGRESS' | 'COMPLETED' = 'NOT_STARTED';

    if (!topic.lessons || topic.lessons.length === 0) {
      contentCompletion = 100;
      contentStatus = 'COMPLETED';
    } else {
      const lessonIds = topic.lessons.map((l) => l.id);
      const lessonProgress = await this.prisma.lessonProgress.findMany({
        where: {
          userId,
          lessonId: { in: lessonIds },
        },
      });

      const completedCount = lessonProgress.filter((p) => p.status === 'COMPLETED').length;
      contentCompletion = Math.round((completedCount / topic.lessons.length) * 100);

      if (completedCount === topic.lessons.length) {
        contentStatus = 'COMPLETED';
      } else if (lessonProgress.some((p) => p.status === 'IN_PROGRESS' || p.status === 'COMPLETED')) {
        contentStatus = 'IN_PROGRESS';
      } else if (lessonProgress.length > 0) {
        contentStatus = 'OPENED';
      } else {
        contentStatus = 'NOT_STARTED';
      }
    }

    // Step 2: Practice Volume & Valid Attempts
    const attempts = await this.prisma.questionAttempt.findMany({
      where: {
        userId,
        template: {
          topicId,
        },
        isValidAttempt: true,
      },
      include: {
        template: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalAttempts = attempts.length;
    const validPracticeCount = totalAttempts;
    const correctAttempts = attempts.filter((a) => a.isCorrect).length;
    const accuracy =
      totalAttempts === 0 ? 0 : Number(((correctAttempts / totalAttempts) * 100).toFixed(1));

    // Step 3: Recent accuracy (last 20 valid attempts)
    const recentSlice = attempts.slice(-this.RECENT_WINDOW_SIZE);
    const recentAttempts = recentSlice.length;
    const recentCorrect = recentSlice.filter((a) => a.isCorrect).length;
    const recentAccuracy =
      recentAttempts === 0 ? 0 : Number(((recentCorrect / recentAttempts) * 100).toFixed(1));

    // Step 4: Difficulty Coverage
    const easyAttempts = attempts.filter((a) => (a.difficulty || a.template?.difficulty) === 'EASY');
    const easyCorrect = easyAttempts.filter((a) => a.isCorrect).length;
    const easyAccuracy =
      easyAttempts.length === 0
        ? 0
        : Number(((easyCorrect / easyAttempts.length) * 100).toFixed(1));

    const medAttempts = attempts.filter((a) => (a.difficulty || a.template?.difficulty) === 'MEDIUM');
    const medCorrect = medAttempts.filter((a) => a.isCorrect).length;
    const medAccuracy =
      medAttempts.length === 0
        ? 0
        : Number(((medCorrect / medAttempts.length) * 100).toFixed(1));

    const hardAttempts = attempts.filter(
      (a) =>
        (a.difficulty || a.template?.difficulty) === 'ADVANCED' ||
        (a.difficulty || a.template?.difficulty) === 'HARD',
    );
    const hardCorrect = hardAttempts.filter((a) => a.isCorrect).length;
    const hardAccuracy =
      hardAttempts.length === 0
        ? 0
        : Number(((hardCorrect / hardAttempts.length) * 100).toFixed(1));

    let coveredTiers = 0;
    if (easyAttempts.length >= 5 && easyAccuracy >= 70) coveredTiers++;
    if (medAttempts.length >= 5 && medAccuracy >= 65) coveredTiers++;
    if (hardAttempts.length >= 3 && hardAccuracy >= 55) coveredTiers++;

    // Step 5: Question Types Coverage
    const questionTypesUsed = Array.from(
      new Set(attempts.map((a) => a.questionType || a.template?.templateType).filter(Boolean)),
    ) as string[];

    // Mastery Score Formula (Explainable):
    // content = 20%, practice = 20%, overall accuracy = 25%, recent accuracy = 20%, difficulty = 10%, question-types = 5%
    const contentComponent = (contentCompletion / 100) * 20;
    const practiceComponent = Math.min(1, validPracticeCount / this.MIN_PRACTICE_VOLUME) * 20;
    const overallAccComponent = (accuracy / 100) * 25;
    const recentAccComponent = (recentAccuracy / 100) * 20;
    const difficultyComponent = (coveredTiers / 3) * 10;
    const typeComponent = questionTypesUsed.length === 0 ? 0 : Math.min(1, questionTypesUsed.length / 2) * 5;

    // Zero-state guard: A completely untouched topic (0 lessons read, 0 practice attempts) is strictly 0%
    let masteryScore = 0;
    if (contentCompletion > 0 || validPracticeCount > 0) {
      masteryScore = Math.min(
        100,
        Math.max(
          0,
          Math.round(
            contentComponent +
              practiceComponent +
              overallAccComponent +
              recentAccComponent +
              difficultyComponent +
              typeComponent,
          ),
        ),
      );
    }

    // Hard Gates for MASTERED status
    const meetsContent = contentCompletion >= 100;
    const meetsPractice = validPracticeCount >= this.MIN_PRACTICE_VOLUME;
    const meetsAccuracy = accuracy >= this.MIN_OVERALL_ACCURACY;
    const meetsRecent = recentAccuracy >= this.MIN_RECENT_ACCURACY;
    const meetsDifficulty = coveredTiers >= 2; // verified exposure across tiers

    const isMastered =
      meetsContent && meetsPractice && meetsAccuracy && meetsRecent && meetsDifficulty;

    // Status Determination
    let status: TopicLearningStatus = 'NOT_STARTED';
    let recommendedAction = 'Begin by studying the lesson content and observing worked examples.';

    if (totalAttempts === 0 && (contentStatus === 'NOT_STARTED' || contentCompletion === 0)) {
      status = 'NOT_STARTED';
      recommendedAction = 'Open the lesson to study foundational concepts and techniques.';
    } else if (contentStatus !== 'COMPLETED' || totalAttempts < 10) {
      status = 'LEARNING';
      if (contentStatus !== 'COMPLETED') {
        recommendedAction = 'Complete the instructional lesson content before advancing practice.';
      } else {
        recommendedAction = `Solve ${10 - totalAttempts} more questions to establish initial technique fluency.`;
      }
    } else if (totalAttempts < this.MIN_PRACTICE_VOLUME) {
      status = 'PRACTICING';
      recommendedAction = `Solve ${this.MIN_PRACTICE_VOLUME - totalAttempts} more valid practice challenges across tiers.`;
    } else if (isMastered) {
      status = 'MASTERED';
      recommendedAction = 'Mastery verified! Maintain mental speed through periodic review.';
    } else if (recentAccuracy < 55 && totalAttempts >= 60) {
      status = 'REVIEW_REQUIRED';
      recommendedAction = 'Recent accuracy has dropped below 55%. Review the Vedic diagnostic steps.';
    } else {
      status = 'DEVELOPING';
      if (!meetsContent) {
        recommendedAction = 'Review and complete the foundational lesson content.';
      } else if (!meetsAccuracy) {
        recommendedAction = `Current accuracy is ${accuracy}%. Raise overall accuracy to ≥${this.MIN_OVERALL_ACCURACY}%.`;
      } else if (!meetsRecent) {
        recommendedAction = `Recent accuracy is ${recentAccuracy}%. Reach ≥${this.MIN_RECENT_ACCURACY}% over your last 20 questions.`;
      } else {
        recommendedAction = 'Solve Medium and Advanced problems to expand difficulty tier coverage.';
      }
    }

    return {
      topicId,
      topicTitle: topic.title,
      moduleId: topic.moduleId,
      courseTitle: topic.module?.course?.title || 'Vedic Mathematics',
      contentCompletion,
      contentStatus,
      validPracticeCount,
      totalAttempts,
      correctAttempts,
      accuracy: totalAttempts === 0 ? null : accuracy,
      recentAttempts,
      recentCorrect,
      recentAccuracy: recentAttempts === 0 ? null : recentAccuracy,
      difficultyCoverage: {
        easyAttempts: easyAttempts.length,
        easyAccuracy,
        mediumAttempts: medAttempts.length,
        mediumAccuracy: medAccuracy,
        advancedAttempts: hardAttempts.length,
        advancedAccuracy: hardAccuracy,
        expertAttempts: 0,
        expertAccuracy: 0,
        coveredTiers,
      },
      questionTypesUsed,
      masteryScore,
      status,
      isMastered,
      recommendedAction,
    };
  }

  /**
   * Calculates comprehensive multi-dimensional mastery for a given user and canonical Sutra.
   */
  async calculateSutraMastery(userId: number, sutraId: string): Promise<SutraMasteryDetails> {
    const sutra = await this.prisma.sutra.findUnique({
      where: { id: sutraId },
    });

    if (!sutra) {
      throw new Error(`Sutra with ID ${sutraId} not found`);
    }

    // Find all attempts that map to this Sutra
    const allAttempts = await this.prisma.questionAttempt.findMany({
      where: { userId },
      include: {
        template: {
          include: {
            topic: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const sutraAttempts = allAttempts.filter((att) => {
      const t = att.template;
      if (!t) return false;
      const mapping = sutraPracticeMappings.find((m) => m.templateType === t.templateType);
      if (mapping && mapping.sutraId === sutra.id) return true;
      if (
        t.topic?.sutra &&
        (t.topic.sutra.toLowerCase().includes(sutra.name.toLowerCase()) ||
          sutra.name.toLowerCase().includes(t.topic.sutra.toLowerCase()))
      ) {
        return true;
      }
      return false;
    });

    const totalAttempts = sutraAttempts.length;
    const correctAttempts = sutraAttempts.filter((a) => a.isCorrect).length;
    const accuracy =
      totalAttempts === 0 ? 0 : Number(((correctAttempts / totalAttempts) * 100).toFixed(1));

    const recentSlice = sutraAttempts.slice(-this.RECENT_WINDOW_SIZE);
    const recentCorrect = recentSlice.filter((a) => a.isCorrect).length;
    const recentAccuracy =
      recentSlice.length === 0 ? 0 : Number(((recentCorrect / recentSlice.length) * 100).toFixed(1));

    const volumeRatio = Math.min(1, totalAttempts / this.MIN_PRACTICE_VOLUME);
    const masteryScore = totalAttempts === 0
      ? 0
      : Math.min(
          100,
          Math.round(volumeRatio * 35 + (accuracy / 100) * 40 + (recentAccuracy / 100) * 25),
        );

    let status: 'NOT_STARTED' | 'PRACTICING' | 'DEVELOPING' | 'MASTERED' | 'REVIEW_REQUIRED' =
      'NOT_STARTED';
    let isMastered = false;

    if (totalAttempts === 0) {
      status = 'NOT_STARTED';
    } else if (totalAttempts < 20) {
      status = 'PRACTICING';
    } else if (totalAttempts < this.MIN_PRACTICE_VOLUME) {
      status = 'DEVELOPING';
    } else {
      if (accuracy >= this.MIN_OVERALL_ACCURACY && recentAccuracy >= this.MIN_RECENT_ACCURACY) {
        status = 'MASTERED';
        isMastered = true;
      } else if (recentAccuracy < 50) {
        status = 'REVIEW_REQUIRED';
      } else {
        status = 'DEVELOPING';
      }
    }

    const tiers = new Set<string>();
    for (const a of sutraAttempts) {
      if (a.template?.difficulty) tiers.add(a.template.difficulty);
    }

    return {
      sutraId: sutra.id,
      sutraNumber: sutra.number,
      sutraName: sutra.name,
      sanskritName: sutra.name,
      englishMeaning: sutra.meaning,
      totalAttempts,
      correctAttempts,
      accuracy: totalAttempts === 0 ? null : accuracy,
      recentAccuracy: recentSlice.length === 0 ? null : recentAccuracy,
      masteryScore,
      status,
      isMastered,
      difficultyCoverage: Array.from(tiers),
      recommendedAction: isMastered
        ? 'Mastery verified! Maintain regular recall.'
        : 'Practice mixed difficulty problems with this Sutra.',
    };
  }

  /**
   * Recalculates and persists UserProgress mastery after an answer attempt.
   */
  async updateProgressAfterAttempt(userId: number, topicId: number): Promise<TopicMasteryDetails> {
    const details = await this.calculateTopicMastery(userId, topicId);

    await this.prisma.userProgress.upsert({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
      update: {
        mastery: details.masteryScore,
        completed: details.isMastered,
      },
      create: {
        userId,
        topicId,
        mastery: details.masteryScore,
        completed: details.isMastered,
      },
    });

    return details;
  }

  async getTopicMastery(userId: number, topicId: number): Promise<TopicMasteryDetails> {
    return this.calculateTopicMastery(userId, topicId);
  }

  async getAllTopicsMastery(userId: number): Promise<TopicMasteryDetails[]> {
    const topics = await this.prisma.topic.findMany({
      orderBy: { id: 'asc' },
    });
    return Promise.all(topics.map((t) => this.calculateTopicMastery(userId, t.id)));
  }

  async getSutraMastery(userId: number, sutraIdentifier: string): Promise<SutraMasteryDetails | null> {
    const sutra = await this.prisma.sutra.findFirst({
      where: {
        OR: [
          { id: sutraIdentifier },
          { name: { contains: sutraIdentifier, mode: 'insensitive' } },
        ],
      },
    });
    if (!sutra) return null;
    return this.calculateSutraMastery(userId, sutra.id);
  }

  async getAllSutrasMastery(userId: number): Promise<SutraMasteryDetails[]> {
    const sutras = await this.prisma.sutra.findMany({
      orderBy: { number: 'asc' },
    });
    return Promise.all(sutras.map((s) => this.calculateSutraMastery(userId, s.id)));
  }
}
