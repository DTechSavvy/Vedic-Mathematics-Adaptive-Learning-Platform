import { Injectable } from '@nestjs/common';

import { ProcessedText } from '../interfaces/processed-text.interface';
import { BloomResult } from '../interfaces/bloom-result.interface';
import { BloomBreakdown } from '../interfaces/bloom-breakdown.interface';

import { BloomLevel } from '../enums/bloom-level.enum';

import { BLOOM_KEYWORDS } from '../constants/bloom-keywords';

@Injectable()
export class BloomTaxonomyService {
  //----------------------------------------------------
  // Count keyword matches
  //----------------------------------------------------

  private countMatches(
    processed: ProcessedText,

    keywords: string[],
  ): number {
    let score = 0;

    for (const keyword of keywords) {
      if (processed.filteredTokens.includes(keyword)) {
        score++;
      }
    }

    return score;
  }

  //----------------------------------------------------
  // Breakdown
  //----------------------------------------------------

  private buildBreakdown(processed: ProcessedText): BloomBreakdown {
    return {
      rememberScore: this.countMatches(
        processed,
        BLOOM_KEYWORDS[BloomLevel.Remember],
      ),

      understandScore: this.countMatches(
        processed,
        BLOOM_KEYWORDS[BloomLevel.Understand],
      ),

      applyScore: this.countMatches(
        processed,
        BLOOM_KEYWORDS[BloomLevel.Apply],
      ),

      analyzeScore: this.countMatches(
        processed,
        BLOOM_KEYWORDS[BloomLevel.Analyze],
      ),

      evaluateScore: this.countMatches(
        processed,
        BLOOM_KEYWORDS[BloomLevel.Evaluate],
      ),

      createScore: this.countMatches(
        processed,
        BLOOM_KEYWORDS[BloomLevel.Create],
      ),
    };
  }

  //----------------------------------------------------
  // Highest Bloom Level
  //----------------------------------------------------

  private determineLevel(breakdown: BloomBreakdown): BloomLevel {
    const scores = [
      {
        level: BloomLevel.Remember,
        score: breakdown.rememberScore,
      },

      {
        level: BloomLevel.Understand,
        score: breakdown.understandScore,
      },

      {
        level: BloomLevel.Apply,
        score: breakdown.applyScore,
      },

      {
        level: BloomLevel.Analyze,
        score: breakdown.analyzeScore,
      },

      {
        level: BloomLevel.Evaluate,
        score: breakdown.evaluateScore,
      },

      {
        level: BloomLevel.Create,
        score: breakdown.createScore,
      },
    ];

    scores.sort((a, b) => b.score - a.score);

    if (scores[0].score === 0) {
      return BloomLevel.Unknown;
    }

    return scores[0].level;
  }

  //----------------------------------------------------
  // Confidence
  //----------------------------------------------------

  private confidence(breakdown: BloomBreakdown): number {
    const total =
      breakdown.rememberScore +
      breakdown.understandScore +
      breakdown.applyScore +
      breakdown.analyzeScore +
      breakdown.evaluateScore +
      breakdown.createScore;

    if (total === 0) {
      return 0;
    }

    return Number(Math.min(total / 6, 1).toFixed(2));
  }
  //----------------------------------------------------
  // Matched Keywords
  //----------------------------------------------------

  private matchedKeywords(processed: ProcessedText): string[] {
    const matched: string[] = [];

    for (const keywords of Object.values(BLOOM_KEYWORDS)) {
      for (const keyword of keywords) {
        if (processed.filteredTokens.includes(keyword)) {
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
    level: BloomLevel,

    matchedKeywords: string[],
  ): string[] {
    const reasoning: string[] = [];

    reasoning.push(`Bloom level classified as "${level}".`);

    if (matchedKeywords.length > 0) {
      reasoning.push(
        `Matched ${matchedKeywords.length} Bloom taxonomy keywords.`,
      );
    }

    return reasoning;
  }

  //----------------------------------------------------
  // Public API
  //----------------------------------------------------

  classify(processed: ProcessedText): BloomResult {
    const breakdown = this.buildBreakdown(processed);

    const level = this.determineLevel(breakdown);

    const matchedKeywords = this.matchedKeywords(processed);

    return {
      level,

      confidence: this.confidence(breakdown),

      breakdown,

      matchedKeywords,

      reasoning: this.buildReasoning(
        level,

        matchedKeywords,
      ),
    };
  }
}
