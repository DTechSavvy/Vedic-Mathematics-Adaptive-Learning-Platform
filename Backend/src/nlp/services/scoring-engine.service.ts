import { Injectable } from '@nestjs/common';

import { ConfidenceBreakdown } from '../interfaces/confidence-breakdown.interface';
import { ReasoningStep } from '../interfaces/reasoning-step.interface';

@Injectable()
export class ScoringEngineService {
  //----------------------------------------------------
  // Base Scores
  //----------------------------------------------------

  keyword(weight = 2): number {
    return weight;
  }

  synonym(weight = 2): number {
    return weight;
  }

  phrase(weight = 5): number {
    return weight;
  }

  actionVerb(weight = 3): number {
    return weight;
  }

  //======================================
  // Match Scores
  //======================================

  keywordScore(): number {
    return 2;
  }

  synonymScore(): number {
    return 3;
  }

  patternScore(): number {
    return 5;
  }

  actionVerbScore(): number {
    return 4;
  }

  //======================================
  // N-Gram Scores
  //======================================

  bigramScore(): number {
    return 4;
  }

  trigramScore(): number {
    return 6;
  }

  //======================================
  // Context Boosts
  //======================================

  topicBoostScore(): number {
    return 4;
  }

  emotionBoostScore(): number {
    return 3;
  }

  learningGoalBoostScore(): number {
    return 3;
  }

  entityBoostScore(): number {
    return 2;
  }

  positionBoostScore(): number {
    return 6;
  }

  //----------------------------------------------------
  // Context Scores
  //----------------------------------------------------

  topic(weight = 2): number {
    return weight;
  }

  emotion(weight = 2): number {
    return weight;
  }

  learningGoal(weight = 3): number {
    return weight;
  }

  entity(weight = 2): number {
    return weight;
  }

  bloom(weight = 3): number {
    return weight;
  }

  difficulty(weight = 2): number {
    return weight;
  }

  //----------------------------------------------------
  // Fuzzy Match
  //----------------------------------------------------

  fuzzy(confidence: number): number {
    if (confidence >= 0.98) return 5;

    if (confidence >= 0.95) return 4;

    if (confidence >= 0.9) return 3;

    if (confidence >= 0.8) return 2;

    if (confidence >= 0.7) return 1;

    return 0;
  }

  //----------------------------------------------------
  // Calculate Total
  //----------------------------------------------------

  calculateTotal(...scores: number[]): number {
    return scores.reduce((total, current) => total + current, 0);
  }

  //----------------------------------------------------
  // Normalize
  //----------------------------------------------------

  normalize(
    obtained: number,

    expected: number,
  ): number {
    if (expected <= 0) {
      return 0;
    }

    return Number(
      Math.min(
        obtained / expected,

        1,
      ).toFixed(2),
    );
  }

  //----------------------------------------------------
  // Confidence
  //----------------------------------------------------

  confidence(
    obtained: number,

    expected: number,
  ): number {
    return this.normalize(
      obtained,

      expected,
    );
  }

  //----------------------------------------------------
  // Reasoning Builder
  //----------------------------------------------------

  createReasoning(
    stage: string,

    message: string,

    contribution: number,
  ): ReasoningStep {
    return {
      stage,

      message,

      scoreContribution: contribution,
    };
  }

  //----------------------------------------------------
  // Build Breakdown
  //----------------------------------------------------

  buildBreakdown(
    keywordScore: number,

    synonymScore: number,

    patternScore: number,

    fuzzyScore: number,

    topicBoost: number,

    emotionBoost: number,

    learningGoalBoost: number,

    entityBoost: number,

    bloomBoost: number,

    difficultyBoost: number,
  ): ConfidenceBreakdown {
    const totalScore = this.calculateTotal(
      keywordScore,

      synonymScore,

      patternScore,

      fuzzyScore,

      topicBoost,

      emotionBoost,

      learningGoalBoost,

      entityBoost,

      bloomBoost,

      difficultyBoost,
    );

    const confidence = this.normalize(
      totalScore,

      35,
    );

    return {
      keywordScore,

      synonymScore,

      patternScore,

      fuzzyScore,

      topicBoost,

      emotionBoost,

      learningGoalBoost,

      entityBoost,

      bloomBoost,

      difficultyBoost,

      totalScore,

      confidence,
    };
  }

  //----------------------------------------------------
  // Aggregate Intent Scores
  //----------------------------------------------------

  aggregateIntentScore(
    keywordScore: number,

    synonymScore: number,

    patternScore: number,

    fuzzyScore: number,

    topicBoost: number,

    emotionBoost: number,

    learningGoalBoost: number,

    entityBoost: number,
  ): number {
    return this.calculateTotal(
      keywordScore,

      synonymScore,

      patternScore,

      fuzzyScore,

      topicBoost,

      emotionBoost,

      learningGoalBoost,

      entityBoost,
    );
  }

  //----------------------------------------------------
  // Aggregate Difficulty Score
  //----------------------------------------------------

  aggregateDifficultyScore(
    baseScore: number,

    topicBoost: number,

    entityBoost: number,
  ): number {
    return this.calculateTotal(
      baseScore,

      topicBoost,

      entityBoost,
    );
  }

  //----------------------------------------------------
  // Aggregate Bloom Score
  //----------------------------------------------------

  aggregateBloomScore(
    keywordScore: number,

    learningGoalBoost: number,

    actionVerbScore: number,
  ): number {
    return this.calculateTotal(
      keywordScore,

      learningGoalBoost,

      actionVerbScore,
    );
  }

  //----------------------------------------------------
  // Aggregate Misconception Score
  //----------------------------------------------------

  aggregateMisconceptionScore(
    keywordScore: number,

    fuzzyScore: number,

    entityBoost: number,
  ): number {
    return this.calculateTotal(
      keywordScore,

      fuzzyScore,

      entityBoost,
    );
  }

  //----------------------------------------------------
  // Aggregate Recommendation Score
  //----------------------------------------------------

  aggregateRecommendationScore(
    keywordScore: number,

    topicBoost: number,

    emotionBoost: number,
  ): number {
    return this.calculateTotal(
      keywordScore,

      topicBoost,

      emotionBoost,
    );
  }

  //----------------------------------------------------
  // Confidence From Breakdown
  //----------------------------------------------------

  confidenceFromBreakdown(breakdown: ConfidenceBreakdown): number {
    return breakdown.confidence;
  }

  //----------------------------------------------------
  // Merge Reasoning
  //----------------------------------------------------

  mergeReasoning(...steps: ReasoningStep[][]): ReasoningStep[] {
    return steps.flat();
  }
  //----------------------------------------------------
  // Rank Intent Scores
  //----------------------------------------------------

  rankIntentScores(scores: Map<any, number>) {
    const maxScore = Math.max(...scores.values(), 1);

    return [...scores.entries()]
      .map(([intent, score]) => ({
        intent,
        score,
        confidence: this.confidence(score, maxScore),
      }))
      .sort((a, b) => b.score - a.score);
  }

  //----------------------------------------------------
  // Primary Intent
  //----------------------------------------------------

  primaryIntent(
    ranking: {
      intent: any;
      score: number;
    }[],
    unknownIntent: any,
  ) {
    if (ranking.length === 0 || ranking[0].score <= 0) {
      return unknownIntent;
    }

    return ranking[0].intent;
  }

  //----------------------------------------------------
  // Secondary Intent
  //----------------------------------------------------

  secondaryIntent(
    ranking: {
      intent: any;
      score: number;
    }[],
  ) {
    if (ranking.length < 2 || ranking[1].score <= 0) {
      return null;
    }

    return ranking[1].intent;
  }

  //----------------------------------------------------
  // Merge Evidence
  //----------------------------------------------------

  mergeEvidence(...arrays: string[][]): string[] {
    return [...new Set(arrays.flat())];
  }

  //----------------------------------------------------
  // Empty Reasoning
  //----------------------------------------------------

  emptyReasoning() {
    return [] as ReasoningStep[];
  }

  //----------------------------------------------------
  // Safe Confidence
  //----------------------------------------------------

  safeConfidence(breakdown: ConfidenceBreakdown): number {
    return Number(Math.max(0, Math.min(1, breakdown.confidence)).toFixed(2));
  }

  //----------------------------------------------------
  // Final Intent Score
  //----------------------------------------------------

  finalizeIntentScore(score: number, max: number): number {
    return this.confidence(score, max);
  }

  //----------------------------------------------------
  // Empty Breakdown
  //----------------------------------------------------

  emptyBreakdown(): ConfidenceBreakdown {
    return {
      keywordScore: 0,

      synonymScore: 0,

      patternScore: 0,

      fuzzyScore: 0,

      topicBoost: 0,

      emotionBoost: 0,

      learningGoalBoost: 0,

      entityBoost: 0,

      bloomBoost: 0,

      difficultyBoost: 0,

      totalScore: 0,

      confidence: 0,
    };
  }
}
