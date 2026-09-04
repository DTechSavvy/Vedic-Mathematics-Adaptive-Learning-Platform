import { IntentType } from '../enums/intent-type.enum';

import { IntentScore } from './intent-score.interface';

import { ConfidenceBreakdown } from './confidence-breakdown.interface';

import { ReasoningStep } from './reasoning-step.interface';

export interface IntentClassificationResult {
  primaryIntent: IntentType;

  secondaryIntent: IntentType | null;

  rankedIntents: IntentScore[];

  matchedKeywords: string[];

  matchedSynonyms: string[];

  matchedPatterns: string[];

  matchedActionVerbs: string[];

  confidence: number;

  confidenceBreakdown: ConfidenceBreakdown;

  reasoning: ReasoningStep[];
}
