import { Difficulty } from '@prisma/client';
import { TopicContentPackage } from './types';

export const MODULE_3_PACKAGES: TopicContentPackage[] = [
  // ===========================================================
  // TOPIC 10: Base Method Multiplication
  // ===========================================================
  {
    topicTitle: 'Base Method Multiplication',
    moduleTitle: 'Miracle Multiplication and Excellent Division',
    lessonTitle: 'Base Multiplication via Nikhilam Navatashcaramam Dashatah',
    lessonDescription:
      'Multiply numbers near base 10, 100, 1000, and sub-bases using cross-addition and deviation products in a single mental line.',
    sutra: 'Nikhilam Navatashcaramam Dashatah',
    technique: 'Base Deficiency & Surplus Multiplication',
    difficulty: Difficulty.EASY,
    estimatedMinutes: 25,
    resources: [
      {
        title: 'Nikhilam Base Method Multiplication Tutorial',
        description: 'Complete guide to multiplying numbers near base 10, 100, and 1000 using deficiencies and surpluses.',
        resourceType: 'YOUTUBE_VIDEO',
        url: 'https://www.youtube.com/watch?v=MbUEIvZ6YPE',
        embedUrl: 'https://www.youtube-nocookie.com/embed/MbUEIvZ6YPE',
        provider: 'YouTube',
        authorOrPublisher: 'Sruthi Karu Vedic Math',
        attributionText: 'Curated video on Nikhilam Multiplication techniques',
        licenseType: 'Standard YouTube License',
        isVerified: true,
      },
    ],
    pages: [
      {
        title: 'Introduction & Base Intuition',
        slug: 'intro-base-multiplication',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 3,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Understand the concept of working bases (10, 100, 1000)',
          'Learn to calculate positive surpluses and negative deficiencies',
        ],
        contentMarkdown: `## Introduction: The Power of Proximity to a Base

Multiplying $98 \\times 97$ conventionally requires writing two partial products, remembering carries, and summing columns.

In Vedic Mathematics, we notice both numbers are near **Base 100**:
- $98$ has a deficiency of $-2$ (it is $100 - 2$)
- $97$ has a deficiency of $-3$ (it is $100 - 3$)

### The Two-Part Solution
1. **Left Part:** Cross-subtract either deviation:
   $$98 - 3 = 95 \\quad (\\text{or } 97 - 2 = 95)$$
2. **Right Part:** Multiply the deficiencies:
   $$(-2) \\times (-3) = 06$$

Combine them: **9506** in 3 seconds!`,
      },
      {
        title: 'Mathematical Theory & Algebraic Proof',
        slug: 'theory-base-multiplication',
        pageType: 'THEORY',
        order: 2,
        estimatedMinutes: 4,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Prove the algebraic identity: (B + a)(B + b) = B(B + a + b) + ab',
          'Understand why the number of zeros in the base determines RHS digit count',
        ],
        contentMarkdown: `## Algebraic Proof of the Base Method

Let the base be $B = 10^k$. Let two numbers be $X = (B + a)$ and $Y = (B + b)$, where $a$ and $b$ are deviations (surpluses if positive, deficiencies if negative).

Multiply $X \\times Y$:
$$(B + a)(B + b) = B^2 + Ba + Bb + ab = B(B + a + b) + ab$$

Notice that:
- $B + a + b = X + b = Y + a$ (This is the **cross-addition**!)
- Multiplied by $B$, this shifts the cross-sum to the higher place value.
- $ab$ is simply the product of the deviations!

### Crucial Rule: RHS Digit Count
Because $B = 10^k$, the right-hand part ($ab$) must occupy **exactly $k$ digits** (the number of zeros in the base).
- For Base 10: 1 digit on RHS.
- For Base 100: 2 digits on RHS (prefix a 0 if single digit: e.g. write $06$ instead of $6$).
- For Base 1000: 3 digits on RHS.`,
      },
      {
        title: 'Worked Examples: Both Below & Both Above Base',
        slug: 'worked-examples-base-multiplication',
        pageType: 'WORKED_EXAMPLES',
        order: 3,
        estimatedMinutes: 5,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Solve multiplication for numbers below base 100 and above base 100',
          'Properly format leading zeros on the RHS',
        ],
        contentMarkdown: `## Worked Examples

### Case 1: Both Below Base ($96 \\times 94$)
Base: $100$
Deviations: $-4, -6$
$$\\begin{array}{r@{\\quad}r}
96 & -04 \\\\
94 & -06 \\\\
\\hline
(96 - 6) & (-4) \\times (-6) \\\\
90 & 24
\\end{array}$$
$$\\mathbf{96 \\times 94 = 9024}$$
*Verification:* $96 \\times 94 = 9024$. Correct!

---

### Case 2: Both Above Base ($104 \\times 107$)
Base: $100$
Deviations: $+04, +07$
$$\\begin{array}{r@{\\quad}r}
104 & +04 \\\\
107 & +07 \\\\
\\hline
(104 + 7) & (+4) \\times (+7) \\\\
111 & 28
\\end{array}$$
$$\\mathbf{104 \\times 107 = 11128}$$
*Verification:* $104 \\times 107 = 11128$. Correct!`,
      },
      {
        title: 'Case 3: One Above and One Below Base (Vinculum)',
        slug: 'mixed-base-multiplication',
        pageType: 'SUTRA_TECHNIQUE',
        order: 4,
        estimatedMinutes: 4,
        difficulty: Difficulty.MEDIUM,
        learningObjectives: [
          'Multiply mixed numbers where one has surplus and one has deficiency',
          'Apply vinculum subtraction to resolve negative RHS',
        ],
        contentMarkdown: `## Mixed Case: One Above, One Below ($103 \\times 96$)

Base: $100$
Deviations: $+03$ and $-04$

1. **Left Part:** $103 - 4 = 99$ (or $96 + 3 = 99$).
2. **Right Part:** $(+3) \\times (-4) = -12$ (a negative quantity $\\overline{12}$).
3. **Combine via Place Value:**
   $$99 \\text{ hundreds} - 12 = 9900 - 12 = \\mathbf{9888}$$
   *Shortcut:* Reduce left part by $1$ ($99 - 1 = 98$) and take the 100s complement of $12$ via All From 9 and Last From 10 ($100 - 12 = 88$).
$$\\mathbf{103 \\times 96 = 9888}$$
*Verification:* $103 \\times 96 = 9888$. Correct!`,
      },
      {
        title: 'Common Mistakes & Diagnostics',
        slug: 'common-mistakes-base-multiplication',
        pageType: 'COMMON_ERRORS',
        order: 5,
        estimatedMinutes: 3,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Avoid missing leading zeros on RHS for base 100 and 1000',
          'Avoid carry overflow mistakes on RHS',
        ],
        contentMarkdown: `## Common Student Errors

1. **The Missing Zero Trap:**
   - *Problem:* $98 \\times 99$ (Deviations $-2, -1$).
   - *Wrong Answer:* Left $= 97$, Right $= (-2) \\times (-1) = 2 \\implies 972$.
   - *Correct:* Base 100 needs **two digits** on the right! Right $= 02 \\implies \\mathbf{9702}$.
2. **The Carry-Over Overflow:**
   - *Problem:* $88 \\times 88$ (Deviations $-12, -12$).
   - *Right Part:* $(-12) \\times (-12) = 144$ (3 digits, but base 100 holds only 2!).
   - *Correct:* Carry the $1$ to the left: Left $= (88 - 12) + 1 = 76 + 1 = 77$. RHS $= 44 \\implies \\mathbf{7744}$.`,
      },
      {
        title: 'Summary & Practice Prep',
        slug: 'summary-base-multiplication',
        pageType: 'SUMMARY',
        order: 6,
        estimatedMinutes: 2,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Review the base multiplication rules',
          'Practice with real-time generated problems',
        ],
        contentMarkdown: `## Topic Summary

- Match deviations against base $10^k$.
- Left part $= X + b = Y + a$.
- Right part $= a \\times b$ (must have exactly $k$ digits).
- If right part is negative, subtract from base.

Click **Practice This Topic** below to master the Base Method!`,
      },
    ],
  },

  // ===========================================================
  // TOPIC 11: Urdhva Tiryak Multiplication
  // ===========================================================
  {
    topicTitle: 'Urdhva Tiryak Multiplication',
    moduleTitle: 'Miracle Multiplication and Excellent Division',
    lessonTitle: 'Universal Vertically & Crosswise Multiplication (Urdhva-Tiryagbhyam)',
    lessonDescription:
      'Multiply arbitrary multi-digit numbers universally in a single horizontal line using symmetric vertical and crosswise multiplication patterns.',
    sutra: 'Urdhva-Tiryagbhyam',
    technique: 'Universal Vertically & Crosswise Multiplication',
    difficulty: Difficulty.MEDIUM,
    estimatedMinutes: 25,
    resources: [
      {
        title: 'Universal Multiplication by Urdhva-Tiryagbhyam',
        description: 'Visual step-by-step tutorial on vertical and crosswise multiplication for 2-digit and 3-digit numbers.',
        resourceType: 'YOUTUBE_VIDEO',
        url: 'https://www.youtube.com/watch?v=b6n3D90BZB8',
        embedUrl: 'https://www.youtube-nocookie.com/embed/b6n3D90BZB8',
        provider: 'YouTube',
        authorOrPublisher: 'MyRank Vedic Maths',
        attributionText: 'Curated tutorial on Urdhva Tiryak multiplication',
        licenseType: 'Standard YouTube License',
        isVerified: true,
      },
    ],
    pages: [
      {
        title: 'Introduction: The Universal Multiplier',
        slug: 'intro-urdhva-tiryak',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 3,
        difficulty: Difficulty.MEDIUM,
        learningObjectives: [
          'Understand why Urdhva-Tiryagbhyam is considered the crown jewel of Vedic arithmetic',
          'Recognize that it applies to ANY numbers regardless of base proximity',
        ],
        contentMarkdown: `## The Universal Multiplier

While the Base Method requires numbers to be close to 10, 100, or 1000, **Urdhva-Tiryagbhyam** (Vertically and Crosswise) is **completely universal**.

It multiplies:
- Any 2-digit by 2-digit number
- Any 3-digit by 3-digit number
- Any $n$-digit polynomial or matrix

All in a **single horizontal line**, calculating and adding place-value products mentally!`,
      },
      {
        title: 'The 3-Step Pattern for 2-Digit Multiplication',
        slug: 'two-digit-pattern',
        pageType: 'THEORY',
        order: 2,
        estimatedMinutes: 4,
        difficulty: Difficulty.MEDIUM,
        learningObjectives: [
          'Memorize the 3-step geometric pattern: Vertical -> Crosswise -> Vertical',
          'Accumulate single-line carries mentally',
        ],
        contentMarkdown: `## The 2-Digit Pattern: $| \\; \\times \\; |$

To multiply two 2-digit numbers:
$$\\begin{array}{cc} a & b \\\\ c & d \\end{array}$$

The calculation proceeds in 3 symmetric steps:
1. **Right Vertical ($|$):** Multiply units digits:
   $$\\text{Step 1} = b \\times d$$
2. **Crosswise ($\\times$):** Multiply diagonals and add:
   $$\\text{Step 2} = (a \\times d) + (b \\times c)$$
3. **Left Vertical ($|$):** Multiply tens digits:
   $$\\text{Step 3} = a \\times c$$

Carries from each step are simply added to the step to the left!`,
      },
      {
        title: 'Worked Examples: 2-Digit Numbers',
        slug: 'worked-examples-two-digit',
        pageType: 'WORKED_EXAMPLES',
        order: 3,
        estimatedMinutes: 5,
        difficulty: Difficulty.MEDIUM,
        learningObjectives: [
          'Execute vertical and crosswise multiplication on concrete numbers',
          'Follow carry management with precision',
        ],
        contentMarkdown: `## Worked Examples

### Example 1: $23 \\times 14$
$$\\begin{array}{cc} 2 & 3 \\\\ 1 & 4 \\end{array}$$

1. **Step 1 (Right Vertical):** $3 \\times 4 = 12$
   - Write **2**, carry **1**.
2. **Step 2 (Crosswise):** $(2 \\times 4) + (3 \\times 1) + \\text{carry } 1 = 8 + 3 + 1 = 12$
   - Write **2**, carry **1**.
3. **Step 3 (Left Vertical):** $(2 \\times 1) + \\text{carry } 1 = 2 + 1 = 3$
   - Write **3**.

Combine from left to right: **322**
*Verification:* $23 \\times 14 = 322$. Correct!

---

### Example 2: $47 \\times 36$
1. **Right Vertical:** $7 \\times 6 = 42$ (write 2, carry 4).
2. **Crosswise:** $(4 \\times 6) + (7 \\times 3) + 4 = 24 + 21 + 4 = 49$ (write 9, carry 4).
3. **Left Vertical:** $(4 \\times 3) + 4 = 12 + 4 = 16$.
$$\\mathbf{47 \\times 36 = 1692}$$
*Verification:* $47 \\times 36 = 1692$. Correct!`,
      },
      {
        title: 'The 5-Step Pattern for 3-Digit Multiplication',
        slug: 'three-digit-pattern',
        pageType: 'SUTRA_TECHNIQUE',
        order: 4,
        estimatedMinutes: 5,
        difficulty: Difficulty.HARD,
        learningObjectives: [
          'Understand the symmetric 5-step expansion for 3-digit numbers',
          'Apply star-cross combinations with confidence',
        ],
        contentMarkdown: `## 3-Digit Universal Multiplication: 5 Steps

For numbers $a_1 b_1 c_1 \\times a_2 b_2 c_2$:

1. **Right Vertical:** $c_1 c_2$
2. **Right Crosswise:** $b_1 c_2 + c_1 b_2$
3. **Star Combination (Outer Cross + Middle Vertical):**
   $$(a_1 c_2 + c_1 a_2) + (b_1 b_2)$$
4. **Left Crosswise:** $a_1 b_2 + b_1 a_2$
5. **Left Vertical:** $a_1 a_2$

Notice the beautiful bell-shaped symmetry: $1 \\to 2 \\to 3 \\to 2 \\to 1$ terms!`,
      },
      {
        title: 'Summary & Practice Prep',
        slug: 'summary-urdhva-tiryak',
        pageType: 'SUMMARY',
        order: 5,
        estimatedMinutes: 2,
        difficulty: Difficulty.MEDIUM,
        learningObjectives: [
          'Review Urdhva Tiryak steps',
          'Launch interactive practice',
        ],
        contentMarkdown: `## Topic Summary

- **Urdhva-Tiryagbhyam** is universal: works for all numbers.
- 2-digit: 3 steps ($| \\; \\times \\; |$).
- 3-digit: 5 steps ($| \\; \\times \\; * \\; \\times \\; |$).
- Carries flow smoothly from right to left.

Click **Practice This Topic** below to try randomized problems!`,
      },
    ],
  },

  // ===========================================================
  // TOPIC 12: Multiplication by Series of 1s
  // ===========================================================
  {
    topicTitle: 'Multiplication by Series of 1s',
    moduleTitle: 'Miracle Multiplication and Excellent Division',
    lessonTitle: 'Multiplication by 11, 111, and Series of 1s',
    lessonDescription:
      'Multiply any number by 11, 111, or arbitrary strings of 1s instantaneously using the neighbor addition scheme without longhand multiplication.',
    sutra: 'Ekadhikena Purvena',
    technique: 'Neighbor Addition Scheme',
    difficulty: Difficulty.EASY,
    estimatedMinutes: 20,
    resources: [
      {
        title: 'Multiply by 11 and 111 in Seconds',
        description: 'Visual demonstration of the sliding neighbor-addition method for multiplying by 11 and 111.',
        resourceType: 'YOUTUBE_VIDEO',
        url: 'https://www.youtube.com/watch?v=8e7a775X4DE',
        embedUrl: 'https://www.youtube-nocookie.com/embed/8e7a775X4DE',
        provider: 'YouTube',
        authorOrPublisher: 'Sruthi Karu Vedic Math',
        attributionText: 'Curated video on Series of 1s multiplication',
        licenseType: 'Standard YouTube License',
        isVerified: true,
      },
    ],
    pages: [
      {
        title: 'Introduction: The Magic of 11',
        slug: 'intro-series-ones',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 3,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Observe the neighbor addition pattern when multiplying by 11',
          'Eliminate standard two-row partial products',
        ],
        contentMarkdown: `## Multiplication by 11: The Neighbor Addition Scheme

Multiplying by 11 is one of the most delightful mental shortcuts in arithmetic.

Look at $43 \\times 11$:
- The first digit is **4**.
- The middle digit is the sum of the digits: $4 + 3 = \\mathbf{7}$.
- The last digit is **3**.
$$\\mathbf{43 \\times 11 = 473}$$

This is not magic—it is place-value neighbor summation!`,
      },
      {
        title: 'Multi-Digit Numbers & Carry Management',
        slug: 'multi-digit-series-ones',
        pageType: 'THEORY',
        order: 2,
        estimatedMinutes: 4,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Extend the neighbor method to numbers of any length',
          'Handle carries when neighbor sums exceed 9',
        ],
        contentMarkdown: `## Multiplying Any Number by 11

### The Universal Algorithm
To multiply any number $N$ by 11:
1. Write down the last digit of $N$.
2. Add each pair of adjacent neighbors moving right-to-left.
3. Write down the first digit of $N$ (plus any carry).

### Example: $432 \\times 11$
- Last digit: **2**
- Middle: $3 + 2 = \\mathbf{5}$
- Middle: $4 + 3 = \\mathbf{7}$
- First digit: **4**
$$\\mathbf{432 \\times 11 = 4752}$$
*Verification:* $432 \\times 11 = 4752$. Correct!`,
      },
      {
        title: 'Worked Examples with Carries & 111',
        slug: 'worked-examples-series-ones',
        pageType: 'WORKED_EXAMPLES',
        order: 3,
        estimatedMinutes: 4,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Handle neighbor sums >= 10 with carries',
          'Extend the window to 3 digits for multiplying by 111',
        ],
        contentMarkdown: `## Worked Examples

### Example 1 (With Carries): $785 \\times 11$
- Units: **5**
- Next: $8 + 5 = 13$ (write **3**, carry 1)
- Next: $7 + 8 + 1 = 16$ (write **6**, carry 1)
- Leading: $7 + 1 = \\mathbf{8}$
$$\\mathbf{785 \\times 11 = 8635}$$
*Verification:* $785 \\times 11 = 8635$. Correct!

---

### Example 2: Multiplying by 111
When multiplying by $111$, the sliding window sums **groups of three neighbors**:
$$234 \\times 111$$
- Units: $4$
- Tens: $3 + 4 = 7$
- Hundreds: $2 + 3 + 4 = 9$
- Thousands: $2 + 3 = 5$
- Ten-thousands: $2$
$$\\mathbf{234 \\times 111 = 25974}$$`,
      },
      {
        title: 'Summary & Practice Prep',
        slug: 'summary-series-ones',
        pageType: 'SUMMARY',
        order: 4,
        estimatedMinutes: 2,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Consolidate series of 1s shortcuts',
          'Practice speed calculations',
        ],
        contentMarkdown: `## Topic Summary

- Multiply by 11: Add pairs of neighbors.
- Multiply by 111: Add triplets of neighbors.
- Carries propagate naturally to the left.

Click **Practice This Topic** below to test your speed!`,
      },
    ],
  },

  // ===========================================================
  // TOPIC 13: Multiplication by Series of 9s
  // ===========================================================
  {
    topicTitle: 'Multiplication by Series of 9s',
    moduleTitle: 'Miracle Multiplication and Excellent Division',
    lessonTitle: 'Multiplication by 9, 99, 999 via Ekanyunena Purvena',
    lessonDescription:
      'Multiply numbers by strings of 9s instantly using the Ekanyunena Purvena (By One Less) aphorism and 9s complement decomposition.',
    sutra: 'Ekanyunena Purvena',
    technique: 'One Less and Decimal Complement',
    difficulty: Difficulty.EASY,
    estimatedMinutes: 20,
    resources: [
      {
        title: 'Multiply by 9s Instantly: Ekanyunena Purvena',
        description: 'Tutorial demonstrating instantaneous multiplication by 9, 99, 999, and 9999 using the One Less rule.',
        resourceType: 'YOUTUBE_VIDEO',
        url: 'https://www.youtube.com/watch?v=4vCsXaI_FEg',
        embedUrl: 'https://www.youtube-nocookie.com/embed/4vCsXaI_FEg',
        provider: 'YouTube',
        authorOrPublisher: 'Sruthi Karu Vedic Math',
        attributionText: 'Curated video on Ekanyunena Purvena multiplication',
        licenseType: 'Standard YouTube License',
        isVerified: true,
      },
    ],
    pages: [
      {
        title: 'Introduction & The Ekanyunena Aphorism',
        slug: 'intro-series-nines',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 3,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Understand the Sanskrit meaning of Ekanyunena Purvena (By one less than previous)',
          'Learn the two-part partition for multiplication by 9s',
        ],
        contentMarkdown: `## Introduction: The "One Less" Aphorism

The Sutra **Ekanyunena Purvena** means:
$$\\textbf{"By one less than the previous one"}$$

Whenever you multiply a number by an equal string of 9s (e.g. $64 \\times 99$), the answer splits into two equal parts:
1. **Left Part:** Subtract 1 from the number:
   $$64 - 1 = \\mathbf{63}$$
2. **Right Part:** Subtract each digit of the left part from 9:
   $$9 - 6 = 3, \\quad 9 - 3 = 6 \\implies \\mathbf{36}$$

Combine them: **6336** in 2 seconds!`,
      },
      {
        title: 'Theory & Algebraic Rationale',
        slug: 'theory-series-nines',
        pageType: 'THEORY',
        order: 2,
        estimatedMinutes: 4,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Prove why N * (10^k - 1) splits into (N - 1) and (10^k - 1 - (N - 1))',
          'Understand the 3 cases: equal digits, more 9s, and fewer 9s',
        ],
        contentMarkdown: `## Algebraic Proof of the 9s Rule

Let $N$ be a $k$-digit number multiplied by $k$ nines ($10^k - 1$):
$$N \\times (10^k - 1) = N \\cdot 10^k - N$$
Rewrite $N \\cdot 10^k - N$ by splitting:
$$= (N - 1) \\cdot 10^k + (10^k - N)$$

Notice:
- The upper $k$ digits are $(N - 1)$ (This is *Ekanyunena* — **one less**!).
- The lower $k$ digits are $(10^k - N)$, which is the exact **Nikhilam complement** of $N$ (All from 9 and last from 10)!

### Three Cases
1. **Equal Digits:** Digits in $N$ equal the count of 9s ($64 \\times 99$).
2. **More 9s:** $N$ has fewer digits ($7 \\times 999 \\implies 007 \\times 999$).
3. **Fewer 9s:** $N$ has more digits ($432 \\times 99$). Resolved by subtraction.`,
      },
      {
        title: 'Worked Examples Across All Cases',
        slug: 'worked-examples-series-nines',
        pageType: 'WORKED_EXAMPLES',
        order: 3,
        estimatedMinutes: 5,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Solve problems with equal 9s and more 9s',
          'Verify arithmetic deterministically',
        ],
        contentMarkdown: `## Worked Examples

### Example 1: $73 \\times 99$
1. Left part: $73 - 1 = \\mathbf{72}$
2. Right part (all from 9): $9 - 7 = 2, 9 - 2 = 7 \\implies \\mathbf{27}$
$$\\mathbf{73 \\times 99 = 7227}$$
*Verification:* $73 \\times 99 = 7227$. Correct!

---

### Example 2 (More 9s): $48 \\times 999$
Pad 48 with a leading zero to match 3 digits: **048**
1. Left part: $48 - 1 = \\mathbf{047}$
2. Right part: $9 - 0 = 9, 9 - 4 = 5, 9 - 7 = 2 \\implies \\mathbf{952}$
$$\\mathbf{48 \\times 999 = 47952}$$
*Verification:* $48 \\times 999 = 47952$. Correct!`,
      },
      {
        title: 'Summary & Practice Prep',
        slug: 'summary-series-nines',
        pageType: 'SUMMARY',
        order: 4,
        estimatedMinutes: 2,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Review Ekanyunena Purvena rules',
          'Practice with the automated engine',
        ],
        contentMarkdown: `## Topic Summary

- Left part: Number minus 1.
- Right part: 9's complement of the left part.
- If fewer digits than 9s, pad with leading zeros.

Click **Practice This Topic** below to test your skills!`,
      },
    ],
  },

  // ===========================================================
  // TOPIC 14: Vinculum Method Division
  // ===========================================================
  {
    topicTitle: 'Vinculum Method Division',
    moduleTitle: 'Miracle Multiplication and Excellent Division',
    lessonTitle: 'Vinculum Conversion and Division by Paravartya Yojayet',
    lessonDescription:
      'Transform large, clumsy digits (6, 7, 8, 9) into small bar numbers (vinculum) to make long division fast, compact, and free of trial-and-error quotient guesses.',
    sutra: 'Paravartya Yojayet',
    technique: 'Bar Number Division & Transposition',
    difficulty: Difficulty.MEDIUM,
    estimatedMinutes: 25,
    resources: [
      {
        title: 'Vinculum Numbers and Paravartya Division',
        description: 'Comprehensive guide to division using Paravartya Yojayet and transpose-and-apply methods.',
        resourceType: 'YOUTUBE_VIDEO',
        url: 'https://www.youtube.com/watch?v=IPrJABfzZqw',
        embedUrl: 'https://www.youtube-nocookie.com/embed/IPrJABfzZqw',
        provider: 'YouTube / Khan Academy India',
        authorOrPublisher: 'Khan Academy India',
        attributionText: 'Curated educational video on Vedic Paravartya division',
        licenseType: 'Standard YouTube License',
        isVerified: true,
      },
    ],
    pages: [
      {
        title: 'Introduction to Vinculum Numbers',
        slug: 'intro-vinculum',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 3,
        difficulty: Difficulty.MEDIUM,
        learningObjectives: [
          'Understand what a vinculum (bar number) represents',
          'Convert high digits (6, 7, 8, 9) into negative place-value counterparts',
        ],
        contentMarkdown: `## What is a Vinculum Number?

In standard arithmetic, digits are strictly $0, 1, 2, \\dots, 9$. Large digits like $7, 8, 9$ cause heavy multiplication tables and trial-and-error quotient guesses during division.

A **Vinculum** is a bar placed over a digit, indicating that the digit has **negative place value**:
$$1\\bar{2} = 10 - 2 = 8$$
$$2\\bar{1} = 20 - 1 = 19$$
$$10\\bar{2} = 100 - 2 = 98$$

By converting numbers with high digits into vinculum representations, our operational digits are strictly **$0, 1, 2, 3, 4, 5$**, reducing arithmetic difficulty by over 60%!`,
      },
      {
        title: 'Conversion Rules for Vinculum',
        slug: 'conversion-vinculum',
        pageType: 'THEORY',
        order: 2,
        estimatedMinutes: 4,
        difficulty: Difficulty.MEDIUM,
        learningObjectives: [
          'Master conversion from normal to vinculum form and back',
          'Use All From 9 and Last From 10 for bar conversions',
        ],
        contentMarkdown: `## How to Convert to Vinculum Form

### Forward Conversion (Normal to Vinculum)
1. Identify high digits ($6, 7, 8, 9$).
2. Take the 10s complement of the last high digit and 9s complement of any preceding high digits.
3. Place a bar over these complement digits.
4. Add 1 to the next lower digit to the left (*Ekadhikena*).

*Example:* Convert **289**
- High digits: 89
- Last from 10: $10 - 9 = \\bar{1}$
- Preceding from 9: $9 - 8 = \\bar{1}$
- Add 1 to 2: $2 + 1 = 3$
$$\\mathbf{289 = 3\\bar{1}\\bar{1}} \\quad (300 - 11 = 289)$$`,
      },
      {
        title: 'Division by Transposition: Paravartya Yojayet',
        slug: 'paravartya-division',
        pageType: 'SUTRA_TECHNIQUE',
        order: 3,
        estimatedMinutes: 5,
        difficulty: Difficulty.MEDIUM,
        learningObjectives: [
          'Apply Paravartya Yojayet (Transpose and Apply) to divisors',
          'Execute single-line synthetic division with transposed digits',
        ],
        contentMarkdown: `## Division via Paravartya Yojayet

The Sutra **Paravartya Yojayet** means:
$$\\textbf{"Transpose and Apply"}$$

Instead of dividing by a difficult divisor, we:
1. Invert the signs of the divisor's deviation from base 10 or 100.
2. Multiply and add downward (identical to algebraic synthetic division).

### Example: Divide $1234$ by $112$
Base: $100$. Transposed deviation of $112$: $\\bar{1}\\bar{2}$

$$\\begin{array}{c|cc|cc}
112 & 1 & 2 & 3 & 4 \\\\
\\bar{1}\\bar{2} & & \\bar{1} & \\bar{2} & \\\\
& & & 0 & 0 \\\\
\\hline
& 1 & 1 & 0 & 2
\\end{array}$$

- **Quotient:** **11**
- **Remainder:** **2**
*Verification:* $112 \\times 11 + 2 = 1232 + 2 = 1234$. Exact!`,
      },
      {
        title: 'Summary & Module 3 Review',
        slug: 'summary-module-three',
        pageType: 'SUMMARY',
        order: 4,
        estimatedMinutes: 2,
        difficulty: Difficulty.MEDIUM,
        learningObjectives: [
          'Review the division and vinculum techniques',
          'Prepare for Module 4: Squares and Cubes',
        ],
        contentMarkdown: `## Summary of Module 3

Module 3 has equipped you with high-speed multiplication and division:
- **Base Method (Nikhilam):** Cross-addition and deviation products.
- **Universal Multiplier (Urdhva-Tiryagbhyam):** Vertical and crosswise patterns for any numbers.
- **Series of 1s and 9s:** Specialized single-breath shortcuts.
- **Vinculum & Paravartya Division:** High-speed division by transposition.

Next up: **Module 4 — Lightning Squares and Rapid Cubes!**`,
      },
    ],
  },
];
