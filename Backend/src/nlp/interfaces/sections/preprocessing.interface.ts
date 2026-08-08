export interface NLPPreprocessing {

  cleanedText: string;

  normalizedText: string;

  corrections: {

    original: string;

    corrected: string;

    confidence: number;

  }[];

}