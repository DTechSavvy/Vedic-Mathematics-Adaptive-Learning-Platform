import { TutorIntent } from '../enums/tutor-intent.enum';
import { TutorMode } from '../enums/tutor-mode.enum';

export interface TutorNlpResult {
  rawText: string;
  intent: TutorIntent;
  confidence: number;
  detectedTopic?: string | null;
  technique?: string | null;
  sutra?: string | null;
  mathExpression?: string | null;
  studentAnswer?: string | null;
  studentDifficulty: boolean;
  recommendedMode: TutorMode;
  entities: string[];
}
