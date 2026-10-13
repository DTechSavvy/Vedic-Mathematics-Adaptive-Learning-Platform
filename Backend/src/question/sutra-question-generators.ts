import { PracticeDifficulty } from './practice-difficulty.service';
import {
  generateConceptCheckQuestion,
  generateTechniqueSelectionQuestion,
  generateErrorAnalysisQuestion,
  generateReverseProblemQuestion,
  generateWordProblemQuestion,
} from './sutra-specialized-generators';

export interface PedagogicalStep {
  stepNumber: number;
  title: string;
  explanation: string;
  mathExpression?: string;
  subSutraRule?: string;
  commonPitfall?: string;
}

export interface SutraQuestionResult {
  question: string;
  correctAnswer: string;
  explanationSteps: string[];
  pedagogicalSteps?: PedagogicalStep[];
  technique: string;
  sutraName: string;
  questionType: string;
  cognitiveCategory?: string;
  options?: string[];
  visual?: Record<string, unknown>;
}

export const SUTRA_AVAILABLE_QUESTION_TYPES = [
  {
    id: 'CALCULATION',
    label: 'Calculation',
    description: 'Step-by-step arithmetic application',
  },
  {
    id: 'TECHNIQUE_SELECTION',
    label: 'Technique Selection',
    description: 'Identify the governing Sutra for the pattern',
  },
  {
    id: 'REVERSE_PROBLEM',
    label: 'Reverse Problem',
    description: 'Determine inputs from products or roots',
  },
  {
    id: 'ERROR_ANALYSIS',
    label: 'Error Analysis',
    description: 'Spot and correct subtle Vedic calculation traps',
  },
  {
    id: 'WORD_PROBLEM',
    label: 'Word Problem',
    description: 'Applied real-world problem solving',
  },
  {
    id: 'CONCEPT_CHECK',
    label: 'Concept Check',
    description: 'Test core Sutra principles and constraints',
  },
];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateSutraQuestionContent(
  sutraId: string,
  difficulty: PracticeDifficulty = 'EASY',
  requestedType?: string,
): SutraQuestionResult {
  if (requestedType === 'CONCEPT_CHECK') {
    return generateConceptCheckQuestion(sutraId);
  }
  if (requestedType === 'TECHNIQUE_SELECTION') {
    return generateTechniqueSelectionQuestion(sutraId);
  }
  if (requestedType === 'ERROR_ANALYSIS') {
    return generateErrorAnalysisQuestion(sutraId, difficulty);
  }
  if (requestedType === 'REVERSE_PROBLEM') {
    return generateReverseProblemQuestion(sutraId, difficulty);
  }
  if (requestedType === 'WORD_PROBLEM') {
    return generateWordProblemQuestion(sutraId, difficulty);
  }

  switch (sutraId) {
    // 1. Ekadhikena Purvena
    case 'sutra-01': {
      const sutraName = 'Ekadhikena Purvena';
      const technique = 'Squaring Ending in 5 & Proportional Products';

      if (difficulty === 'EASY') {
        const d = pickRandom([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        const n = d * 10 + 5;
        const ans = n * n;
        return {
          question: `Calculate ${n}² using Ekadhikena Purvena`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Identify the preceding digits before 5: ${d}.`,
            `Multiply ${d} by 'one more than previous': ${d} × ${d + 1} = ${d * (d + 1)}.`,
            `Append 25 to the product: ${d * (d + 1)} | 25 = ${ans}.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
          visual: {
            type: 'square_ending_five',
            baseNumber: n,
            precedingPart: d,
            answer: ans,
          },
        };
      } else if (difficulty === 'MEDIUM') {
        const d = pickRandom([3, 4, 5, 6, 7, 8]);
        const u1 = pickRandom([1, 2, 3, 4]);
        const u2 = 10 - u1;
        const a = d * 10 + u1;
        const b = d * 10 + u2;
        const ans = a * b;
        return {
          question: `Calculate ${a} × ${b} using Ekadhikena Purvena (units sum to 10)`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Verify rule conditions: leading digits match (${d}) and unit digits sum to 10 (${u1} + ${u2} = 10).`,
            `Multiply leading digit by one more: ${d} × ${d + 1} = ${d * (d + 1)}.`,
            `Multiply units digits: ${u1} × ${u2} = ${String(u1 * u2).padStart(2, '0')}.`,
            `Combine: ${d * (d + 1)}${String(u1 * u2).padStart(2, '0')} = ${ans}.`,
          ],
          technique,
          sutraName,
          questionType: 'MULTI_STEP_CALCULATION',
        };
      } else if (difficulty === 'ADVANCED') {
        const d = pickRandom([4, 6, 7, 8, 9]);
        const n = d * 10 + 5;
        const sq = n * n;
        return {
          question: `A positive number N ends in 5. If N² = ${sq}, find N using Ekadhikena Purvena`,
          correctAnswer: String(n),
          explanationSteps: [
            `The last two digits of ${sq} are 25, confirming the number ends in 5.`,
            `The leading part is ${d * (d + 1)}, which must equal d × (d + 1).`,
            `Notice ${d} × ${d + 1} = ${d * (d + 1)}, so the preceding digit is ${d}.`,
            `Therefore, the original number N is ${n}.`,
          ],
          technique,
          sutraName,
          questionType: 'REVERSE_PROBLEM',
        };
      } else {
        // EXPERT
        const d = pickRandom([6, 7, 8, 9]);
        const side = d * 10 + 5;
        const area = side * side;
        return {
          question: `A square solar power park has a side length of ${side} meters. Using Ekadhikena Purvena, calculate its total area in square meters.`,
          correctAnswer: String(area),
          explanationSteps: [
            `Formulate the problem: Area of a square = side² = ${side}².`,
            `Apply Ekadhikena Purvena to ${side}: preceding part is ${d}.`,
            `Compute left part: ${d} × ${d + 1} = ${d * (d + 1)}.`,
            `Append 25: ${area}.`,
            `The solar park area is ${area} square meters.`,
          ],
          technique,
          sutraName,
          questionType: 'WORD_PROBLEM',
        };
      }
    }

    // 2. Nikhilam Navatashcaramam Dashatah
    case 'sutra-02': {
      const sutraName = 'Nikhilam Navatashcaramam Dashatah';
      const technique = 'Base Complements & Multiplication';

      if (difficulty === 'EASY') {
        const n = randInt(105, 895);
        const ans = 1000 - n;
        return {
          question: `Find the complement of ${n} from base 1000 (1000 - ${n}) using Nikhilam`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Apply 'All from 9 and the last from 10' to ${n}:`,
            `Subtract leading digits from 9 and the final digit from 10.`,
            `1000 - ${n} = ${ans}.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'MEDIUM') {
        const a = randInt(92, 98);
        const b = randInt(91, 97);
        const devA = a - 100;
        const devB = b - 100;
        const left = a + devB;
        const right = devA * devB;
        const ans = a * b;
        return {
          question: `Calculate ${a} × ${b} using Nikhilam base-100 multiplication`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Base = 100. Deficiencies: ${devA} and ${devB}.`,
            `Cross-subtract: ${a} + (${devB}) = ${left}.`,
            `Multiply deficiencies: (${devA}) × (${devB}) = ${String(right).padStart(2, '0')}.`,
            `Combine: ${ans}.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'ADVANCED') {
        const a = randInt(103, 108);
        const b = randInt(93, 97);
        const devA = a - 100;
        const devB = b - 100;
        const left = a + devB;
        const negRight = Math.abs(devA * devB);
        const ans = a * b;
        return {
          question: `Calculate ${a} × ${b} using Nikhilam with mixed deviations from base 100`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Base = 100. Deviations: +${devA} and ${devB}.`,
            `Cross sum/difference: ${a} + (${devB}) = ${left}.`,
            `Multiply deviations: (+${devA}) × (${devB}) = -${negRight}.`,
            `Apply vinculum correction: ${left}00 - ${negRight} = ${ans}.`,
          ],
          technique,
          sutraName,
          questionType: 'MULTI_STEP_CALCULATION',
        };
      } else {
        // EXPERT
        const a = randInt(95, 99);
        const b = randInt(94, 98);
        const total = a * b;
        return {
          question: `A freight logistics hub ships ${a} cargo crates, each with a standardized weight of ${b} kilograms. Using Nikhilam base-100 multiplication, determine the total cargo weight in kilograms.`,
          correctAnswer: String(total),
          explanationSteps: [
            `Model total weight: ${a} × ${b} kg.`,
            `Base 100 deficiencies: ${a - 100} and ${b - 100}.`,
            `Cross-subtract: ${a} + (${b - 100}) = ${a + b - 100}.`,
            `Multiply deficiencies: (${a - 100}) × (${b - 100}) = ${String((a - 100) * (b - 100)).padStart(2, '0')}.`,
            `Total weight is ${total} kg.`,
          ],
          technique,
          sutraName,
          questionType: 'WORD_PROBLEM',
        };
      }
    }

    // 3. Urdhva-Tiryagbhyam
    case 'sutra-03': {
      const sutraName = 'Urdhva-Tiryagbhyam';
      const technique = 'Vertical and Crosswise Multiplication';

      if (difficulty === 'EASY') {
        const a = pickRandom([12, 14, 21, 23, 31, 32]);
        const b = pickRandom([13, 21, 22, 31]);
        const ans = a * b;
        return {
          question: `Calculate ${a} × ${b} using Urdhva-Tiryagbhyam (Vertically and Crosswise)`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Multiply right vertical digits: ${a % 10} × ${b % 10} = ${(a % 10) * (b % 10)}.`,
            `Cross-multiply and add: (${Math.floor(a / 10)} × ${b % 10}) + (${Math.floor(b / 10)} × ${a % 10}) = ${
              Math.floor(a / 10) * (b % 10) + Math.floor(b / 10) * (a % 10)
            }.`,
            `Multiply left vertical digits: ${Math.floor(a / 10)} × ${Math.floor(b / 10)} = ${
              Math.floor(a / 10) * Math.floor(b / 10)
            }.`,
            `Combine places to get: ${ans}.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'MEDIUM') {
        const a = randInt(35, 75);
        const b = randInt(26, 68);
        const ans = a * b;
        return {
          question: `Calculate ${a} × ${b} using Urdhva-Tiryagbhyam with carries`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Apply vertical-crosswise-vertical step pattern on ${a} × ${b}.`,
            `Process carries systematically from right to left.`,
            `Final product = ${ans}.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'ADVANCED') {
        const a = randInt(112, 234);
        const b = randInt(121, 215);
        const ans = a * b;
        return {
          question: `Calculate ${a} × ${b} using 3-digit Urdhva-Tiryagbhyam`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Apply the 5-step crosswise pattern: 1×1, 2×2, 3×3, 2×2, 1×1.`,
            `Accumulate diagonal products and carry forward place values.`,
            `Result: ${ans}.`,
          ],
          technique,
          sutraName,
          questionType: 'MULTI_STEP_CALCULATION',
        };
      } else {
        // EXPERT
        const rows = randInt(26, 44);
        const cols = randInt(32, 58);
        const total = rows * cols;
        return {
          question: `A solar generation facility has ${rows} arrays with ${cols} photovoltaic panels per array. Using Urdhva-Tiryagbhyam vertical and crosswise multiplication, compute the total number of solar panels.`,
          correctAnswer: String(total),
          explanationSteps: [
            `Formulate problem: Total panels = ${rows} × ${cols}.`,
            `Multiply right digits: ${rows % 10} × ${cols % 10} = ${(rows % 10) * (cols % 10)}.`,
            `Cross multiply and add: (${Math.floor(rows / 10)} × ${cols % 10}) + (${Math.floor(cols / 10)} × ${rows % 10}).`,
            `Multiply left digits and combine with carries: ${total}.`,
            `Total installed panels: ${total}.`,
          ],
          technique,
          sutraName,
          questionType: 'WORD_PROBLEM',
        };
      }
    }

    // 4. Paravartya Yojayet
    case 'sutra-04': {
      const sutraName = 'Paravartya Yojayet';
      const technique = 'Transpose and Apply';

      if (difficulty === 'EASY') {
        const x = randInt(3, 9);
        const a = randInt(2, 6);
        const b = randInt(4, 15);
        const c = a * x + b;
        return {
          question: `Solve for x using Paravartya Yojayet (Transpose and Apply): ${a}x + ${b} = ${c}`,
          correctAnswer: String(x),
          explanationSteps: [
            `Transpose the constant +${b} with opposite sign: ${a}x = ${c} - ${b} = ${c - b}.`,
            `Transpose coefficient ${a} by division: x = ${c - b} / ${a} = ${x}.`,
            `Verification: ${a}(${x}) + ${b} = ${c}.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'MEDIUM') {
        const x = randInt(3, 8);
        const c = randInt(2, 4);
        const diffA = randInt(2, 4);
        const a = c + diffA;
        const d = randInt(18, 32);
        const b = d - diffA * x;
        return {
          question: `Solve for x using Paravartya Yojayet: ${a}x + ${b} = ${c}x + ${d}`,
          correctAnswer: String(x),
          explanationSteps: [
            `Transpose variable terms: (${a} - ${c})x = ${diffA}x.`,
            `Transpose constant terms: ${d} - (${b}) = ${d - b}.`,
            `Solve: x = ${d - b} / ${diffA} = ${x}.`,
          ],
          technique,
          sutraName,
          questionType: 'MULTI_STEP_CALCULATION',
        };
      } else if (difficulty === 'ADVANCED') {
        const a = randInt(2, 5);
        const b = randInt(3, 7);
        return {
          question: `Find the quotient when (x² + ${a + b}x + ${a * b}) is divided by (x + ${a}) using Paravartya Yojayet`,
          correctAnswer: `x + ${b}`,
          explanationSteps: [
            `In divisor (x + ${a}), transpose +${a} to -${a}.`,
            `Synthetic division table with -${a}: coefficients 1, ${a + b}, ${a * b}.`,
            `First term is 1 (x). Remainder is 0. Constant term is ${b}.`,
            `Quotient is x + ${b}.`,
          ],
          technique,
          sutraName,
          questionType: 'TECHNIQUE_SELECTION',
        };
      } else {
        // EXPERT
        const w = randInt(6, 14);
        const rate = randInt(12, 18);
        const base = randInt(35, 65);
        const total = base + rate * w;
        return {
          question: `A freight courier charges a flat booking fee of $${base} plus $${rate} per kilogram. If the invoice total is $${total}, transpose the linear equation and solve for the package weight in kilograms.`,
          correctAnswer: String(w),
          explanationSteps: [
            `Model equation: ${rate}w + ${base} = ${total}.`,
            `Transpose booking fee: ${rate}w = ${total} - ${base} = ${total - base}.`,
            `Transpose rate by division: w = ${total - base} / ${rate} = ${w}.`,
            `Package weight is ${w} kg.`,
          ],
          technique,
          sutraName,
          questionType: 'WORD_PROBLEM',
        };
      }
    }

    // 5. Shunyam Saamyasamuccaye
    case 'sutra-05': {
      const sutraName = 'Shunyam Saamyasamuccaye';
      const technique = 'Equated Aggregate is Zero';

      if (difficulty === 'EASY') {
        const k = randInt(2, 8);
        const a = randInt(2, 5);
        const b = randInt(2, 5);
        return {
          question: `Solve for x using Shunyam Saamyasamuccaye: ${a}(x + ${k}) + ${b}(x + ${k}) = 0`,
          correctAnswer: String(-k),
          explanationSteps: [
            `Recognize the common aggregate factor: (x + ${k}).`,
            `Since (${a} + ${b})(x + ${k}) = 0 and ${a + b} ≠ 0, the aggregate must equal zero.`,
            `x + ${k} = 0 ⟹ x = ${-k}.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'MEDIUM') {
        const k = randInt(3, 9);
        const c = randInt(3, 7);
        const d = randInt(2, 6);
        return {
          question: `Solve for x using Shunyam Saamyasamuccaye: ${c}(x - ${k}) + ${d}(x - ${k}) = 0`,
          correctAnswer: String(k),
          explanationSteps: [
            `The common structural term is (x - ${k}).`,
            `Setting the samuccaya to zero: x - ${k} = 0 ⟹ x = ${k}.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'ADVANCED') {
        const s = randInt(3, 6);
        const a = s - 1;
        const b = s + 1;
        const c = s - 2;
        const d = s + 2;
        return {
          question: `Solve for x using Shunyam Saamyasamuccaye: 1/(x + ${a}) + 1/(x + ${b}) = 1/(x + ${c}) + 1/(x + ${d})`,
          correctAnswer: String(-s),
          explanationSteps: [
            `Sum of LHS denominators: (x + ${a}) + (x + ${b}) = 2x + ${a + b} = 2x + ${2 * s}.`,
            `Sum of RHS denominators: (x + ${c}) + (x + ${d}) = 2x + ${c + d} = 2x + ${2 * s}.`,
            `Since the sums of denominators match, the samuccaya equals zero: 2x + ${2 * s} = 0.`,
            `x = ${-s}.`,
          ],
          technique,
          sutraName,
          questionType: 'PATTERN_RECOGNITION',
        };
      } else {
        // EXPERT
        const k = randInt(4, 9);
        return {
          question: `Two hydraulic actuators exert opposing alignment pressures given by 5(x - ${k}) and 3(x - ${k}). In equilibrium (total resultant pressure = 0), apply Shunyam Saamyasamuccaye to find x.`,
          correctAnswer: String(k),
          explanationSteps: [
            `Equation: 5(x - ${k}) + 3(x - ${k}) = 0.`,
            `Common factor is (x - ${k}).`,
            `Set the aggregate to zero: x - ${k} = 0 ⟹ x = ${k}.`,
          ],
          technique,
          sutraName,
          questionType: 'WORD_PROBLEM',
        };
      }
    }

    // 6. (Anurupye) Shunyamanyat
    case 'sutra-06': {
      const sutraName = '(Anurupye) Shunyamanyat';
      const technique = 'Proportionality Roots';

      const a1 = randInt(2, 4);
      const b1 = randInt(3, 5);
      const r = randInt(2, 3);
      const a2 = a1 * r;
      const b2 = b1 * r + 1;
      const xVal = randInt(3, 6);
      const c1 = a1 * xVal;
      const c2 = a2 * xVal;

      if (difficulty === 'EASY') {
        return {
          question: `In the system ${a1}x + ${b1}y = ${c1} and ${a2}x + ${b2}y = ${c2}, the ratio of x-coefficients equals the ratio of constants (${a1}/${a2} = ${c1}/${c2}). Use (Anurupye) Shunyamanyat to find y`,
          correctAnswer: '0',
          explanationSteps: [
            `Ratio of x-coefficients: ${a1}/${a2} = 1/${r}.`,
            `Ratio of constant terms: ${c1}/${c2} = 1/${r}.`,
            `By (Anurupye) Shunyamanyat, when one set of coefficients is in proportion with constants, the other variable vanishes: y = 0.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'MEDIUM') {
        return {
          question: `In the system ${a1}x + ${b1}y = ${c1} and ${a2}x + ${b2}y = ${c2}, find x using (Anurupye) Shunyamanyat`,
          correctAnswer: String(xVal),
          explanationSteps: [
            `Since x-coefficients and constants are in ratio 1/${r}, y = 0.`,
            `Substitute y = 0 into first equation: ${a1}x = ${c1} ⟹ x = ${xVal}.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'ADVANCED') {
        return {
          question: `Solve for the ordered pair (x, y) using (Anurupye) Shunyamanyat: ${a1}x + ${b1}y = ${c1}, ${a2}x + ${b2}y = ${c2}`,
          correctAnswer: `${xVal}, 0`,
          explanationSteps: [
            `Identify proportional ratio: ${a1}/${a2} = ${c1}/${c2} = 1/${r}.`,
            `The other variable y must equal 0.`,
            `Solving for x: ${a1}x = ${c1} ⟹ x = ${xVal}.`,
            `Solution pair: (${xVal}, 0).`,
          ],
          technique,
          sutraName,
          questionType: 'MULTI_STEP_CALCULATION',
        };
      } else {
        // EXPERT
        return {
          question: `A chemical batch reaction has concentration relations ${a1}x + ${b1}y = ${c1} and ${a2}x + ${b2}y = ${c2} mg/L. Because the x-coefficients and independent yields share the exact same proportion, use (Anurupye) Shunyamanyat to determine the residual impurity level y in mg/L.`,
          correctAnswer: '0',
          explanationSteps: [
            `Compare ratios: ${a1}/${a2} = ${c1}/${c2} = 1/${r}.`,
            `By (Anurupye) Shunyamanyat, the variable not in proportion must equal zero.`,
            `Residual impurity y = 0 mg/L.`,
          ],
          technique,
          sutraName,
          questionType: 'WORD_PROBLEM',
        };
      }
    }

    // 7. Sankalana-Vyavakalanabhyam
    case 'sutra-07': {
      const sutraName = 'Sankalana-Vyavakalanabhyam';
      const technique = 'Addition and Subtraction Cancellation';

      const a = randInt(4, 7);
      const b = randInt(2, a - 1);
      const x = randInt(3, 7);
      const y = randInt(1, 3);
      const m = a * x + b * y;
      const n = b * x + a * y;

      if (difficulty === 'EASY') {
        const sumVal = x + y;
        return {
          question: `Given ${a}x + ${b}y = ${m} and ${b}x + ${a}y = ${n}, use addition to find (x + y)`,
          correctAnswer: String(sumVal),
          explanationSteps: [
            `Add the two symmetric equations: (${a} + ${b})x + (${b} + ${a})y = ${m} + ${n}.`,
            `${a + b}x + ${a + b}y = ${m + n}.`,
            `Divide by ${a + b}: x + y = ${sumVal}.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'MEDIUM') {
        return {
          question: `Solve for x using Sankalana-Vyavakalanabhyam: ${a}x + ${b}y = ${m} and ${b}x + ${a}y = ${n}`,
          correctAnswer: String(x),
          explanationSteps: [
            `1. Add equations: (${a + b})(x + y) = ${m + n} ⟹ x + y = ${x + y}.`,
            `2. Subtract equations: (${a - b})(x - y) = ${m - n} ⟹ x - y = ${x - y}.`,
            `3. Add both results: 2x = ${x + y + (x - y)} ⟹ x = ${x}.`,
          ],
          technique,
          sutraName,
          questionType: 'MULTI_STEP_CALCULATION',
        };
      } else if (difficulty === 'ADVANCED') {
        return {
          question: `Solve for the pair (x, y) using Sankalana-Vyavakalanabhyam: ${a}x + ${b}y = ${m} and ${b}x + ${a}y = ${n}`,
          correctAnswer: `${x}, ${y}`,
          explanationSteps: [
            `Sum gives: x + y = ${x + y}.`,
            `Difference gives: x - y = ${x - y}.`,
            `Solving: x = ${x}, y = ${y}.`,
          ],
          technique,
          sutraName,
          questionType: 'MULTI_STEP_CALCULATION',
        };
      } else {
        // EXPERT
        return {
          question: `A theater sells ${a} orchestra tickets and ${b} balcony tickets on Friday for $${m}. On Saturday, it sells ${b} orchestra tickets and ${a} balcony tickets for $${n}. Using Sankalana-Vyavakalanabhyam, find the price of one orchestra ticket in dollars.`,
          correctAnswer: String(x),
          explanationSteps: [
            `Set up symmetric equations: ${a}x + ${b}y = ${m} and ${b}x + ${a}y = ${n}.`,
            `Sum of revenues: (${a + b})(x + y) = ${m + n} ⟹ x + y = ${x + y}.`,
            `Difference of revenues: (${a - b})(x - y) = ${m - n} ⟹ x - y = ${x - y}.`,
            `Adding both: 2x = ${x + y + (x - y)} ⟹ x = $${x}.`,
          ],
          technique,
          sutraName,
          questionType: 'WORD_PROBLEM',
        };
      }
    }

    // 8. Puranapuranabhyam
    case 'sutra-08': {
      const sutraName = 'Puranapuranabhyam';
      const technique = 'By Completion or Non-Completion';

      if (difficulty === 'EASY') {
        const n1 = pickRandom([28, 39, 48, 59, 68, 79, 88, 98]);
        const comp = 10 - (n1 % 10);
        const n2 = randInt(14, 35);
        const ans = n1 + n2;
        return {
          question: `Calculate ${n1} + ${n2} by completing ${n1} to the nearest decade using Puranapuranabhyam`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Complete ${n1} to ${n1 + comp} by adding ${comp}.`,
            `Compensate by subtracting ${comp} from ${n2}: ${n2} - ${comp} = ${n2 - comp}.`,
            `Combine: ${n1 + comp} + ${n2 - comp} = ${ans}.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'MEDIUM') {
        const k = randInt(2, 5);
        const r = randInt(k + 2, k + 6);
        const m = r * r - k * k;
        const ans = r - k;
        return {
          question: `Solve for positive x using Puranapuranabhyam (completion of square): x² + ${2 * k}x = ${m}`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Complete the square on LHS: add ${k}² = ${k * k} to both sides.`,
            `x² + ${2 * k}x + ${k * k} = ${m} + ${k * k} = ${r * r}.`,
            `(x + ${k})² = ${r * r} ⟹ x + ${k} = ${r}.`,
            `x = ${r} - ${k} = ${ans}.`,
          ],
          technique,
          sutraName,
          questionType: 'MULTI_STEP_CALCULATION',
        };
      } else if (difficulty === 'ADVANCED') {
        const k = randInt(4, 7);
        const r = randInt(k + 3, k + 8);
        const m = r * r - k * k;
        const ans = r - k;
        return {
          question: `Solve for positive x by completing the square: x² + ${2 * k}x = ${m}`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Add ${k * k} to complete square: (x + ${k})² = ${r * r}.`,
            `x + ${k} = ${r} ⟹ x = ${ans}.`,
          ],
          technique,
          sutraName,
          questionType: 'MULTI_STEP_CALCULATION',
        };
      } else {
        // EXPERT
        const k = randInt(2, 4);
        const r = randInt(k + 3, k + 6);
        const m = r * r - k * k;
        const w = r - k;
        return {
          question: `A botanical research plot has width x and length (x + ${2 * k}) meters. Its total enclosed area is ${m} square meters. Using Puranapuranabhyam (completing the square), calculate the plot width x in meters.`,
          correctAnswer: String(w),
          explanationSteps: [
            `Area equation: x(x + ${2 * k}) = ${m} ⟹ x² + ${2 * k}x = ${m}.`,
            `Complete square: add ${k * k} to both sides: (x + ${k})² = ${r * r}.`,
            `Taking positive square root: x + ${k} = ${r} ⟹ x = ${w} meters.`,
          ],
          technique,
          sutraName,
          questionType: 'WORD_PROBLEM',
        };
      }
    }

    // 9. Chalana-Kalanabhyam
    case 'sutra-09': {
      const sutraName = 'Chalana-Kalanabhyam';
      const technique = 'Differential Calculus / Rate of Variation';

      if (difficulty === 'EASY') {
        const a = randInt(2, 5);
        const x0 = randInt(2, 6);
        const ans = 2 * a * x0;
        return {
          question: `Given f(x) = ${a}x², find the rate of change f'(${x0}) using Chalana-Kalanabhyam`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Apply variation derivative rule: d/dx(${a}x²) = ${2 * a}x.`,
            `Evaluate at x = ${x0}: ${2 * a}(${x0}) = ${ans}.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'MEDIUM') {
        const k = randInt(2, 6);
        const c = randInt(3, 12);
        return {
          question: `Find the value of x where the derivative of f(x) = x² - ${2 * k}x + ${c} equals zero`,
          correctAnswer: String(k),
          explanationSteps: [
            `Differentiate f(x): f'(x) = 2x - ${2 * k}.`,
            `Set rate of change to zero: 2x - ${2 * k} = 0.`,
            `x = ${k}.`,
          ],
          technique,
          sutraName,
          questionType: 'MULTI_STEP_CALCULATION',
        };
      } else if (difficulty === 'ADVANCED') {
        const a = randInt(2, 3);
        const k = randInt(2, 5);
        const b = 2 * a * k;
        return {
          question: `Find the x-coordinate of the maximum turning point of f(x) = -${a}x² + ${b}x + 7`,
          correctAnswer: String(k),
          explanationSteps: [
            `Compute derivative: f'(x) = -${2 * a}x + ${b}.`,
            `Set to zero: -${2 * a}x + ${b} = 0 ⟹ x = ${b} / ${2 * a} = ${k}.`,
          ],
          technique,
          sutraName,
          questionType: 'TECHNIQUE_SELECTION',
        };
      } else {
        // EXPERT
        const v0 = randInt(3, 7) * 10;
        const tPeak = v0 / 10;
        return {
          question: `A sounding rocket trajectory is given by height h(t) = ${v0}t - 5t² meters after t seconds. Using Chalana-Kalanabhyam to set the vertical velocity h'(t) to zero, find the time t in seconds when the rocket reaches peak altitude.`,
          correctAnswer: String(tPeak),
          explanationSteps: [
            `Velocity is the time derivative: v(t) = h'(t) = ${v0} - 10t.`,
            `At maximum height, instantaneous velocity equals zero: ${v0} - 10t = 0.`,
            `t = ${v0} / 10 = ${tPeak} seconds.`,
          ],
          technique,
          sutraName,
          questionType: 'WORD_PROBLEM',
        };
      }
    }

    // 10. Yavadunam
    case 'sutra-10': {
      const sutraName = 'Yavadunam';
      const technique = 'Base Deficiency and Excess Squaring/Cubing';

      if (difficulty === 'EASY') {
        const n = randInt(92, 98);
        const def = 100 - n;
        const ans = n * n;
        return {
          question: `Calculate ${n}² using Yavadunam deficiency method (base 100)`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Base = 100. Deficiency is ${def}.`,
            `Subtract deficiency from number: ${n} - ${def} = ${n - def}.`,
            `Square the deficiency: ${def}² = ${String(def * def).padStart(2, '0')}.`,
            `Combine: ${ans}.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'MEDIUM') {
        const n = randInt(103, 109);
        const exc = n - 100;
        const ans = n * n;
        return {
          question: `Calculate ${n}² using Yavadunam excess method (base 100)`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Base = 100. Excess is ${exc}.`,
            `Add excess to number: ${n} + ${exc} = ${n + exc}.`,
            `Square the excess: ${exc}² = ${String(exc * exc).padStart(2, '0')}.`,
            `Combine: ${ans}.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'ADVANCED') {
        const d = randInt(1, 3);
        const n = 100 + d;
        const ans = n * n * n;
        return {
          question: `Calculate ${n}³ using Yavadunam cubing near base 100`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Base = 100. Excess d = ${d}.`,
            `Left part: ${n} + 2(${d}) = ${n + 2 * d}.`,
            `Middle part: 3 × (${d}²) = ${String(3 * d * d).padStart(2, '0')}.`,
            `Right part: ${d}³ = ${String(d * d * d).padStart(2, '0')}.`,
            `Result = ${ans}.`,
          ],
          technique,
          sutraName,
          questionType: 'MULTI_STEP_CALCULATION',
        };
      } else {
        // EXPERT
        const n = randInt(994, 998);
        const ans = n * n;
        return {
          question: `A precision square thermal shield for an aerospace craft measures ${n} mm per side. Using Yavadunam base-1000 squaring, calculate its surface area in square millimeters.`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Base = 1000. Deficiency is ${1000 - n}.`,
            `Left part: ${n} - ${1000 - n} = ${n - (1000 - n)}.`,
            `Right part: (${1000 - n})² = ${String((1000 - n) * (1000 - n)).padStart(3, '0')}.`,
            `Total area = ${ans} sq mm.`,
          ],
          technique,
          sutraName,
          questionType: 'WORD_PROBLEM',
        };
      }
    }

    // 11. Vyashtisamanstih
    case 'sutra-11': {
      const sutraName = 'Vyashtisamanstih';
      const technique = 'Part and Whole Decomposition';

      if (difficulty === 'EASY') {
        const a = randInt(22, 38);
        const b = randInt(4, 8);
        const tens = Math.floor(a / 10) * 10;
        const units = a % 10;
        const ans = a * b;
        return {
          question: `Calculate ${a} × ${b} by decomposing ${a} into (${tens} + ${units}) using Vyashtisamanstih`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Decompose whole ${a} into parts: ${tens} + ${units}.`,
            `Multiply part 1: ${tens} × ${b} = ${tens * b}.`,
            `Multiply part 2: ${units} × ${b} = ${units * b}.`,
            `Combine parts to restore whole: ${tens * b} + ${units * b} = ${ans}.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'MEDIUM') {
        const a = pickRandom([15, 25, 35, 45]);
        const b = pickRandom([12, 14, 16, 18]);
        const ans = a * b;
        return {
          question: `Calculate ${a} × ${b} using Vyashtisamanstih friendly factor decomposition`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Decompose ${b} into 2 × ${b / 2}.`,
            `Multiply first part: ${a} × 2 = ${a * 2}.`,
            `Multiply second part: ${a * 2} × ${b / 2} = ${ans}.`,
          ],
          technique,
          sutraName,
          questionType: 'MULTI_STEP_CALCULATION',
        };
      } else if (difficulty === 'ADVANCED') {
        const a = randInt(2, 4);
        const b = randInt(3, 5);
        return {
          question: `Factor x³ + ${a}x² + ${b}x + ${a * b} by grouping parts using Vyashtisamanstih`,
          correctAnswer: `(x² + ${b})(x + ${a})`,
          explanationSteps: [
            `Group first two terms: x²(x + ${a}).`,
            `Group second two terms: ${b}(x + ${a}).`,
            `Extract common part: (x² + ${b})(x + ${a}).`,
          ],
          technique,
          sutraName,
          questionType: 'TECHNIQUE_SELECTION',
        };
      } else {
        // EXPERT
        const rows = randInt(24, 35);
        const seats = randInt(25, 40);
        const ans = rows * seats;
        return {
          question: `A university hall has ${rows} rows with ${seats} seats per row. Using Vyashtisamanstih to decompose into friendly partial components, calculate the total auditorium seating capacity.`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Formulate: Total seats = ${rows} × ${seats}.`,
            `Decompose ${rows} into ${Math.floor(rows / 10) * 10} + ${rows % 10}.`,
            `Multiply components: ${Math.floor(rows / 10) * 10} × ${seats} = ${Math.floor(rows / 10) * 10 * seats}.`,
            `${rows % 10} × ${seats} = ${(rows % 10) * seats}.`,
            `Total capacity = ${ans} seats.`,
          ],
          technique,
          sutraName,
          questionType: 'WORD_PROBLEM',
        };
      }
    }

    // 12. Shesanyankena Charamena
    case 'sutra-12': {
      const sutraName = 'Shesanyankena Charamena';
      const technique = 'Remainder and Divisibility Analysis';

      if (difficulty === 'EASY') {
        const div = randInt(6, 9);
        const q = randInt(7, 12);
        const rem = randInt(2, div - 1);
        const n = q * div + rem;
        return {
          question: `Find the remainder when ${n} is divided by ${div} using Shesanyankena Charamena`,
          correctAnswer: String(rem),
          explanationSteps: [
            `Quotient estimation: ${div} fits into ${n} a total of ${q} times (${q} × ${div} = ${q * div}).`,
            `Remainder = ${n} - ${q * div} = ${rem}.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'MEDIUM') {
        const div = randInt(7, 11);
        const q = randInt(20, 45);
        const rem = randInt(2, div - 1);
        const n = q * div + rem;
        return {
          question: `Find the remainder when ${n} is divided by ${div}`,
          correctAnswer: String(rem),
          explanationSteps: [
            `Divide ${n} by ${div}: ${q} × ${div} = ${q * div}.`,
            `Remainder = ${n} - ${q * div} = ${rem}.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'ADVANCED') {
        const n = randInt(142, 856);
        const digits = String(n).split('').map(Number);
        const digitSum = digits.reduce((s, d) => s + d, 0);
        const ans = n % 9;
        return {
          question: `Find ${n} mod 9 using the digit-sum remainder principle of Shesanyankena Charamena`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Sum the digits of ${n}: ${digits.join(' + ')} = ${digitSum}.`,
            `Reduce mod 9: ${digitSum} mod 9 = ${ans}.`,
          ],
          technique,
          sutraName,
          questionType: 'PATTERN_RECOGNITION',
        };
      } else {
        // EXPERT
        const period = randInt(14, 18);
        const q = randInt(15, 22);
        const rem = randInt(3, period - 1);
        const totalHours = q * period + rem;
        return {
          question: `An environmental telemetry satellite completes an orbit cycle every ${period} hours. If ${totalHours} hours have passed since launch, use Shesanyankena Charamena to determine how many hours have elapsed into the current unfinished orbit.`,
          correctAnswer: String(rem),
          explanationSteps: [
            `Calculate completed orbits: ${totalHours} ÷ ${period} = ${q} complete orbits.`,
            `Elapsed time in complete cycles: ${q} × ${period} = ${q * period} hours.`,
            `Remainder into current orbit: ${totalHours} - ${q * period} = ${rem} hours.`,
          ],
          technique,
          sutraName,
          questionType: 'WORD_PROBLEM',
        };
      }
    }

    // 13. Sopaantyadvayamantyam
    case 'sutra-13': {
      const sutraName = 'Sopaantyadvayamantyam';
      const technique = 'Ultimate and Penultimate Weighted Sum';

      const a = randInt(2, 8);
      const b = randInt(2, 6);
      const c = randInt(1, 8);
      const num = a * 100 + b * 10 + c;
      const weighted = 2 * b + c;

      if (difficulty === 'EASY') {
        return {
          question: `For the number ${num}, calculate the ultimate digit plus twice the penultimate digit (2b + c)`,
          correctAnswer: String(weighted),
          explanationSteps: [
            `Penultimate digit (tens place) b = ${b}.`,
            `Ultimate digit (units place) c = ${c}.`,
            `Formula: 2(${b}) + ${c} = ${2 * b} + ${c} = ${weighted}.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'MEDIUM') {
        return {
          question: `Evaluate the divisibility check (2b + c) for the number ${num}`,
          correctAnswer: String(weighted),
          explanationSteps: [
            `Identify penultimate digit b = ${b} and ultimate c = ${c}.`,
            `2b + c = 2(${b}) + ${c} = ${weighted}.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'ADVANCED') {
        const p1 = randInt(2, 5);
        const p2 = randInt(3, 6);
        const sumCoef = p1 + p2;
        const constTerm = p1 * p2;
        const total = sumCoef + constTerm;
        return {
          question: `In the expansion of (x + ${p1})(x + ${p2}), calculate the sum of the penultimate coefficient (x-term) and ultimate constant`,
          correctAnswer: String(total),
          explanationSteps: [
            `Expanded form: x² + ${sumCoef}x + ${constTerm}.`,
            `Penultimate coefficient = ${sumCoef}. Ultimate constant = ${constTerm}.`,
            `Sum: ${sumCoef} + ${constTerm} = ${total}.`,
          ],
          technique,
          sutraName,
          questionType: 'MULTI_STEP_CALCULATION',
        };
      } else {
        // EXPERT
        return {
          question: `An automated logistics sorter validates package barcodes ending in ...${b}${c} using the weighted check sum (2 × penultimate_digit + ultimate_digit). Calculate the verification value.`,
          correctAnswer: String(weighted),
          explanationSteps: [
            `Extract trailing digits: penultimate = ${b}, ultimate = ${c}.`,
            `Apply formula: 2(${b}) + ${c} = ${weighted}.`,
          ],
          technique,
          sutraName,
          questionType: 'WORD_PROBLEM',
        };
      }
    }

    // 14. Ekanyunena Purvena
    case 'sutra-14': {
      const sutraName = 'Ekanyunena Purvena';
      const technique = 'By One Less Than the Previous';

      if (difficulty === 'EASY') {
        const n = randInt(23, 89);
        const ans = n * 99;
        return {
          question: `Calculate ${n} × 99 using Ekanyunena Purvena (One Less Than Previous)`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Subtract 1 from ${n}: ${n} - 1 = ${n - 1}.`,
            `Subtract ${n} from base 100: 100 - ${n} = ${100 - n}.`,
            `Combine parts: ${n - 1} | ${String(100 - n).padStart(2, '0')} = ${ans}.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'MEDIUM') {
        const n = randInt(125, 875);
        const ans = n * 999;
        return {
          question: `Calculate ${n} × 999 using Ekanyunena Purvena`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Subtract 1 from ${n}: ${n} - 1 = ${n - 1}.`,
            `Subtract ${n} from 1000: 1000 - ${n} = ${1000 - n}.`,
            `Combine: ${n - 1} | ${String(1000 - n).padStart(3, '0')} = ${ans}.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'ADVANCED') {
        const n = randInt(25, 85);
        const ans = n * 999;
        return {
          question: `Calculate ${n} × 999 using Ekanyunena Purvena with prefix zero padding`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Pad ${n} to 3 digits matching 999: 0${n}.`,
            `Subtract 1: ${n} - 1 = ${n - 1}.`,
            `Subtract from 1000: 1000 - ${n} = ${1000 - n}.`,
            `Combine: ${n - 1}${String(1000 - n).padStart(3, '0')} = ${ans}.`,
          ],
          technique,
          sutraName,
          questionType: 'MULTI_STEP_CALCULATION',
        };
      } else {
        // EXPERT
        const qty = randInt(35, 85);
        const ans = qty * 99;
        return {
          question: `An academic textbook supplier fulfills a school order of ${qty} Vedic Mathematics textbooks at a wholesale price of 99 rupees each. Using Ekanyunena Purvena, calculate the total billing amount in rupees.`,
          correctAnswer: String(ans),
          explanationSteps: [
            `Model billing: ${qty} × 99.`,
            `Subtract 1 from ${qty}: ${qty - 1}.`,
            `Complement from 100: 100 - ${qty} = ${100 - qty}.`,
            `Total invoice = ${ans} rupees.`,
          ],
          technique,
          sutraName,
          questionType: 'WORD_PROBLEM',
        };
      }
    }

    // 15. Gunitasamuchayah
    case 'sutra-15': {
      const sutraName = 'Gunitasamuchayah';
      const technique = 'Product of Sums Equals Sum of Product';

      const a = randInt(2, 4);
      const b = randInt(a + 1, a + 4);

      if (difficulty === 'EASY') {
        const sc = (1 + a) * (1 + b);
        return {
          question: `For the linear factors (x + ${a})(x + ${b}), calculate the product of coefficient sums Sc using Gunitasamuchayah`,
          correctAnswer: String(sc),
          explanationSteps: [
            `Sum of coefficients of first factor: (1 + ${a}) = ${1 + a}.`,
            `Sum of coefficients of second factor: (1 + ${b}) = ${1 + b}.`,
            `Product of sums Sc: (${1 + a}) × (${1 + b}) = ${sc}.`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'MEDIUM') {
        return {
          question: `Factor x² + ${a + b}x + ${a * b} into (x + a)(x + b) with a < b`,
          correctAnswer: `(x + ${a})(x + ${b})`,
          explanationSteps: [
            `Find two integers that multiply to ${a * b} and add to ${a + b}: ${a} and ${b}.`,
            `Factors: (x + ${a})(x + ${b}).`,
            `Check with Gunitasamuchayah: Sc = (1+${a})(1+${b}) = ${(1 + a) * (1 + b)}, Sp = 1 + ${a + b} + ${a * b} = ${(1 + a) * (1 + b)}. Verified!`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'ADVANCED') {
        return {
          question: `Factor x² - ${a + b}x + ${a * b} into (x - a)(x - b) with a < b`,
          correctAnswer: `(x - ${a})(x - ${b})`,
          explanationSteps: [
            `Negative middle term with positive constant: (-${a}) × (-${b}) = ${a * b}, (-${a}) + (-${b}) = -${a + b}.`,
            `Factors: (x - ${a})(x - ${b}).`,
          ],
          technique,
          sutraName,
          questionType: 'TECHNIQUE_SELECTION',
        };
      } else {
        // EXPERT
        return {
          question: `A civil engineering beam stress polynomial is modeled by P(x) = x² + ${a + b}x + ${a * b}. Using Gunitasamuchayah, factor this polynomial into linear stress components (x + a)(x + b) with a < b.`,
          correctAnswer: `(x + ${a})(x + ${b})`,
          explanationSteps: [
            `Factor quadratic: roots at -${a} and -${b}.`,
            `Factors are (x + ${a})(x + ${b}).`,
            `Verify Sc = Sp = ${(1 + a) * (1 + b)}.`,
          ],
          technique,
          sutraName,
          questionType: 'WORD_PROBLEM',
        };
      }
    }

    // 16. Gunakasamuchayah
    case 'sutra-16':
    default: {
      const sutraName = 'Gunakasamuchayah';
      const technique = 'Factors of the Sum';

      const m = randInt(2, 5);

      if (difficulty === 'EASY') {
        const k = randInt(2, 4);
        return {
          question: `Factor ${k}x² + ${k * m}x by extracting the common factor using Gunakasamuchayah`,
          correctAnswer: `${k}x(x + ${m})`,
          explanationSteps: [
            `Extract common term ${k}x from both terms:`,
            `${k}x² / ${k}x = x.`,
            `${k * m}x / ${k}x = ${m}.`,
            `Factorization: ${k}x(x + ${m}).`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'MEDIUM') {
        const middle = 2 * m + 1;
        return {
          question: `Factor the quadratic 2x² + ${middle}x + ${m} into (2x + 1)(x + b)`,
          correctAnswer: `(2x + 1)(x + ${m})`,
          explanationSteps: [
            `Factors of leading coefficient 2 are (2, 1).`,
            `Factors of constant ${m} are (1, ${m}).`,
            `Cross product: 2(${m}) + 1(1) = ${2 * m + 1}.`,
            `Result: (2x + 1)(x + ${m}).`,
          ],
          technique,
          sutraName,
          questionType: 'DIRECT_CALCULATION',
        };
      } else if (difficulty === 'ADVANCED') {
        const middle = 3 * m + 1;
        return {
          question: `Factor the quadratic 3x² + ${middle}x + ${m} into (3x + 1)(x + b)`,
          correctAnswer: `(3x + 1)(x + ${m})`,
          explanationSteps: [
            `Leading coefficient 3 factors as (3, 1).`,
            `Constant ${m} factors as (1, ${m}).`,
            `Cross-product check: 3(${m}) + 1(1) = ${3 * m + 1}.`,
            `Result: (3x + 1)(x + ${m}).`,
          ],
          technique,
          sutraName,
          questionType: 'MULTI_STEP_CALCULATION',
        };
      } else {
        // EXPERT
        const middle = 2 * m + 1;
        return {
          question: `The floor plan area of a conference pavilion is represented by the quadratic 2x² + ${middle}x + ${m} square meters. Using Gunakasamuchayah, factor this expression into its dimension expressions (2x + 1)(x + b).`,
          correctAnswer: `(2x + 1)(x + ${m})`,
          explanationSteps: [
            `Model area as length × width = 2x² + ${middle}x + ${m}.`,
            `Factor coefficients: (2x + 1)(x + ${m}).`,
            `The dimensions of the pavilion are (2x + 1) and (x + ${m}) meters.`,
          ],
          technique,
          sutraName,
          questionType: 'WORD_PROBLEM',
        };
      }
    }
  }
}
