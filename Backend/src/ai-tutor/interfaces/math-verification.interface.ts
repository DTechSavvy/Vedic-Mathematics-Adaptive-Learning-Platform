export interface MathVerificationResult {
  expression: string;
  parsedResult: number | null;
  studentAnswer?: string | null;
  isCorrect?: boolean | null;
  difference?: number | null;
  success: boolean;
  error?: string | null;
}
