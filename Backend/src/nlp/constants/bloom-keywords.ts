import { BloomLevel } from '../enums/bloom-level.enum';

export const BLOOM_KEYWORDS: Record<BloomLevel, string[]> = {
  [BloomLevel.Remember]: [
    'what',
    'define',
    'list',
    'identify',
    'name',
    'recall',
    'state',
  ],

  [BloomLevel.Understand]: [
    'explain',
    'describe',
    'summarize',
    'interpret',
    'discuss',
    'understand',
  ],

  [BloomLevel.Apply]: [
    'solve',
    'calculate',
    'use',
    'apply',
    'demonstrate',
    'show',
  ],

  [BloomLevel.Analyze]: [
    'compare',
    'differentiate',
    'analyse',
    'analyze',
    'distinguish',
    'categorize',
  ],

  [BloomLevel.Evaluate]: [
    'justify',
    'evaluate',
    'critique',
    'recommend',
    'choose',
    'judge',
  ],

  [BloomLevel.Create]: [
    'create',
    'design',
    'develop',
    'construct',
    'invent',
    'generate',
  ],

  [BloomLevel.Unknown]: [],
};
