export interface StudentProfile {
  userId: number;
  mastery: number;
  accuracy: number;
  averageTime: number;
  weakTopics: string[];
  strongTopics: string[];
  recentMistakes: string[];
  mistakeAnalysis: string[];
}
