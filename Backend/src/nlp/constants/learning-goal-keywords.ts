import { LearningGoal } from '../enums/learning-goal.enum';

export const LEARNING_GOAL_KEYWORDS = {
  [LearningGoal.ConceptUnderstanding]: [
    'explain',

    'teach',

    'understand',

    'concept',

    'definition',

    'meaning',

    'clarify',
  ],

  [LearningGoal.SkillPractice]: [
    'practice',

    'exercise',

    'questions',

    'quiz',

    'worksheet',

    'solve',
  ],

  [LearningGoal.Revision]: ['revise', 'revision', 'review', 'forgot', 'again'],

  [LearningGoal.ErrorAnalysis]: [
    'mistake',

    'wrong',

    'error',

    'why',

    'incorrect',
  ],

  [LearningGoal.StudyPlanning]: [
    'study plan',

    'schedule',

    'roadmap',

    'plan',

    'prepare',
  ],

  [LearningGoal.Challenge]: [
    'hard',

    'harder',

    'advanced',

    'challenge',

    'difficult',
  ],

  [LearningGoal.Recommendation]: [
    'recommend',

    'suggest',

    'next topic',

    'what next',
  ],

  [LearningGoal.Motivation]: [
    'motivate',

    'demotivated',

    'stress',

    'tired',

    'quit',
  ],
};
