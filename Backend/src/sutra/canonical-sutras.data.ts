export interface CanonicalSutra {
  id: string;
  number: number;
  name: string;
  aliases: string[];
  meaning: string;
  description: string;
  mathematicalIdea: string;
  whenToUse: string;
  whenNotToUse: string;
  prerequisites: string[];
  example: {
    problem: string;
    recognition: string;
    steps: string[];
    answer: string;
  };
  commonMistakes: string[];
  practiceGuidance: string;
  relatedSutras: string[];
  practiceTemplateType: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
}

export const foundationalSource = {
  title: 'Vedic Mathematics',
  organization: 'Bharati Krishna Tirthaji; edited by V. S. Agrawala',
  reference:
    'Motilal Banarsidass, first published 1965; terminology and applications cross-checked with VedicMaths.org instructional and research resources',
};

export const CANONICAL_SUTRAS: CanonicalSutra[] = [
  {
    id: 'sutra-01',
    number: 1,
    name: 'Ekadhikena Purvena',
    aliases: ['Ekadhikena Purvena'],
    meaning: 'By one more than the previous one',
    description:
      'A rule used in established examples such as squaring positive integers ending in 5.',
    mathematicalIdea:
      'Multiply the part before the final 5 by its successor and append 25.',
    whenToUse: 'Squares of positive integers ending in 5.',
    whenNotToUse: 'A number that does not end in 5.',
    prerequisites: ['Place value', 'Small-integer multiplication'],
    example: {
      problem: '35^2',
      recognition: '35 ends in 5.',
      steps: ['Use the preceding part 3.', '3 x 4 = 12.', 'Append 25.'],
      answer: '1225',
    },
    commonMistakes: ['Forgetting 25', 'Using the rule for another final digit'],
    practiceGuidance:
      'Start with two-digit squares ending in 5, then progress to three-digit examples.',
    relatedSutras: ['sutra-10'],
    practiceTemplateType: 'SQUARE_ENDING_FIVE',
    difficulty: 'beginner',
    icon: '5',
  },
  {
    id: 'sutra-02',
    number: 2,
    name: 'Nikhilam Navatashcaramam Dashatah',
    aliases: ['Nikhilam', 'Nikhilam Navatashcaramam Dashatah'],
    meaning: 'All from 9 and the last from 10',
    description:
      'A complement principle for subtraction from powers of ten and products near a base.',
    mathematicalIdea:
      'Use deficiencies or excesses from a base, combining a cross-part with a deviation product.',
    whenToUse: 'Complements and products near 10, 100, or 1000.',
    whenNotToUse: 'When the chosen base does not simplify the work.',
    prerequisites: ['Place value', 'Complements', 'Multiplication'],
    example: {
      problem: '97 x 96',
      recognition: 'Both factors are close to 100.',
      steps: [
        'Deficiencies are 3 and 4.',
        'Cross-subtract: 97 - 4 = 93.',
        'Multiply: 3 x 4 = 12.',
        'Pad to two right-hand places: 93 | 12.',
      ],
      answer: '9312',
    },
    commonMistakes: [
      'Not padding the right part',
      'Mixing deficiency and excess signs',
    ],
    practiceGuidance:
      'Practice complements first, then products near 10, 100, and 1000.',
    relatedSutras: ['sutra-03', 'sutra-10'],
    practiceTemplateType: 'BASE_MULTIPLICATION',
    difficulty: 'beginner',
    icon: 'N',
  },
  {
    id: 'sutra-03',
    number: 3,
    name: 'Urdhva-Tiryagbhyam',
    aliases: ['Urdhva Tiryagbhyam', 'Vertically and Crosswise'],
    meaning: 'Vertically and crosswise',
    description:
      'A general multiplication arrangement using vertical and crosswise partial products.',
    mathematicalIdea:
      'Form diagonal partial products and combine them by place value.',
    whenToUse:
      'Systematic multiplication, especially two-digit and multi-digit examples.',
    whenNotToUse:
      'Do not claim it is always faster than the conventional algorithm.',
    prerequisites: ['Place value', 'Single-digit multiplication', 'Carrying'],
    example: {
      problem: '12 x 13',
      recognition: 'Use the two-digit vertical-and-crosswise pattern.',
      steps: ['2 x 3 = 6.', '1 x 3 + 2 x 1 = 5.', '1 x 1 = 1.'],
      answer: '156',
    },
    commonMistakes: ['Dropping carries', 'Omitting one cross product'],
    practiceGuidance: 'Record each diagonal before combining and carrying.',
    relatedSutras: ['sutra-02'],
    practiceTemplateType: 'URDHVA_MULTIPLICATION',
    difficulty: 'beginner',
    icon: 'x',
  },
  {
    id: 'sutra-04',
    number: 4,
    name: 'Paravartya Yojayet',
    aliases: ['Paravartya', 'Paravartya Yojayet'],
    meaning: 'Transpose and apply',
    description:
      'A transposition principle used in suitable division and algebraic equation procedures.',
    mathematicalIdea:
      'Move a term or divisor component while applying the required sign or place-value adjustment.',
    whenToUse:
      'A suitable division form or linear equation where transposition simplifies the work.',
    whenNotToUse: 'Without checking signs and the final result.',
    prerequisites: ['Algebra', 'Division', 'Signs'],
    example: {
      problem: '3x + 5 = 17',
      recognition: 'Transpose the constant before dividing.',
      steps: ['3x = 17 - 5 = 12.', 'x = 12 / 3.', 'Check: 3(4) + 5 = 17.'],
      answer: 'x = 4',
    },
    commonMistakes: [
      'Changing a sign without preserving equality',
      'Skipping the check',
    ],
    practiceGuidance:
      'Use one-step and two-step equations, verifying by substitution.',
    relatedSutras: ['sutra-07'],
    practiceTemplateType: 'PARAVARTYA_TRANSPOSITION',
    difficulty: 'intermediate',
    icon: 'T',
  },
  {
    id: 'sutra-05',
    number: 5,
    name: 'Shunyam Saamyasamuccaye',
    aliases: ['Shunyam Saamyasamuccaye'],
    meaning: 'When the samuccaya is the same, it is zero',
    description:
      'An equation-solving principle that depends on a matching structural sum.',
    mathematicalIdea:
      'Recognize a repeated aggregate expression and reduce the equation only when the required form is present.',
    whenToUse: 'A matching aggregate appears in the required equation form.',
    whenNotToUse:
      'When “same” is only superficial; always identify the algebraic structure.',
    prerequisites: ['Algebraic expressions', 'Linear equations'],
    example: {
      problem: 'x + 5 = 5',
      recognition: 'The same constant occurs on both sides.',
      steps: [
        'Subtract 5 from both sides.',
        'The result is x = 0.',
        'Substitute to check.',
      ],
      answer: 'x = 0',
    },
    commonMistakes: [
      'Applying the rule to the wrong structure',
      'Not checking',
    ],
    practiceGuidance:
      'Use guided recognition exercises before symbolic drills.',
    relatedSutras: ['sutra-06', 'sutra-07'],
    practiceTemplateType: 'SHUNYAM_EQUATION',
    difficulty: 'advanced',
    icon: '0',
  },
  {
    id: 'sutra-06',
    number: 6,
    name: '(Anurupye) Shunyamanyat',
    aliases: ['Anurupye Shunyamanyat', 'Anurupyena'],
    meaning: 'If one is in proportion, the other is zero',
    description:
      'A proportionality-based principle for suitable systems of equations.',
    mathematicalIdea:
      'A matching ratio can force a remaining variable or expression to vanish, but all relevant ratios must agree.',
    whenToUse:
      'A system has the required proportional coefficient and constant pattern.',
    whenNotToUse:
      'From one ratio alone or without classifying dependent equations.',
    prerequisites: ['Ratios', 'Simultaneous equations', 'Substitution'],
    example: {
      problem: 'x + 2y = 6; 2x + 4y = 12',
      recognition: 'The second equation is twice the first.',
      steps: [
        'Compare all coefficients and constants.',
        'Confirm the equations are dependent.',
        'State that there are infinitely many solutions.',
      ],
      answer: 'Infinitely many solutions',
    },
    commonMistakes: [
      'Claiming both variables are zero',
      'Checking only one ratio',
    ],
    practiceGuidance: 'Classify proportional systems before solving them.',
    relatedSutras: ['sutra-05', 'sutra-07'],
    practiceTemplateType: 'PROPORTIONAL_SYSTEM',
    difficulty: 'advanced',
    icon: 'R',
  },
  {
    id: 'sutra-07',
    number: 7,
    name: 'Sankalana-Vyavakalanabhyam',
    aliases: ['Sankalana Vyavakalanabhyam'],
    meaning: 'By addition and by subtraction',
    description:
      'A paired addition/subtraction principle for combining equations or quantities strategically.',
    mathematicalIdea:
      'Add or subtract related equations so a selected variable cancels.',
    whenToUse:
      'Systems of linear equations and structured sums or differences.',
    whenNotToUse: 'When signs or equality are not preserved.',
    prerequisites: ['Addition', 'Subtraction', 'Linear equations'],
    example: {
      problem: 'x + y = 10; x - y = 2',
      recognition: 'Adding cancels y.',
      steps: ['Add: 2x = 12.', 'x = 6.', 'Substitute: y = 4.'],
      answer: 'x = 6, y = 4',
    },
    commonMistakes: [
      'Using the wrong subtraction direction',
      'Not substituting back',
    ],
    practiceGuidance:
      'Choose addition or subtraction based on the variable to cancel.',
    relatedSutras: ['sutra-04', 'sutra-06'],
    practiceTemplateType: 'ADD_SUBTRACT_SYSTEM',
    difficulty: 'intermediate',
    icon: '+',
  },
  {
    id: 'sutra-08',
    number: 8,
    name: 'Puranapuranabhyam',
    aliases: ['Puranapuranabhyam'],
    meaning: 'By completion or non-completion',
    description:
      'A completion principle for supplying a useful missing part and compensating for it.',
    mathematicalIdea:
      'Complete a useful numerical or algebraic structure, then subtract or otherwise compensate for what was added.',
    whenToUse: 'A convenient round base or complete algebraic form is nearby.',
    whenNotToUse: 'When compensation is not explicit.',
    prerequisites: ['Place value', 'Algebraic identities'],
    example: {
      problem: '98 + 7',
      recognition: 'Complete 98 to 100.',
      steps: [
        'Add 2 to 98.',
        'Subtract the same 2 from 7: 5.',
        '100 + 5 = 105.',
      ],
      answer: '105',
    },
    commonMistakes: [
      'Forgetting compensation',
      'Choosing an inconvenient base',
    ],
    practiceGuidance: 'Complete to 10, 100, and nearby round values.',
    relatedSutras: ['sutra-02', 'sutra-10'],
    practiceTemplateType: 'COMPLETION_METHOD',
    difficulty: 'intermediate',
    icon: 'C',
  },
  {
    id: 'sutra-09',
    number: 9,
    name: 'Chalana-Kalanabhyam',
    aliases: ['Chalana Kalanabhyam'],
    meaning: 'Differential calculus',
    description:
      'A calculus-related name in the canonical list; concerns change and variation.',
    mathematicalIdea:
      'Concerns change and variation rather than a universal elementary arithmetic shortcut.',
    whenToUse:
      'A calculus or quadratic lesson supplies definitions, conditions, and a derivation.',
    whenNotToUse:
      'Do not reduce it to elementary multiplication without a sourced derivation.',
    prerequisites: ['Functions', 'Limits', 'Derivative rules'],
    example: {
      problem: "f(x) = x^2; find f'(x)",
      recognition: 'Use the power rule.',
      steps: [
        'Differentiate x^2.',
        'The result is 2x.',
        'At x = 3, the slope is 6.',
      ],
      answer: "f'(x) = 2x",
    },
    commonMistakes: [
      'Confusing function value and derivative',
      'Treating the name as an arithmetic rule',
    ],
    practiceGuidance:
      'Keep this as guided calculus and rate-of-change practice.',
    relatedSutras: [],
    practiceTemplateType: 'RATE_OF_CHANGE',
    difficulty: 'advanced',
    icon: 'd',
  },
  {
    id: 'sutra-10',
    number: 10,
    name: 'Yavadunam',
    aliases: ['Yavadunam'],
    meaning: 'Whatever the extent of the deficiency',
    description:
      'A deficiency-based principle for powers and calculations near a convenient base.',
    mathematicalIdea:
      'Use the deficiency from a base to form an adjusted leading part and correction.',
    whenToUse: 'Squares or cubes near 10, 100, or another suitable base.',
    whenNotToUse: 'When the base or correction is not convenient.',
    prerequisites: ['Complements', 'Powers', 'Place value'],
    example: {
      problem: '98^2',
      recognition: '98 is 2 below 100.',
      steps: [
        'Deficiency = 2.',
        '98 - 2 = 96.',
        '2^2 = 04.',
        '96 | 04 = 9604.',
      ],
      answer: '9604',
    },
    commonMistakes: ['Writing 4 instead of 04', 'Using the wrong base'],
    practiceGuidance: 'Compare deficiency and excess cases near 10 and 100.',
    relatedSutras: ['sutra-02', 'sutra-08'],
    practiceTemplateType: 'SQUARE_BASE_METHOD',
    difficulty: 'intermediate',
    icon: '2',
  },
  {
    id: 'sutra-11',
    number: 11,
    name: 'Vyashtisamanstih',
    aliases: ['Vyashti Samasti', 'Vyashtisamanstih'],
    meaning: 'Part and whole',
    description:
      'A part-and-whole principle for decomposing a quantity and recombining verified parts.',
    mathematicalIdea:
      'Split a whole into useful components, operate on each, then restore the whole.',
    whenToUse:
      'Decomposition, distributive calculations, or factorisation with clear parts.',
    whenNotToUse: 'When an arbitrary split adds work.',
    prerequisites: ['Distributive property', 'Factorisation'],
    example: {
      problem: '23 x 7',
      recognition: 'Split 23 into 20 + 3.',
      steps: ['20 x 7 = 140.', '3 x 7 = 21.', '140 + 21 = 161.'],
      answer: '161',
    },
    commonMistakes: ['Dropping a part', 'Using the wrong sign'],
    practiceGuidance:
      'Choose splits that produce round partial products and verify conventionally.',
    relatedSutras: ['sutra-03', 'sutra-15'],
    practiceTemplateType: 'PART_AND_WHOLE',
    difficulty: 'intermediate',
    icon: 'P',
  },
  {
    id: 'sutra-12',
    number: 12,
    name: 'Shesanyankena Charamena',
    aliases: ['Shesanyankena Charamena', 'Sesa Sutra'],
    meaning: 'The remainders by the last digit',
    description:
      'A remainder-oriented name used in suitable divisibility and quotient-remainder procedures.',
    mathematicalIdea:
      'Use a final digit or remainder relationship only when the divisor condition for the test is stated.',
    whenToUse:
      'A sourced remainder or divisibility exercise meets the required condition.',
    whenNotToUse:
      'Do not infer a remainder from the final digit for arbitrary divisors.',
    prerequisites: ['Division with remainder', 'Divisibility'],
    example: {
      problem: '17 divided by 5',
      recognition: 'Use quotient-remainder form.',
      steps: ['5 fits 3 times.', '3 x 5 = 15.', '17 - 15 = 2.'],
      answer: '3 remainder 2',
    },
    commonMistakes: [
      'Remainder at least the divisor',
      'Confusing final digit and remainder',
    ],
    practiceGuidance:
      'Start with explicit divisor checks before specialized digit tests.',
    relatedSutras: ['sutra-13'],
    practiceTemplateType: 'REMAINDER_METHOD',
    difficulty: 'advanced',
    icon: 'R',
  },
  {
    id: 'sutra-13',
    number: 13,
    name: 'Sopaantyadvayamantyam',
    aliases: ['Sopaantyadvayamantyam'],
    meaning: 'The ultimate and twice the penultimate',
    description:
      'A digit-pattern and coefficient principle used in selected divisibility and root checks.',
    mathematicalIdea:
      'Combine the last digit with twice the preceding digit only in the documented test.',
    whenToUse: 'A lesson states the exact divisor and condition for the test.',
    whenNotToUse: 'As a general remainder algorithm.',
    prerequisites: ['Place value', 'Divisibility'],
    example: {
      problem: 'Evaluate 2b + c for number 345',
      recognition: 'Penultimate digit b = 4, ultimate digit c = 5.',
      steps: [
        'Identify penultimate digit: 4.',
        'Multiply by 2: 2 * 4 = 8.',
        'Add ultimate digit: 8 + 5 = 13.',
      ],
      answer: '13',
    },
    commonMistakes: ['Using the wrong digit positions', 'Ignoring sign rules'],
    practiceGuidance:
      'Use condition-recognition exercises and digit weighting drills.',
    relatedSutras: ['sutra-12'],
    practiceTemplateType: 'PENULTIMATE_ULTIMATE',
    difficulty: 'advanced',
    icon: 'D',
  },
  {
    id: 'sutra-14',
    number: 14,
    name: 'Ekanyunena Purvena',
    aliases: ['Ekanyunena Purvena'],
    meaning: 'By one less than the previous one',
    description:
      'A one-less-than-previous principle used in multiplication by series of 9s.',
    mathematicalIdea:
      'Relate a number to a predecessor and a base complement, with explicit place-value handling.',
    whenToUse: 'Multiplying numbers by 9, 99, 999, etc.',
    whenNotToUse:
      'For arbitrary multiplication or as a replacement for Sutra 1.',
    prerequisites: ['Place value', 'Complements', 'Pattern recognition'],
    example: {
      problem: '43 x 99',
      recognition: 'Multiplier consists entirely of 9s.',
      steps: [
        'Subtract 1 from 43: 42.',
        'Subtract 43 from 100: 57.',
        'Combine: 42 | 57 = 4257.',
      ],
      answer: '4257',
    },
    commonMistakes: [
      'Using one more instead of one less',
      'Skipping complement verification',
    ],
    practiceGuidance: 'Use products with 99, 999, and 9999.',
    relatedSutras: ['sutra-01', 'sutra-02'],
    practiceTemplateType: 'SERIES_NINES_MULTIPLICATION',
    difficulty: 'advanced',
    icon: '-1',
  },
  {
    id: 'sutra-15',
    number: 15,
    name: 'Gunitasamuchayah',
    aliases: ['Gunitasamuchayah'],
    meaning: 'The product of the sum',
    description:
      'A factorisation and verification principle involving sums of terms and factors.',
    mathematicalIdea:
      'Compare products and sums as a check, then multiply factors back for proof.',
    whenToUse: 'Suitable polynomial factorisation and identity checks.',
    whenNotToUse: 'As a proof without expansion.',
    prerequisites: ['Polynomials', 'Factorisation'],
    example: {
      problem: 'Factor x^2 + 5x + 6',
      recognition: 'Find factors with product 6 and sum 5.',
      steps: [
        '2 x 3 = 6.',
        '2 + 3 = 5.',
        '(x + 2)(x + 3) expands to the original.',
      ],
      answer: '(x + 2)(x + 3)',
    },
    commonMistakes: ['Matching only the sum', 'Not expanding'],
    practiceGuidance:
      'Practice factor pairs and verify every result by expansion.',
    relatedSutras: ['sutra-11', 'sutra-16'],
    practiceTemplateType: 'FACTOR_QUADRATIC',
    difficulty: 'advanced',
    icon: 'S',
  },
  {
    id: 'sutra-16',
    number: 16,
    name: 'Gunakasamuchayah',
    aliases: ['Gunaka Samuchaya', 'Gunakasamuchayah'],
    meaning: 'The factors of the sum',
    description:
      'A factor-and-sum principle used in algebraic verification and factorisation settings.',
    mathematicalIdea:
      'Use relationships among factors and sums as a check on a constructed identity.',
    whenToUse: 'A documented algebraic identity can be independently checked.',
    whenNotToUse: 'As a substitute for multiplying factors back.',
    prerequisites: ['Algebraic expressions', 'Factorisation', 'Verification'],
    example: {
      problem: 'Factor x^2 + 7x + 12',
      recognition: 'Find factor pair 3 and 4.',
      steps: [
        '3 x 4 = 12.',
        '3 + 4 = 7.',
        '(x + 3)(x + 4) expands to the original.',
      ],
      answer: '(x + 3)(x + 4)',
    },
    commonMistakes: [
      'Choosing the wrong factor pair',
      'Ignoring negative pairs',
    ],
    practiceGuidance: 'Use factor-pair tables and expansion checks.',
    relatedSutras: ['sutra-11', 'sutra-15'],
    practiceTemplateType: 'FACTOR_QUADRATIC',
    difficulty: 'advanced',
    icon: 'F',
  },
];
