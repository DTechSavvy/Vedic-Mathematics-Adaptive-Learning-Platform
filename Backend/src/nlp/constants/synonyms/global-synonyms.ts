export interface SynonymEntry {
  root: string;

  weight: number;

  synonyms: string[];
}

export const GLOBAL_SYNONYMS: SynonymEntry[] = [
  // -------------------------
  // Explain
  // -------------------------

  {
    root: 'explain',

    weight: 5,

    synonyms: [
      'teach',

      'describe',

      'clarify',

      'define',

      'elaborate',

      'illustrate',

      'demonstrate',

      'show',

      'guide',

      'educate',
    ],
  },

  // -------------------------
  // Practice
  // -------------------------

  {
    root: 'practice',

    weight: 5,

    synonyms: [
      'exercise',

      'solve',

      'train',

      'drill',

      'attempt',

      'workout',

      'revise',

      'repeat',

      'improve',

      'develop',

      'enhance',

      'master',
    ],
  },

  // -------------------------
  // Recommendation
  // -------------------------

  {
    root: 'recommend',

    weight: 4,

    synonyms: [
      'suggest',

      'advise',

      'propose',

      'prefer',

      'next',

      'suitable',

      'best',
    ],
  },

  // -------------------------
  // Motivation
  // -------------------------

  {
    root: 'motivate',

    weight: 4,

    synonyms: [
      'encourage',

      'inspire',

      'uplift',

      'confident',

      'positive',

      'confidence',

      'hope',
    ],
  },

  // -------------------------
  // Study Plan
  // -------------------------

  {
    root: 'plan',

    weight: 4,

    synonyms: [
      'schedule',

      'roadmap',

      'timetable',

      'routine',

      'prepare',

      'organize',
    ],
  },

  // -------------------------
  // Doubt
  // -------------------------

  {
    root: 'doubt',

    weight: 5,

    synonyms: [
      'confused',

      'unclear',

      'mistake',

      'wrong',

      'stuck',

      'problem',

      'issue',

      'difficulty',

      'error',

      'forget',
    ],
  },
];
