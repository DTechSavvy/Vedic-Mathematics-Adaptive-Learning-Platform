export interface ConfidenceBreakdown {

  keywordScore: number;

  synonymScore: number;

  patternScore: number;

  fuzzyScore: number;

  topicBoost: number;

  emotionBoost: number;

  learningGoalBoost: number;

  entityBoost: number;

  bloomBoost: number;

  difficultyBoost: number;

  totalScore: number;

  confidence: number;

}