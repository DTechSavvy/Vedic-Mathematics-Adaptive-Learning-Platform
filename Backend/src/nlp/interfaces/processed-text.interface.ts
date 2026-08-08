export interface ProcessedText {

  originalText: string;

  cleanedText: string;

  normalizedText: string;

  tokens: string[];

  correctedTokens: string[];

  filteredTokens: string[];

  normalizedTopics: string[];

  wordCount: number;

  sentenceCount: number;

  containsQuestion: boolean;

  containsNumbers: boolean;

  containsMathExpression: boolean;

  bigrams: string[];

  trigrams: string[];

  corrections: {
    original: string;
    corrected: string;
    confidence: number;
  }[];
}