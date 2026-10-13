import { PracticeDifficulty } from './practice-difficulty.service';
import { SutraQuestionResult } from './sutra-question-generators';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 1. CONCEPT CHECK GENERATORS
export function generateConceptCheckQuestion(
  sutraId: string,
): SutraQuestionResult {
  switch (sutraId) {
    case 'sutra-01':
      return {
        question:
          "What is the foundational meaning of the Sanskrit Sutra 'Ekadhikena Purvena'?",
        correctAnswer: 'By one more than the previous one',
        options: [
          'By one more than the previous one',
          'All from 9 and last from 10',
          'Vertically and crosswise',
          'Transpose and apply',
        ],
        explanationSteps: [
          "'Eka' = One, 'Adhika' = More, 'Purvena' = By the previous.",
          'It prescribes adding 1 to the preceding portion when computing squares ending in 5 or products where units sum to 10.',
        ],
        technique: 'Sutra Conceptualization',
        sutraName: 'Ekadhikena Purvena',
        questionType: 'CONCEPT_CHECK',
        cognitiveCategory: 'FOUNDATION',
      };

    case 'sutra-02':
      return {
        question:
          "In 'Nikhilam Navatashcaramam Dashatah', what does the phrase 'Navatashcaramam Dashatah' literally dictate?",
        correctAnswer: 'All from 9 and the last from 10',
        options: [
          'All from 9 and the last from 10',
          'All numbers equal to zero',
          'Multiply vertically and crosswise',
          'Sum of the factors',
        ],
        explanationSteps: [
          "'Nikhilam' = All, 'Navatas' = from 9, 'Charamam' = the last, 'Dashatas' = from 10.",
          'This provides the complementary algorithm for base multiplication and mental subtraction.',
        ],
        technique: 'Base Complements & Principles',
        sutraName: 'Nikhilam Navatashcaramam Dashatah',
        questionType: 'CONCEPT_CHECK',
        cognitiveCategory: 'FOUNDATION',
      };

    case 'sutra-03':
      return {
        question:
          "What general arithmetic algorithm does 'Urdhva-Tiryagbhyam' translate to?",
        correctAnswer: 'Vertically and crosswise',
        options: [
          'Vertically and crosswise',
          'By one less than previous',
          'If one is in ratio, the other is zero',
          'By addition and subtraction',
        ],
        explanationSteps: [
          "'Urdhva' = Vertically, 'Tiryagbhyam' = Crosswise.",
          'It represents the universal multiplication schema applicable to numbers of any base or length.',
        ],
        technique: 'Universal Multiplication',
        sutraName: 'Urdhva-Tiryagbhyam',
        questionType: 'CONCEPT_CHECK',
        cognitiveCategory: 'FOUNDATION',
      };

    case 'sutra-04':
      return {
        question:
          "In 'Paravartya Yojayet', what rule does 'Paravartya' prescribe when transposing algebraic or arithmetic terms?",
        correctAnswer: 'Change sign and apply',
        options: [
          'Change sign and apply',
          'Double the digits',
          'Square both sides',
          'Divide by the base',
        ],
        explanationSteps: [
          "'Paravartya' = Transpose / Invert, 'Yojayet' = Apply / Join.",
          'When terms cross the equality or in synthetic division, their signs invert.',
        ],
        technique: 'Transposition & Division',
        sutraName: 'Paravartya Yojayet',
        questionType: 'CONCEPT_CHECK',
        cognitiveCategory: 'FOUNDATION',
      };

    case 'sutra-05':
      return {
        question:
          "What does 'Shunyam Saamyasamuccaye' assert when symmetric algebraic expressions or common factors equate?",
        correctAnswer: 'The common collection is equated to zero',
        options: [
          'The common collection is equated to zero',
          'The roots are imaginary',
          'The product equals one',
          'The ratio is constant',
        ],
        explanationSteps: [
          "'Shunyam' = Zero, 'Saamya' = Equality/Balance, 'Samuccaye' = In the collection.",
          'When sums of roots or independent terms balance on both sides, the unknown factor is zero.',
        ],
        technique: 'Symmetric Equation Solving',
        sutraName: 'Shunyam Saamyasamuccaye',
        questionType: 'CONCEPT_CHECK',
        cognitiveCategory: 'FOUNDATION',
      };

    case 'sutra-06':
      return {
        question:
          "Under '(Anurupye) Shunyamanyat', if one variable is in the same ratio as the independent constants, what is the other variable?",
        correctAnswer: '0',
        options: ['0', '1', 'Infinity', 'Undetermined'],
        explanationSteps: [
          "'(Anurupye) Shunyamanyat' translates to: 'If one is in ratio, the other is zero.'",
          'In linear systems a1/a2 = c1/c2, the other variable y must equal zero.',
        ],
        technique: 'Proportional Elimination',
        sutraName: '(Anurupye) Shunyamanyat',
        questionType: 'CONCEPT_CHECK',
        cognitiveCategory: 'FOUNDATION',
      };

    case 'sutra-07':
      return {
        question:
          "What paired mathematical operations are performed alternately in 'Sankalana-Vyavakalanabhyam'?",
        correctAnswer: 'Addition and Subtraction',
        options: [
          'Addition and Subtraction',
          'Multiplication and Division',
          'Squaring and Root Extraction',
          'Factorization and Integration',
        ],
        explanationSteps: [
          "'Sankalana' = Addition, 'Vyavakalana' = Subtraction.",
          'Used for symmetric simultaneous equations (ax + by = c and bx + ay = d) by alternating sum and difference.',
        ],
        technique: 'Symmetric Linear Systems',
        sutraName: 'Sankalana-Vyavakalanabhyam',
        questionType: 'CONCEPT_CHECK',
        cognitiveCategory: 'FOUNDATION',
      };

    case 'sutra-08':
      return {
        question: "What algebraic strategy is codified by 'Puranapuranabhyam'?",
        correctAnswer: 'By the completion or non-completion',
        options: [
          'By the completion or non-completion',
          'By vertical cross-multiplication',
          'By differential slopes',
          'By reciprocal fractions',
        ],
        explanationSteps: [
          "'Purana' = Completion (such as completing the square).",
          'This sutra resolves second-degree polynomials by making one side a perfect square.',
        ],
        technique: 'Completing the Square',
        sutraName: 'Puranapuranabhyam',
        questionType: 'CONCEPT_CHECK',
        cognitiveCategory: 'FOUNDATION',
      };

    case 'sutra-09':
      return {
        question:
          "What modern branches of mathematics directly correlate with 'Chalana-Kalanabhyam'?",
        correctAnswer: 'Calculus (Differential and Integral)',
        options: [
          'Calculus (Differential and Integral)',
          'Matrix Algebra',
          'Set Theory',
          'Graph Theory',
        ],
        explanationSteps: [
          "'Chalana' = Motion/Change (Differential), 'Kalana' = Accumulation/Measure (Integral).",
          'Used for locating local extrema, turning points, and rates of change.',
        ],
        technique: 'Vedic Calculus & Turning Points',
        sutraName: 'Chalana-Kalanabhyam',
        questionType: 'CONCEPT_CHECK',
        cognitiveCategory: 'FOUNDATION',
      };

    case 'sutra-10':
      return {
        question:
          "Complete the classical aphorism: 'Yavadunam Tavadunikritya...'?",
        correctAnswer: 'Vargancha Yojayet',
        options: [
          'Vargancha Yojayet',
          'Shunyam Saamyasamuccaye',
          'Navatashcaramam Dashatah',
          'Paravartya Yojayet',
        ],
        explanationSteps: [
          'Full Sutra: Yavadunam Tavadunikritya Vargancha Yojayet.',
          'Meaning: Whatever the extent of its deficiency, lessen it by that much and set up the square of the deficiency.',
        ],
        technique: 'Deficiency Squaring & Cubing',
        sutraName: 'Yavadunam',
        questionType: 'CONCEPT_CHECK',
        cognitiveCategory: 'FOUNDATION',
      };

    case 'sutra-11':
      return {
        question:
          "What dual mathematical relationship is expressed by 'Vyashtisamanstih'?",
        correctAnswer: 'Part and Whole',
        options: [
          'Part and Whole',
          'Zero and Infinity',
          'Root and Exponent',
          'Sine and Cosine',
        ],
        explanationSteps: [
          "'Vyashti' = Individual / Part, 'Samashti' = Collective / Whole.",
          'Used to decompose composite polynomials or aggregate systems into atomic factors.',
        ],
        technique: 'Decomposition & Synthesis',
        sutraName: 'Vyashtisamanstih',
        questionType: 'CONCEPT_CHECK',
        cognitiveCategory: 'FOUNDATION',
      };

    case 'sutra-12':
      return {
        question:
          "For converting fractions like 1/7 or 1/19 into recurring decimals, what does 'Shesanyankena Charamena' utilize?",
        correctAnswer: 'The remainders by the last digit',
        options: [
          'The remainders by the last digit',
          'The greatest common divisor',
          'The binomial theorem',
          'Logarithmic tables',
        ],
        explanationSteps: [
          "'Shesany' = Remainders, 'Ankena' = by the digit, 'Charamena' = by the last.",
          'Calculates repeating decimal digits by tracking cyclic remainders.',
        ],
        technique: 'Cyclic Decimal Expansion',
        sutraName: 'Shesanyankena Charamena',
        questionType: 'CONCEPT_CHECK',
        cognitiveCategory: 'FOUNDATION',
      };

    case 'sutra-13':
      return {
        question:
          "In 'Sopaantyadvayamantyam', what do 'Sopaantya' and 'Antya' refer to?",
        correctAnswer: 'The ultimate and twice the penultimate',
        options: [
          'The ultimate and twice the penultimate',
          'The first and middle terms',
          'The positive and negative roots',
          'The numerator and denominator',
        ],
        explanationSteps: [
          "'Antya' = Ultimate (last), 'Sopaantya' = Penultimate (next to last).",
          'Used in special symmetric cubic and rational reductions.',
        ],
        technique: 'Penultimate-Ultimate Balancing',
        sutraName: 'Sopaantyadvayamantyam',
        questionType: 'CONCEPT_CHECK',
        cognitiveCategory: 'FOUNDATION',
      };

    case 'sutra-14':
      return {
        question: "What does 'Ekanyunena Purvena' translate to?",
        correctAnswer: 'By one less than the previous one',
        options: [
          'By one less than the previous one',
          'By one more than the previous one',
          'Vertically and crosswise',
          'All from 9 and last from 10',
        ],
        explanationSteps: [
          "'Eka' = One, 'Nyuna' = Less, 'Purvena' = by previous.",
          'Specifically used for multiplying arbitrary integers by strings of 9s (9, 99, 999...).',
        ],
        technique: 'Multiplication by 9s',
        sutraName: 'Ekanyunena Purvena',
        questionType: 'CONCEPT_CHECK',
        cognitiveCategory: 'FOUNDATION',
      };

    case 'sutra-15':
      return {
        question:
          "In factorization verification, what does 'Gunitasamuchayah' equate?",
        correctAnswer:
          'The product of the sum of coefficients equals the sum of coefficients of the product',
        options: [
          'The product of the sum of coefficients equals the sum of coefficients of the product',
          'The sum of squares equals the square of the sum',
          'The discriminant equals the product of roots',
          'The derivative of the sum is zero',
        ],
        explanationSteps: [
          "'Gunita' = Product, 'Samuchayah' = Sum of coefficients.",
          'Rule: Sc = Sp. If P(x) = Q(x)R(x), then P(1) = Q(1) × R(1).',
        ],
        technique: 'Algebraic Factor Checking',
        sutraName: 'Gunitasamuchayah',
        questionType: 'CONCEPT_CHECK',
        cognitiveCategory: 'FOUNDATION',
      };

    case 'sutra-16':
    default:
      return {
        question: "What algebraic mechanism is codified by 'Gunakasamuchayah'?",
        correctAnswer:
          'The factors of the sum are equal to the sum of the factors',
        options: [
          'The factors of the sum are equal to the sum of the factors',
          'Every number has unique prime factors',
          'Matrix determinants are multiplicative',
          'The reciprocal of a sum is the sum of reciprocals',
        ],
        explanationSteps: [
          "'Gunaka' = Multiplier/Factor, 'Samuchayah' = Sum/Collection.",
          'Used to extract common binomial or linear factors from polynomial aggregations.',
        ],
        technique: 'Factorization of Polynomials',
        sutraName: 'Gunakasamuchayah',
        questionType: 'CONCEPT_CHECK',
        cognitiveCategory: 'FOUNDATION',
      };
  }
}

// 2. TECHNIQUE SELECTION GENERATORS
export function generateTechniqueSelectionQuestion(
  sutraId: string,
): SutraQuestionResult {
  switch (sutraId) {
    case 'sutra-01':
      return {
        question:
          'Which Vedic Sutra is most suitable for calculating 85² in a single mental step?',
        correctAnswer: 'Ekadhikena Purvena',
        options: [
          'Ekadhikena Purvena',
          'Paravartya Yojayet',
          'Shesanyankena Charamena',
          'Ekanyunena Purvena',
        ],
        explanationSteps: [
          '85 ends in 5, fitting the exact condition of Ekadhikena Purvena.',
          'Preceding digit 8 is multiplied by (8 + 1) = 72, and 25 is appended: 7225.',
        ],
        technique: 'Technique Identification',
        sutraName: 'Ekadhikena Purvena',
        questionType: 'TECHNIQUE_SELECTION',
        cognitiveCategory: 'COGNITIVE_SELECTION',
      };

    case 'sutra-02':
      return {
        question:
          'Which Vedic Sutra provides the optimal base-method shortcut to multiply 996 × 994?',
        correctAnswer: 'Nikhilam Navatashcaramam Dashatah',
        options: [
          'Nikhilam Navatashcaramam Dashatah',
          'Ekanyunena Purvena',
          'Puranapuranabhyam',
          'Chalana-Kalanabhyam',
        ],
        explanationSteps: [
          'Both 996 and 994 are close to base 1000 with deficiencies -4 and -6.',
          'Nikhilam Navatashcaramam Dashatah calculates cross-subtraction and deficiency product.',
        ],
        technique: 'Technique Identification',
        sutraName: 'Nikhilam Navatashcaramam Dashatah',
        questionType: 'TECHNIQUE_SELECTION',
        cognitiveCategory: 'COGNITIVE_SELECTION',
      };

    case 'sutra-03':
      return {
        question:
          'To multiply two arbitrary 3-digit numbers like 432 × 567 without base proximity, which universal Sutra is required?',
        correctAnswer: 'Urdhva-Tiryagbhyam',
        options: [
          'Urdhva-Tiryagbhyam',
          'Ekadhikena Purvena',
          'Yavadunam',
          'Shunyam Saamyasamuccaye',
        ],
        explanationSteps: [
          'Urdhva-Tiryagbhyam (Vertically and Crosswise) operates universally across any digits regardless of base.',
        ],
        technique: 'Technique Identification',
        sutraName: 'Urdhva-Tiryagbhyam',
        questionType: 'TECHNIQUE_SELECTION',
        cognitiveCategory: 'COGNITIVE_SELECTION',
      };

    case 'sutra-14':
      return {
        question:
          'Which Sutra calculates 654 × 999 instantaneously by subtracting 1 from the multiplicand and taking the complement?',
        correctAnswer: 'Ekanyunena Purvena',
        options: [
          'Ekanyunena Purvena',
          'Ekadhikena Purvena',
          'Urdhva-Tiryagbhyam',
          'Gunakasamuchayah',
        ],
        explanationSteps: [
          'Multiplying by strings of 9s is the specific domain of Ekanyunena Purvena (654 - 1 = 653, 999 - 653 = 346 -> 653346).',
        ],
        technique: 'Technique Identification',
        sutraName: 'Ekanyunena Purvena',
        questionType: 'TECHNIQUE_SELECTION',
        cognitiveCategory: 'COGNITIVE_SELECTION',
      };

    default:
      return {
        question: `Which Vedic Sutra corresponds to the technique '${sutraId}' in mental mathematics?`,
        correctAnswer: 'Vedic Method',
        options: [
          'Vedic Method',
          'Synthetic Division',
          'Trial and Error',
          'Long Division',
        ],
        explanationSteps: [
          'The problem maps directly to the governing aphorism of this Vedic module.',
        ],
        technique: 'Technique Identification',
        sutraName: 'Vedic Principles',
        questionType: 'TECHNIQUE_SELECTION',
        cognitiveCategory: 'COGNITIVE_SELECTION',
      };
  }
}

// 3. ERROR ANALYSIS GENERATORS
export function generateErrorAnalysisQuestion(
  sutraId: string,
  _difficulty: PracticeDifficulty,
): SutraQuestionResult {
  void _difficulty;
  switch (sutraId) {
    case 'sutra-01': {
      const d = pickRandom([6, 7, 8, 9]);
      const n = d * 10 + 5;
      const correctAns = n * n;
      const wrongPart = d * d;
      return {
        question: `A student calculated ${n}² using Ekadhikena Purvena by computing ${d} × ${d} = ${wrongPart} and appending 25, giving ${wrongPart}25. They forgot to multiply by 'one more than the previous'. What is the CORRECT value of ${n}²?`,
        correctAnswer: String(correctAns),
        explanationSteps: [
          `Mistake identified: The student squared the preceding digit (${d} × ${d}) instead of using Ekadhikena (${d} × ${d + 1}).`,
          `Correct left part: ${d} × ${d + 1} = ${d * (d + 1)}.`,
          `Append 25: ${correctAns}.`,
        ],
        technique: 'Error Correction',
        sutraName: 'Ekadhikena Purvena',
        questionType: 'ERROR_ANALYSIS',
        cognitiveCategory: 'CRITICAL_ANALYSIS',
        visual: {
          type: 'error_analysis',
          studentAnswer: `${wrongPart}25`,
          correctAnswer: correctAns,
          mistakeType: 'FORGOT_EKADHIKENA_ONE_MORE',
        },
      };
    }

    case 'sutra-02': {
      const a = 98;
      const b = 97;
      const correctAns = a * b; // 9506
      return {
        question: `A student multiplied 98 × 97 using Nikhilam base 100 with deviations -2 and -3. Left part = 98 - 3 = 95. Right part = (-2) × (-3) = 6. The student wrote 956 because they forgot the 2-digit zero-padding for base 100. What is the CORRECT product?`,
        correctAnswer: String(correctAns),
        explanationSteps: [
          'Mistake identified: Base 100 has 2 zeros, so the right-hand column MUST occupy exactly 2 digits.',
          'Right part: (-2) × (-3) = 6 -> pad with zero to make 06.',
          `Left part = 95. Combined: ${correctAns}.`,
        ],
        technique: 'Zero-Padding Trap Correction',
        sutraName: 'Nikhilam Navatashcaramam Dashatah',
        questionType: 'ERROR_ANALYSIS',
        cognitiveCategory: 'CRITICAL_ANALYSIS',
        visual: {
          type: 'error_analysis',
          studentAnswer: '956',
          correctAnswer: correctAns,
          mistakeType: 'MISSING_ZERO_PADDING',
        },
      };
    }

    case 'sutra-03': {
      return {
        question: `A student calculated 24 × 13 using Urdhva-Tiryagbhyam: right = 4×3 = 12 (they wrote 2 and forgot carry 1), cross = 2×3 + 4×1 = 10, left = 2×1 = 2, writing 2102. What is the CORRECT product of 24 × 13?`,
        correctAnswer: '312',
        explanationSteps: [
          'Mistake identified: Forgotten carries across step boundaries.',
          'Right: 4 × 3 = 12 (write 2, carry 1).',
          'Cross: 2 × 3 + 4 × 1 + 1 (carry) = 11 (write 1, carry 1).',
          'Left: 2 × 1 + 1 (carry) = 3.',
          'Correct answer = 312.',
        ],
        technique: 'Carry Propagation Correction',
        sutraName: 'Urdhva-Tiryagbhyam',
        questionType: 'ERROR_ANALYSIS',
        cognitiveCategory: 'CRITICAL_ANALYSIS',
      };
    }

    case 'sutra-04': {
      return {
        question: `A student solved the equation 4x + 20 = 0 using Paravartya Yojayet. When transposing 20, they kept the positive sign, concluding x = 20 / 4 = 5. What is the CORRECT value of x?`,
        correctAnswer: '-5',
        explanationSteps: [
          'Mistake identified: Failure to invert sign upon transposition (Paravartya).',
          'Transposing +20 yields -20.',
          'x = -20 / 4 = -5.',
        ],
        technique: 'Transposition Sign Inversion',
        sutraName: 'Paravartya Yojayet',
        questionType: 'ERROR_ANALYSIS',
        cognitiveCategory: 'CRITICAL_ANALYSIS',
      };
    }

    case 'sutra-14': {
      return {
        question: `A student calculated 73 × 99 using Ekanyunena Purvena. Left: 73 - 1 = 72. For the right part, they took 99 - 73 = 26 instead of subtracting the reduced number 72, getting 7226. What is the CORRECT product of 73 × 99?`,
        correctAnswer: '7227',
        explanationSteps: [
          'Mistake identified: The student subtracted the original number instead of the reduced number (73 - 1 = 72).',
          'Right part: 99 - 72 = 27.',
          'Correct product: 7227.',
        ],
        technique: 'Ekanyunena Complement Correction',
        sutraName: 'Ekanyunena Purvena',
        questionType: 'ERROR_ANALYSIS',
        cognitiveCategory: 'CRITICAL_ANALYSIS',
      };
    }

    default: {
      const a = randInt(12, 19);
      const b = 11;
      const ans = a * b;
      return {
        question: `A student multiplied ${a} × 11 by simply adding 1 to ${a} to get ${a + 1}. What is the CORRECT product of ${a} × 11?`,
        correctAnswer: String(ans),
        explanationSteps: [
          `Split ${a} and insert sum of digits in the middle.`,
          `Correct result: ${ans}.`,
        ],
        technique: 'Error Correction',
        sutraName: 'Vedic Mathematics',
        questionType: 'ERROR_ANALYSIS',
        cognitiveCategory: 'CRITICAL_ANALYSIS',
      };
    }
  }
}

// 4. REVERSE PROBLEM GENERATORS
export function generateReverseProblemQuestion(
  sutraId: string,
  _difficulty: PracticeDifficulty,
): SutraQuestionResult {
  void _difficulty;
  switch (sutraId) {
    case 'sutra-01': {
      const d = pickRandom([4, 5, 6, 7, 8, 9]);
      const n = d * 10 + 5;
      const sq = n * n;
      return {
        question: `A positive two-digit number N ends in 5. If N² = ${sq}, determine N using the inverse of Ekadhikena Purvena.`,
        correctAnswer: String(n),
        explanationSteps: [
          `Observe the last two digits of ${sq} are 25, confirming N ends in 5.`,
          `The leading portion is ${d * (d + 1)}.`,
          `Solve d(d + 1) = ${d * (d + 1)} -> d = ${d}.`,
          `Therefore, N = ${n}.`,
        ],
        technique: 'Reverse Squaring',
        sutraName: 'Ekadhikena Purvena',
        questionType: 'REVERSE_PROBLEM',
        cognitiveCategory: 'REVERSE_REASONING',
      };
    }

    case 'sutra-02': {
      return {
        question: `In Nikhilam base 100 multiplication, multiplying 96 by an unknown integer X yields a product whose left part is 91. What is the value of X?`,
        correctAnswer: '95',
        explanationSteps: [
          'Base = 100. Deviation of 96 is -4.',
          'Left part formula: 96 + dev(X) = 91 -> dev(X) = 91 - 96 = -5.',
          'Therefore, X = 100 + (-5) = 95.',
        ],
        technique: 'Reverse Base Deviation',
        sutraName: 'Nikhilam Navatashcaramam Dashatah',
        questionType: 'REVERSE_PROBLEM',
        cognitiveCategory: 'REVERSE_REASONING',
      };
    }

    case 'sutra-10': {
      const dev = pickRandom([2, 3, 4, 5]);
      const n = 100 - dev;
      return {
        question: `Using Yavadunam, the square of a number close to 100 has deficiency square ${dev * dev} and left part ${n - dev}. What is the original number?`,
        correctAnswer: String(n),
        explanationSteps: [
          `Deficiency squared is ${dev * dev}, so the deficiency is ${dev}.`,
          `Original number is 100 - ${dev} = ${n}.`,
        ],
        technique: 'Reverse Deficiency Analysis',
        sutraName: 'Yavadunam',
        questionType: 'REVERSE_PROBLEM',
        cognitiveCategory: 'REVERSE_REASONING',
      };
    }

    default: {
      const root = randInt(11, 25);
      const sq = root * root;
      return {
        question: `If the square of an integer N is ${sq}, find N using Vedic square root principles.`,
        correctAnswer: String(root),
        explanationSteps: [
          `Inspect the units digit of ${sq} and the nearest square to the leading group.`,
          `Result: N = ${root}.`,
        ],
        technique: 'Reverse Root Finding',
        sutraName: 'Vedic Extraction',
        questionType: 'REVERSE_PROBLEM',
        cognitiveCategory: 'REVERSE_REASONING',
      };
    }
  }
}

// 5. WORD PROBLEM GENERATORS
export function generateWordProblemQuestion(
  sutraId: string,
  _difficulty: PracticeDifficulty,
): SutraQuestionResult {
  void _difficulty;
  switch (sutraId) {
    case 'sutra-01': {
      const d = pickRandom([5, 6, 7, 8]);
      const side = d * 10 + 5;
      const area = side * side;
      return {
        question: `A square architectural pavilion has a side length of ${side} meters. Using Ekadhikena Purvena, calculate its exact floor area in square meters.`,
        correctAnswer: String(area),
        explanationSteps: [
          `Formulate: Area = side² = ${side}².`,
          `Apply Ekadhikena Purvena: preceding part is ${d}.`,
          `Left part = ${d} × ${d + 1} = ${d * (d + 1)}.`,
          `Append 25: ${area} m².`,
        ],
        technique: 'Applied Geometric Squaring',
        sutraName: 'Ekadhikena Purvena',
        questionType: 'WORD_PROBLEM',
        cognitiveCategory: 'APPLICATION',
      };
    }

    case 'sutra-02': {
      const price = 98;
      const quantity = 97;
      const total = price * quantity;
      return {
        question: `A handicrafts cooperative in Jaipur purchases ${quantity} handloom textile sets at ₹${price} each. Using Nikhilam base 100 multiplication, calculate the total purchase cost in Indian Rupees (₹).`,
        correctAnswer: String(total),
        explanationSteps: [
          `Base 100 deviations: ${price} (-2) and ${quantity} (-3).`,
          `Left part: ${price} - 3 = 95.`,
          `Right part: (-2) × (-3) = 06 (padded to 2 digits).`,
          `Total: ₹${total}.`,
        ],
        technique: 'Applied Commercial Multiplication',
        sutraName: 'Nikhilam Navatashcaramam Dashatah',
        questionType: 'WORD_PROBLEM',
        cognitiveCategory: 'APPLICATION',
      };
    }

    case 'sutra-03': {
      const rate = 32;
      const hours = 24;
      const total = rate * hours;
      return {
        question: `A solar irrigation pump in Maharashtra pumps ${rate} kilolitres of water per hour and operates continuously for ${hours} hours during the sowing season. Using Urdhva-Tiryagbhyam, compute the total water pumped in kilolitres.`,
        correctAnswer: String(total),
        explanationSteps: [
          `Multiply 32 × 24 vertically and crosswise:`,
          `1. Units: 2 × 4 = 8.`,
          `2. Cross: 3 × 4 + 2 × 2 = 12 + 4 = 16 (write 6, carry 1).`,
          `3. Tens: 3 × 2 + 1 = 7.`,
          `Total = ${total} kL.`,
        ],
        technique: 'Applied Universal Multiplication',
        sutraName: 'Urdhva-Tiryagbhyam',
        questionType: 'WORD_PROBLEM',
        cognitiveCategory: 'APPLICATION',
      };
    }

    default: {
      const items = randInt(15, 35);
      const cost = 11;
      const total = items * cost;
      return {
        question: `A school mathematics club in Bengaluru ordered ${items} Vedic math workbooks at ₹${cost} each. Using Vedic mental multiplication, what is the total cost in Indian Rupees (₹)?`,
        correctAnswer: String(total),
        explanationSteps: [
          `Multiply ${items} by 11: split digits ${items} and insert their sum.`,
          `Total cost: ₹${total}.`,
        ],
        technique: 'Applied Mental Math',
        sutraName: 'Vedic Math Application',
        questionType: 'WORD_PROBLEM',
        cognitiveCategory: 'APPLICATION',
      };
    }
  }
}
