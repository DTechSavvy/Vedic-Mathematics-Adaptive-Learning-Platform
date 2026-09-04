import { LearningGoal } from '../enums/learning-goal.enum';

export interface LearningGoalResult {
  goal: LearningGoal;

  confidence: number;

  evidence: string[];
}
