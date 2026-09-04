export interface NLPLinguistics {

  tokens: string[];

  correctedTokens: string[];

  filteredTokens: string[];

  bigrams: string[];

  trigrams: string[];

  wordCount: number;

  sentenceCount: number;

  containsQuestion: boolean;

  containsNumbers: boolean;

  containsMathExpression: boolean;

}