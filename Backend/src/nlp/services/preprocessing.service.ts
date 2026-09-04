import { Injectable } from '@nestjs/common';
import { ProcessedText } from '../interfaces/processed-text.interface';
import { SPELL_CORRECTIONS } from '../constants/spell-corrections';
import { TOPIC_ALIASES } from '../constants/topic-aliases';
import { STOP_WORDS } from '../constants/stop-words';
import { FuzzyMatcherService } from './fuzzy-matcher.service';
import { ENGLISH_VOCABULARY } from '../constants/vocabulary/english-vocabulary';
import { MATH_VOCABULARY } from '../constants/vocabulary/math-vocabulary';
import { EDUCATIONAL_VOCABULARY } from '../constants/vocabulary/educational-vocabulary';
import { VEDIC_TOPICS } from '../constants/vedic-topics';

@Injectable()
export class PreprocessingService {
  constructor(private readonly fuzzyMatcherService: FuzzyMatcherService) {}

  preprocess(text: string): ProcessedText {
    const originalText = text;

    // ----------------------------
    // Normalize unicode
    // ----------------------------

    let normalizedText = text.normalize('NFKC');

    // ----------------------------
    // Convert to lowercase
    // ----------------------------

    normalizedText = normalizedText.toLowerCase();

    // ----------------------------
    // Expand abbreviations
    // ----------------------------

    const abbreviationMap: Record<string, string> = {
      u: 'you',

      ur: 'your',

      pls: 'please',

      plz: 'please',

      thx: 'thanks',

      btw: 'by the way',

      asap: 'as soon as possible',

      cant: 'cannot',

      dont: 'do not',

      im: 'i am',
    };

    for (const [abbr, full] of Object.entries(abbreviationMap)) {
      const regex = new RegExp(`\\b${abbr}\\b`, 'g');

      normalizedText = normalizedText.replace(regex, full);
    }

    // ----------------------------
    // Normalize mathematical symbols
    // ----------------------------

    normalizedText = normalizedText
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/√/g, 'sqrt');

    // ----------------------------
    // Detect question
    // ----------------------------

    const containsQuestion =
      /\?/.test(originalText) ||
      normalizedText.startsWith('why') ||
      normalizedText.startsWith('how') ||
      normalizedText.startsWith('what') ||
      normalizedText.startsWith('when') ||
      normalizedText.startsWith('where') ||
      normalizedText.startsWith('can') ||
      normalizedText.startsWith('could');

    // ----------------------------
    // Remove punctuation
    // ----------------------------

    let cleanedText = normalizedText.replace(/[^\w\s*/-]/g, ' ');

    // ----------------------------
    // Remove extra spaces
    // ----------------------------

    cleanedText = cleanedText.replace(/\s+/g, ' ').trim();

    // ----------------------------
    // Tokenization
    // ----------------------------

    const tokens = cleanedText.split(' ').filter((token) => token.length > 0);

    const dictionary = [
      ...new Set([
        ...Object.keys(SPELL_CORRECTIONS),

        ...Object.values(SPELL_CORRECTIONS),

        ...ENGLISH_VOCABULARY,

        ...MATH_VOCABULARY,

        ...EDUCATIONAL_VOCABULARY,

        ...VEDIC_TOPICS,
      ]),
    ];

    const corrections: {
      original: string;
      corrected: string;
      confidence: number;
    }[] = [];

    const correctedTokens = tokens.map((token) => {
      if (SPELL_CORRECTIONS[token]) {
        corrections.push({
          original: token,
          corrected: SPELL_CORRECTIONS[token],
          confidence: 1,
        });

        return SPELL_CORRECTIONS[token];
      }

      const match = this.fuzzyMatcherService.findBestMatch(token, dictionary);

      if (match.confidence >= 0.8 && match.corrected !== token) {
        corrections.push({
          original: token,
          corrected: match.corrected,
          confidence: match.confidence,
        });

        return match.corrected;
      }

      return token;
    });

    // --------------------------------
    // Stop Word Removal
    // --------------------------------

    const filteredTokens = correctedTokens.filter(
      (token) => !STOP_WORDS.includes(token),
    );

    // ----------------------------
    // Generate Bigrams
    // ----------------------------

    const bigrams: string[] = [];

    for (let i = 0; i < filteredTokens.length - 1; i++) {
      bigrams.push(`${filteredTokens[i]} ${filteredTokens[i + 1]}`);
    }

    // ----------------------------
    // Generate Trigrams
    // ----------------------------

    const trigrams: string[] = [];

    for (let i = 0; i < filteredTokens.length - 2; i++) {
      trigrams.push(
        `${filteredTokens[i]} ${filteredTokens[i + 1]} ${filteredTokens[i + 2]}`,
      );
    }

    // --------------------------------
    // Topic Alias Detection
    // --------------------------------

    const normalizedTopics: string[] = [];

    const cleanedSentence = correctedTokens.join(' ');

    for (const [alias, canonical] of Object.entries(TOPIC_ALIASES)) {
      if (cleanedSentence.includes(alias)) {
        normalizedTopics.push(canonical);
      }
    }

    // ----------------------------
    // Statistics
    // ----------------------------

    const wordCount = tokens.length;

    const sentenceCount = originalText
      .split(/[.!?]+/)
      .filter((sentence) => sentence.trim().length > 0).length;

    const containsNumbers = /\d/.test(cleanedText);

    const containsMathExpression = /[\d+\-*/=]/.test(cleanedText);

    return {
      originalText,

      cleanedText,

      normalizedText,

      tokens,

      correctedTokens,

      corrections,

      filteredTokens,

      normalizedTopics,

      bigrams,

      trigrams,

      wordCount,

      sentenceCount,

      containsQuestion,

      containsNumbers,

      containsMathExpression,
    };
  }
}
