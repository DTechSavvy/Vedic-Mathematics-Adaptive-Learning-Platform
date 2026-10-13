import { Difficulty } from '@prisma/client';
import { TopicContentPackage } from './types';

export const MODULE_2_PACKAGES: TopicContentPackage[] = [
  // ===========================================================
  // TOPIC 5: Addition Without Carrying
  // ===========================================================
  {
    topicTitle: 'Addition Without Carrying',
    moduleTitle: 'High Speed Addition and Subtraction',
    lessonTitle: 'Left-to-Right Mental Addition Without Carrying',
    lessonDescription:
      'Perform rapid multi-digit addition entirely from left to right, maintaining running cumulative sums and eliminating pencil carry marks.',
    sutra: 'Ekadhikena Purvena',
    technique: 'Left-to-Right Mental Addition',
    difficulty: Difficulty.EASY,
    estimatedMinutes: 25,
    resources: [
      {
        title: 'Left to Right Mental Addition Masterclass',
        description: 'Visual step-by-step walkthrough of computing multi-digit additions left to right.',
        resourceType: 'YOUTUBE_VIDEO',
        url: 'https://www.youtube.com/watch?v=Ro4U2SXueJE',
        embedUrl: 'https://www.youtube-nocookie.com/embed/Ro4U2SXueJE',
        provider: 'YouTube',
        authorOrPublisher: 'CBSE Math By Ruchi',
        attributionText: 'Curated instructional tutorial on mental addition',
        licenseType: 'Standard YouTube License',
        isVerified: true,
      },
    ],
    pages: [
      {
        title: 'Introduction & Intuition',
        slug: 'intro-addition-without-carrying',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 3,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Understand the cognitive friction caused by traditional right-to-left carrying',
          'Learn to maintain a running mental total from left to right',
        ],
        contentMarkdown: `## Introduction: Free Your Mind from Carry Marks

When adding numbers like **468 + 275** on paper, school algorithms force you to start at the right:
$$8 + 5 = 13 \\implies \\text{write } 3, \\text{ carry } 1$$
This is unnatural because your eyes and voice communicate **hundreds first**.

In Vedic Mathematics, we add from **Left to Right**:
1. Add the hundreds: $400 + 200 = 600$
2. Add the tens: $60 + 70 = 130 \\implies 600 + 130 = 730$
3. Add the units: $8 + 5 = 13 \\implies 730 + 13 = 743$

You produce the exact answer **743** while speaking it fluently!`,
      },
      {
        title: 'Mathematical Theory & Place-Value Expansion',
        slug: 'theory-place-value-expansion',
        pageType: 'THEORY',
        order: 2,
        estimatedMinutes: 4,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Analyze the algebraic foundation of columnar place-value addition',
          'Understand how cumulative registers update without memory overflow',
        ],
        contentMarkdown: `## Place-Value Expansion Theory

Any $n$-digit integer $N$ can be expressed in decimal base expansion:
$$N = d_k 10^k + d_{k-1} 10^{k-1} + \\dots + d_0$$

When summing two numbers $A = \\sum a_i 10^i$ and $B = \\sum b_i 10^i$:
$$(A + B) = \\sum (a_i + b_i) 10^i$$

By accumulating terms starting from the highest index $k$ downward, the running total $R_i$ evolves as:
$$R_i = R_{i+1} \\cdot 10 + (a_i + b_i)$$

This matches computer hardware accumulator logic and allows human working memory to hold only **one running number** at any instant!`,
      },
      {
        title: 'The Ekadhikena Look-Ahead Technique',
        slug: 'sutra-technique-lookahead',
        pageType: 'SUTRA_TECHNIQUE',
        order: 3,
        estimatedMinutes: 4,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Apply Ekadhikena Purvena (One more than previous) using 1-step lookahead',
          'Write digits directly from left to right without erasing',
        ],
        contentMarkdown: `## The One-Step Lookahead Technique

How do you write down digits from left to right without having to erase when a carry occurs?
We apply the principle of *Ekadhikena Purvena* (By one more than the previous) using a simple **1-column look-ahead**:

### The Golden Rule
Before writing the sum of the current column:
- Glance at the next column to the right.
- If the next column's sum is **10 or greater**, increase your current column's sum by **1** immediately (*Ekadhika*).
- If the next column's sum is **less than 10**, write down your current column's sum as is.

This allows you to write the final answer directly onto the paper from left to right in one stroke!`,
      },
      {
        title: 'Worked Examples with Step-by-Step Breakdown',
        slug: 'worked-examples-addition',
        pageType: 'WORKED_EXAMPLES',
        order: 4,
        estimatedMinutes: 5,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Solve 2-digit and 3-digit left-to-right additions with verified steps',
          'Follow intermediate verification calculations',
        ],
        contentMarkdown: `## Worked Examples

### Example 1 (Easy): $54 + 38$
1. **Look at tens column:** $5 + 3 = 8$.
2. **Glance at units column:** $4 + 8 = 12$ (which is $\\ge 10$).
3. **Apply Ekadhikena:** Tens digit becomes $8 + 1 = 9$.
4. **Units digit:** The units of 12 is $2$.
$$\\mathbf{54 + 38 = 92}$$
*Verification:* $54 + 38 = 92$. Correct!

---

### Example 2 (Medium): $468 + 275$
1. **Hundreds column:** $4 + 2 = 6$.
   *Next column (tens):* $6 + 7 = 13 \\ge 10 \\implies$ Hundreds digit becomes $6 + 1 = \\mathbf{7}$.
2. **Tens column:** The units of 13 is 3.
   *Next column (units):* $8 + 5 = 13 \\ge 10 \\implies$ Tens digit becomes $3 + 1 = \\mathbf{4}$.
3. **Units column:** The units of 13 is $\\mathbf{3}$.
$$\\mathbf{468 + 275 = 743}$$
*Verification:* $468 + 275 = 743$. Correct!`,
      },
      {
        title: 'Common Student Errors & Diagnostic Fixes',
        slug: 'common-errors-addition',
        pageType: 'COMMON_ERRORS',
        order: 5,
        estimatedMinutes: 3,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Diagnose the 9-sum cascade trap',
          'Correctly handle columns that sum to 9 with lookahead',
        ],
        contentMarkdown: `## Common Pitfalls & Diagnostics

### Trap: The "Summing to 9" Lookahead Cascade
What happens if the next column sums to exactly 9?
*Example:* $365 + 237$
- Hundreds: $3 + 2 = 5$.
- Glance at tens: $6 + 3 = 9$.
- **Crucial Rule:** If the next column sums to 9, you must glance **two columns ahead**! Because if the units column carries, it will turn that 9 into a 10, which will in turn carry into your hundreds!
- Here, units is $5 + 7 = 12 \\ge 10$. This turns the tens 9 into 10, which increases hundreds from 5 to **6**!
- Final answer: **602**.`,
      },
      {
        title: 'Summary & Practice Preparation',
        slug: 'summary-practice-prep',
        pageType: 'SUMMARY',
        order: 6,
        estimatedMinutes: 3,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Consolidate left-to-right addition rules',
          'Transition to interactive practice engine',
        ],
        contentMarkdown: `## Key Takeaways

1. **Left-to-Right:** Process highest place values first for immediate magnitude estimation.
2. **One-Step Lookahead:** Check if next column $\\ge 10$; if so, add 1 immediately.
3. **Nine-Cascade:** If next column is 9, look two steps ahead.

Click **Practice This Topic** below to solve real-time generated problems!`,
      },
    ],
  },

  // ===========================================================
  // TOPIC 6: Dot Method Addition
  // ===========================================================
  {
    topicTitle: 'Dot Method Addition',
    moduleTitle: 'High Speed Addition and Subtraction',
    lessonTitle: 'Rekha Sthana: Columnar Addition with Dot Marks',
    lessonDescription:
      'Add tall columns of single and multi-digit numbers effortlessly using the Rekha Sthana (Dot Method), dropping tens as simple dots to keep running numbers under 10.',
    sutra: 'Rekha Sthana',
    technique: 'Rekha Sthana Columnar Summation',
    difficulty: Difficulty.EASY,
    estimatedMinutes: 25,
    resources: [
      {
        title: 'Vedic Dot Method for Long Column Addition',
        description: 'Complete tutorial demonstrating how dots replace difficult multi-digit mental additions.',
        resourceType: 'YOUTUBE_VIDEO',
        url: 'https://www.youtube.com/watch?v=pMGpBCtI09w',
        embedUrl: 'https://www.youtube-nocookie.com/embed/pMGpBCtI09w',
        provider: 'YouTube',
        authorOrPublisher: 'Deekshaa Math',
        attributionText: 'Curated video guide on the Shudh Dot Method',
        licenseType: 'Standard YouTube License',
        isVerified: true,
      },
    ],
    pages: [
      {
        title: 'Introduction & The Burden of Long Columns',
        slug: 'intro-dot-method',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 3,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Understand why long columns of numbers cause cognitive fatigue',
          'Learn how dropping tens as dots keeps mental calculations below 10',
        ],
        contentMarkdown: `## The Burden of Long Column Addition

Imagine adding a column of eight numbers:
$$7 + 8 + 6 + 9 + 5 + 8 + 4 + 7$$
In conventional math, your brain must accumulate larger and larger numbers:
$$7 \\to 15 \\to 21 \\to 30 \\to 35 \\to 43 \\to 47 \\to 54$$
Holding numbers in the 40s and 50s while adding single digits causes arithmetic slips and cognitive fatigue.

### The Vedic Rekha Sthana (Dot Method)
The moment your running sum reaches or exceeds **10**, you drop the ten by placing a small **dot** $(\\cdot)$ on that digit, and continue adding **only the remaining units digit**!
Your running count **never exceeds 18**, making mistakes practically impossible.`,
      },
      {
        title: 'Theory & Step-by-Step Procedure',
        slug: 'procedure-dot-method',
        pageType: 'THEORY',
        order: 2,
        estimatedMinutes: 4,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Execute the dot-drop operation whenever a sum reaches 10',
          'Count dots to determine carries to the next column',
        ],
        contentMarkdown: `## How Rekha Sthana Works

### The Fundamental Rule
1. Start at the top (or bottom) of a column and add downward.
2. The instant your sum reaches $\\ge 10$:
   - Place a dot on the digit that triggered the ten.
   - Subtract 10 mentally (keep only the units digit).
   - Continue adding with that units digit.
3. At the bottom of the column, write down the final single digit.
4. Count the number of dots in the column—that count is your **carry** to the next column to the left!`,
      },
      {
        title: 'Worked Examples: Single and Multi-Column',
        slug: 'worked-examples-dot-method',
        pageType: 'WORKED_EXAMPLES',
        order: 3,
        estimatedMinutes: 5,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Follow a complete columnar addition using dot notation',
          'Verify column totals with deterministic arithmetic',
        ],
        contentMarkdown: `## Worked Example

Add the column: $8, 6, 7, 9, 5$

$$\\begin{array}{r@{\\quad}l}
8 & \\text{Running: } 8 \\\\
6 & 8 + 6 = 14 \\implies \\mathbf{6^\\bullet} \\text{ (drop 10, keep 4)} \\\\
7 & 4 + 7 = 11 \\implies \\mathbf{7^\\bullet} \\text{ (drop 10, keep 1)} \\\\
9 & 1 + 9 = 10 \\implies \\mathbf{9^\\bullet} \\text{ (drop 10, keep 0)} \\\\
5 & 0 + 5 = \\mathbf{5} \\text{ (final digit)}
\\end{array}$$

1. **Units Digit:** The final remaining digit at the bottom is **5**.
2. **Tens Digit (Dot Count):** Count the dots: there are **3 dots** (on 6, 7, and 9).
$$\\text{Total} = \\mathbf{35}$$
*Verification:* $8 + 6 + 7 + 9 + 5 = 35$. Verified!`,
      },
      {
        title: 'Common Mistakes & Self-Correction',
        slug: 'common-mistakes-dot-method',
        pageType: 'COMMON_ERRORS',
        order: 4,
        estimatedMinutes: 3,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Avoid forgetting to reset the running sum after dropping a dot',
          'Prevent miscounting dots in dense columns',
        ],
        contentMarkdown: `## Common Student Errors

1. **Forgetting to Drop the 10:**
   - *Error:* Reaching 14, placing a dot, but continuing to add with 14 instead of 4!
   - *Correction:* The moment a dot is marked, the 10 is physically discharged. You MUST continue with only the units digit.
2. **Double Dotting on Exact 10:**
   - *Error:* Adding $3 + 7 = 10$, putting a dot, and getting confused about what to carry.
   - *Correction:* $10 - 10 = 0$. You continue adding from 0!`,
      },
      {
        title: 'Summary & Practice Prep',
        slug: 'summary-dot-method',
        pageType: 'SUMMARY',
        order: 5,
        estimatedMinutes: 2,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Review the Dot Method key rules',
          'Ready for practice in the question engine',
        ],
        contentMarkdown: `## Topic Summary

- **Rekha Sthana** caps all mental operations below 18.
- Dots record tens; the final remainder is the column's place digit.
- Dot count carries to the left column.

Ready to practice? Click below to try the Dot Method practice generator!`,
      },
    ],
  },

  // ===========================================================
  // TOPIC 7: Nikhilam Subtraction
  // ===========================================================
  {
    topicTitle: 'Nikhilam Subtraction',
    moduleTitle: 'High Speed Addition and Subtraction',
    lessonTitle: 'Nikhilam Subtraction: All from 9 and Last from 10',
    lessonDescription:
      'Subtract any number from powers of 10 (100, 1000, 10000) or general minuends instantaneously without borrowing chains using the famous Nikhilam aphorism.',
    sutra: 'Nikhilam Navatashcaramam Dashatah',
    technique: 'All from 9 and Last from 10',
    difficulty: Difficulty.EASY,
    estimatedMinutes: 25,
    resources: [
      {
        title: 'All From 9 and Last From 10 Subtraction Tutorial',
        description: 'Complete explanation of calculating decimal complements and subtracting from base numbers.',
        resourceType: 'YOUTUBE_VIDEO',
        url: 'https://www.youtube.com/watch?v=eNYbURkoGTU',
        embedUrl: 'https://www.youtube-nocookie.com/embed/eNYbURkoGTU',
        provider: 'YouTube',
        authorOrPublisher: 'MindPowerMath',
        attributionText: 'Curated video on Nikhilam Subtraction from base numbers',
        licenseType: 'Standard YouTube License',
        isVerified: true,
      },
    ],
    pages: [
      {
        title: 'Introduction: Eliminate the Borrowing Chain',
        slug: 'intro-nikhilam-subtraction',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 3,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Identify why subtracting across multiple zeros causes frequent borrowing errors',
          'Understand the phrase "All from 9 and the last from 10"',
        ],
        contentMarkdown: `## Eliminate the Borrowing Chain

Consider this common calculation:
$$10,000 - 3,647$$
In conventional arithmetic, you must cross out the 1, turn zeros into 9s, borrow across four columns, and write tiny numbers above the line. One slip, and the entire answer is ruined.

### The Vedic Revolution: Nikhilam Navatashcaramam Dashatah
Vedic Mathematics uses a direct rule:
$$\\textbf{"All from 9 and the Last from 10"}$$
Subtract every digit from **9**, and subtract the very last non-zero digit from **10**!

$$\\begin{aligned}
9 - 3 &= 6 \\\\
9 - 6 &= 3 \\\\
9 - 4 &= 5 \\\\
10 - 7 &= 3
\\end{aligned}$$

Write the answer directly: **6,353** in 2 seconds!`,
      },
      {
        title: 'Mathematical Theory & Algebraic Complements',
        slug: 'theory-nikhilam-subtraction',
        pageType: 'THEORY',
        order: 2,
        estimatedMinutes: 4,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Prove why (10^k - N) equals the 9s complement plus 1',
          'Master digit alignment with base powers of 10',
        ],
        contentMarkdown: `## Algebraic Proof of the Nikhilam Formula

Why does "All from 9 and the last from 10" work for any base $10^k$?

Notice the algebraic identity:
$$10^k = (10^k - 1) + 1 = \\underbrace{999\\dots9}_{k \\text{ nines}} + 1$$

Therefore, subtracting any $k$-digit number $N = d_k d_{k-1} \\dots d_1$ from $10^k$:
$$10^k - N = (999\\dots9 - N) + 1$$

Subtracting each digit $d_i$ from $9$ gives the **9's complement**. Adding $1$ to the final unit's place transforms:
$$(9 - d_1) + 1 = 10 - d_1$$

Hence: every digit is subtracted from 9, and only the final unit digit is subtracted from 10!`,
      },
      {
        title: 'Worked Examples & Numbers Ending in Zero',
        slug: 'worked-examples-nikhilam-subtraction',
        pageType: 'WORKED_EXAMPLES',
        order: 3,
        estimatedMinutes: 5,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Apply Nikhilam to numbers with trailing zeros',
          'Handle numbers with fewer digits than the base',
        ],
        contentMarkdown: `## Worked Examples

### Example 1: $1000 - 428$
- All from 9: $9 - 4 = 5$, $9 - 2 = 7$.
- Last from 10: $10 - 8 = 2$.
$$\\mathbf{1000 - 428 = 572}$$

---

### Example 2 (Trailing Zeros): $10000 - 3600$
**Crucial Rule:** The "last from 10" rule applies to the **last non-zero digit**! Any trailing zeros simply pass through unchanged.
- Here, the last non-zero digit is 6.
- All from 9: $9 - 3 = 6$.
- Last from 10: $10 - 6 = 4$.
- Trailing zeros: Append the two zeros $\\implies 00$.
$$\\mathbf{10000 - 3600 = 6400}$$

---

### Example 3 (Prefix Zeros): $10000 - 74$
Since base $10000$ has 4 zeros, treat 74 as **0074**:
- $9 - 0 = 9$
- $9 - 0 = 9$
- $9 - 7 = 2$
- $10 - 4 = 6$
$$\\mathbf{10000 - 74 = 9926}$$`,
      },
      {
        title: 'Common Student Errors & Fixes',
        slug: 'common-errors-nikhilam-subtraction',
        pageType: 'COMMON_ERRORS',
        order: 4,
        estimatedMinutes: 3,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Prevent applying "last from 10" to a trailing zero',
          'Check answers using digit sums',
        ],
        contentMarkdown: `## Common Pitfalls

1. **Subtracting Trailing Zero from 10:**
   - *Error:* For $1000 - 480$, writing $10 - 0 = 10$.
   - *Correction:* Always pass trailing zeros through intact! The "last from 10" belongs to the **8** ($10 - 8 = 2$), giving **520**.
2. **Missing Leading Zeros:**
   - *Error:* For $1000 - 35$, doing $9 - 3 = 6, 10 - 5 = 5 \\implies 65$.
   - *Correction:* $1000$ has 3 zeros, but 35 has only 2 digits! Prefix a zero ($035$): $9-0=9, 9-3=6, 10-5=5 \\implies \\mathbf{965}$.`,
      },
      {
        title: 'Summary & Practice Prep',
        slug: 'summary-nikhilam-subtraction',
        pageType: 'SUMMARY',
        order: 5,
        estimatedMinutes: 2,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Review Nikhilam subtraction rules',
          'Proceed to practice exercises',
        ],
        contentMarkdown: `## Topic Summary

- **Nikhilam Navatashcaramam Dashatah:** All from 9, last from 10.
- Match digit count to the number of zeros in the base by prefixing zeros.
- Pass trailing zeros through directly.

Now click **Practice This Topic** to test your speed!`,
      },
    ],
  },

  // ===========================================================
  // TOPIC 8: Fraction Addition
  // ===========================================================
  {
    topicTitle: 'Fraction Addition',
    moduleTitle: 'High Speed Addition and Subtraction',
    lessonTitle: 'Crosswise Fraction Addition via Urdhva-Tiryagbhyam',
    lessonDescription:
      'Add fractions in a single horizontal line using crosswise multiplication, bypassing the tedious multi-step Least Common Multiple (LCM) algorithm.',
    sutra: 'Urdhva-Tiryagbhyam',
    technique: 'Crosswise Fraction Summation',
    difficulty: Difficulty.EASY,
    estimatedMinutes: 25,
    resources: [
      {
        title: 'Criss-Cross Fraction Addition Method',
        description: 'Visual explanation of cross-multiplying numerators and denominators for instant fraction sums.',
        resourceType: 'YOUTUBE_VIDEO',
        url: 'https://www.youtube.com/watch?v=GNuPW5L54kc',
        embedUrl: 'https://www.youtube-nocookie.com/embed/GNuPW5L54kc',
        provider: 'YouTube / TEDx Talks',
        authorOrPublisher: 'TEDx Talks / Gaurav Tekriwal',
        attributionText: 'Curated video on crosswise fraction operations',
        licenseType: 'Standard YouTube License',
        isVerified: true,
      },
    ],
    pages: [
      {
        title: 'Introduction & The LCM Bottleneck',
        slug: 'intro-fraction-addition',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 3,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Understand how finding Lowest Common Denominators slows mental arithmetic',
          'Learn the horizontal cross-multiplication pattern',
        ],
        contentMarkdown: `## Eliminate the LCM Bottleneck

In conventional schooling, adding two simple fractions:
$$\\frac{2}{5} + \\frac{3}{7}$$
requires a multi-step procedure: prime factorize 5 and 7, find the LCM (35), adjust numerators, and add.

### The Vedic Criss-Cross Pattern
Using the universal Sutra **Urdhva-Tiryagbhyam** (Vertically and Crosswise):
1. **Cross-multiply and add** for the numerator:
   $$(2 \\times 7) + (3 \\times 5) = 14 + 15 = 29$$
2. **Multiply denominators vertically** for the denominator:
   $$5 \\times 7 = 35$$

The answer is **$\\frac{29}{35}$** written in one continuous mental breath!`,
      },
      {
        title: 'Mathematical Theory & Algebraic Formulation',
        slug: 'theory-fraction-addition',
        pageType: 'THEORY',
        order: 2,
        estimatedMinutes: 4,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Prove the algebraic identity for fraction summation',
          'Understand conditions where direct crosswise multiplication is optimal',
        ],
        contentMarkdown: `## Algebraic Formulation

For any two real fractions $\\frac{a}{b}$ and $\\frac{c}{d}$ where $b, d \\neq 0$:
$$\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}$$

### Why This Is Cognitively Superior
- **Parallel processing:** The products $ad$ and $bc$ can be evaluated simultaneously in working memory.
- **Uniformity:** The identical formula applies whether denominators are co-prime, composite, or algebraic variables:
$$\\frac{1}{x} + \\frac{1}{y} = \\frac{x + y}{xy}$$`,
      },
      {
        title: 'Worked Examples & Simplifications',
        slug: 'worked-examples-fraction-addition',
        pageType: 'WORKED_EXAMPLES',
        order: 3,
        estimatedMinutes: 5,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Work through numeric fraction addition examples',
          'Simplify final fractions using greatest common divisors',
        ],
        contentMarkdown: `## Worked Examples

### Example 1: $\\frac{3}{4} + \\frac{2}{5}$
1. Cross-multiply:
   $$(3 \\times 5) + (2 \\times 4) = 15 + 8 = 23$$
2. Multiply denominators:
   $$4 \\times 5 = 20$$
$$\\mathbf{\\frac{3}{4} + \\frac{2}{5} = \\frac{23}{20} = 1\\frac{3}{20}}$$

---

### Example 2 (With Simplification): $\\frac{1}{6} + \\frac{3}{8}$
1. Cross-multiply:
   $$(1 \\times 8) + (3 \\times 6) = 8 + 18 = 26$$
2. Multiply denominators:
   $$6 \\times 8 = 48$$
3. Reduce fraction:
   $$\\frac{26}{48} = \\mathbf{\\frac{13}{24}}$$
*Verification:* LCM of 6 and 8 is 24 $\\implies 4/24 + 9/24 = 13/24$. Perfect match!`,
      },
      {
        title: 'Common Mistakes & Summary',
        slug: 'common-mistakes-fraction-addition',
        pageType: 'COMMON_ERRORS',
        order: 4,
        estimatedMinutes: 3,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Avoid multiplying numerators straight across',
          'Remember to reduce common factors after cross-multiplication',
        ],
        contentMarkdown: `## Common Pitfalls

- **The Addition Slip:** Adding across numerators and denominators (e.g. thinking $\\frac{1}{2} + \\frac{1}{3} = \\frac{2}{5}$). This is mathematically invalid!
- **Overlooking Reduction:** Always check if numerator and denominator share common factors (like dividing 26/48 by 2 to get 13/24).

Ready to practice? Click below to try the Fraction Addition practice generator!`,
      },
    ],
  },

  // ===========================================================
  // TOPIC 9: Fraction Subtraction
  // ===========================================================
  {
    topicTitle: 'Fraction Subtraction',
    moduleTitle: 'High Speed Addition and Subtraction',
    lessonTitle: 'Crosswise Fraction Subtraction via Urdhva-Tiryagbhyam',
    lessonDescription:
      'Subtract fractions horizontally with high precision using cross-difference multiplication, avoiding sign slips and LCD conversions.',
    sutra: 'Urdhva-Tiryagbhyam',
    technique: 'Crosswise Fraction Subtraction',
    difficulty: Difficulty.EASY,
    estimatedMinutes: 25,
    resources: [
      {
        title: 'Crosswise Fraction Subtraction & Mental Subtraction',
        description: 'Clear demonstration of subtracting fractions and mental left-to-right subtraction.',
        resourceType: 'YOUTUBE_VIDEO',
        url: 'https://www.youtube.com/watch?v=8mQostYnEJE',
        embedUrl: 'https://www.youtube-nocookie.com/embed/8mQostYnEJE',
        provider: 'YouTube',
        authorOrPublisher: 'MindPowerMath',
        attributionText: 'Curated video on mental subtraction methods',
        licenseType: 'Standard YouTube License',
        isVerified: true,
      },
    ],
    pages: [
      {
        title: 'Introduction & Subtraction Pattern',
        slug: 'intro-fraction-subtraction',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 3,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Master crosswise subtraction of fractions',
          'Maintain correct operational order (ad - bc)',
        ],
        contentMarkdown: `## Fraction Subtraction: Cross-Difference

Just as with fraction addition, fraction subtraction uses the universal crosswise pattern:
$$\\frac{a}{b} - \\frac{c}{d} = \\frac{ad - bc}{bd}$$

### Crucial Directional Rule
Because subtraction is **non-commutative** ($x - y \\neq y - x$), you must preserve the order:
- **First cross:** Multiply the first numerator by the second denominator: $a \\times d$.
- **Second cross:** Subtract the product of the second numerator and first denominator: $b \\times c$.
- **Denominator:** Multiply denominators vertically: $b \\times d$.`,
      },
      {
        title: 'Worked Examples & Negative Results',
        slug: 'worked-examples-fraction-subtraction',
        pageType: 'WORKED_EXAMPLES',
        order: 2,
        estimatedMinutes: 5,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Solve positive and negative fraction subtraction problems',
          'Verify arithmetic using conventional LCM',
        ],
        contentMarkdown: `## Worked Examples

### Example 1: $\\frac{4}{5} - \\frac{2}{3}$
1. Cross products:
   $$(4 \\times 3) - (2 \\times 5) = 12 - 10 = 2$$
2. Denominator:
   $$5 \\times 3 = 15$$
$$\\mathbf{\\frac{4}{5} - \\frac{2}{3} = \\frac{2}{15}}$$
*Verification:* $12/15 - 10/15 = 2/15$. Correct!

---

### Example 2 (Negative Result): $\\frac{1}{4} - \\frac{2}{5}$
1. Cross products:
   $$(1 \\times 5) - (2 \\times 4) = 5 - 8 = -3$$
2. Denominator:
   $$4 \\times 5 = 20$$
$$\\mathbf{\\frac{1}{4} - \\frac{2}{5} = -\\frac{3}{20}}$$`,
      },
      {
        title: 'Common Mistakes & Summary',
        slug: 'common-mistakes-fraction-subtraction',
        pageType: 'COMMON_ERRORS',
        order: 3,
        estimatedMinutes: 3,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Prevent reverse subtraction order',
          'Consolidate fraction arithmetic under Urdhva-Tiryagbhyam',
        ],
        contentMarkdown: `## Common Pitfalls

- **Reversing the Cross Products:** Calculating $bc - ad$ instead of $ad - bc$. Always start with the top-left numerator ($a \\times d$)!
- **Sign Errors:** When $ad < bc$, the result is negative. Do not drop the negative sign.

Congratulations on completing Module 2! In Module 3, we unleash the miracle methods of Multiplication and Division!`,
      },
    ],
  },
];
