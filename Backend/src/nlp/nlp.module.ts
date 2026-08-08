import { Module } from '@nestjs/common';

import { NLPService } from './nlp.service';
import { NlpController } from './controllers/nlp.controller';

import { PreprocessingService } from './services/preprocessing.service';
import { IntentClassificationService } from './services/intent-classification.service';
import { TopicDetectorService } from './services/topic-detector.service';
import { FuzzyMatcherService } from './services/fuzzy-matcher.service';
import { LearningGoalDetectorService } from './services/learning-goal-detector.service';
import { EmotionDetectorService } from './services/emotion-detector.service';
import { NLPOrchestratorService } from './services/nlp-orchestrator.service';
import { ScoringEngineService } from './services/scoring-engine.service';
import { EntityExtractorService } from './services/entity-extractor.service';
import { DifficultyAnalyzerService } from './services/difficulty-analyzer.service';
import { BloomTaxonomyService } from './services/bloom-taxonomy.service';
import { MisconceptionDetectorService } from './services/misconception-detector.service';
import { RecommendationBuilderService } from './services/recommendation-builder.service';
import { GoldenTestService } from './testing/golden-test.service';
import { GoldenTestController } from './testing/golden-test.controller';

@Module({
  controllers: [NlpController, GoldenTestController],

  providers: [
    NLPService,
    PreprocessingService,
    IntentClassificationService,
    TopicDetectorService,
    FuzzyMatcherService,
    LearningGoalDetectorService,
    EmotionDetectorService,
    NLPOrchestratorService,
    ScoringEngineService,
    EntityExtractorService,
    DifficultyAnalyzerService,
    BloomTaxonomyService,
    MisconceptionDetectorService,
    RecommendationBuilderService,
    GoldenTestService,
  ],

  exports: [NLPService, NLPOrchestratorService, DifficultyAnalyzerService, BloomTaxonomyService, MisconceptionDetectorService],
})
export class NlpModule {}
