import { Injectable } from '@nestjs/common';

import { ProcessedText } from '../interfaces/processed-text.interface';
import { LearningGoalResult } from '../interfaces/learning-goal-result.interface';

import { LearningGoal } from '../enums/learning-goal.enum';

import { TextMatcher } from '../utils/text-matcher';
import { LEARNING_GOAL_KEYWORDS } from '../constants/learning-goal-keywords';

@Injectable()
export class LearningGoalDetectorService {

  detectGoal(

    processed: ProcessedText,

  ): LearningGoalResult {

    const scores = new Map<LearningGoal, number>();

    const evidence = new Map<LearningGoal, string[]>();

    Object.values(LearningGoal).forEach(goal => {

      scores.set(goal, 0);

      evidence.set(goal, []);

    });

    //------------------------
    // Token Matching
    //------------------------

    for (const goal of Object.values(LearningGoal)) {

      const keywords = LEARNING_GOAL_KEYWORDS[goal] || [];

      for (const token of processed.filteredTokens) {

        if (keywords.includes(token)) {

          scores.set(goal, scores.get(goal)! + 2);

          evidence.get(goal)!.push(token);

        }

      }

    }

    //------------------------
    // Bigram Matching
    //------------------------

    for (const goal of Object.values(LearningGoal)) {

      const keywords = LEARNING_GOAL_KEYWORDS[goal] || [];

      for (const bigram of processed.bigrams) {

        if (keywords.includes(bigram)) {

          scores.set(goal, scores.get(goal)! + 4);

          evidence.get(goal)!.push(bigram);

        }

      }

    }

    //------------------------
    // Trigram Matching
    //------------------------

    for (const goal of Object.values(LearningGoal)) {

      const keywords = LEARNING_GOAL_KEYWORDS[goal] || [];

      for (const trigram of processed.trigrams) {

        if (keywords.includes(trigram)) {

          scores.set(goal, scores.get(goal)! + 6);

          evidence.get(goal)!.push(trigram);

        }

      }

    }
    
    //------------------------
// Contextual Goal Boost
//------------------------

const sentence =
processed.correctedTokens.join(' ');

//------------------
// Concept Learning
//------------------

if (

  TextMatcher.matchesPhrase(sentence, 'understand') ||

  TextMatcher.matchesPhrase(sentence, 'learn') ||

  TextMatcher.matchesPhrase(sentence, 'concept') ||

  TextMatcher.matchesPhrase(sentence, 'meaning') ||

  TextMatcher.matchesPhrase(sentence, 'explain')

){

scores.set(

LearningGoal.ConceptUnderstanding,

scores.get(
LearningGoal.ConceptUnderstanding,
)!+4,

);

}

//------------------
// Practice
//------------------

if (

TextMatcher.matchesPhrase(sentence, 'practice') ||

TextMatcher.matchesPhrase(sentence, 'exercise') ||

TextMatcher.matchesPhrase(sentence, 'solve') ||

TextMatcher.matchesPhrase(sentence, 'problem') 

){

scores.set(

LearningGoal.SkillPractice,

scores.get(
LearningGoal.SkillPractice,
)!+4,

);

}

//------------------
// Planning
//------------------

if (

TextMatcher.matchesPhrase(sentence, 'plan') ||

TextMatcher.matchesPhrase(sentence, 'schedule') ||

TextMatcher.matchesPhrase(sentence, 'organize') ||

TextMatcher.matchesPhrase(sentence, 'time management') 

){

scores.set(

LearningGoal.StudyPlanning,

scores.get(
LearningGoal.StudyPlanning,
)!+4,

);

}

//------------------
// Recommendation
//------------------

if (

TextMatcher.matchesPhrase(sentence, 'recommend') ||

TextMatcher.matchesPhrase(sentence, 'best') ||

TextMatcher.matchesPhrase(sentence, 'which') ||

TextMatcher.matchesPhrase(sentence, 'suggest')

){

scores.set(

LearningGoal.Recommendation,

scores.get(
LearningGoal.Recommendation,
)!+4,

);

}

//------------------
// Motivation
//------------------

if (

TextMatcher.matchesPhrase(sentence, 'improve') ||

TextMatcher.matchesPhrase(sentence, 'confidence') ||

TextMatcher.matchesPhrase(sentence, 'better') ||

TextMatcher.matchesPhrase(sentence, 'motivate') 

){

scores.set(

LearningGoal.Motivation,

scores.get(
LearningGoal.Motivation,
)!+4,

);

}

    //------------------------
    // Best Goal
    //------------------------

    let bestGoal = LearningGoal.Unknown;

    let highestScore = 0;

    for (const [goal, score] of scores.entries()) {

      if (score > highestScore) {

        highestScore = score;

        bestGoal = goal;

      }

    }

    const confidence =

      Number(

        Math.min(

          highestScore / 10,

          1,

        ).toFixed(2),

      );

    return{

      goal:bestGoal,

      confidence,

      evidence:evidence.get(bestGoal)!,

    };

  }

}