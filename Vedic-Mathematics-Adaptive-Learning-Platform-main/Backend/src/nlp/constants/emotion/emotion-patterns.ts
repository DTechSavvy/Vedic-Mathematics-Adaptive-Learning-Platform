import { EmotionType } from '../../enums/emotion-type.enum';

export const EMOTION_PATTERNS = {

  [EmotionType.Confused]: [

    "i don't understand",
    "i do not understand",
    "can you explain",
    "help me understand",
    "what does this mean",
    "i forgot",
    "i can't remember",
    "i cannot remember",
    "i am confused",
    "i'm confused",
    "explain again",
    "not getting it",
    "i'm stuck",
    "i am stuck",

  ],

  [EmotionType.Frustrated]: [

    "i keep making mistakes",
    "i always get it wrong",
    "i am losing confidence",
    "i'm losing confidence",
    "i keep failing",
    "i can't solve this",
    "i cannot solve this",
    "this is too difficult",
    "i give up",
    "i'm frustrated",
    "i am frustrated",
    "i feel discouraged",
    "i'm tired of this",

  ],

  [EmotionType.Curious]: [

    "tell me more",
    "teach me",
    "show me",
    "how does",
    "why does",
    "i want to know",
    "i'm curious",
    "can you explain",

  ],

  [EmotionType.Confident]: [

    "i got it",
    "i understand",
    "i know this",
    "this is easy",
    "i solved it",
    "i can do it",
    "i'm confident",

  ],

  [EmotionType.Motivated]: [

    "i want to improve",
    "help me improve",
    "i want to learn",
    "i want to practice",
    "help me become faster",
    "improve my speed",
    "improve my accuracy",
    "keep learning",
    "keep practicing",
    "challenge me",

  ],

};