import { IntentType } from '../enums/intent-type.enum';

export interface IntentSynonym {
  intent: IntentType;

  words: string[];
}

export const INTENT_SYNONYMS: IntentSynonym[] = [
  {
    intent: IntentType.ExplainTopic,

    words: [
      'teach',
      'learning',
      'learn',
      'study',
      'understand',
      'understanding',
      'explain',
      'describe',
      'illustrate',
      'define',
      'definition',
      'meaning',
      'concept',
      'concepts',
      'theory',
      'principle',
      'method',
      'procedure',
      'example',
      'examples',
      'demonstrate',
      'show',
    ],
  },

  {
    intent: IntentType.NeedPractice,

    words: [
      'practice',
      'exercise',
      'exercises',
      'drill',
      'drills',
      'quiz',
      'quizzes',
      'worksheet',
      'worksheets',
      'test',
      'tests',
      'attempt',
      'attempts',
      'solve',
      'solving',
      'problem',
      'problems',
      'challenge',
      'revision',
    ],
  },

  {
    intent: IntentType.Recommendation,

    words: [
      'recommend',
      'recommendation',
      'suggest',
      'suggestion',
      'advise',
      'advice',
      'guide',
      'guidance',
      'best',
      'next',
      'continue',
      'path',
      'direction',
    ],
  },

  {
    intent: IntentType.StudyPlan,

    words: [
      'plan',
      'planning',
      'roadmap',
      'schedule',
      'routine',
      'strategy',
      'organize',
      'calendar',
      'timeline',
      'preparation',
      'prepare',
    ],
  },

  {
    intent: IntentType.Motivation,

    words: [
      'motivate',
      'motivation',
      'encourage',
      'encouragement',
      'confidence',
      'confident',
      'improve',
      'improvement',
      'progress',
      'faster',
      'speed',
      'focus',
      'discipline',
      'consistent',
    ],
  },

  {
    intent: IntentType.AskDoubt,

    words: [
      'why',
      'how',
      'question',
      'questions',
      'doubt',
      'doubts',
      'confused',
      'confusion',
      'clarify',
      'mistake',
      'wrong',
      'incorrect',
      'issue',
      'problem',
      'stuck',
    ],
  },

  {
    intent: IntentType.Greeting,

    words: [
      'hello',
      'hi',
      'hey',
      'greetings',
      'welcome',
      'thanks',
      'thank',
      'goodbye',
      'bye',
    ],
  },
];
