import { Injectable } from '@nestjs/common';

import { ProcessedText } from '../interfaces/processed-text.interface';

import { MisconceptionResult } from '../interfaces/misconception-result.interface';
import { MisconceptionBreakdown } from '../interfaces/misconception-breakdown.interface';

import { TextMatcher } from '../utils/text-matcher';

import { MisconceptionType } from '../enums/misconception-type.enum';

import { MISCONCEPTION_KEYWORDS } from '../constants/misconception-keywords';

@Injectable()
export class MisconceptionDetectorService {

  //----------------------------------------------------
  // Count Matches
  //----------------------------------------------------

  private countMatches(

    processed: ProcessedText,

    keywords: string[],

  ): number {

    let score = 0;

    const text =
      processed.cleanedText.toLowerCase();

    for (const keyword of keywords) {

      if (

       TextMatcher.matchesPhrase(

        text,

       keyword,

       )

      ) {

    score++;

}
    }

    return score;

  }

  //----------------------------------------------------
  // Breakdown
  //----------------------------------------------------

  private buildBreakdown(
    processed: ProcessedText,
  ): MisconceptionBreakdown {

    return {

      conceptGapScore:

        this.countMatches(

          processed,

          MISCONCEPTION_KEYWORDS[
            MisconceptionType.ConceptGap
          ],

        ),

      conceptConfusionScore:

        this.countMatches(

          processed,

          MISCONCEPTION_KEYWORDS[
            MisconceptionType.ConceptConfusion
          ],

        ),

      procedureErrorScore:

        this.countMatches(

          processed,

          MISCONCEPTION_KEYWORDS[
            MisconceptionType.ProcedureError
          ],

        ),

      calculationErrorScore:

        this.countMatches(

          processed,

          MISCONCEPTION_KEYWORDS[
            MisconceptionType.CalculationError
          ],

        ),

      repeatedMistakeScore:

        this.countMatches(

          processed,

          MISCONCEPTION_KEYWORDS[
            MisconceptionType.RepeatedMistake
          ],

        ),

    };

  }

  //----------------------------------------------------
  // Determine Type
  //----------------------------------------------------

  private determineType(

    breakdown: MisconceptionBreakdown,

  ): MisconceptionType {

    const scores = [

      {

        type: MisconceptionType.ConceptGap,

        score: breakdown.conceptGapScore,

      },

      {

        type: MisconceptionType.ConceptConfusion,

        score: breakdown.conceptConfusionScore,

      },

      {

        type: MisconceptionType.ProcedureError,

        score: breakdown.procedureErrorScore,

      },

      {

        type: MisconceptionType.CalculationError,

        score: breakdown.calculationErrorScore,

      },

      {

        type: MisconceptionType.RepeatedMistake,

        score: breakdown.repeatedMistakeScore,

      },

    ];

    scores.sort(

      (a, b) => b.score - a.score,

    );

    if (scores[0].score === 0) {

      return MisconceptionType.None;

    }

    return scores[0].type;

  }

  //----------------------------------------------------
  // Confidence
  //----------------------------------------------------

  private confidence(

    breakdown: MisconceptionBreakdown,

  ): number {

    const total =

      breakdown.conceptGapScore +

      breakdown.conceptConfusionScore +

      breakdown.procedureErrorScore +

      breakdown.calculationErrorScore +

      breakdown.repeatedMistakeScore;

    if (total === 0) {

      return 0;

    }

    return Number(

      Math.min(

        total / 5,

        1,

      ).toFixed(2),

    );

  }
    //----------------------------------------------------
  // Matched Keywords
  //----------------------------------------------------

  private matchedKeywords(
    processed: ProcessedText,
  ): string[] {

    const matched: string[] = [];

    const text =
      processed.cleanedText.toLowerCase();

    for (const keywords of Object.values(
      MISCONCEPTION_KEYWORDS,
    )) {

      for (const keyword of keywords) {

        if (

        TextMatcher.matchesPhrase(

         text,

         keyword,

        )

      ) {

  matched.push(keyword);

}

      }

    }

    return [...new Set(matched)];

  }

  //----------------------------------------------------
  // Build Reasoning
  //----------------------------------------------------

  private buildReasoning(

    type: MisconceptionType,

    matchedKeywords: string[],

  ): string[] {

    const reasoning: string[] = [];

    if (type === MisconceptionType.None) {

      reasoning.push(
        'No misconception indicators detected.',
      );

      return reasoning;

    }

    reasoning.push(
      `Detected misconception type "${type}".`,
    );

    if (matchedKeywords.length > 0) {

      reasoning.push(
        `Matched ${matchedKeywords.length} misconception keywords.`,
      );

    }

    return reasoning;

  }

  //----------------------------------------------------
  // Public API
  //----------------------------------------------------

  detect(
    processed: ProcessedText,
  ): MisconceptionResult {

    const breakdown =
      this.buildBreakdown(
        processed,
      );

    const type =
      this.determineType(
        breakdown,
      );

    const matchedKeywords =
      this.matchedKeywords(
        processed,
      );

    return {

      type,

      confidence:
        this.confidence(
          breakdown,
        ),

      breakdown,

      matchedKeywords,

      reasoning:
        this.buildReasoning(

          type,

          matchedKeywords,

        ),

    };

  }

}
