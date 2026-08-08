export interface Sutra {
  id: string;
  name: string;
  meaning: string;
  description: string;
  example: {
    problem: string;
    steps: string[];
    answer: string;
  };
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
}

export const sutras: Sutra[] = [
  {
    id: 'nikhilam',
    name: 'Nikhilam Navatashcaramam Dashatah',
    meaning: 'All from 9 and the last from 10',
    description: 'Used for subtraction from powers of 10 and multiplication of numbers close to a base (10, 100, 1000, etc.).',
    example: {
      problem: '97 × 96',
      steps: [
        'Base = 100. Deficiencies: 97→3, 96→4',
        'Cross-subtract: 97 - 4 = 93 (or 96 - 3 = 93)',
        'Multiply deficiencies: 3 × 4 = 12',
        'Answer: 93 | 12 = 9312'
      ],
      answer: '9312'
    },
    difficulty: 'beginner',
    icon: '🔢'
  },
  {
    id: 'urdhva',
    name: 'Urdhva-Tiryagbhyam',
    meaning: 'Vertically and Crosswise',
    description: 'A general multiplication formula applicable to all cases. Multiply vertically and crosswise to get the result.',
    example: {
      problem: '12 × 13',
      steps: [
        'Vertical: 1×1 = 1 (hundreds)',
        'Crosswise: (1×3) + (1×2) = 5 (tens)',
        'Vertical: 2×3 = 6 (units)',
        'Answer: 156'
      ],
      answer: '156'
    },
    difficulty: 'beginner',
    icon: '✖️'
  },
  {
    id: 'paraavartya',
    name: 'Paraavartya Yojayet',
    meaning: 'Transpose and Adjust',
    description: 'Used for division. The remainder and quotient are found by transposing the divisor.',
    example: {
      problem: '1225 ÷ 12',
      steps: [
        'Divisor 12 → flag digit = 2',
        'Bring down 1, multiply: 1×2=2',
        'Next: 2-2=0, multiply: 0×2=0',
        'Next: 2-0=2, multiply: 2×2=4',
        'Last: 5-4=1. Quotient=102, Remainder=1'
      ],
      answer: '102 R 1'
    },
    difficulty: 'intermediate',
    icon: '➗'
  },
  {
    id: 'ekadhikena',
    name: 'Ekadhikena Purvena',
    meaning: 'By one more than the previous one',
    description: 'Used for squaring numbers ending in 5 and finding recurring decimal fractions.',
    example: {
      problem: '35²',
      steps: [
        'Number ends in 5, so last part is always 25',
        'Take the digit before 5: 3',
        'Multiply by one more: 3 × 4 = 12',
        'Answer: 12 | 25 = 1225'
      ],
      answer: '1225'
    },
    difficulty: 'beginner',
    icon: '5️⃣'
  },
  {
    id: 'anurupye',
    name: 'Anurupye Shunyamanyat',
    meaning: 'If one is in ratio, the other is zero',
    description: 'Used in solving simultaneous equations where one pair of coefficients has a simple ratio.',
    example: {
      problem: '3x + 7y = 2, 4x + 21y = 6',
      steps: [
        'Check ratio: 7:21 = 1:3',
        'Check constants: 2:6 = 1:3 (same ratio!)',
        'Since coefficients of y and constants are in same ratio',
        'x = 0, substitute: 7y = 2, y = 2/7'
      ],
      answer: 'x = 0, y = 2/7'
    },
    difficulty: 'advanced',
    icon: '📐'
  },
  {
    id: 'yavadunam',
    name: 'Yavadunam',
    meaning: 'Whatever the extent of deficiency',
    description: 'Used for squaring numbers near a base. Find the deficiency, add to number, then square the deficiency.',
    example: {
      problem: '98²',
      steps: [
        'Base = 100, Deficiency = 2',
        'Number - Deficiency = 98 - 2 = 96',
        'Deficiency² = 2² = 04',
        'Answer: 96 | 04 = 9604'
      ],
      answer: '9604'
    },
    difficulty: 'intermediate',
    icon: '²'
  }
];

export const gamificationRewards = {
  sutraCoins: { name: 'Sutra Coins', icon: '🪙', description: 'Earned for correct answers' },
  masteryStones: { name: 'Mastery Stones', icon: '💎', description: 'Earned for completing sutras' },
  speedStars: { name: 'Speed Stars', icon: '⭐', description: 'Earned for fast solving' },
  wisdomTree: { name: 'Wisdom Tree', icon: '🌳', description: 'Grows with continuous learning' },
};
