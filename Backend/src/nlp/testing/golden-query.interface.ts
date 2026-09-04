import { IntentType } from '../enums/intent-type.enum';
import { EmotionType } from '../enums/emotion-type.enum';
import { LearningGoal } from '../enums/learning-goal.enum';
import { BloomLevel } from '../enums/bloom-level.enum';
import { DifficultyLevel } from '../enums/difficulty-level.enum';
import { MisconceptionType } from '../enums/misconception-type.enum';

export interface GoldenQuery {
  input: string;

  intent: IntentType;

  topic: string | null;

  emotion: EmotionType;

  goal: LearningGoal;

  bloom: BloomLevel;

  difficulty: DifficultyLevel;

  misconception: MisconceptionType;
}
