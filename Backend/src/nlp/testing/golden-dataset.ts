import { GoldenQuery } from './golden-query.interface';

import { IntentType } from '../enums/intent-type.enum';
import { EmotionType } from '../enums/emotion-type.enum';
import { LearningGoal } from '../enums/learning-goal.enum';
import { BloomLevel } from '../enums/bloom-level.enum';
import { DifficultyLevel } from '../enums/difficulty-level.enum';
import { MisconceptionType } from '../enums/misconception-type.enum';

export const GOLDEN_DATASET: GoldenQuery[] = [

  // =====================================================
  // Greetings
  // =====================================================

  {
    input: 'Hi',

    intent: IntentType.Greeting,

    topic: null,

    emotion: EmotionType.Neutral,

    goal: LearningGoal.Unknown,

    bloom: BloomLevel.Unknown,

    difficulty: DifficultyLevel.Easy,

    misconception: MisconceptionType.None,
  },

  {
    input: 'Hello',

    intent: IntentType.Greeting,

    topic: null,

    emotion: EmotionType.Neutral,

    goal: LearningGoal.Unknown,

    bloom: BloomLevel.Unknown,

    difficulty: DifficultyLevel.Easy,

    misconception: MisconceptionType.None,
  },

  {
    input: 'Good Morning',

    intent: IntentType.Greeting,

    topic: null,

    emotion: EmotionType.Neutral,

    goal: LearningGoal.Unknown,

    bloom: BloomLevel.Unknown,

    difficulty: DifficultyLevel.Easy,

    misconception: MisconceptionType.None,
  },

  // =====================================================
  // Explain Topic
  // =====================================================

  {
    input: 'Explain Urdhva Tiryagbhyam.',

    intent: IntentType.ExplainTopic,

    topic: 'Urdhva Tiryagbhyam',

    emotion: EmotionType.Curious,

    goal: LearningGoal.ConceptUnderstanding,

    bloom: BloomLevel.Understand,

    difficulty: DifficultyLevel.Easy,

    misconception: MisconceptionType.None,
  },

  {
    input: 'Teach me Nikhilam Sutra.',

    intent: IntentType.ExplainTopic,

    topic: 'Nikhilam',

    emotion: EmotionType.Curious,

    goal: LearningGoal.ConceptUnderstanding,

    bloom: BloomLevel.Understand,

    difficulty: DifficultyLevel.Easy,

    misconception: MisconceptionType.None,
  },

  {
    input: 'What is Ekadhikena Purvena?',

    intent: IntentType.ExplainTopic,

    topic: 'Ekadhikena Purvena',

    emotion: EmotionType.Curious,

    goal: LearningGoal.ConceptUnderstanding,

    bloom: BloomLevel.Remember,

    difficulty: DifficultyLevel.Easy,

    misconception: MisconceptionType.None,
  },

  // =====================================================
  // Practice
  // =====================================================

  {
    input: 'Give me five multiplication questions.',

    intent: IntentType.NeedPractice,

    topic: 'Multiplication',

    emotion: EmotionType.Motivated,

    goal: LearningGoal.SkillPractice,

    bloom: BloomLevel.Apply,

    difficulty: DifficultyLevel.Medium,

    misconception: MisconceptionType.None,
  },

  {
    input: 'Quiz me on Division.',

    intent: IntentType.NeedPractice,

    topic: 'Division',

    emotion: EmotionType.Motivated,

    goal: LearningGoal.SkillPractice,

    bloom: BloomLevel.Apply,

    difficulty: DifficultyLevel.Medium,

    misconception: MisconceptionType.None,
  },

  // =====================================================
  // Doubts
  // =====================================================

  {
    input: "I don't understand Urdhva Tiryagbhyam.",

    intent: IntentType.AskDoubt,

    topic: 'Urdhva Tiryagbhyam',

    emotion: EmotionType.Confused,

    goal: LearningGoal.ConceptUnderstanding,

    bloom: BloomLevel.Understand,

    difficulty: DifficultyLevel.Easy,

    misconception: MisconceptionType.ConceptGap,
  },

  {
    input: 'Why is my answer wrong?',

    intent: IntentType.AskDoubt,

    topic: null,

    emotion: EmotionType.Confused,

    goal: LearningGoal.ConceptUnderstanding,

    bloom: BloomLevel.Analyze,

    difficulty: DifficultyLevel.Medium,

    misconception: MisconceptionType.ProcedureError,
  },

  // =====================================================
  // Recommendation
  // =====================================================

  {
    input: 'Which topic should I learn next?',

    intent: IntentType.Recommendation,

    topic: null,

    emotion: EmotionType.Motivated,

    goal: LearningGoal.Recommendation,

    bloom: BloomLevel.Evaluate,

    difficulty: DifficultyLevel.Easy,

    misconception: MisconceptionType.None,
  },

  // =====================================================
  // Study Plan
  // =====================================================

  {
    input: 'Create a study plan for Vedic Maths.',

    intent: IntentType.StudyPlan,

    topic: null,

    emotion: EmotionType.Motivated,

    goal: LearningGoal.StudyPlanning,

    bloom: BloomLevel.Create,

    difficulty: DifficultyLevel.Easy,

    misconception: MisconceptionType.None,
  },

  // =====================================================
  // Motivation
  // =====================================================

  {
    input: 'I feel like giving up.',

    intent: IntentType.Motivation,

    topic: null,

    emotion: EmotionType.Frustrated,

    goal: LearningGoal.Motivation,

    bloom: BloomLevel.Unknown,

    difficulty: DifficultyLevel.Easy,

    misconception: MisconceptionType.None,
  },

];