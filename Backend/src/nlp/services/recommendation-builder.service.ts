import { Injectable } from '@nestjs/common';

import { IntentClassificationResult } from '../interfaces/intent-classification-result.interface';
import { TopicResult } from '../interfaces/topic-result.interface';
import { EmotionResult } from '../interfaces/emotion-result.interface';
import { LearningGoalResult } from '../interfaces/learning-goal-result.interface';

import { DifficultyResult } from '../interfaces/difficulty-result.interface';
import { BloomResult } from '../interfaces/bloom-result.interface';
import { MisconceptionResult } from '../interfaces/misconception-result.interface';
import { MisconceptionType } from '../enums/misconception-type.enum';

import { NLPRecommendations } from '../interfaces/sections/recommendations.interface';

import { IntentType } from '../enums/intent-type.enum';
import { EmotionType } from '../enums/emotion-type.enum';

@Injectable()
export class RecommendationBuilderService {
  build(
    intent: IntentClassificationResult,

    topic: TopicResult,

    learningGoal: LearningGoalResult,

    emotion: EmotionResult,

    difficulty: DifficultyResult,

    bloom: BloomResult,

    misconception: MisconceptionResult,
  ): NLPRecommendations {
    return {
      tutorMode: this.getTutorMode(intent),

      practiceMode: this.getPracticeMode(learningGoal),

      questionDifficulty: this.getQuestionDifficulty(difficulty),

      explanationDepth: this.getExplanationDepth(bloom),

      hintLevel: this.getHintLevel(difficulty),

      nextAction: this.getNextAction(intent, misconception),
    };
  }

  //---------------------------------
  // Tutor Mode
  //---------------------------------

  private getTutorMode(intent: IntentClassificationResult): string {
    switch (intent.primaryIntent) {
      case IntentType.ExplainTopic:
        return 'ConceptTeacher';

      case IntentType.AskDoubt:
        return 'DoubtSolver';

      case IntentType.NeedPractice:
        return 'PracticeCoach';

      case IntentType.StudyPlan:
        return 'Planner';

      case IntentType.Recommendation:
        return 'Advisor';

      case IntentType.Motivation:
        return 'Mentor';

      default:
        return 'GeneralTutor';
    }
  }

  //---------------------------------
  // Practice Mode
  //---------------------------------

  private getPracticeMode(goal: LearningGoalResult): string {
    return goal.goal;
  }

  //---------------------------------
  // Difficulty
  //---------------------------------

  private getQuestionDifficulty(difficulty: DifficultyResult): string {
    return difficulty.difficulty;
  }

  //---------------------------------
  // Explanation Depth
  //---------------------------------

  private getExplanationDepth(bloom: BloomResult): string {
    return bloom.level;
  }

  //---------------------------------
  // Hint Level
  //---------------------------------

  private getHintLevel(difficulty: DifficultyResult): string {
    switch (difficulty.difficulty) {
      case 'Easy':
        return 'Minimal';

      case 'Medium':
        return 'Guided';

      case 'Hard':
        return 'Detailed';

      default:
        return 'Guided';
    }
  }

  //---------------------------------
  // Next Action
  //---------------------------------

  private getNextAction(
    intent: IntentClassificationResult,

    misconception: MisconceptionResult,
  ): string {
    if (misconception.type !== MisconceptionType.None) {
      return 'CorrectMisconception';
    }

    return intent.primaryIntent;
  }
}
