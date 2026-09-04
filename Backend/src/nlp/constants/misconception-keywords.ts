import { MisconceptionType } from '../enums/misconception-type.enum';

export const MISCONCEPTION_KEYWORDS: Record<MisconceptionType, string[]> = {
  [MisconceptionType.None]: [],

  [MisconceptionType.ConceptGap]: [
    'dont understand',
    "don't understand",
    'cannot understand',
    'not clear',
    'confused',
    'difficult',
    'hard',
  ],

  [MisconceptionType.ConceptConfusion]: [
    'difference',
    'between',
    'compare',
    'mixing',
    'confuse',
    'which one',
  ],

  [MisconceptionType.ProcedureError]: [
    'wrong step',
    'incorrect method',
    'procedure',
    'method',
    'steps',
  ],

  [MisconceptionType.CalculationError]: [
    'wrong answer',
    'calculation',
    'incorrect',
    'mistake',
    'error',
  ],

  [MisconceptionType.RepeatedMistake]: [
    'always',
    'every time',
    'again',
    'repeated',
    'still wrong',
    'keeps happening',
    'keep making',
    'same mistake',
    'again',
    'again and again',
    'always wrong',
    'repeatedly',
    'still wrong',
    'every time',
  ],

  [MisconceptionType.Unknown]: [],
};
