import { Injectable } from '@nestjs/common';

import { IntentType } from '../enums/intent-type.enum';

import { ProcessedText } from '../interfaces/processed-text.interface';
import { TopicResult } from '../interfaces/topic-result.interface';
import { EmotionResult } from '../interfaces/emotion-result.interface';
import { LearningGoalResult } from '../interfaces/learning-goal-result.interface';
import { EntityResult } from '../interfaces/entity-result.interface';

import { TextMatcher } from '../utils/text-matcher';

import { IntentClassificationResult } from '../interfaces/intent-classification-result.interface';
import { IntentScore } from '../interfaces/intent-score.interface';
import { ConfidenceBreakdown } from '../interfaces/confidence-breakdown.interface';
import { ReasoningStep } from '../interfaces/reasoning-step.interface';

import { ScoringEngineService } from './scoring-engine.service';
import { LearningGoal } from '../enums/learning-goal.enum';
import { INTENT_KEYWORDS } from '../constants/intent-keywords';
import { INTENT_PATTERNS } from '../constants/intent-patterns';
import { INTENT_SYNONYMS } from '../constants/intent-synonyms';
import { INTENT_PRIORITY } from '../constants/intent-priority';
import { ACTION_VERBS } from '../constants/action-verbs';

@Injectable()
export class IntentClassificationService {

  constructor(

    private readonly scoringEngine: ScoringEngineService,

  ) {}

  //----------------------------------------------------
  // Initialize Scores
  //----------------------------------------------------

  private initializeScores(): Map<IntentType, number> {

    const scores = new Map<IntentType, number>();

    Object.values(IntentType).forEach(intent => {

      scores.set(intent, 0);

    });

    return scores;

  }

  //----------------------------------------------------
  // Initialize Evidence Maps
  //----------------------------------------------------

  private initializeEvidence(): Map<IntentType, string[]> {

    const evidence = new Map<IntentType, string[]>();

    Object.values(IntentType).forEach(intent => {

      evidence.set(intent, []);

    });

    return evidence;

  }

  //----------------------------------------------------
  // Add Score
  //----------------------------------------------------

  private addScore(

    scores: Map<IntentType, number>,

    intent: IntentType,

    value: number,

  ) {

    scores.set(

      intent,

      (scores.get(intent) ?? 0) + value,

    );

  }

  //----------------------------------------------------
  // Add Evidence
  //----------------------------------------------------

  private addEvidence(

    map: Map<IntentType, string[]>,

    intent: IntentType,

    value: string,

  ) {

    map.get(intent)?.push(value);

  }

  //----------------------------------------------------
  // Highest Score
  //----------------------------------------------------

  private highestScore(

    scores: Map<IntentType, number>,

  ): number {

    return Math.max(

      ...scores.values(),

      0,

    );

  }

  //----------------------------------------------------
  // Ranking
  //----------------------------------------------------

  private buildRanking(

    scores: Map<IntentType, number>,

  ): IntentScore[] {

    const max =

      Math.max(

        ...scores.values(),

        1,

      );

    return [...scores.entries()]

      .map(

        ([intent, score]) => ({

          intent,

          score,

          confidence:

            this.scoringEngine.confidence(

              score,

              max,

            ),

        }),

      )

      .sort((a, b) => {

       const difference = b.score - a.score;

  // If the scores are clearly different,
  // keep score ordering.
       if (Math.abs(difference) > 2) {

        return difference;

      }

  // Otherwise use intent priority.
      return (

       INTENT_PRIORITY[b.intent] -

       INTENT_PRIORITY[a.intent]

      );

      });
   
  }
  
  //----------------------------------------------------
  // Unknown
  //----------------------------------------------------

  private isUnknown(

    ranking: IntentScore[],

  ): boolean {

    return (

      ranking.length === 0 ||

      ranking[0].score === 0

    );

  }

  //----------------------------------------------------
  // Primary Intent
  //----------------------------------------------------

  private primaryIntent(

    ranking: IntentScore[],

  ): IntentType {

    if (

      this.isUnknown(

        ranking,

      )

    ) {

      return IntentType.Unknown;

    }

    return ranking[0].intent;

  }

  //----------------------------------------------------
  // Secondary Intent
  //----------------------------------------------------

  private secondaryIntent(

    ranking: IntentScore[],

  ): IntentType | null {

    if (

      ranking.length < 2 ||

      ranking[1].score === 0

    ) {

      return null;

    }

    return ranking[1].intent;

  }
    //----------------------------------------------------
  // Keyword Matching
  //----------------------------------------------------

  private matchKeywords(

    processed: ProcessedText,

    scores: Map<IntentType, number>,

    evidence: Map<IntentType, string[]>,

    matchedKeywords: string[],

  ): number {

    let total = 0;

    for (const intent of Object.values(IntentType)) {

      const keywords = INTENT_KEYWORDS[intent] || [];

      for (const keyword of keywords) {

        if (

          processed.filteredTokens.includes(

            keyword.keyword,

          )

        ) {

          const value =

            this.scoringEngine.keyword(

              keyword.weight,

            );

          total += value;

          this.addScore(

            scores,

            intent,

            value,

          );

          this.addEvidence(

            evidence,

            intent,

            keyword.keyword,

          );

          matchedKeywords.push(

            keyword.keyword,

          );

        }

      }

    }

    return total;

  }

  //----------------------------------------------------
  // Synonym Matching
  //----------------------------------------------------

  private matchSynonyms(

    processed: ProcessedText,

    scores: Map<IntentType, number>,

    evidence: Map<IntentType, string[]>,

    matchedSynonyms: string[],

  ): number {

    let total = 0;

    for (const intent of Object.values(IntentType)) {

      const synonyms =

        INTENT_SYNONYMS[intent] || [];

      for (const synonym of synonyms) {

        if (

          processed.filteredTokens.includes(

            synonym,

          )

        ) {

          const value =

            this.scoringEngine.synonym();

          total += value;

          this.addScore(

            scores,

            intent,

            value,

          );

          this.addEvidence(

            evidence,

            intent,

            synonym,

          );

          matchedSynonyms.push(

            synonym,

          );

        }

      }

    }

    return total;

  }

  //----------------------------------------------------
  // Pattern Matching
  //----------------------------------------------------

  private matchPatterns(

    processed: ProcessedText,

    scores: Map<IntentType, number>,

    evidence: Map<IntentType, string[]>,

    matchedPatterns: string[],

  ): number {

    let total = 0;

    const sentence =

      processed.cleanedText.toLowerCase();

    for (const intent of Object.values(IntentType)) {

      const patterns =

        INTENT_PATTERNS[intent] || [];

      for (const pattern of patterns) {

        if (

         TextMatcher.matchesPhrase(

          sentence,

          pattern,
          
         )

        ){

          const value =

            this.scoringEngine.phrase();

          total += value;

          this.addScore(

            scores,

            intent,

            value,

          );

          this.addEvidence(

            evidence,

            intent,

            pattern,

          );

          matchedPatterns.push(

            pattern,

          );

        }

      }

    }

    return total;

  }

  //----------------------------------------------------
  // Action Verb Matching
  //----------------------------------------------------

  private matchActionVerbs(

    processed: ProcessedText,

    scores: Map<IntentType, number>,

    matchedActionVerbs: string[],

  ): number {

    let total = 0;

    for (const action of ACTION_VERBS) {

      if (

        processed.filteredTokens.includes(

          action.verb,

        )

      ) {

        const value =

          this.scoringEngine.actionVerb(

            action.weight,

          );

        total += value;

        matchedActionVerbs.push(

          action.verb,

        );

        for (

          const intent of Object.values(

            IntentType,

          )

        ) {

          this.addScore(

            scores,

            intent,

            value * 0.2,

          );

        }

      }

    }

    return total;

  }
    //----------------------------------------------------
  // Topic Boost
  //----------------------------------------------------

  private applyTopicBoost(

    topic: TopicResult,

    scores: Map<IntentType, number>,

  ): number {

    if (!topic.topic) {

      return 0;

    }

    const boost =
      this.scoringEngine.topic();

    this.addScore(

      scores,

      IntentType.ExplainTopic,

      boost,

    );

    return boost;

  }

  //----------------------------------------------------
  // Emotion Boost
  //----------------------------------------------------

  private applyEmotionBoost(

    emotion: EmotionResult,

    scores: Map<IntentType, number>,

  ): number {

    let boost = 0;

    switch (emotion.emotion) {

      case 'Confused':

        boost =
          this.scoringEngine.emotion();

        this.addScore(

          scores,

          IntentType.ExplainTopic,

          boost,

        );

        break;

      case 'Frustrated':

        boost =
          this.scoringEngine.emotion();

        this.addScore(

          scores,

          IntentType.Motivation,

          boost,

        );

        break;

      case 'Curious':

        boost =
          this.scoringEngine.emotion();

        this.addScore(

          scores,

          IntentType.ExplainTopic,

          boost,

        );

        break;

      case 'Motivated':

        boost =
          this.scoringEngine.emotion();

        this.addScore(

          scores,

          IntentType.NeedPractice,

          boost,

        );

        break;

      case 'Confident':

        boost =
          this.scoringEngine.emotion();

        this.addScore(

          scores,

          IntentType.NeedPractice,

          boost,

        );

        break;

      default:

        boost = 0;

    }

    return boost;

  }

  //----------------------------------------------------
  // Learning Goal Boost
  //----------------------------------------------------

  private applyLearningGoalBoost(

    learningGoal: LearningGoalResult,

    scores: Map<IntentType, number>,

  ): number {

    const boost =
      this.scoringEngine.learningGoal();

    switch (learningGoal.goal) {

  case LearningGoal.ConceptUnderstanding:

    this.addScore(
      scores,
      IntentType.ExplainTopic,
      boost,
    );

    break;

  case LearningGoal.SkillPractice:

    this.addScore(
      scores,
      IntentType.NeedPractice,
      boost,
    );

    break;

  case LearningGoal.Revision:

    this.addScore(
      scores,
      IntentType.StudyPlan,
      boost,
    );

    break;

  case LearningGoal.StudyPlanning:

    this.addScore(
      scores,
      IntentType.StudyPlan,
      boost,
    );

    break;

  case LearningGoal.Recommendation:

    this.addScore(
      scores,
      IntentType.Recommendation,
      boost,
    );

    break;

  case LearningGoal.Motivation:

    this.addScore(
      scores,
      IntentType.Motivation,
      boost,
    );

    break;

  default:

    return 0;

 }

    return boost;

  }

  //----------------------------------------------------
  // Entity Boost
  //----------------------------------------------------

  private applyEntityBoost(

    entity: EntityResult,

    scores: Map<IntentType, number>,

  ): number {

    let boost = 0;

    if (

      entity.techniques.length > 0 ||

      entity.concepts.length > 0 ||

      entity.operations.length > 0

    ) {

      boost =

        this.scoringEngine.topic();

      this.addScore(

        scores,

        IntentType.ExplainTopic,

        boost,

      );

    }

    return boost;

  }
    //----------------------------------------------------
  // Build Reasoning
  //----------------------------------------------------

  private buildReasoning(

    matchedKeywords: string[],

    matchedSynonyms: string[],

    matchedPatterns: string[],

    matchedActionVerbs: string[],

    topic: TopicResult,

    emotion: EmotionResult,

    learningGoal: LearningGoalResult,

    entity: EntityResult,

  ): ReasoningStep[] {

    const reasoning: ReasoningStep[] = [];

    if (matchedKeywords.length > 0) {

      reasoning.push({

        stage: 'Keyword Matching',

        message: `Matched ${matchedKeywords.length} intent keywords.`,

        scoreContribution: matchedKeywords.length,

      });

    }

    if (matchedSynonyms.length > 0) {

      reasoning.push({

        stage: 'Synonym Matching',

        message: `Matched ${matchedSynonyms.length} synonyms.`,

        scoreContribution: matchedSynonyms.length,

      });

    }

    if (matchedPatterns.length > 0) {

      reasoning.push({

        stage: 'Pattern Matching',

        message: `Matched ${matchedPatterns.length} language patterns.`,

        scoreContribution: matchedPatterns.length,

      });

    }

    if (matchedActionVerbs.length > 0) {

      reasoning.push({

        stage: 'Action Verbs',

        message: `Detected ${matchedActionVerbs.length} educational action verbs.`,

        scoreContribution: matchedActionVerbs.length,

      });

    }

    if (topic.topic) {

      reasoning.push({

        stage: 'Topic Detection',

        message: `Detected topic "${topic.topic}".`,

        scoreContribution: 3,

      });

    }

    reasoning.push({

      stage: 'Emotion',

      message: `Emotion detected: ${emotion.emotion}.`,

      scoreContribution: 2,

    });

    reasoning.push({

      stage: 'Learning Goal',

      message: `Learning goal: ${learningGoal.goal}.`,

      scoreContribution: 3,

    });

    if (

      entity.concepts.length ||

      entity.techniques.length ||

      entity.operations.length

    ) {

      reasoning.push({

        stage: 'Entity Extraction',

        message:

          `Detected ${

            entity.concepts.length +

            entity.techniques.length +

            entity.operations.length

          } mathematical entities.`,

        scoreContribution: 3,

      });

    }

    return reasoning;

  }

  //----------------------------------------------------
  // Classify
  //----------------------------------------------------

  classify(

    processed: ProcessedText,

    topic: TopicResult,

    emotion: EmotionResult,

    learningGoal: LearningGoalResult,

    entity: EntityResult,

  ): IntentClassificationResult {

    const scores =

      this.initializeScores();

    const evidence =

      this.initializeEvidence();

    const matchedKeywords: string[] = [];

    const matchedSynonyms: string[] = [];

    const matchedPatterns: string[] = [];

    const matchedActionVerbs: string[] = [];

    //----------------------------------

    const keywordScore =

      this.matchKeywords(

        processed,

        scores,

        evidence,

        matchedKeywords,

      );

    //----------------------------------

    const synonymScore =

      this.matchSynonyms(

        processed,

        scores,

        evidence,

        matchedSynonyms,

      );

    //----------------------------------

    const patternScore =

      this.matchPatterns(

        processed,

        scores,

        evidence,

        matchedPatterns,

      );

    //----------------------------------

    const actionVerbScore =

      this.matchActionVerbs(

        processed,

        scores,

        matchedActionVerbs,

      );

    //----------------------------------

    const topicBoost =

      this.applyTopicBoost(

        topic,

        scores,

      );

    //----------------------------------

    const emotionBoost =

      this.applyEmotionBoost(

        emotion,

        scores,

      );

    //----------------------------------

    const learningGoalBoost =

      this.applyLearningGoalBoost(

        learningGoal,

        scores,

      );

    //----------------------------------

    const entityBoost =

      this.applyEntityBoost(

        entity,

        scores,

      );
  
      //----------------------------------
    // Ranking
    //----------------------------------

    const rankedIntents =

      this.scoringEngine.rankIntentScores(
        scores,
      );
    console.table(rankedIntents);
    //----------------------------------
    // Primary / Secondary
    //----------------------------------

    const primaryIntent =

      this.scoringEngine.primaryIntent(

        rankedIntents,

        IntentType.Unknown,

      );

    const secondaryIntent =

      this.scoringEngine.secondaryIntent(

        rankedIntents,

      );
      
    //----------------------------------
    // Confidence Breakdown
    //----------------------------------

    const confidenceBreakdown =

      this.scoringEngine.buildBreakdown(

        keywordScore,

        synonymScore,

        patternScore,

        actionVerbScore,

        topicBoost,

        emotionBoost,

        learningGoalBoost,

        entityBoost,

        0,

        0,

      );

    //----------------------------------
    // Reasoning
    //----------------------------------

    const reasoning =

      this.buildReasoning(

        matchedKeywords,

        matchedSynonyms,

        matchedPatterns,

        matchedActionVerbs,

        topic,

        emotion,

        learningGoal,

        entity,

      );

    //----------------------------------
    // Return
    //----------------------------------

    return {

      primaryIntent,

      secondaryIntent,

      rankedIntents,

      matchedKeywords,

      matchedSynonyms,

      matchedPatterns,

      matchedActionVerbs,

      confidence:

        this.scoringEngine.safeConfidence(

          confidenceBreakdown,

        ),

      confidenceBreakdown,

      reasoning,

    };

  }
}
