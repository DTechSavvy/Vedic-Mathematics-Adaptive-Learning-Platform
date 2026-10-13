import { Difficulty } from '@prisma/client';
import { TopicContentPackage } from './types';

export const MODULE_1_PACKAGES: TopicContentPackage[] = [
  // ===========================================================
  // TOPIC 1: History of Vedic Mathematics
  // ===========================================================
  {
    topicTitle: 'History of Vedic Mathematics',
    moduleTitle: 'Introduction to Vedic Mathematics',
    lessonTitle: 'Historical Foundations and Modern Reconstruction',
    lessonDescription:
      'Explore the origins of Vedic Mathematics, the research of Swami Bharati Krishna Tirtha, and the distinction between Shulbasutra geometry and 20th-century mental arithmetic systems.',
    sutra: 'Origin & Evolution',
    technique: 'Historical Analysis',
    difficulty: Difficulty.EASY,
    estimatedMinutes: 20,
    resources: [
      {
        title: 'From Vedas to Vedic Maths: Historical Foundations',
        description: 'Comprehensive historical overview of Vedic Mathematics by Rajaraman K.S. at TEDx.',
        resourceType: 'YOUTUBE_VIDEO',
        url: 'https://www.youtube.com/watch?v=G-PWO2NSThQ',
        embedUrl: 'https://www.youtube-nocookie.com/embed/G-PWO2NSThQ',
        provider: 'YouTube / TEDx Talks',
        authorOrPublisher: 'TEDx Talks',
        attributionText: 'Curated educational presentation on Vedic mathematical history',
        licenseType: 'Standard YouTube License',
        isVerified: true,
      },
      {
        title: 'Vedic Mathematics (Motilal Banarsidass, 1965)',
        description: 'The seminal foundational text composed by Jagadguru Swami Bharati Krishna Tirtha.',
        resourceType: 'HISTORICAL_TEXT',
        url: 'https://archive.org/details/vedic-mathematics-bharati-krishna-tirthaji',
        provider: 'Archive.org Public Repository',
        authorOrPublisher: 'Swami Bharati Krishna Tirtha; ed. Dr. V. S. Agrawala',
        attributionText: 'Published by Motilal Banarsidass Publishers, Delhi',
        licenseType: 'Public Domain / Academic Fair Use',
        isVerified: true,
      },
    ],
    pages: [
      {
        title: 'Introduction: The Heritage of Indian Mathematics',
        slug: 'introduction-heritage',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 3,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Understand the historical lineage of computational techniques in ancient India',
          'Identify key figures including Baudhayana, Aryabhata, and Swami Bharati Krishna Tirtha',
        ],
        contentMarkdown: `## The Heritage of Indian Mathematics

The mathematical tradition of the Indian subcontinent spans over three millennia, characterized by a deep interplay between computational agility, geometric constructions for Vedic altars, and astronomical calculations.

### Key Historical Milestones
1. **The Shulbasutras (c. 800–500 BCE):** Composed by Baudhayana, Apastamba, and Katyayana, these texts contain the earliest recorded explicit statements of the Pythagorean theorem, geometric quadratures (circling the square), and continued rational approximations of $\\sqrt{2}$.
2. **The Classical Era (5th–12th Century CE):** Luminaries such as Aryabhata, Brahmagupta, and Bhaskara II established zero, negative numbers, decimal place-value notation, and indeterminate equations (*Kuttaka*).
3. **The 20th-Century Reconstruction:** Between 1911 and 1918, Swami Bharati Krishna Tirtha reconstructed a unique system of 16 aphorisms (*Sutras*) and 13 sub-sutras (*Upasutras*) aimed at rapid mental calculations.

> **Key Takeaway:** Modern "Vedic Mathematics" as taught today primarily refers to the 16 Sutras reconstructed by Bharati Krishna Tirtha, which function as mental calculation algorithms rather than direct translations of ancient Atharvaveda hymns.`,
      },
      {
        title: 'Reconstruction: Swami Bharati Krishna Tirtha',
        slug: 'swami-bharati-krishna-tirtha',
        pageType: 'THEORY',
        order: 2,
        estimatedMinutes: 4,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Recognize Bharati Krishna Tirtha’s methodology and hermeneutic approach',
          'Distinguish between scholarly textual history and heuristic pedagogical efficacy',
        ],
        contentMarkdown: `## Swami Bharati Krishna Tirtha (1884–1960)

Swami Bharati Krishna Tirtha was an extraordinary scholar who earned Master’s degrees in seven distinct subjects, including Mathematics, Science, Philosophy, and Sanskrit.

### The Period of Solitary Contemplation
Between 1911 and 1918, during deep study near Sringeri, Swamiji investigated cryptic Sanskrit aphorisms. He demonstrated that sixteen concise aphoristic phrases could encode universal mathematical principles ranging from simple single-digit addition to polynomial division, calculus, and matrix inversion.

### Scholarly Context & Historical Evidence
Academic mathematicians and historians of science (such as Prof. K. S. Shukla and Prof. George Gheverghese Joseph) have noted:
- The 16 Sutras are written in relatively modern Sanskrit idiom rather than ancient Vedic archaic metre.
- Their brilliance lies in **computational psychology and algebraic coherence**, providing intuitive shortcuts that transform tedious vertical algorithms into fluid horizontal mental calculations.

We honor both: the verified historical context and the practical mathematical beauty of the algorithms themselves.`,
      },
      {
        title: 'Core Architecture: 16 Sutras & 13 Sub-Sutras',
        slug: 'sutra-architecture',
        pageType: 'SUTRA_TECHNIQUE',
        order: 3,
        estimatedMinutes: 4,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Appreciate how concise Sanskrit aphorisms serve as mnemonic pattern recognition pegs',
          'Understand the structural difference between Sutras and Sub-Sutras',
        ],
        contentMarkdown: `## Aphoristic Structure: Sutras and Upasutras

In Indian philosophy, a *Sutra* is defined as:
$$\\text{Alpaksharam Asandigdham Saravat Vishvatomukham}$$
*(Concise, unambiguous, capturing the essence, and universally applicable).*

### How Sutras Function in Computing
Traditional vertical math algorithms require external paper storage for carry-overs and intermediate sums. Vedic Sutras serve as **mental micro-programs**:
- **Pattern Matching:** The student observes the problem structure (e.g., base proximity, ending digits, symmetry).
- **Aphorism Trigger:** The corresponding Sutra prescribes a single horizontal transform.
- **Direct Place-Value Writing:** Answers are generated from left-to-right or crosswise in a single pass.

| Sutra # | Sanskrit Name | English Meaning | Primary Application |
|---|---|---|---|
| 1 | Ekadhikena Purvena | By one more than the previous | Squaring ending in 5, series of 1s |
| 2 | Nikhilam Navatashcaramam Dashatah | All from 9 and last from 10 | Base subtraction and multiplication |
| 3 | Urdhva-Tiryagbhyam | Vertically and crosswise | General multiplication, fractions |`,
      },
      {
        title: 'Historiography: Myths vs. Verified Mathematics',
        slug: 'historiography-perspectives',
        pageType: 'APPLICATIONS',
        order: 4,
        estimatedMinutes: 3,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Critically analyze claims surrounding the origins of Vedic Mathematics',
          'Engage with peer-reviewed mathematical scholarship',
        ],
        contentMarkdown: `## Historiography: Myths vs. Verified Mathematics

To study Vedic Mathematics with scientific rigor, students must distinguish verified evidence from popular hyperbole.

### 1. Myth vs. Fact
- **Myth:** "All modern calculus, aerospace engineering, and computers were copied directly from the Rigveda."
- **Fact:** The 16 Sutras are a 20th-century heuristic creation by Bharati Krishna Tirtha. However, ancient texts like the *Sulbasutras* and *Aryabhatiya* do contain profound early geometry, trigonometry, and algebra.

### 2. Why the System Remains Invaluable
Even when recognized as modern pedagogical mnemonic tools, Vedic math techniques offer:
- **Cognitive agility:** Eliminates fear of math and reliance on mechanical calculators.
- **Multiple perspectives:** Teaches students that a math problem can be solved in multiple elegant ways.
- **Error cross-checking:** Native integration of digit sums (*Navasesh*) guarantees instantaneous verification.`,
      },
      {
        title: 'Topic Summary & Study Guide',
        slug: 'summary-study-guide',
        pageType: 'SUMMARY',
        order: 5,
        estimatedMinutes: 3,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Review the core points of the historical emergence of Vedic Mathematics',
          'Prepare for studying operational Sutras in upcoming modules',
        ],
        contentMarkdown: `## Key Takeaways

1. **Origins:** Reconstructed between 1911–1918 by Swami Bharati Krishna Tirtha and published in 1965 by Motilal Banarsidass.
2. **Pedagogical Genius:** Uses 16 primary Sutras and 13 Sub-Sutras as mental calculation keys.
3. **Scientific Balance:** We distinguish between ancient Shulbasutra geometry (c. 800 BCE) and modern mental computation techniques, celebrating both with intellectual honesty.
4. **Next Step:** In the next topic, we will explore the foundational cognitive features of the Vedic system: coherence, flexibility, and instant error-checking.`,
      },
      {
        title: 'Knowledge Check & Practice Prep',
        slug: 'knowledge-check-prep',
        pageType: 'PRACTICE_PREP',
        order: 6,
        estimatedMinutes: 3,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Self-assess comprehension of historical context',
          'Consult AI Tutor for historical questions',
        ],
        contentMarkdown: `## Knowledge Check

Before moving to the next topic, test your understanding:

1. Who reconstructed the 16 Vedic Mathematics Sutras in the 20th century?
2. What are the *Shulbasutras*, and what mathematical concepts did they document?
3. What is the fundamental cognitive advantage of aphoristic (Sutra-based) mental calculation?

*Tip: If you have any questions or want to explore ancient Indian mathematics further, ask the **AI Tutor** in the sidebar!*`,
      },
    ],
  },

  // ===========================================================
  // TOPIC 2: Features of Vedic Mathematics
  // ===========================================================
  {
    topicTitle: 'Features of Vedic Mathematics',
    moduleTitle: 'Introduction to Vedic Mathematics',
    lessonTitle: 'Core Features, Coherence, and Cognitive Benefits',
    lessonDescription:
      'Analyze the structural coherence, flexibility, mental agility, and cross-checking mechanisms that distinguish Vedic mental arithmetic from conventional vertical algorithms.',
    sutra: 'Sutra Architecture',
    technique: 'Holistic Mathematics',
    difficulty: Difficulty.EASY,
    estimatedMinutes: 20,
    resources: [
      {
        title: 'The Coherent Beauty of Vedic Mathematics',
        description: 'Discussion of why Vedic math creates holistic mathematical thinking across disciplines.',
        resourceType: 'EXTERNAL_ARTICLE',
        url: 'https://www.vedicmaths.org/introduction/what-is-vedic-mathematics',
        provider: 'Vedic Mathematics Academy UK',
        authorOrPublisher: 'Kenneth Williams',
        attributionText: 'VedicMaths.org Educational Resource Archive',
        licenseType: 'Educational Reference with Attribution',
        isVerified: true,
      },
      {
        title: 'Squares, Fractions, and Frontiers of Vedic Mathematics',
        description: 'TEDx presentation by Gaurav Tekriwal on holistic calculation and systemic impact.',
        resourceType: 'YOUTUBE_VIDEO',
        url: 'https://www.youtube.com/watch?v=GNuPW5L54kc',
        embedUrl: 'https://www.youtube-nocookie.com/embed/GNuPW5L54kc',
        provider: 'YouTube / TEDx Talks',
        authorOrPublisher: 'TEDx Talks / Gaurav Tekriwal',
        attributionText: 'Educational demonstration on holistic mathematical thinking',
        licenseType: 'Standard YouTube License',
        isVerified: true,
      },
    ],
    pages: [
      {
        title: 'Introduction: The Unified Nature of the System',
        slug: 'introduction-unified-nature',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 3,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Identify how conventional arithmetic creates artificial silos between topics',
          'Understand how Vedic techniques link arithmetic, algebra, and geometry through shared patterns',
        ],
        contentMarkdown: `## The Unified Nature of Vedic Mathematics

In conventional school curricula, mathematics is often taught as isolated, rigid compartments: addition algorithms have nothing to do with multiplication, and algebra seems completely disconnected from arithmetic.

Vedic Mathematics operates on the opposite philosophy: **Structural Coherence**.

### Unified Principles
The very same Sutra (*Urdhva-Tiryagbhyam* / Vertically and Crosswise) that multiplies two 2-digit numbers:
$$23 \\times 14 = 322$$
is identical in principle to:
- Adding fractions: $\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}$
- Multiplying polynomials: $(2x + 3)(x + 4) = 2x^2 + 11x + 12$
- Evaluating vector determinants and cross-products.

Once you master the universal pattern, you have mastered solutions across arithmetic, algebra, and analytic geometry simultaneously!`,
      },
      {
        title: 'Left-to-Right Processing vs. Conventional Right-to-Left',
        slug: 'left-to-right-computation',
        pageType: 'THEORY',
        order: 2,
        estimatedMinutes: 4,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Compare cognitive load between right-to-left paper algorithms and left-to-right mental flow',
          'Understand how left-to-right calculation allows instant estimation',
        ],
        contentMarkdown: `## Left-to-Right Mental Arithmetic

Consider how we read language and numbers:
When you read the number **4,821**, your eyes move from **left to right**, processing the thousands first, then the hundreds, tens, and units.

### The Conventional Conflict
Conventional school algorithms force you to compute in reverse: from right to left (units first). This means:
- You cannot read the most significant digits until the entire calculation is finished.
- It is impossible to estimate orders of magnitude on the fly.
- It requires physical paper scratchpads to hold carry marks.

### The Vedic Left-to-Right Approach
Vedic Mathematics prioritizes **Left-to-Right Computation**:
- You calculate the largest place values first (hundreds, then tens, then units).
- If you are interrupted or need an instant rough estimate, you already possess the most critical leading digits!
- Mental memory overhead is drastically reduced.`,
      },
      {
        title: 'Flexibility: Multiple Pathways to One Solution',
        slug: 'pathways-and-flexibility',
        pageType: 'SUTRA_TECHNIQUE',
        order: 3,
        estimatedMinutes: 4,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Recognize that Vedic math rejects single-method dogma',
          'Select optimal techniques based on numerical topology',
        ],
        contentMarkdown: `## Flexibility and Multiple Solution Pathways

A standout hallmark of Vedic Mathematics is that there is **never just one rigid way** to solve a problem.

### Example: Computing $98 \\times 97$
Depending on the student's personal cognitive style, they can choose between:

1. **The Base Method (*Nikhilam*):**
   Both numbers are near 100 with deviations $-2$ and $-3$:
   $$\\text{Left} = 98 - 3 = 95, \\quad \\text{Right} = (-2) \\times (-3) = 06 \\implies 9506$$
2. **Vertically and Crosswise (*Urdhva*):**
   Universal direct multiplication in a single mental line.
3. **Algebraic Identity:**
   $(100 - 2)(100 - 3) = 10000 - 500 + 6 = 9506$.
4. **Vinculum Method:**
   Transforming 98 and 97 into bar numbers $(10\\bar{2}) \\times (10\\bar{3})$.

Students develop **mathematical intuition** rather than robotic adherence to one recipe.`,
      },
      {
        title: 'Instant Verification: Navasesh / Digit Sums',
        slug: 'navasesh-digit-sums',
        pageType: 'WORKED_EXAMPLES',
        order: 4,
        estimatedMinutes: 4,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Calculate digit sums (casting out nines) accurately',
          'Verify arithmetic operations in less than 3 seconds',
        ],
        contentMarkdown: `## Instant Self-Checking via Navasesh (Casting Out 9s)

How do you know an answer is correct without re-doing the entire calculation?
Vedic Mathematics incorporates a built-in checking system called *Navasesh* (Digit Sum modulo 9).

### The Digit Sum Rule
Add the digits of a number until a single digit (1–9) remains. You may "cast out" (ignore) any 9s or combinations summing to 9.

### Worked Example: Check $436 + 285 = 721$
1. **Digit Sum of 436:**
   $$4 + 3 + 6 = 13 \\implies 1 + 3 = 4$$
2. **Digit Sum of 285:**
   $$2 + 8 + 5 = 15 \\implies 1 + 5 = 6$$
3. **Sum of Digit Sums:**
   $$4 + 6 = 10 \\implies 1 + 0 = 1$$
4. **Digit Sum of the Answer (721):**
   $$7 + 2 + 1 = 10 \\implies 1 + 0 = 1$$

Since $1 = 1$, the calculation is verified! If they differed, an error would be immediately detected.`,
      },
      {
        title: 'Common Mistakes in Feature Application',
        slug: 'common-mistakes-features',
        pageType: 'COMMON_ERRORS',
        order: 5,
        estimatedMinutes: 3,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Avoid false confidence from casting out nines',
          'Prevent misapplying specialized methods to general problems',
        ],
        contentMarkdown: `## Common Student Mistakes

### 1. The Limitation of Casting Out Nines
- **Trap:** Believing that matching digit sums guarantees 100% correctness.
- **Correction:** Casting out nines detects 8 out of 9 errors. It does NOT detect transposition errors (e.g., writing 712 instead of 721) or errors by multiples of 9. Always pair it with place-value estimation!

### 2. Forcing a Specific Shortcut on Incompatible Numbers
- **Trap:** Attempting to use the Base Method on numbers far from any base (e.g. $47 \\times 62$ using base 100).
- **Correction:** Use specialized methods (*Nikhilam*) only when numbers are near a base. Use universal methods (*Urdhva*) everywhere else!`,
      },
      {
        title: 'Summary and Knowledge Check',
        slug: 'summary-knowledge-check',
        pageType: 'SUMMARY',
        order: 6,
        estimatedMinutes: 2,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Review the core features of Vedic Mathematics',
          'Self-assess readiness for applications and operations',
        ],
        contentMarkdown: `## Summary of Features

1. **Holistic & Coherent:** Identical mathematical patterns unite arithmetic, algebra, and geometry.
2. **Left-to-Right:** Enables rapid mental estimation of highest-value digits.
3. **Flexible:** Multiple valid routes allow cognitive adaptation.
4. **Built-in Verification:** Instant error checking via *Navasesh* (digit sums).

Ready to explore practical applications? Let's move to Topic 3!`,
      },
    ],
  },

  // ===========================================================
  // TOPIC 3: Applications of Vedic Mathematics
  // ===========================================================
  {
    topicTitle: 'Applications of Vedic Mathematics',
    moduleTitle: 'Introduction to Vedic Mathematics',
    lessonTitle: 'Modern Applications: Mental Agility to High-Speed Computing',
    lessonDescription:
      'Discover how Vedic Mathematics principles apply to competitive exams, mental financial calculations, computer VLSI arithmetic algorithms, and cryptography.',
    sutra: 'Applied Mathematics',
    technique: 'Computational Speed',
    difficulty: Difficulty.EASY,
    estimatedMinutes: 20,
    resources: [
      {
        title: 'Vedic Mathematics in Modern Computing & VLSI Design',
        description: 'Academic monograph discussing high-speed Urdhva-Tiryagbhyam multiplier hardware architectures.',
        resourceType: 'RESEARCH_PAPER',
        url: 'https://ieeexplore.ieee.org/document/5484803',
        provider: 'IEEE Xplore Research Archive',
        authorOrPublisher: 'P. Saha et al., IEEE Transactions',
        attributionText: 'IEEE Computer Society Research Paper on High-Speed Multipliers',
        licenseType: 'Academic Research Citation',
        isVerified: true,
      },
    ],
    pages: [
      {
        title: 'Introduction: Beyond Classroom Calculations',
        slug: 'beyond-classroom-applications',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 3,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Identify the broad spectrum of Vedic mathematics applications in the modern world',
          'Understand how mental agility translates to competitive advantage',
        ],
        contentMarkdown: `## Beyond Classroom Calculations

Is Vedic Mathematics merely an interesting set of party tricks, or does it hold genuine utility in the 21st century?

The answer is profound: while human students use Vedic algorithms for **mental calculation in competitive exams and finance**, electrical engineers and computer scientists implement the exact same algorithmic structures in **silicon microprocessors (VLSI design)** to dramatically reduce propagation delay!

### Major Domains of Application
1. **Competitive Examinations:** SAT, GRE, CAT, GMAT, Olympiads, and Civil Services.
2. **Everyday Financial Math:** Instant interest estimation, discount calculation, and currency conversions.
3. **Digital Signal Processing (DSP):** High-speed multiplier architectures in computer chips.
4. **Cognitive Brain Fitness:** Enhances working memory and spatial pattern recognition.`,
      },
      {
        title: 'Application in VLSI & Digital Hardware Multipliers',
        slug: 'vlsi-computer-multipliers',
        pageType: 'THEORY',
        order: 2,
        estimatedMinutes: 4,
        difficulty: Difficulty.MEDIUM,
        learningObjectives: [
          'Understand how Urdhva-Tiryagbhyam reduces hardware multiplier latency',
          'Contrast Vedic parallel crosswise multiplication with conventional shift-and-add hardware',
        ],
        contentMarkdown: `## High-Speed Hardware Multipliers in VLSI

In computer processor design, **multiplication** is one of the most hardware-intensive and time-consuming operations in Arithmetic Logic Units (ALUs) and Digital Signal Processors (DSPs).

### The Conventional Hardware Bottleneck
Standard computer multipliers historically used sequential *shift-and-add* algorithms (such as Booth's algorithm) or Wallace trees. These suffer from:
- Sequential carry propagation delays.
- Increased silicon surface area and thermal power dissipation.

### The Vedic Architecture (Urdhva-Tiryagbhyam in Silicon)
Engineers implemented *Urdhva-Tiryagbhyam* (Vertically and Crosswise) in digital circuitry:
- All partial products are generated **in parallel** in a single clock cycle.
- Intermediate carry outputs are summed simultaneously using carry-save adders.
- Published IEEE papers demonstrate a **30% to 45% reduction in calculation delay** for 8-bit, 16-bit, and 32-bit floating-point multipliers!`,
      },
      {
        title: 'Competitive Exams and Time Management',
        slug: 'competitive-exams-applications',
        pageType: 'APPLICATIONS',
        order: 3,
        estimatedMinutes: 4,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Implement speed shortcuts under strict exam time constraints',
          'Eliminate intermediate rough work on test paper',
        ],
        contentMarkdown: `## Applications in Competitive Exams (CAT, GRE, SAT)

In high-stakes competitive examinations, the limiting factor is rarely whether you know how to solve a problem—it is whether you can execute it in **45 seconds instead of 3 minutes**.

### Direct Tactical Advantages
1. **Squaring & Roots in 5 Seconds:**
   Evaluating numbers like $65^2$ or $\\sqrt{5329}$ mentally frees cognitive energy for complex reasoning.
2. **Decimal Fraction Simplifications:**
   Using crosswise operations on fractions eliminates multi-step LCD expansions.
3. **Option Elimination:**
   By applying digit sum checking (*Navasesh*) to multiple-choice options, you can eliminate 3 out of 4 answers in under 10 seconds without computing the full equation!`,
      },
      {
        title: 'Summary and Knowledge Check',
        slug: 'applications-summary',
        pageType: 'SUMMARY',
        order: 4,
        estimatedMinutes: 2,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Synthesize modern applications of Vedic Mathematics',
          'Appreciate the dual cognitive and computational impact',
        ],
        contentMarkdown: `## Topic Summary

Vedic Mathematics is both a personal cognitive amplifier and a formal mathematical architecture:
- In humans: Builds mental calculation speed, memory capacity, and confidence.
- In computers: Informs modern low-latency VLSI digital multiplier hardware.

Next, we explore the complete canonical catalog of the 16 Sutras and 13 Sub-Sutras!`,
      },
    ],
  },

  // ===========================================================
  // TOPIC 4: Sutras and Upsutras
  // ===========================================================
  {
    topicTitle: 'Sutras and Upsutras',
    moduleTitle: 'Introduction to Vedic Mathematics',
    lessonTitle: 'The Complete Canonical 16 Sutras and 13 Sub-Sutras',
    lessonDescription:
      'Master the complete catalog, Sanskrit titles, English translations, and functional domains of all 16 canonical Vedic Sutras and 13 Upasutras.',
    sutra: '16 Sutras and 13 Sub-Sutras',
    technique: 'Aphoristic Structures',
    difficulty: Difficulty.EASY,
    estimatedMinutes: 25,
    resources: [
      {
        title: 'The 16 Vedic Mathematics Sutras Explained',
        description: 'Systematic explanation of the names, meanings, and operations of Vedic aphorisms by Aditi Singhal.',
        resourceType: 'YOUTUBE_VIDEO',
        url: 'https://www.youtube.com/watch?v=yyE23Dqs8pM',
        embedUrl: 'https://www.youtube-nocookie.com/embed/yyE23Dqs8pM',
        provider: 'YouTube',
        authorOrPublisher: 'Aditi Singhal',
        attributionText: 'Curated instructional overview of the 16 Sutras',
        licenseType: 'Standard YouTube License',
        isVerified: true,
      },
    ],
    pages: [
      {
        title: 'Introduction: The 16 Primary Aphorisms',
        slug: 'sixteen-primary-sutras',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 4,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Recognize the names and English meanings of the primary 16 Sutras',
          'Understand their computational categories',
        ],
        contentMarkdown: `## The 16 Primary Vedic Sutras

The entire Vedic Mathematics system is organized around 16 foundational aphorisms (*Mula Sutras*):

1. **Ekadhikena Purvena:** By one more than the previous one.
2. **Nikhilam Navatashcaramam Dashatah:** All from 9 and the last from 10.
3. **Urdhva-Tiryagbhyam:** Vertically and crosswise.
4. **Paravartya Yojayet:** Transpose and apply.
5. **Shunyam Samyasamuccaye:** When the collection is the same, it is zero.
6. **Anurupyena:** Proportionately.
7. **Sankalana-Vyavakalanabhyam:** By addition and by subtraction.
8. **Puranapuranabhyam:** By the completion or non-completion.
9. **Calana-Kalanabhyam:** Differential calculus / movement and computation.
10. **Yavadunam:** By the deficiency.
11. **Vyashtisamashthi:** Specific and general / individual and aggregate.
12. **Seshanyankena Charamena:** The remainders by the last digit.
13. **Sopantyadvayamantyam:** The ultimate and twice the penultimate.
14. **Ekanyunena Purvena:** By one less than the previous one.
15. **Gunitasamuccayah:** The product of the sum is the sum of the products.
16. **Gunakasamuccayah:** The factor of the sum is equal to the sum of the factors.`,
      },
      {
        title: 'The 13 Sub-Sutras (Upasutras)',
        slug: 'thirteen-sub-sutras',
        pageType: 'THEORY',
        order: 2,
        estimatedMinutes: 4,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Learn the secondary corollaries known as Upasutras',
          'Understand how Upasutras specialize the primary Sutras',
        ],
        contentMarkdown: `## The 13 Sub-Sutras (Upasutras)

Sub-sutras (*Upasutras*) are corollaries that refine or specialize the main aphorisms for particular numerical topologies:

1. **Anurupyena:** Proportionately (applies to working bases).
2. **Sishyate Seshasamjnah:** The remainder remains constant.
3. **Adyamadyenantyamantyena:** The first by the first, and the last by the last (polynomial factoring).
4. **Kevalaih Saptakam Gunyat:** For 7, the multiplier is 143.
5. **Vestanam:** By osculation (divisibility testing).
6. **Yavadunam Tavadunam:** Lessen by the deficiency.
7. **Yavadunam Tavadunikritya Vargancha Yojayet:** Whatever the deficiency, lessen by that amount and append the square of the deficiency.
8. **Antyayordashake'pi:** When the sum of the final digits is 10.
9. **Antyayoreva:** Only the last terms.
10. **Samuccayagunitah:** The sum of the coefficients in the product.
11. **Lopana-Sthapanabhyam:** By elimination and retention.
12. **Vilokanam:** By simple observation / inspection.
13. **Gunitasamuccayah Samuccayagunitah:** The product of the sum is the sum of the products.`,
      },
      {
        title: 'Functional Categorization of the Sutras',
        slug: 'functional-grouping',
        pageType: 'SUTRA_TECHNIQUE',
        order: 3,
        estimatedMinutes: 4,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Group Sutras by mathematical function (Arithmetic, Algebra, Geometry, Calculus)',
          'Select the right Sutra family for any given problem',
        ],
        contentMarkdown: `## Functional Categorization

To navigate the 16 Sutras with ease, we categorize them into operational domains:

### 1. General Universal Algorithms
- **Urdhva-Tiryagbhyam (Vertically & Crosswise):** General multiplication, division, polynomial products.
- **Paravartya Yojayet (Transpose & Apply):** General division, algebraic equation solving.

### 2. Base & Complement Operators
- **Nikhilam Navatashcaramam Dashatah:** Base multiplication, rapid subtraction, complements.
- **Yavadunam:** Base squaring and cubing near 10, 100, 1000.

### 3. Digit Increment & Decrement Patterns
- **Ekadhikena Purvena:** Squaring ending in 5, recurring decimal expansions, series of 1s.
- **Ekanyunena Purvena:** Multiplication by series of 9s (9, 99, 999).

### 4. Algebraic Inspection & Factoring
- **Adyamadyenantyamantya:** Direct visual factorization of quadratic expressions.
- **Shunyam Samyasamuccaye:** Instant root detection in symmetric equations.`,
      },
      {
        title: 'Summary & Transition to Operations',
        slug: 'summary-transition',
        pageType: 'SUMMARY',
        order: 4,
        estimatedMinutes: 2,
        difficulty: Difficulty.EASY,
        learningObjectives: [
          'Review the catalog of Sutras and Upasutras',
          'Transition to practical arithmetic computation in Module 2',
        ],
        contentMarkdown: `## Summary of Module 1

You have now established the historical, theoretical, and aphoristic foundations of Vedic Mathematics!
- You know who Swami Bharati Krishna Tirtha was and how his reconstruction fits into Indian mathematical history.
- You understand the core features: coherence, left-to-right calculation, flexibility, and digit sum checking.
- You have reviewed the 16 Sutras and 13 Upasutras.

In **Module 2**, we begin practical computation: High-Speed Addition and Subtraction!`,
      },
    ],
  },
];
