import { IntentType } from '../enums/intent-type.enum';

export const INTENT_PRIORITY: Record<IntentType, number> = {
  [IntentType.ExplainTopic]: 100,

  [IntentType.AskDoubt]: 95,

  [IntentType.NeedPractice]: 90,

  [IntentType.Recommendation]: 80,

  [IntentType.StudyPlan]: 75,

  [IntentType.Motivation]: 70,

  [IntentType.Greeting]: 20,

  [IntentType.Unknown]: 0,
};
