import { Injectable } from '@nestjs/common';

import { ProcessedText } from '../interfaces/processed-text.interface';
import { TopicResult } from '../interfaces/topic-result.interface';
import { EntityResult } from '../interfaces/entity-result.interface';

import { DifficultyResult } from '../interfaces/difficulty-result.interface';
import { DifficultyBreakdown } from '../interfaces/difficulty-breakdown.interface';

import { DifficultyLevel } from '../enums/difficulty-level.enum';

@Injectable()
export class DifficultyAnalyzerService {

  //----------------------------------------------------
  // Word Complexity
  //----------------------------------------------------

  private scoreWordComplexity(
    processed: ProcessedText,
  ): number {

    let score = 0;

    if (processed.wordCount >= 10)
      score += 2;

    if (processed.wordCount >= 20)
      score += 2;

    if (processed.wordCount >= 30)
      score += 1;

    return score;

  }

  //----------------------------------------------------
  // Math Complexity
  //----------------------------------------------------

  private scoreMathComplexity(
    processed: ProcessedText,
  ): number {

    let score = 0;

    if (processed.containsMathExpression)
      score += 3;

    if (processed.containsNumbers)
      score += 1;

    return score;

  }

  //----------------------------------------------------
  // Topic Complexity
  //----------------------------------------------------

  private scoreTopicComplexity(

    topic: TopicResult,

    entity: EntityResult,

  ): number {

    let score = 0;

    if (topic.topic)
      score += 2;

    if (entity.concepts.length > 1)
      score += 2;

    if (entity.techniques.length > 1)
      score += 2;

    return score;

  }

  //----------------------------------------------------
  // Reasoning Complexity
  //----------------------------------------------------

  private scoreReasoningComplexity(
    processed: ProcessedText,
  ): number {

    let score = 0;

    const reasoningWords = [

      'compare',

      'derive',

      'analyse',

      'analyze',

      'evaluate',

      'justify',

      'prove',

      'verify',

      'why',

      'difference',

      'relationship',

      'explain',

    ];

    for (const word of reasoningWords) {

      if (

        processed.filteredTokens.includes(

          word,

        )

      ) {

        score += 1;

      }

    }

    return Math.min(score, 4);

  }

  //----------------------------------------------------
  // Expression Complexity
  //----------------------------------------------------

  private scoreExpressionComplexity(
    processed: ProcessedText,
  ): number {

    let score = 0;

    if (processed.sentenceCount > 1)
      score += 1;

    if (processed.bigrams.length > 5)
      score += 1;

    if (processed.trigrams.length > 3)
      score += 1;

    return score;

  }

  //----------------------------------------------------
  // Difficulty Level
  //----------------------------------------------------

  private determineDifficulty(
    total: number,
  ): DifficultyLevel {

    if (total <= 4)
      return DifficultyLevel.Easy;

    if (total <= 9)
      return DifficultyLevel.Medium;

    return DifficultyLevel.Hard;

  }

  //----------------------------------------------------
  // Confidence
  //----------------------------------------------------

  private confidence(
    total: number,
  ): number {

    return Number(

      Math.min(

        total / 15,

        1,

      ).toFixed(2),

    );

  }
    //----------------------------------------------------
  // Breakdown
  //----------------------------------------------------

  private buildBreakdown(

    wordComplexity: number,

    mathComplexity: number,

    topicComplexity: number,

    reasoningComplexity: number,

    expressionComplexity: number,

  ): DifficultyBreakdown {

    return {

      wordComplexity,

      mathComplexity,

      topicComplexity,

      reasoningComplexity,

      expressionComplexity,

      totalScore:

        wordComplexity +

        mathComplexity +

        topicComplexity +

        reasoningComplexity +

        expressionComplexity,

    };

  }

  //----------------------------------------------------
  // Reasoning Builder
  //----------------------------------------------------

  private buildReasoning(

    processed: ProcessedText,

    topic: TopicResult,

    entity: EntityResult,

    breakdown: DifficultyBreakdown,

  ): string[] {

    const reasoning: string[] = [];

    if (breakdown.wordComplexity > 0) {

      reasoning.push(

        `Query contains ${processed.wordCount} words.`,

      );

    }

    if (breakdown.mathComplexity > 0) {

      reasoning.push(

        'Mathematical expressions and numerical content detected.',

      );

    }

    if (topic.topic) {

      reasoning.push(

        `Topic "${topic.topic}" identified.`,

      );

    }

    if (entity.concepts.length > 1) {

      reasoning.push(

        'Multiple mathematical concepts detected.',

      );

    }

    if (entity.techniques.length > 1) {

      reasoning.push(

        'Multiple Vedic techniques detected.',

      );

    }

    if (breakdown.reasoningComplexity > 0) {

      reasoning.push(

        'Reasoning-oriented vocabulary detected.',

      );

    }

    if (breakdown.expressionComplexity > 0) {

      reasoning.push(

        'Complex sentence structure detected.',

      );

    }

    return reasoning;

  }

  //----------------------------------------------------
  // Public API
  //----------------------------------------------------

  analyze(

    processed: ProcessedText,

    topic: TopicResult,

    entity: EntityResult,

  ): DifficultyResult {

    const wordComplexity =

      this.scoreWordComplexity(

        processed,

      );

    const mathComplexity =

      this.scoreMathComplexity(

        processed,

      );

    const topicComplexity =

      this.scoreTopicComplexity(

        topic,

        entity,

      );

    const reasoningComplexity =

      this.scoreReasoningComplexity(

        processed,

      );

    const expressionComplexity =

      this.scoreExpressionComplexity(

        processed,

      );

    const breakdown =

      this.buildBreakdown(

        wordComplexity,

        mathComplexity,

        topicComplexity,

        reasoningComplexity,

        expressionComplexity,

      );

    return {

      difficulty:

        this.determineDifficulty(

          breakdown.totalScore,

        ),

      totalScore:

        breakdown.totalScore,

      confidence:

        this.confidence(

          breakdown.totalScore,

        ),

      breakdown,

      reasoning:

        this.buildReasoning(

          processed,

          topic,

          entity,

          breakdown,

        ),

    };

  }

}
