import { IntentType } from '../enums/intent-type.enum';

export interface IntentScore {

  intent: IntentType;

  score: number;

  confidence: number;

  reasoning?: string[];

}