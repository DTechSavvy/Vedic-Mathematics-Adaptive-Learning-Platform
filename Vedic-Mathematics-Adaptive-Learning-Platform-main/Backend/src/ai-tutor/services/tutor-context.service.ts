import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  LearningEntitySummary,
  RecentMistakeContext,
  TutorContext,
} from '../interfaces/tutor-context.interface';

@Injectable()
export class TutorContextService {
  private readonly logger = new Logger(TutorContextService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Build bounded, relevant learner context avoiding N+1 queries
   */
  async buildContext(
    userId: number,
    topicId?: number | null,
    moduleId?: number | null,
    courseId?: number | null,
    conversationSummary?: string | null,
  ): Promise<TutorContext> {
    try {
      // 1. Fetch user basic profile
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true },
      });

      // 2. Fetch target curriculum entities if specified
      let currentTopic: LearningEntitySummary | null = null;
      let currentModule: LearningEntitySummary | null = null;
      let currentCourse: LearningEntitySummary | null = null;

      if (topicId) {
        const topic = await this.prisma.topic.findUnique({
          where: { id: topicId },
          select: { id: true, title: true, moduleId: true },
        });
        if (topic) {
          currentTopic = { id: topic.id, title: topic.title };
          if (!moduleId) moduleId = topic.moduleId;
        }
      }

      if (moduleId) {
        const mod = await this.prisma.module.findUnique({
          where: { id: moduleId },
          select: { id: true, title: true, courseId: true },
        });
        if (mod) {
          currentModule = { id: mod.id, title: mod.title };
          if (!courseId) courseId = mod.courseId;
        }
      }

      if (courseId) {
        const course = await this.prisma.course.findUnique({
          where: { id: courseId },
          select: { id: true, title: true },
        });
        if (course) {
          currentCourse = { id: course.id, title: course.title };
        }
      }

      // 3. Fetch progress for mastery and weak/strong topics (1 query)
      const progress = await this.prisma.userProgress.findMany({
        where: { userId },
        select: {
          mastery: true,
          topic: { select: { title: true } },
        },
      });

      const mastery =
        progress.length === 0
          ? 0
          : Number(
              (
                progress.reduce((sum, p) => sum + p.mastery, 0) / progress.length
              ).toFixed(1),
            );

      const weakTopics = progress
        .filter((p) => p.mastery < 60)
        .map((p) => p.topic.title);

      const strongTopics = progress
        .filter((p) => p.mastery >= 80)
        .map((p) => p.topic.title);

      // 4. Fetch recent question attempts count & recent mistakes (bounded, 1 query)
      const attempts = await this.prisma.questionAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 15,
        select: {
          isCorrect: true,
          generatedQuestion: true,
          userAnswer: true,
          correctAnswer: true,
          template: {
            select: {
              topic: { select: { title: true } },
            },
          },
        },
      });

      const totalAttempts = attempts.length;
      const correctAttempts = attempts.filter((a) => a.isCorrect).length;
      const accuracy =
        totalAttempts === 0
          ? 0
          : Number(((correctAttempts / totalAttempts) * 100).toFixed(1));

      // Extract last 5 mistakes
      const recentMistakes: RecentMistakeContext[] = attempts
        .filter((a) => !a.isCorrect)
        .slice(0, 5)
        .map((a) => ({
          question: a.generatedQuestion,
          userAnswer: a.userAnswer,
          correctAnswer: a.correctAnswer,
          topicTitle: a.template?.topic?.title,
        }));

      return {
        userId,
        userName: user?.name || 'Student',
        currentCourse,
        currentModule,
        currentTopic,
        mastery,
        accuracy,
        weakTopics,
        strongTopics,
        recentMistakes,
        recentAttemptsCount: totalAttempts,
        conversationSummary,
      };
    } catch (err: any) {
      this.logger.error(`Error building tutor context for user ${userId}: ${err.message}`);
      // Return safe partial context on error so tutor pipeline doesn't break
      return {
        userId,
        userName: 'Student',
        mastery: 0,
        accuracy: 0,
        weakTopics: [],
        strongTopics: [],
        recentMistakes: [],
        recentAttemptsCount: 0,
        conversationSummary: null,
      };
    }
  }
}
