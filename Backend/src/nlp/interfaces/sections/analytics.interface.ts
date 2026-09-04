import { ConfidenceBreakdown } from '../confidence-breakdown.interface';

export interface NLPAnalytics {
  overallConfidence: number;

  confidence: {
    intent: number;

    topic: number;

    emotion: number;

    learningGoal: number;

    difficulty: number;

    bloom: number;

    misconception: number;
  };

  scoreBreakdown?: ConfidenceBreakdown;
}
