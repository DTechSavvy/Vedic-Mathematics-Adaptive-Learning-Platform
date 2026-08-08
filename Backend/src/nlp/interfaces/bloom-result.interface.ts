import { BloomLevel } from '../enums/bloom-level.enum';
import { BloomBreakdown } from './bloom-breakdown.interface';

export interface BloomResult {

  level: BloomLevel;

  confidence: number;

  breakdown: BloomBreakdown;

  matchedKeywords: string[];

  reasoning: string[];

}