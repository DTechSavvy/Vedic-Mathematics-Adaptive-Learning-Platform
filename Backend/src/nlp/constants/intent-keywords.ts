import { IntentType } from '../enums/intent-type.enum';
import { IntentKeyword } from '../interfaces/intent-keyword.interface';

export const INTENT_KEYWORDS: Record<IntentType, IntentKeyword[]> = {

  [IntentType.ExplainTopic]: [
    { keyword: 'explain', weight: 5 },
    { keyword: 'teach', weight: 4 },
    { keyword: 'describe', weight: 4 },
    { keyword: 'what is', weight: 5 },
    { keyword: 'how does', weight: 5 },
    { keyword: 'how do', weight: 5 },
    { keyword: 'meaning', weight: 3 },
    { keyword: 'definition', weight: 4 },
    { keyword: 'clarify', weight: 5 },
    { keyword: 'understand', weight: 2 },
    { keyword: 'concept', weight: 2 },
    { keyword: 'learn', weight: 2 },
    { keyword: 'guide', weight: 2 },
  ],

  [IntentType.AskDoubt]: [
    { keyword: 'why', weight: 4 },
    { keyword: 'wrong', weight: 5 },
    { keyword: 'mistake', weight: 5 },
    { keyword: 'confused', weight: 5 },
    { keyword: 'doubt', weight: 5 },
    { keyword: 'unclear', weight: 4 },
    { keyword: 'stuck', weight: 4 },
    { keyword: 'cannot', weight: 3 },
    { keyword: "don't understand", weight: 5 },
    { keyword: 'error', weight: 4 },
    { keyword: 'issue', weight: 3 },
    { keyword: 'not getting', weight: 5 },
  ],

  [IntentType.NeedPractice]: [
    { keyword: 'practice', weight: 5 },
    { keyword: 'exercise', weight: 4 },
    { keyword: 'questions', weight: 3 },
    { keyword: 'quiz', weight: 4 },
    { keyword: 'test', weight: 3 },
    { keyword: 'challenge', weight: 4 },
    { keyword: 'solve', weight: 4 },
    { keyword: 'worksheet', weight: 4 },
  ],

  [IntentType.StudyPlan]: [
    { keyword: 'study plan', weight: 5 },
    { keyword: 'schedule', weight: 4 },
    { keyword: 'roadmap', weight: 5 },
    { keyword: 'prepare', weight: 3 },
    { keyword: 'plan', weight: 3 },
    { keyword: 'timetable', weight: 5 },
  ],

  [IntentType.Recommendation]: [
    { keyword: 'recommend', weight: 5 },
    { keyword: 'next topic', weight: 5 },
    { keyword: 'next', weight: 2 },
    { keyword: 'suggest', weight: 4 },
    { keyword: 'advice', weight: 3 },
  ],

  [IntentType.Greeting]: [
    { keyword: 'hello', weight: 5 },
    { keyword: 'hi', weight: 5 },
    { keyword: 'hey', weight: 5 },
    { keyword: 'good morning', weight: 5 },
    { keyword: 'good afternoon', weight: 5 },
    { keyword: 'good evening', weight: 5 },
    { keyword: 'good night', weight: 5 },
  ],

  [IntentType.Motivation]: [
    { keyword: 'motivate', weight: 5 },
    { keyword: 'demotivated', weight: 5 },
    { keyword: 'hard', weight: 2 },
    { keyword: 'difficult', weight: 2 },
    { keyword: 'quit', weight: 5 },
    { keyword: 'tired', weight: 4 },
    { keyword: 'boring', weight: 4 },
    { keyword: 'stress', weight: 4 },
  ],

  [IntentType.Unknown]: [],
};