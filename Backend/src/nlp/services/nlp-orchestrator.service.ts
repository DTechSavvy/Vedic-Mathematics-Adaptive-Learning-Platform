import { Injectable } from '@nestjs/common';

import { NLPAnalysis } from '../interfaces/nlp-analysis.interface';

import { PreprocessingService } from './preprocessing.service';
import { IntentClassificationService } from './intent-classification.service';
import { TopicDetectorService } from './topic-detector.service';
import { LearningGoalDetectorService } from './learning-goal-detector.service';
import { EmotionDetectorService } from './emotion-detector.service';
import { EntityExtractorService } from './entity-extractor.service';
import { DifficultyAnalyzerService } from './difficulty-analyzer.service';
import { BloomTaxonomyService } from './bloom-taxonomy.service';
import { MisconceptionDetectorService } from './misconception-detector.service';
import { RecommendationBuilderService } from './recommendation-builder.service';

@Injectable()
export class NLPOrchestratorService {

  constructor(

    private readonly preprocessingService: PreprocessingService,

    private readonly intentClassificationService: IntentClassificationService,

    private readonly topicDetectorService: TopicDetectorService,

    private readonly learningGoalDetectorService: LearningGoalDetectorService,

    private readonly emotionDetectorService: EmotionDetectorService,

    private readonly entityExtractorService: EntityExtractorService,

    private readonly difficultyAnalyzerService: DifficultyAnalyzerService,

    private readonly bloomTaxonomyService: BloomTaxonomyService,

    private readonly misconceptionDetectorService: MisconceptionDetectorService,

    private readonly recommendationBuilderService: RecommendationBuilderService,


  ) {}

  analyze(text: string): NLPAnalysis {

  const startTime = Date.now();

  //---------------------------------
  // STEP 1
  //---------------------------------

  const processed =
    this.preprocessingService.preprocess(text);

  //---------------------------------
  // STEP 2
  //---------------------------------

  const topic =
    this.topicDetectorService.detectTopic(
      processed,
    );

  //---------------------------------
  // STEP 3
  //---------------------------------

  const emotion =
    this.emotionDetectorService.detectEmotion(
      processed,
    );

  //---------------------------------
  // STEP 4
  //---------------------------------

  const learningGoal =
    this.learningGoalDetectorService.detectGoal(
      processed,
    );

  //---------------------------------
  // STEP 5
  //---------------------------------

  const entities =
    this.entityExtractorService.extract(
      processed,
    );

  //---------------------------------
  // STEP 6
  //---------------------------------

  const intent =
    this.intentClassificationService.classify(
      processed,
      topic,
      emotion,
      learningGoal,
      entities,
    );

  //---------------------------------
  // STEP 7
  //---------------------------------

  const difficulty =
    this.difficultyAnalyzerService.analyze(
      processed,
      topic,
      entities,
    );

  //---------------------------------
  // STEP 8
  //---------------------------------

  const bloom =
    this.bloomTaxonomyService.classify(
      processed,
    );

  //---------------------------------
  // STEP 9
  //---------------------------------

  const misconception =
    this.misconceptionDetectorService.detect(
      processed,
    );

  //---------------------------------
  // STEP 10
  //---------------------------------

  const recommendations =
    this.recommendationBuilderService.build(
      intent,
      topic,
      learningGoal,
      emotion,
      difficulty,
      bloom,
      misconception,
    );

  const processingTime =
    Date.now() - startTime;

  return {

  //---------------------------------
  // Input
  //---------------------------------

  input: {
    originalText: text,
  },

  //---------------------------------
  // Preprocessing
  //---------------------------------

  preprocessing: {
    cleanedText: processed.cleanedText,
    normalizedText: processed.normalizedText,
    corrections: processed.corrections,
  },

  //---------------------------------
  // Linguistics
  //---------------------------------

  linguistics: {
    tokens: processed.tokens,
    correctedTokens: processed.correctedTokens,
    filteredTokens: processed.filteredTokens,
    bigrams: processed.bigrams,
    trigrams: processed.trigrams,
    wordCount: processed.wordCount,
    sentenceCount: processed.sentenceCount,
    containsQuestion: processed.containsQuestion,
    containsNumbers: processed.containsNumbers,
    containsMathExpression: processed.containsMathExpression,
  },

  //---------------------------------
  // Semantics
  //---------------------------------

  semantics: {
    intent,
    topic,
    emotion,
    learningGoal,
    entities,
  },

  //---------------------------------
  // Pedagogy
  //---------------------------------

  pedagogy: {
    difficulty,
    bloom,
    misconception,
  },

  //---------------------------------
  // Recommendations
  //---------------------------------

  recommendations,

  //---------------------------------
  // Analytics
  //---------------------------------

  analytics: {

    overallConfidence:
      Number(
        (
          (
            intent.confidence +
            topic.confidence +
            emotion.confidence +
            learningGoal.confidence +
            difficulty.confidence +
            bloom.confidence +
            misconception.confidence
          ) / 7
        ).toFixed(2),
      ),

    confidence: {

      intent: intent.confidence,

      topic: topic.confidence,

      emotion: emotion.confidence,

      learningGoal: learningGoal.confidence,

      difficulty: difficulty.confidence,

      bloom: bloom.confidence,

      misconception: misconception.confidence,

    },

    scoreBreakdown:
      intent.confidenceBreakdown,

  },

  //---------------------------------
  // Metadata
  //---------------------------------

  metadata: {

    processingTimeMs:
      processingTime,

    nlpVersion:
      '1.0.0',

    timestamp:
      new Date().toISOString(),

  },

  //---------------------------------
  // Trace
  //---------------------------------

  trace: [

    'Preprocessing Completed',

    'Topic Detection Completed',

    'Emotion Detection Completed',

    'Learning Goal Detection Completed',

    'Entity Extraction Completed',

    'Intent Classification Completed',

    'Difficulty Analysis Completed',

    'Bloom Taxonomy Completed',

    'Misconception Detection Completed',

    'Recommendation Generation Completed',

  ],

};

 }


  //---------------------------------
  // Difficulty Estimation
  //---------------------------------

  private calculateDifficulty(
    processed: any,
  ): string {

    let score = 0;

    if (processed.wordCount >= 10)
      score += 2;

    if (processed.wordCount >= 20)
      score += 2;

    if (processed.containsMathExpression)
      score += 2;

    if (
      processed.normalizedTopics.length > 1
    )
      score += 2;

    if (score <= 2)
      return 'Easy';

    if (score <= 5)
      return 'Medium';

    return 'Hard';

  }

  //---------------------------------
  // Overall Confidence
  //---------------------------------

  private calculateOverallConfidence(

    intent: number,

    topic: number,

    goal: number,

    emotion: number,

  ): number {

    return Number(

      (
        (

          intent +

          topic +

          goal +

          emotion

        ) / 4

      ).toFixed(2),

    );

  }

}