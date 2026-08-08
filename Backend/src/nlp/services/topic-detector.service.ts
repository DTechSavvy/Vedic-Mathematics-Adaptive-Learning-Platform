import { Injectable } from '@nestjs/common';

import { ProcessedText } from '../interfaces/processed-text.interface';
import { TopicResult } from '../interfaces/topic-result.interface';

import { TextMatcher } from '../utils/text-matcher';

import { TOPIC_ALIASES } from '../constants/topic-aliases';
import { VEDIC_TOPICS } from '../constants/vedic-topics';

@Injectable()
export class TopicDetectorService {

  detectTopic(processed: ProcessedText): TopicResult {

    // -------------------------
    // 1. Already normalized
    // -------------------------

    if (processed.normalizedTopics.length > 0) {

      return {

        topic: processed.normalizedTopics[0],

        confidence: 0.98,

        matchedAlias: processed.normalizedTopics[0],

      };

    }

    // -------------------------
    // 2. Alias Matching
    // -------------------------

    const completeText =
      processed.filteredTokens.join(' ');

    for (const [alias, canonical] of Object.entries(TOPIC_ALIASES)) {

      if (

       TextMatcher.matchesPhrase(

        completeText,

        alias,

       )
 
      ) {

        return {

          topic: canonical,

          confidence: 0.95,

          matchedAlias: alias,

        };

      }

    }

    // -------------------------
    // 3. Bigram Matching
    // -------------------------

    for (const bigram of processed.bigrams) {

      for (const [alias, canonical] of Object.entries(TOPIC_ALIASES)) {

        if (bigram === alias.toLowerCase()) {

          return {

            topic: canonical,

            confidence: 0.90,

            matchedAlias: alias,

          };

        }

      }

    }

    // -------------------------
    // 4. Trigram Matching
    // -------------------------

    for (const trigram of processed.trigrams) {

      for (const [alias, canonical] of Object.entries(TOPIC_ALIASES)) {

        if (trigram === alias.toLowerCase()) {

          return {

            topic: canonical,

            confidence: 0.92,

            matchedAlias: alias,

          };

        }

      }

    }

    // -------------------------
    // 5. Direct Topic Name Match
    // -------------------------

    for (const topic of VEDIC_TOPICS) {

      if (

       TextMatcher.matchesPhrase(

       completeText,

       topic,

       )

      ) {

        return {

          topic,

          confidence: 0.85,

          matchedAlias: topic,

        };

      }

    }

    return {

      topic: null,

      confidence: 0,

      matchedAlias: null,

    };

  }

}