import { EmotionType } from '../enums/emotion-type.enum';

export interface EmotionResult {

  emotion: EmotionType;

  confidence: number;

  evidence: string[];

}