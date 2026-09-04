import { IntentClassificationResult } from '../intent-classification-result.interface';
import { TopicResult } from '../topic-result.interface';
import { EmotionResult } from '../emotion-result.interface';
import { LearningGoalResult } from '../learning-goal-result.interface';
import { EntityResult } from '../entity-result.interface';

export interface NLPSemantics {
  intent: IntentClassificationResult;

  topic: TopicResult;

  emotion: EmotionResult;

  learningGoal: LearningGoalResult;

  entities: EntityResult;
}
