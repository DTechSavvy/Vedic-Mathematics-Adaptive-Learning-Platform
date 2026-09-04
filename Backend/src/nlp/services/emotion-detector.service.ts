import { Injectable } from '@nestjs/common';

import { ProcessedText } from '../interfaces/processed-text.interface';
import { EmotionResult } from '../interfaces/emotion-result.interface';

import { EmotionType } from '../enums/emotion-type.enum';

import { TextMatcher } from '../utils/text-matcher';

import { EMOTION_KEYWORDS } from '../constants/emotion/emotion-keywords';
import { EMOTION_PATTERNS } from '../constants/emotion/emotion-patterns';

@Injectable()
export class EmotionDetectorService {
  detectEmotion(processed: ProcessedText): EmotionResult {
    const scores = new Map<EmotionType, number>();

    const evidence = new Map<EmotionType, string[]>();

    Object.values(EmotionType).forEach((emotion) => {
      scores.set(emotion, 0);

      evidence.set(emotion, []);
    });

    //--------------------
    // Token Matching
    //--------------------

    for (const emotion of Object.values(EmotionType)) {
      const keywords = EMOTION_KEYWORDS[emotion] || [];

      for (const token of processed.filteredTokens) {
        if (keywords.includes(token)) {
          scores.set(
            emotion,

            scores.get(emotion)! + 2,
          );

          evidence.get(emotion)!.push(token);
        }
      }
    }

    //--------------------
    // Pattern Matching
    //--------------------

    const normalizedText = processed.normalizedText;

    for (const emotion of Object.values(EmotionType)) {
      const patterns = EMOTION_PATTERNS[emotion] || [];

      for (const pattern of patterns) {
        if (TextMatcher.matchesPhrase(normalizedText, pattern)) {
          scores.set(
            emotion,

            scores.get(emotion)! + 8,
          );

          evidence.get(emotion)!.push(pattern);
        }
      }
    }

    //--------------------
    // Bigram Matching
    //--------------------

    for (const emotion of Object.values(EmotionType)) {
      const keywords = EMOTION_KEYWORDS[emotion] || [];

      for (const bigram of processed.bigrams) {
        if (keywords.includes(bigram)) {
          scores.set(
            emotion,

            scores.get(emotion)! + 4,
          );

          evidence.get(emotion)!.push(bigram);
        }
      }
    }

    //--------------------
    // Trigram Matching
    //--------------------

    for (const emotion of Object.values(EmotionType)) {
      const keywords = EMOTION_KEYWORDS[emotion] || [];

      for (const trigram of processed.trigrams) {
        if (keywords.includes(trigram)) {
          scores.set(
            emotion,

            scores.get(emotion)! + 6,
          );

          evidence.get(emotion)!.push(trigram);
        }
      }
    }

    //--------------------
    // Question Bonus
    //--------------------

    if (processed.containsQuestion) {
      scores.set(
        EmotionType.Curious,

        scores.get(EmotionType.Curious)! + 2,
      );
    }

    //--------------------
    // Best Emotion
    //--------------------

    let bestEmotion = EmotionType.Neutral;

    let highestScore = 0;

    for (const [emotion, score] of scores.entries()) {
      if (score > highestScore) {
        highestScore = score;

        bestEmotion = emotion;
      }
    }

    return {
      emotion: bestEmotion,

      confidence: Number(
        Math.min(
          highestScore / 10,

          1,
        ).toFixed(2),
      ),

      evidence: evidence.get(bestEmotion)!,
    };
  }
}
