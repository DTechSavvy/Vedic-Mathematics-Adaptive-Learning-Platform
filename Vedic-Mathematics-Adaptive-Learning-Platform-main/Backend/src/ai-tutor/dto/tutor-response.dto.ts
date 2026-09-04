import { TutorIntent } from '../enums/tutor-intent.enum';
import { TutorMode } from '../enums/tutor-mode.enum';

export interface MathFeedback {
  expression?: string | null;
  studentAnswer?: string | null;
  correctAnswer?: string | null;
  isCorrect?: boolean | null;
}

export interface SourceReference {
  title: string;
  sutra?: string | null;
  technique?: string | null;
  source?: string | null;
}

export class StructuredTutorResponseDto {
  conversationId!: string;
  messageId!: string;
  intent!: TutorIntent;
  mode!: TutorMode;
  response!: string;
  math?: MathFeedback | null;
  sourceRefs!: SourceReference[];
  suggestedActions!: string[];
}
