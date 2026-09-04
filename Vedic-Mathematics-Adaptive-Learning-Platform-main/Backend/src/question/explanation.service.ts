import { Injectable } from '@nestjs/common';

@Injectable()
export class ExplanationService {

  generateAdditionExplanation(
    num1: number,
    num2: number,
  ) {
    const units1 = num1 % 10;
    const units2 = num2 % 10;

    const tens1 = Math.floor(num1 / 10);
    const tens2 = Math.floor(num2 / 10);

    const unitSum = units1 + units2;

    const carry =
      Math.floor(unitSum / 10);

    const unitDigit =
      unitSum % 10;

    const tensSum =
      tens1 + tens2 + carry;

    return {
     steps: [
      `${units1} + ${units2} = ${unitSum}`,
      `Write ${unitDigit} and carry ${carry}`,
      `${tens1} + ${tens2} + ${carry} = ${tensSum}`,
      `Final Answer = ${tensSum}${unitDigit}`,
     ],

     visual: {
      type: 'vertical_addition',

       num1,

       num2,

       carry,

       answer: Number(
        `${tensSum}${unitDigit}`,
        ),
      },
    };
  }
  generateNikhilamExplanation(
  base: number,
  number: number,
) {
  const digits =
    number.toString().split('');

  const steps: string[] = [];

  let answer = '';

  for (
    let i = 0;
    i < digits.length;
    i++
  ) {
    const digit =
      Number(digits[i]);

    if (
      i === digits.length - 1
    ) {
      const value =
        10 - digit;

      steps.push(
        `10 - ${digit} = ${value}`,
      );

      answer += value;
    } else {
      const value =
        9 - digit;

      steps.push(
        `9 - ${digit} = ${value}`,
      );

      answer += value;
    }
  }

  steps.push(
    `Answer = ${answer}`,
  );

  return {
    steps,

    visual: {
      type:
        'nikhilam_subtraction',

      base,

      number,

      answer:
        Number(answer),
    },
  };
 }
 generateDotMethodExplanation(
  num1: number,
  num2: number,
) {
  const answer =
    num1 + num2;

  return {
    steps: [
      `Write ${num1} and ${num2} vertically`,
      `Add corresponding digits`,
      `Use dots to track carry values`,
      `Final Answer = ${answer}`,
    ],

    visual: {
      type: 'dot_method_addition',

      num1,

      num2,

      answer,
    },
  };
 }
 generateBaseMultiplicationExplanation(
  num1: number,
  num2: number,
) {
  const base = 100;

  const deficiency1 =
    base - num1;

  const deficiency2 =
    base - num2;

  const leftPart =
    num1 - deficiency2;

  const rightPart =
    deficiency1 *
    deficiency2;

  const answer =
    num1 * num2;

  return {
    steps: [
      `Base = ${base}`,

      `${num1} is ${deficiency1} less than ${base}`,

      `${num2} is ${deficiency2} less than ${base}`,

      `${num1} - ${deficiency2} = ${leftPart}`,

      `${deficiency1} × ${deficiency2} = ${rightPart}`,

      `Answer = ${answer}`,
    ],

    visual: {
      type:
        'base_multiplication',

      base,

      num1,

      num2,

      deficiency1,

      deficiency2,

      leftPart,

      rightPart,

      answer,
    },
  };
 }
 generateUrdhvaExplanation(
  num1: number,
  num2: number,
) {
  const a =
    Math.floor(num1 / 10);

  const b =
    num1 % 10;

  const c =
    Math.floor(num2 / 10);

  const d =
    num2 % 10;

  const vertical =
    b * d;

  const cross =
    a * d +
    b * c;

  const left =
    a * c;

  const answer =
    num1 * num2;

  return {
    steps: [
      `${b} × ${d} = ${vertical}`,

      `${a} × ${d} + ${b} × ${c} = ${cross}`,

      `${a} × ${c} = ${left}`,

      `Answer = ${answer}`,
    ],

    visual: {
      type:
        'urdhva_multiplication',

      num1,

      num2,

      vertical,

      cross,

      left,

      answer,
    },
  };
 }
 generateSeriesOnesExplanation(
  number: number,
) {
  const digits =
    number
      .toString()
      .split('')
      .map(Number);

  const a = digits[0];
  const b = digits[1];
  const c = digits[2];

  const step1 = a;

  const step2 = a + b;

  const step3 = b + c;

  const step4 = c;

  const answer =
    number * 111;

  return {
    steps: [
      `First digit = ${a}`,

      `${a} + ${b} = ${step2}`,

      `${b} + ${c} = ${step3}`,

      `Last digit = ${c}`,

      `Answer = ${answer}`,
    ],

    visual: {
      type:
        'series_ones_multiplication',

      number,

      step1,

      step2,

      step3,

      step4,

      answer,
    },
  };
 }
 generateSeriesNinesExplanation(
  number: number,
) {
  const left =
    number - 1;

  const right =
    1000 - number;

  const answer =
    number * 999;

  return {
    steps: [
      `${number} - 1 = ${left}`,

      `1000 - ${number} = ${right}`,

      `Combine ${left} and ${right}`,

      `Answer = ${answer}`,
    ],

    visual: {
      type:
        'series_nines_multiplication',

      number,

      left,

      right,

      answer,
    },
  };
 }
 generateSquareEndingFiveExplanation(
  number: number,
) {
  const prefix =
    Math.floor(number / 10);

  const left =
    prefix *
    (prefix + 1);

  const answer =
    number * number;

  return {
    steps: [
      `Take ${prefix}`,

      `${prefix} × ${
        prefix + 1
      } = ${left}`,

      `Append 25`,

      `Answer = ${answer}`,
    ],

    visual: {
      type:
        'square_ending_five',

      number,

      prefix,

      left,

      answer,
    },
  };
 }
 generateSquareBaseExplanation(
  number: number,
) {
  const base = 100;

  const deficiency =
    base - number;

  const left =
    number - deficiency;

  const right =
    deficiency * deficiency;

  const answer =
    number * number;

  return {
    steps: [
      `Base = ${base}`,

      `${number} is ${deficiency} less than ${base}`,

      `${number} - ${deficiency} = ${left}`,

      `${deficiency}² = ${right}`,

      `Answer = ${answer}`,
    ],

    visual: {
      type:
        'square_base_method',

      number,

      base,

      deficiency,

      left,

      right,

      answer,
    },
  };
 }
 generateDwandwaExplanation(
  number: number,
) {
  const a =
    Math.floor(number / 10);

  const b =
    number % 10;

  const duplex1 =
    b * b;

  const duplex2 =
    2 * a * b;

  const duplex3 =
    a * a;

  const answer =
    number * number;

  return {
    steps: [
      `Duplex(${b}) = ${duplex1}`,

      `Duplex(${a}, ${b}) = 2 × ${a} × ${b} = ${duplex2}`,

      `Duplex(${a}) = ${duplex3}`,

      `Answer = ${answer}`,
    ],

    visual: {
      type:
        'dwandwa_yoga',

      number,

      duplex1,

      duplex2,

      duplex3,

      answer,
    },
  };
 }
 generateCubeExplanation(
  number: number,
) {
  const base = 100;

  const deviation =
    number - base;

  const square =
    deviation * deviation;

  const cube =
    deviation * deviation * deviation;

  const answer =
    Math.pow(number, 3);

  return {
    steps: [
      `Base = ${base}`,

      `${number} differs from ${base} by ${deviation}`,

      `${deviation}² = ${square}`,

      `${deviation}³ = ${cube}`,

      `Final Cube = ${answer}`,
    ],

    visual: {
      type:
        'yavadunam_cube',

      number,

      base,

      deviation,

      square,

      cube,

      answer,
    },
  };
 }
 generateRootTwoExplanation() {
  return {
    steps: [
      '√2 is an irrational number',

      'Its decimal expansion never ends',

      'A commonly used approximation is 1.4142',

      'Therefore √2 ≈ 1.4142',
    ],

    visual: {
      type:
        'square_root_two',

      approximation:
        '1.4142',
    },
  };
 }
 generateFractionAdditionExplanation(
  numerator1: number,
  numerator2: number,
  denominator: number,
) {
  const result =
    numerator1 + numerator2;

  return {
    steps: [
      `Denominators are same (${denominator})`,

      `Add numerators: ${numerator1} + ${numerator2} = ${result}`,

      `Keep denominator ${denominator}`,

      `Answer = ${result}/${denominator}`,
    ],

    visual: {
      type:
        'fraction_addition',

      numerator1,

      numerator2,

      denominator,

      result,
    },
  };
 }
 generateFractionSubtractionExplanation(
  numerator1: number,
  numerator2: number,
  denominator: number,
) {
  const result =
    numerator1 - numerator2;

  return {
    steps: [
      `Denominators are same (${denominator})`,

      `Subtract numerators: ${numerator1} - ${numerator2} = ${result}`,

      `Keep denominator ${denominator}`,

      `Answer = ${result}/${denominator}`,
    ],

    visual: {
      type:
        'fraction_subtraction',

      numerator1,

      numerator2,

      denominator,

      result,
    },
  };
 }
 generateVinculumDivisionExplanation(
  dividend: number,
  divisor: number,
) {
  const quotient =
    dividend / divisor;

  return {
    steps: [
      `Dividend = ${dividend}`,

      `Divisor = ${divisor}`,

      `${divisor} goes into ${dividend} exactly ${quotient} times`,

      `Answer = ${quotient}`,
    ],

    visual: {
      type:
        'vinculum_division',

      dividend,

      divisor,

      quotient,
    },
  };
 }
 generateBaudhayanaExplanation(
  a: number,
  b: number,
) {
  const c =
    Math.sqrt(
      a * a + b * b,
    );

  return {
    steps: [
      `Baudhayana Theorem:`,

      `${a}² + ${b}² = c²`,

      `${a * a} + ${b * b} = ${c * c}`,

      `c = ${c}`,
    ],

    visual: {
      type:
        'baudhayana_theorem',

      a,

      b,

      c,
    },
  };
 }
 generateQuadraticExplanation(
  a: number,
  b: number,
) {
  return {
    steps: [
      `Find two numbers whose sum is ${
        a + b
      }`,

      `and product is ${
        a * b
      }`,

      `Numbers are ${a} and ${b}`,

      `Factorization = (x+${a})(x+${b})`,
    ],

    visual: {
      type:
        'factor_quadratic',

      a,

      b,
    },
  };
 }
 generatePiExplanation(
  radius: number,
) {
  const circumference =
    2 *
    (22 / 7) *
    radius;

  return {
    steps: [
      `Formula: C = 2πr`,

      `π = 22/7`,

      `C = 2 × 22/7 × ${radius}`,

      `C = ${circumference}`,
    ],

    visual: {
      type:
        'concept_of_pi',

      radius,

      circumference,
    },
  };
 }
 generateCirclingSquareExplanation(
  side: number,
) {
  const diagonal =
    Number(
      (
        side *
        Math.sqrt(2)
      ).toFixed(2),
    );

  const radius =
    Number(
      (
        diagonal / 2
      ).toFixed(2),
    );

  return {
    steps: [
      `Square side = ${side}`,

      `Diagonal = ${side}√2 ≈ ${diagonal}`,

      `Radius = diagonal / 2`,

      `Radius = ${radius}`,
    ],

    visual: {
      type:
        'circling_square',

      side,

      diagonal,

      radius,
    },
  };
 }
}