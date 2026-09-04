import { DifficultyLevel } from '../enums/difficulty-level.enum';
import { DifficultyBreakdown } from './difficulty-breakdown.interface';

export interface DifficultyResult {
  difficulty: DifficultyLevel;

  totalScore: number;

  confidence: number;

  breakdown: DifficultyBreakdown;

  reasoning: string[];
}
