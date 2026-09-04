import { NLPInput } from './sections/input.interface';
import { NLPPreprocessing } from './sections/preprocessing.interface';
import { NLPLinguistics } from './sections/linguistics.interface';
import { NLPSemantics } from './sections/semantics.interface';
import { NLPPedagogy } from './sections/pedagogy.interface';
import { NLPRecommendations } from './sections/recommendations.interface';
import { NLPAnalytics } from './sections/analytics.interface';
import { NLPMetadata } from './sections/metadata.interface';

export interface NLPAnalysis {
  //---------------------------------
  // Original Input
  //---------------------------------

  input: NLPInput;

  //---------------------------------
  // Preprocessing
  //---------------------------------

  preprocessing: NLPPreprocessing;

  //---------------------------------
  // Linguistic Features
  //---------------------------------

  linguistics: NLPLinguistics;

  //---------------------------------
  // Semantic Analysis
  //---------------------------------

  semantics: NLPSemantics;

  //---------------------------------
  // Educational Analysis
  //---------------------------------

  pedagogy: NLPPedagogy;

  //---------------------------------
  // AI Recommendations
  //---------------------------------

  recommendations: NLPRecommendations;

  //---------------------------------
  // Analytics
  //---------------------------------

  analytics: NLPAnalytics;

  //---------------------------------
  // Metadata
  //---------------------------------

  metadata: NLPMetadata;

  //---------------------------------
  // Debug Trace
  //---------------------------------

  trace: string[];
}
