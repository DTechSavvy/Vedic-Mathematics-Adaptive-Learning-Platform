import { MisconceptionType } from '../enums/misconception-type.enum';
import { MisconceptionBreakdown } from './misconception-breakdown.interface';

export interface MisconceptionResult {
  type: MisconceptionType;

  confidence: number;

  breakdown: MisconceptionBreakdown;

  matchedKeywords: string[];

  reasoning: string[];
}
