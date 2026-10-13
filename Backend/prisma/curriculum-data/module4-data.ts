import { TopicSeedData } from './types';

export const module4Topics: TopicSeedData[] = [
  {
    topicTitle: 'Squares Using Base Method',
    technique: 'Yavadunam Squaring',
    sutra: 'Yavadunam Tavadunikritya Vargancha Yojayet',
    pages: [
      {
        slug: 'base-squares-intro',
        title: 'Introduction to Base Squaring',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 4,
        contentMarkdown: `## Squaring Numbers Near Powers of 10

Calculating the square of a number close to a theoretical base like 10, 100, or 1000 can be executed in seconds using the Vedic sutra:
$$\\textbf{Yāvadūnam Tāvadūnīkṛtya Vargañca Yojayet}$$
*(Whatever the deficiency or excess, lessen or increase it by that much, and set up the square of the deficiency/excess).*

### The Core Algebraic Principle
Consider a number $N = B + d$, where $B$ is the base ($10, 100, 1000$) and $d$ is the deviation (positive for surplus, negative for deficit).
$$(B + d)^2 = B^2 + 2Bd + d^2 = B(B + 2d) + d^2 = B(N + d) + d^2$$

This reveals the two distinct parts of the answer:
1. **Left Part:** The number plus its deviation: $N + d$
2. **Right Part:** The square of the deviation: $d^2$ (with digits matching the number of zeros in base $B$)`,
      },
      {
        slug: 'base-squares-surplus',
        title: 'Numbers Above the Base (Surplus)',
        pageType: 'THEORY',
        order: 2,
        estimatedMinutes: 5,
        contentMarkdown: `## Squaring Above the Base

When a number exceeds the base $B = 10^k$, its deviation $d$ is positive.

### Algorithm
1. Identify base $B$ and calculate deviation $d = N - B$.
2. Form the left hand side (LHS): $N + d$.
3. Form the right hand side (RHS): $d^2$. The RHS must occupy exactly $k$ digit positions (the number of zeros in $B$).
4. If $d^2$ produces more digits than $k$, carry the excess into the LHS.

### Example: Square of 107
- Base $B = 100$, deviation $d = +7$.
- $\\text{LHS} = 107 + 7 = 114$
- $\\text{RHS} = 7^2 = 49$ (occupies 2 digits, matching 100)
- **Answer:** $11449$

$$\\text{Verification: } 107 \\times 107 = (100 + 7)^2 = 10000 + 1400 + 49 = 11449 \\quad \\checkmark$$`,
      },
      {
        slug: 'base-squares-deficit',
        title: 'Numbers Below the Base (Deficit)',
        pageType: 'THEORY',
        order: 3,
        estimatedMinutes: 5,
        contentMarkdown: `## Squaring Below the Base

When the number is less than the base $B$, deviation $d$ is negative. We denote the deficit as $|d|$.

### Algorithm
1. Deviation $d = N - B = -|d|$.
2. $\\text{LHS} = N - |d|$ (reduce the number by its deficiency).
3. $\\text{RHS} = (-|d|)^2 = d^2$ (always positive).

### Example: Square of 94
- Base $B = 100$, deficit $|d| = 6$.
- $\\text{LHS} = 94 - 6 = 88$
- $\\text{RHS} = 6^2 = 36$
- **Answer:** $8836$

$$\\text{Algebraic proof: } 94^2 = (100 - 6)^2 = 10000 - 1200 + 36 = 8836 \\quad \\checkmark$$`,
      },
      {
        slug: 'base-squares-worked-examples',
        title: 'Comprehensive Worked Examples',
        pageType: 'WORKED_EXAMPLE',
        order: 4,
        estimatedMinutes: 6,
        contentMarkdown: `## Worked Examples with Carries and Zero Fillings

### Example 1: Right Side Requires Zero Filling
**Calculate $103^2$**
- Base $B = 100$, deviation $d = +3$.
- $\\text{LHS} = 103 + 3 = 106$
- $\\text{RHS} = 3^2 = 9$. Because base 100 requires 2 digits, we write $09$.
- **Answer:** $10609$.

---

### Example 2: Carry Forward from RHS
**Calculate $112^2$**
- Base $B = 100$, deviation $d = +12$.
- $\\text{LHS} = 112 + 12 = 124$
- $\\text{RHS} = 12^2 = 144$ (exceeds 2 digits; 1 is carried to LHS).
- $\\text{LHS} = 124 + 1 = 125$
- $\\text{RHS} = 44$
- **Answer:** $12544$.

$$\\text{Check: } 112^2 = (110 + 2)^2 = 12100 + 440 + 4 = 12544 \\quad \\checkmark$$

---

### Example 3: Large Base ($B = 1000$)
**Calculate $988^2$**
- Base $B = 1000$, deficit $|d| = 12$.
- $\\text{LHS} = 988 - 12 = 976$
- $\\text{RHS} = 12^2 = 144$ (occupies exactly 3 digits).
- **Answer:** $976144$.`,
      },
      {
        slug: 'base-squares-pitfalls-summary',
        title: 'Common Mistakes & Summary',
        pageType: 'COMMON_MISTAKES',
        order: 5,
        estimatedMinutes: 4,
        contentMarkdown: `## Critical Pitfalls & Checklist

1. **Forgetting Zero Padding on RHS:**
   In $102^2$, $2^2 = 4$. Writing $1044$ is incorrect! Base 100 demands two digits on the right, so it must be $10404$.
2. **Double-Counting the Carry:**
   When squaring $113$, $\\text{LHS} = 126$, $\\text{RHS} = 169$. Carry $1$ to LHS $\\to 12769$. Do not add $1$ before finding the LHS sum.
3. **Subtraction Errors with Deficits:**
   For $89^2$, deficit is $11$. $\\text{LHS} = 89 - 11 = 78$. RHS $= 11^2 = 121$. Carry $1 \\implies 7921$.`,
      },
    ],
    resources: [
      {
        title: 'Squaring Numbers Near Bases in Vedic Math',
        url: 'https://www.youtube.com/watch?v=DqsWA1GuAA8',
        resourceType: 'VIDEO',
        provider: 'YOUTUBE',
        videoId: 'DqsWA1GuAA8',
        embedUrl: 'https://www.youtube-nocookie.com/embed/DqsWA1GuAA8',
        authorOrPublisher: 'Sruthi Karu Vedic Math',
        isEmbeddable: true,
      },
    ],
  },
  {
    topicTitle: 'Squares Ending in 5',
    technique: 'Preceding Number Times One More',
    sutra: 'Ekadhikena Purvena',
    pages: [
      {
        slug: 'squares-ending-5-intro',
        title: 'Introduction to Ekādhikena Purvena Squaring',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 4,
        contentMarkdown: `## The Elegance of Squaring Numbers Ending in 5

One of the most celebrated and instant mental math tricks in Vedic Mathematics is squaring any integer ending in $5$.
The governing formula is:
$$\\textbf{Ekādhikena Pūrveṇa}$$
*(By one more than the previous one).*

For any number represented in place-value notation as $N = 10a + 5$:
$$N^2 = (10a + 5)^2 = 100a^2 + 100a + 25 = 100a(a + 1) + 25$$

This algebraic identity proves that:
1. The rightmost two digits are **always** $25$.
2. The prefix digits are **always** $a \\times (a + 1)$ (the preceding portion multiplied by its consecutive successor).`,
      },
      {
        slug: 'squares-ending-5-method',
        title: 'Step-by-Step Procedure',
        pageType: 'SUTRA_EXPLANATION',
        order: 2,
        estimatedMinutes: 4,
        contentMarkdown: `## General Mental Algorithm

### Procedure for $(10a + 5)^2$
1. Split the number into two parts: the tens/hundreds prefix $a$ and the unit digit $5$.
2. Compute the prefix: $\\text{LHS} = a \\times (a + 1)$.
3. Append $25$ as the $\\text{RHS}$.
4. Concatenate: $\\text{Result} = [a(a + 1)][25]$.

### Example: $75^2$
- Prefix $a = 7$.
- Consecutive successor $a + 1 = 8$.
- $\\text{LHS} = 7 \\times 8 = 56$.
- $\\text{RHS} = 25$.
- Result: **5625**.`,
      },
      {
        slug: 'squares-ending-5-worked-examples',
        title: 'Worked Examples: 2-Digit, 3-Digit, and Decimals',
        pageType: 'WORKED_EXAMPLE',
        order: 3,
        estimatedMinutes: 5,
        contentMarkdown: `## Multi-Digit and Decimal Applications

### Example 1: 3-Digit Number ($115^2$)
- Split: $a = 11$, unit digit $= 5$.
- $\\text{LHS} = 11 \\times 12 = 132$.
- $\\text{RHS} = 25$.
- **Answer:** $13225$.

$$\\text{Verification: } 115 \\times 115 = (100 + 15)^2 = 10000 + 3000 + 225 = 13225 \\quad \\checkmark$$

---

### Example 2: Decimals and Fractions ($8.5^2$)
- Think of $8.5$ as $85 / 10$.
- $85^2 = (8 \\times 9) | 25 = 7225$.
- Account for two decimal places: $72.25$.

Alternatively, in mixed fractions:
$$\\left(8\\frac{1}{2}\\right)^2 = 8 \\times 9 + \\frac{1}{4} = 72\\frac{1}{4}$$`,
      },
      {
        slug: 'squares-ending-5-mistakes-summary',
        title: 'Common Mistakes & Summary',
        pageType: 'SUMMARY',
        order: 4,
        estimatedMinutes: 3,
        contentMarkdown: `## Summary & Common Pitfalls

### Common Misconceptions
- **Applying to non-5 endings:** Ekādhikena Pūrveṇa applies to $(10a + 5)^2$ or more generally when the unit digits sum to 10 and prefixes match (e.g. $43 \\times 47 = 4 \\times 5 | 3 \\times 7 = 2021$). It cannot be used directly for $46^2$.
- **Arithmetic slips in $a(a+1)$:** For large prefixes like $195^2$, $19 \\times 20 = 380 \\implies 38025$. Take care multiplying larger prefixes mentally.`,
      },
    ],
    resources: [
      {
        title: 'Squaring Numbers Ending in 5 Instantly',
        url: 'https://www.youtube.com/watch?v=yG8MHRBE9do',
        resourceType: 'VIDEO',
        provider: 'YOUTUBE',
        videoId: 'yG8MHRBE9do',
        embedUrl: 'https://www.youtube-nocookie.com/embed/yG8MHRBE9do',
        authorOrPublisher: 'MaThrick Masterji',
        isEmbeddable: true,
      },
    ],
  },
  {
    topicTitle: 'Dwandwa Yoga Sutra',
    technique: 'Duplex Method for General Squaring & Square Roots',
    sutra: 'Dwandwa Yoga',
    pages: [
      {
        slug: 'dwandwa-yoga-intro',
        title: 'Introduction to the Duplex (Dwandwa Yoga)',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 5,
        contentMarkdown: `## The Universal Duplex Method

The word **Dwandwa** (द्वन्द्व) signifies a pair, duality, or combination. In Vedic Mathematics, **Dwandwa Yoga** (Duplex combination) provides a single, universal operator $D$ on digits that facilitates:
1. Squaring numbers of any arbitrary length without cross-multiplication tables.
2. Direct, single-line extraction of exact square roots and decimal approximations.

### Definition of Duplex $D(N)$
The duplex of a group of digits is defined by their combinations:
- **Single digit $a$:**
  $$D(a) = a^2$$
- **Two digits $ab$:**
  $$D(ab) = 2 \\times a \\times b$$
- **Three digits $abc$:**
  $$D(abc) = 2 \\times a \\times c + b^2$$
- **Four digits $abcd$:**
  $$D(abcd) = 2 \\times a \\times d + 2 \\times b \\times c$$`,
      },
      {
        slug: 'dwandwa-squaring-theory',
        title: 'Universal Squaring Algorithm',
        pageType: 'THEORY',
        order: 2,
        estimatedMinutes: 6,
        contentMarkdown: `## Squaring via Progressive Duplexes

To compute the square of an $n$-digit number, calculate the duplex of expanding digit groups from the left, peak at the full number, and contract to the right.

### For a 2-Digit Number $ab$:
$$(ab)^2 = D(a) \\;\\vert\\; D(ab) \\;\\vert\\; D(b) = a^2 \\;\\vert\\; 2ab \\;\\vert\\; b^2$$
*(Notice this is the direct algebraic expansion $(10a + b)^2 = 100a^2 + 20ab + b^2$)*.

### For a 3-Digit Number $abc$:
$$(abc)^2 = D(a) \\;\\vert\\; D(ab) \\;\\vert\\; D(abc) \\;\\vert\\; D(bc) \\;\\vert\\; D(c)$$

Each vertical bar represents one place value column. Carries flow naturally from right to left!`,
      },
      {
        slug: 'dwandwa-worked-examples',
        title: 'Worked Examples of Duplex Squaring',
        pageType: 'WORKED_EXAMPLE',
        order: 3,
        estimatedMinutes: 6,
        contentMarkdown: `## Step-by-Step Duplex Squaring

### Example 1: Square of 43
- $D(4) = 4^2 = 16$
- $D(43) = 2 \\times 4 \\times 3 = 24$
- $D(3) = 3^2 = 9$
- Write columns: $16 \\;\\vert\\; 24 \\;\\vert\\; 9$
- Flow carry $2$ from $24$ into $16$:
  $$16 + 2 = 18 \\implies 1849$$
- **Answer:** $1849$.

$$\\text{Check: } 43^2 = (40 + 3)^2 = 1600 + 240 + 9 = 1849 \\quad \\checkmark$$

---

### Example 2: Square of 312
Calculate duplexes for $3, 31, 312, 12, 2$:
1. $D(3) = 3^2 = 9$
2. $D(31) = 2(3)(1) = 6$
3. $D(312) = 2(3)(2) + 1^2 = 12 + 1 = 13$
4. $D(12) = 2(1)(2) = 4$
5. $D(2) = 2^2 = 4$

Layout:
$$9 \\;\\vert\\; 6 \\;\\vert\\; 13 \\;\\vert\\; 4 \\;\\vert\\; 4$$
Carry $1$ from $13$ into $6 \\to 7$:
$$\\mathbf{97344}$$
- **Answer:** $97344$.

$$\\text{Check: } 312^2 = (300 + 12)^2 = 90000 + 7200 + 144 = 97344 \\quad \\checkmark$$`,
      },
      {
        slug: 'dwandwa-square-roots',
        title: 'Duplex Extraction of Square Roots',
        pageType: 'THEORY',
        order: 4,
        estimatedMinutes: 7,
        contentMarkdown: `## Extracting Square Roots Using Dwandwa Yoga

The duplex operator allows direct left-to-right extraction of square roots.

### Algorithm
1. Group digits in pairs from the decimal point leftwards and rightwards.
2. Find the largest square less than or equal to the first group. Its square root is the first quotient digit $q_1$, and the remainder becomes the prefix for the next dividend.
3. The divisor is always **$2 \\times q_1$**.
4. In each subsequent step:
   $$\\text{Gross Dividend} = \\text{Prefix remainder} \\times 10 + \\text{next digit}$$
   $$\\text{Net Dividend} = \\text{Gross Dividend} - \\text{Duplex of quotient digits found}$$
   $$\\text{New Quotient Digit} = \\lfloor\\text{Net Dividend} / \\text{Divisor}\\rfloor$$
   $$\\text{New Remainder} = \\text{Net Dividend} \\pmod{\\text{Divisor}}$$

### Example: $\\sqrt{5329}$
- Pairs: $53 \\;\\vert\\; 29$.
- First group $53$: $7^2 = 49 \\le 53$. First digit $q_1 = 7$. Remainder $53 - 49 = 4$.
- Divisor $= 2 \\times 7 = 14$.
- Next gross dividend with prefix $4$ and digit $2$: $42$.
- Net dividend $= 42 - 0 = 42$.
- $42 \\div 14 = 3$ remainder $0$. New digit $q_2 = 3$.
- Next gross dividend with prefix $0$ and digit $9$: $09$.
- Deduct duplex $D(q_2) = D(3) = 3^2 = 9$:
  $$\\text{Net dividend} = 9 - 9 = 0$$
- Division terminates with $0$ remainder.
- **Answer:** $\\sqrt{5329} = 73$.`,
      },
      {
        slug: 'dwandwa-mistakes-summary',
        title: 'Common Mistakes & Summary',
        pageType: 'COMMON_MISTAKES',
        order: 5,
        estimatedMinutes: 4,
        contentMarkdown: `## Common Pitfalls in Duplex Operations

1. **Omitting the Center Square in Odd-Digit Duplexes:**
   For $D(abc)$, students often calculate $2ac$ and forget $+ b^2$. Remember: the outer pair is doubled, but the unpaired middle digit is squared!
2. **Duplex Subtraction Order in Square Roots:**
   When calculating net dividends in square roots, always subtract the duplex of the appropriate quotient digits. If the net dividend becomes negative, reduce the previous quotient digit by 1 and increase the remainder accordingly.`,
      },
    ],
    resources: [
      {
        title: 'Universal Squaring with Dwandwa Yoga (Duplex Method)',
        url: 'https://www.youtube.com/watch?v=JX1PA4S95ho',
        resourceType: 'VIDEO',
        provider: 'YOUTUBE',
        videoId: 'JX1PA4S95ho',
        embedUrl: 'https://www.youtube-nocookie.com/embed/JX1PA4S95ho',
        authorOrPublisher: 'Scientific Rana',
        isEmbeddable: true,
      },
    ],
  },
  {
    topicTitle: 'Square Root of 2',
    technique: 'Baudhayana Sulbasutra Continued Approximation',
    sutra: 'Baudhayana Shulbasutra',
    pages: [
      {
        slug: 'sqrt2-historical-context',
        title: 'The Baudhayana Shulbasutra Approximation',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 5,
        contentMarkdown: `## Historical & Mathematical Context of $\\sqrt{2}$

Centuries before the formalization of irrational numbers in ancient Greece, the Vedic altar-builders (*sūtrakāras*) faced a practical geometric problem: constructing a square altar with twice the area of a given square.

By the diagonal property of the square of side $1$, the diagonal length is $\\sqrt{2}$.

In the **Baudhāyana Śulbasūtra** (verse 1.61, c. 800–600 BCE), the text states:
$$\\text{समस्य द्विकरणी प्रमाणं तृतीयेन वर्धयेत्तच्च चतुर्थेनात्मचतुस्त्रिंशोनेन सविशेषः।}$$

> *"The measure is to be increased by its third, and this [third] again by its fourth, less the thirty-fourth part of that fourth. This is the approximate diagonal."*

### Mathematical Formulation
$$\\sqrt{2} \\approx 1 + \\frac{1}{3} + \\frac{1}{3 \\times 4} - \\frac{1}{3 \\times 4 \\times 34}$$`,
      },
      {
        slug: 'sqrt2-fraction-calculation',
        title: 'Fractional & Decimal Precision',
        pageType: 'THEORY',
        order: 2,
        estimatedMinutes: 6,
        contentMarkdown: `## Evaluation of Baudhayana\\'s Expression

Let us combine the terms into a single rational number:
$$\\sqrt{2} \\approx 1 + \\frac{1}{3} + \\frac{1}{12} - \\frac{1}{408}$$

### Step-by-Step Common Denominator:
1. $1 + \\frac{1}{3} = \\frac{4}{3}$
2. $\\frac{4}{3} + \\frac{1}{12} = \\frac{16 + 1}{12} = \\frac{17}{12}$
3. $\\frac{17}{12} - \\frac{1}{408} = \\frac{17 \\times 34 - 1}{408} = \\frac{578 - 1}{408} = \\frac{577}{408}$

### Decimal Comparison
$$\\frac{577}{408} = 1.414215686\\dots$$
$$\\text{Modern True Value: } \\sqrt{2} = 1.414213562\\dots$$
$$\\text{Absolute Error} = 0.000002124\\dots \\quad (< 0.00015\\%!)$$

This approximation is correct to **five decimal places**, an astonishing feat of ancient applied mathematics achieved purely through geometric iteration of ropes and squares.`,
      },
      {
        slug: 'sqrt2-geometric-derivation',
        title: 'Geometric Intuition Behind the Formula',
        pageType: 'THEORY',
        order: 3,
        estimatedMinutes: 6,
        contentMarkdown: `## How Did Baudhayana Derive It?

Scholars such as Thibaut and Datta have demonstrated that Baudhayana\\'s formula was derived geometrically from expanding squares:

1. **First approximation:**
   Start with side $1$. A square of side $4/3$ has area $(4/3)^2 = 16/9 = 1.777\\dots$ (too small for $2$).
2. **Second correction:**
   Add a narrow strip of width $1/(3 \\times 4) = 1/12$.
   Side becomes $17/12$.
   $$(17/12)^2 = 289/144 = 2 + 1/144$$
   This area exceeds $2$ by exactly $\\frac{1}{144}$!
3. **Third correction:**
   To remove the excess area of $\\frac{1}{144}$ from two sides of length $17/12$:
   $$\\text{Correction} = \\frac{1/144}{2 \\times (17/12)} = \\frac{1}{144 \\times (34/12)} = \\frac{1}{12 \\times 34} = \\frac{1}{408}$$
   Subtracting this correction produces the exact term $-\\frac{1}{3 \\times 4 \\times 34}$.`,
      },
      {
        slug: 'sqrt2-summary',
        title: 'Historical Significance & Summary',
        pageType: 'SUMMARY',
        order: 4,
        estimatedMinutes: 4,
        contentMarkdown: `## Historical Reflection & Takeaways

### Distinction Between History and Myth
- The Baudhayana approximation is an **empirically verified historical text** found in the Sulbasutras dating to the 1st millennium BCE.
- It demonstrates early mastery of rational approximations to quadratic irrationals, preceding Archimedes and Heron.
- It was created for sacrificial altar geometry (the *vedi* construction), where doubling the altar area while preserving square proportionality was a sacred requirement.`,
      },
    ],
    resources: [
      {
        title: 'Baudhayana Shulbasutra and the Square Root of 2',
        url: 'https://mathshistory.st-andrews.ac.uk/Biographies/Baudhayana/',
        resourceType: 'ARTICLE',
        provider: 'OPEN_EDUCATIONAL_RESOURCE',
        authorOrPublisher: 'MacTutor History of Mathematics Archive, St Andrews',
      },
    ],
  },
  {
    topicTitle: 'Cubing Using Yavadunam Sutra',
    technique: 'Triple Deviation Base Cubing',
    sutra: 'Yavadunam',
    pages: [
      {
        slug: 'base-cubing-intro',
        title: 'Introduction to Yāvadūnam Cubing',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 5,
        contentMarkdown: `## Cubing Numbers Near Powers of 10

Cubing a number $(B + d)^3$ manually requires long multiplication. The Vedic sutra **Yāvadūnam** decomposes the cubic binomial into three intuitive columns:

$$(B + d)^3 = B^3 + 3B^2d + 3Bd^2 + d^3$$

Dividing by the base powers, the number splits into three distinct parts:
$$\\mathbf{N + 2d \\;\\vert\\; 3 \\times d^2 \\;\\vert\\; d^3}$$

### The Three Columns
1. **Left Part:** $N + 2d$ (the number plus twice its deviation)
2. **Middle Part:** $3 \\times d^2$ (three times the square of the deviation)
3. **Right Part:** $d^3$ (the cube of the deviation)`,
      },
      {
        slug: 'base-cubing-algorithm',
        title: 'Step-by-Step Base Cubing Algorithm',
        pageType: 'THEORY',
        order: 2,
        estimatedMinutes: 6,
        contentMarkdown: `## Step-by-Step Procedure for Base 10 and 100

### Rules for Digit Width
- If Base $B = 10$, Middle and Right parts must each have **1 digit**.
- If Base $B = 100$, Middle and Right parts must each have **2 digits**.
- Any excess digits carry leftwards into the preceding column.
- Any deficit must be zero-padded on the left.

### Example: $104^3$
- Base $B = 100$, deviation $d = +4$.
- **LHS:** $N + 2d = 104 + 2(4) = 104 + 8 = 112$.
- **Middle:** $3 \\times d^2 = 3 \\times 4^2 = 3 \\times 16 = 48$ (2 digits $\\checkmark$).
- **RHS:** $d^3 = 4^3 = 64$ (2 digits $\\checkmark$).
- Concatenate: **1124864**.

$$\\text{Check: } 104^3 = 104 \\times 10816 = 1124864 \\quad \\checkmark$$`,
      },
      {
        slug: 'base-cubing-worked-examples',
        title: 'Worked Examples with Carries and Deficits',
        pageType: 'WORKED_EXAMPLE',
        order: 3,
        estimatedMinutes: 6,
        contentMarkdown: `## Handling Carries and Negative Deviations

### Example 1: With Carries ($106^3$)
- Base $B = 100$, $d = +6$.
- $\\text{LHS} = 106 + 2(6) = 118$.
- $\\text{Middle} = 3 \\times 6^2 = 3 \\times 36 = 108$.
  Because middle can only take 2 digits, $1$ carries into LHS:
  $\\text{LHS} = 118 + 1 = 119$, $\\text{Middle} = 08$.
- $\\text{RHS} = 6^3 = 216$.
  Carry $2$ into middle:
  $\\text{Middle} = 08 + 2 = 10$, $\\text{RHS} = 16$.
- **Answer:** $1191016$.

$$\\text{Check: } 106^3 = 106 \\times 11236 = 1191016 \\quad \\checkmark$$

---

### Example 2: Number Below the Base ($98^3$)
- Base $B = 100$, $d = -2$.
- $\\text{LHS} = 98 + 2(-2) = 98 - 4 = 94$.
- $\\text{Middle} = 3 \\times (-2)^2 = 3 \\times 4 = 12$.
- $\\text{RHS} = (-2)^3 = -8 = \\overline{08}$.
- Convert vinculum: borrow $1$ from Middle ($12 - 1 = 11$):
  $$\\text{RHS} = 100 - 8 = 92$$
- **Answer:** $941192$.

$$\\text{Check: } 98^3 = (100 - 2)^3 = 1000000 - 60000 + 1200 - 8 = 941192 \\quad \\checkmark$$`,
      },
      {
        slug: 'base-cubing-summary',
        title: 'Summary & Key Guidelines',
        pageType: 'SUMMARY',
        order: 4,
        estimatedMinutes: 4,
        contentMarkdown: `## Master Summary of Yāvadūnam Cubing

- **Formula Matrix:**
  $$\\begin{array}{|c|c|c|}
  \\hline
  \\text{Column 1 (LHS)} & \\text{Column 2 (Middle)} & \\text{Column 3 (RHS)} \\\\
  \\hline
  N + 2d & 3d^2 & d^3 \\\\
  \\hline
  \\end{array}$$
- Always resolve carries from right to left (RHS $\\to$ Middle $\\to$ LHS).
- For negative deviations, use standard 100s complement borrowing on the RHS.`,
      },
    ],
    resources: [
      {
        title: 'Vedic Math Fast Cubing Technique',
        url: 'https://www.youtube.com/watch?v=DqsWA1GuAA8',
        resourceType: 'VIDEO',
        provider: 'YOUTUBE',
        videoId: 'DqsWA1GuAA8',
        embedUrl: 'https://www.youtube-nocookie.com/embed/DqsWA1GuAA8',
        authorOrPublisher: 'Sruthi Karu Vedic Math',
        isEmbeddable: true,
      },
    ],
  },
];

export const MODULE_4_PACKAGES = module4Topics;
