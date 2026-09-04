export interface RecentMistakeContext {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  topicTitle?: string;
}

export interface LearningEntitySummary {
  id: number;
  title: string;
}

export interface TutorContext {
  userId: number;
  userName?: string;
  currentCourse?: LearningEntitySummary | null;
  currentModule?: LearningEntitySummary | null;
  currentTopic?: LearningEntitySummary | null;
  mastery: number;
  accuracy: number;
  weakTopics: string[];
  strongTopics: string[];
  recentMistakes: RecentMistakeContext[];
  recentAttemptsCount: number;
  conversationSummary?: string | null;
}
