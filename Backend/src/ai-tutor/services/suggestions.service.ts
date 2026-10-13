import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MasteryService } from '../../progress/mastery.service';

export type SuggestionType =
  | 'CONTINUE_TOPIC'
  | 'REVIEW_MISTAKE'
  | 'PRACTICE_WEAK_TOPIC'
  | 'COMPLETE_LESSON'
  | 'REVISE_SUTRA'
  | 'TRY_NEXT_DIFFICULTY'
  | 'ASK_FOLLOWUP'
  | 'RESUME_CONVERSATION';

export interface SmartSuggestion {
  type: SuggestionType;
  title: string;
  description: string;
  action: 'ASK_TUTOR' | 'OPEN_TOPIC' | 'PRACTICE_TOPIC';
  prompt: string;
  topicId?: number;
  sutraId?: string;
  priority: number;
}

@Injectable()
export class SuggestionsService {
  private readonly logger = new Logger(SuggestionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly masteryService: MasteryService,
  ) {}

  /**
   * Generates deterministic, pedagogically-grounded conversation suggestions
   * derived from authoritative student learning state, attempts, and recent chat history.
   */
  async generateSuggestions(userId: number): Promise<SmartSuggestion[]> {
    const suggestions: SmartSuggestion[] = [];

    const [recentAttempts, recentConversations, allMasteries, incompleteLessons] =
      await Promise.all([
        this.prisma.questionAttempt.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { template: { include: { topic: true } } },
        }),
        this.prisma.tutorConversation.findMany({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
          take: 3,
        }),
        this.masteryService.getAllTopicsMastery(userId),
        this.prisma.lessonProgress.findMany({
          where: { userId, status: { in: ['OPENED', 'IN_PROGRESS'] } },
          include: { lesson: { include: { topic: true } } },
          take: 2,
        }),
      ]);

    // 1. Check for recent calculation mistakes
    const recentWrong = recentAttempts.filter((a) => !a.isCorrect);
    if (recentWrong.length > 0) {
      const wrongAttempt = recentWrong[0];
      const topicName = wrongAttempt.template?.topic?.title || 'mental arithmetic';
      const questionText = wrongAttempt.generatedQuestion;

      suggestions.push({
        type: 'REVIEW_MISTAKE',
        title: `Analyze recent mistake in ${topicName}`,
        description: `You recently missed question: "${questionText}". Review the Vedic diagnostic steps.`,
        action: 'ASK_TUTOR',
        prompt: `Can you explain where I went wrong on this problem: "${questionText}"? My answer was "${wrongAttempt.userAnswer}", but the correct answer is "${wrongAttempt.correctAnswer}".`,
        topicId: wrongAttempt.template?.topicId,
        priority: 0.95,
      });
    }

    // 2. Check for incomplete lessons
    if (incompleteLessons.length > 0) {
      const inc = incompleteLessons[0];
      suggestions.push({
        type: 'COMPLETE_LESSON',
        title: `Continue Lesson: ${inc.lesson.title}`,
        description: `You started "${inc.lesson.title}". Ask your tutor for key intuitions before finishing.`,
        action: 'ASK_TUTOR',
        prompt: `I'm studying the lesson on "${inc.lesson.title}" under ${inc.lesson.topic?.title}. What is the core Vedic shortcut principle for this technique?`,
        topicId: inc.lesson.topicId,
        priority: 0.9,
      });
    }

    // 3. Continue recently discussed topic from previous conversations
    if (recentConversations.length > 0 && recentConversations[0].topicId) {
      const lastConvTopicId = recentConversations[0].topicId;
      const topic = allMasteries.find((t) => t.topicId === lastConvTopicId);
      if (topic) {
        suggestions.push({
          type: 'CONTINUE_TOPIC',
          title: `Continue ${topic.topicTitle}`,
          description: `Pick up where you left off in ${topic.topicTitle}.`,
          action: 'ASK_TUTOR',
          prompt: `Can you give me a practical mental math challenge for ${topic.topicTitle} to test my understanding?`,
          topicId: topic.topicId,
          priority: 0.85,
        });
      }
    }

    // 4. Weakest topic recommendation (lowest mastery among started topics, or first unstarted)
    const startedTopics = allMasteries.filter((t) => t.totalAttempts > 0);
    if (startedTopics.length > 0) {
      const weakest = [...startedTopics].sort((a, b) => a.masteryScore - b.masteryScore)[0];
      if (weakest.masteryScore < 75) {
        suggestions.push({
          type: 'PRACTICE_WEAK_TOPIC',
          title: `Strengthen ${weakest.topicTitle} (${weakest.masteryScore}%)`,
          description: `Your mastery is ${weakest.masteryScore}%. Refine your accuracy with guided Vedic steps.`,
          action: 'ASK_TUTOR',
          prompt: `I want to improve my speed and accuracy on ${weakest.topicTitle}. What common pitfalls should I avoid?`,
          topicId: weakest.topicId,
          priority: 0.8,
        });
      }
    } else if (allMasteries.length > 0) {
      // Untouched scholar: recommend the first foundational topic
      const firstTopic = allMasteries[0];
      suggestions.push({
        type: 'CONTINUE_TOPIC',
        title: `Explore ${firstTopic.topicTitle}`,
        description: 'Begin your journey with foundational Vedic mental calculations.',
        action: 'ASK_TUTOR',
        prompt: `How does ${firstTopic.topicTitle} differ from conventional school arithmetic? Show me an example!`,
        topicId: firstTopic.topicId,
        priority: 0.88,
      });
    }

    // 5. Canonical Sutra Exploration
    const randomSutras = [
      { id: 'sutra-01', name: 'Ekadhikena Purvena', prompt: 'Explain the Ekadhikena Purvena sutra with an example like 35 squared.' },
      { id: 'sutra-02', name: 'Nikhilam Navatashcaramam Dashatah', prompt: 'How does Nikhilam multiplication work for numbers near 100 like 98 × 97?' },
      { id: 'sutra-03', name: 'Urdhva Tiryagbhyam', prompt: 'Teach me the vertically and crosswise method for 2-digit multiplication.' },
    ];
    const pickedSutra = randomSutras[Math.floor(Math.random() * randomSutras.length)];
    suggestions.push({
      type: 'REVISE_SUTRA',
      title: `Revise ${pickedSutra.name}`,
      description: 'Explore the Sanskrit formulation and rapid algorithmic application.',
      action: 'ASK_TUTOR',
      prompt: pickedSutra.prompt,
      sutraId: pickedSutra.id,
      priority: 0.7,
    });

    // Sort by priority descending
    return suggestions.sort((a, b) => b.priority - a.priority).slice(0, 4);
  }
}
