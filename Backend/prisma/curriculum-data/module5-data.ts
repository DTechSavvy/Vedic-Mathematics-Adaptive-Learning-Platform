import { TopicSeedData } from './types';

export const module5Topics: TopicSeedData[] = [
  {
    topicTitle: 'Factoring Quadratic Equations',
    technique: 'Adyamadyena & Anurupyena Factorization',
    sutra: 'Adyamadyenantyamantya',
    pages: [
      {
        slug: 'quadratics-intro',
        title: 'Introduction to Mental Quadratic Factoring',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 5,
        contentMarkdown: `## Factoring Quadratics at a Glance

In modern algebra, factoring a quadratic polynomial $ax^2 + bx + c$ often involves trial and error or applying the quadratic formula.
In Vedic Mathematics, factoring is guided by the twin sutras:
$$\\textbf{Ādyamādyenāntyamantyena} \\quad \\text{and} \\quad \\textbf{Ānurūpyeṇa}$$
*(By the first by the first, and the last by the last; and proportionately).*

### The Fundamental Insight
A factorable quadratic polynomial is the product of two linear factors:
$$(px + q)(rx + s) = (pr)x^2 + (ps + qr)x + (qs)$$

Notice the symmetry:
- **First by first:** The coefficient of $x^2$ is the product of the first terms: $a = pr$.
- **Last by last:** The constant term is the product of the last terms: $c = qs$.
- **Middle term:** The cross-sum: $b = ps + qr$.`,
      },
      {
        slug: 'quadratics-monic-method',
        title: 'Factoring Monic Quadratics ($x^2 + bx + c$)',
        pageType: 'THEORY',
        order: 2,
        estimatedMinutes: 5,
        contentMarkdown: `## Monic Quadratics ($a = 1$)

When $a = 1$, the factors take the shape $(x + q)(x + s)$.
Then:
$$q \\times s = c \\quad \\text{and} \\quad q + s = b$$

### Step-by-Step Procedure
1. Observe the last term $c$ and list its factor pairs $(q, s)$.
2. By inspection, choose the pair whose algebraic sum equals $b$.
3. Instantly write $(x + q)(x + s) = 0$.

### Example: Factor $x^2 + 7x + 12$
- First by first: $x \\times x = x^2$.
- Last by last: $12 = 3 \\times 4$.
- Middle check: $3 + 4 = 7 = b$ (matches!).
- **Factors:** $(x + 3)(x + 4)$.
- **Roots:** $x = -3, x = -4$.`,
      },
      {
        slug: 'quadratics-nonmonic-worked-examples',
        title: 'Non-Monic Quadratics ($ax^2 + bx + c$)',
        pageType: 'WORKED_EXAMPLE',
        order: 3,
        estimatedMinutes: 7,
        contentMarkdown: `## Non-Monic Quadratics & Ratio Method (Ānurūpyeṇa)

When $a > 1$, we can use the **Ratio Method** (Ānurūpyeṇa).

### Example 1: Factor $2x^2 + 7x + 3$
1. Split the product of the first and last coefficients:
   $$a \\times c = 2 \\times 3 = 6$$
2. Find factors of $6$ that sum to $b = 7$:
   $$6 = 6 \\times 1 \\quad (6 + 1 = 7)$$
3. Write the middle term split:
   $$2x^2 + 6x + 1x + 3$$
4. Observe the common ratio between consecutive terms:
   - For $2x^2 + 6x$, the ratio of coefficients is $2 : 6 = 1 : 3$.
   - For $1x + 3$, the ratio of coefficients is $1 : 3$.
   - Because the ratio matches ($1 : 3$), the common factor is $(x + 3)$!
5. The complementary factor is the first divided by first and last divided by last:
   $$(2x^2 / x) + (3 / 3) = 2x + 1$$
6. **Final Factorization:** $(2x + 1)(x + 3)$.

$$\\text{Check: } (2x + 1)(x + 3) = 2x^2 + 6x + x + 3 = 2x^2 + 7x + 3 \\quad \\checkmark$$`,
      },
      {
        slug: 'quadratics-differential-shortcut',
        title: 'The Differential Shortcut for Quadratics',
        pageType: 'THEORY',
        order: 4,
        estimatedMinutes: 6,
        contentMarkdown: `## Finding Roots via First Differential

An intriguing technique introduced in Bharati Krishna Tirtha\\'s work uses the first derivative (differential) of the quadratic:

Let $f(x) = ax^2 + bx + c = 0$.
The first differential is $f\\'(x) = 2ax + b$.

If $f(x) = 0$ has discriminant $\\Delta = b^2 - 4ac$, then:
$$2ax + b = \\pm \\sqrt{b^2 - 4ac}$$
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

This gives an intuitive mental shortcut when $\\Delta$ is a perfect square, allowing students to set $2ax + b = \\sqrt{\\Delta}$ directly without memorizing long fractions!`,
      },
      {
        slug: 'quadratics-mistakes-summary',
        title: 'Common Mistakes & Summary',
        pageType: 'COMMON_MISTAKES',
        order: 5,
        estimatedMinutes: 4,
        contentMarkdown: `## Common Pitfalls in Quadratic Factoring

1. **Sign Errors with Negative Constants:**
   In $x^2 - 5x - 24$, factor pairs of $-24$ must sum to $-5$. Choosing $-6$ and $+4$ gives sum $-2$. The correct pair is $-8$ and $+3$.
2. **Forgetting to Divide by Leading Coefficient in Roots:**
   If the factors are $(3x - 2)(x + 4) = 0$, the roots are $x = \\frac{2}{3}$ and $x = -4$. Do not forget the denominator $3$ for the first factor!`,
      },
    ],
    resources: [
      {
        title: 'Vedic Math Quadratic Equation & Algebraic Division',
        url: 'https://www.youtube.com/watch?v=IPrJABfzZqw',
        resourceType: 'VIDEO',
        provider: 'YOUTUBE',
        videoId: 'IPrJABfzZqw',
        embedUrl: 'https://www.youtube-nocookie.com/embed/IPrJABfzZqw',
        authorOrPublisher: 'Khan Academy India',
        isEmbeddable: true,
      },
    ],
  },
  {
    topicTitle: 'Baudhayana Theorem',
    technique: 'Geometric Rope Triangles & Pythagorean Diagonals',
    sutra: 'Baudhayana Shulbasutra',
    pages: [
      {
        slug: 'baudhayana-theorem-intro',
        title: 'The Baudhayana Shulbasutra Theorem',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 5,
        contentMarkdown: `## The Ancient Indian Geometric Theorem of the Diagonal

The geometric theorem commonly known today as the **Pythagorean Theorem** was explicitly articulated and proved in ancient India in the **Baudhāyana Śulbasūtra** (c. 800–600 BCE), centuries prior to Pythagoras of Samos (c. 570–495 BCE).

### The Original Sanskrit Text (Baudhāyana Śulbasūtra 1.48)
$$\\text{दीर्घचतुरश्रस्याक्ष्णया रज्जुः पार्श्वमानी तिर्यङ्मानी च।}$$
$$\\text{यत्पृथग्भूते कुरुतस्तदुभयं करोति ॥}$$

### English Translation
> *"The rope stretched across the diagonal of an oblong (rectangle) produces an area which the vertical and horizontal sides produce separately."*

In modern algebraic notation:
$$\\text{Area}(\\text{diagonal square}) = \\text{Area}(\\text{length square}) + \\text{Area}(\\text{breadth square})$$
$$\\mathbf{d^2 = a^2 + b^2}$$`,
      },
      {
        slug: 'baudhayana-geometric-proof',
        title: "Baudhayana's Geometric Rope Proof",
        pageType: 'THEORY',
        order: 2,
        estimatedMinutes: 6,
        contentMarkdown: `## Baudhayana's Visual Geometric Dissection

The Vedic geometric tradition relied on visual demonstrations using cords (*śulba*) and geometric tiles (*iṣṭakā*).

### The Inscribed Square Proof
1. Take a large square of side $(a + b)$.
2. Place four identical right-angled triangles with legs $a$ and $b$ and hypotenuse $c$ at the four corners.
3. The remaining central unshaded figure is a square of side $c$ and area $c^2$.
4. **Total Area:**
   $$\\text{Total Area} = (a + b)^2 = a^2 + 2ab + b^2$$
5. **Sum of Four Triangles:**
   $$4 \\times \\left(\\frac{1}{2}ab\\right) = 2ab$$
6. **Central Square Area:**
   $$c^2 = (a^2 + 2ab + b^2) - 2ab = a^2 + b^2$$
   $$\\mathbf{c^2 = a^2 + b^2}$$

This visual dissection requires no advanced algebra and was known to Vedic craftspeople laying brick altars.`,
      },
      {
        slug: 'baudhayana-triplets-worked-examples',
        title: 'Vedic Pythagorean Triplets & Worked Examples',
        pageType: 'WORKED_EXAMPLE',
        order: 3,
        estimatedMinutes: 6,
        contentMarkdown: `## Pythagorean Triplets in the Sulbasutras

The Śulbasūtras explicitly list integer right-triangle triples used for constructing altars:
- $(3, 4, 5)$
- $(5, 12, 13)$
- $(7, 24, 25)$
- $(8, 15, 17)$
- $(12, 35, 37)$
- $(15, 36, 39)$

---

### Example: Calculating the Diagonal of a Fire Altar
**Problem:** A rectangular altar has a length of $15$ prakrama and a width of $8$ prakrama. What is the length of the diagonal cord required to lay out the altar?

1. $a = 15, b = 8$
2. $d^2 = a^2 + b^2 = 15^2 + 8^2$
3. $15^2 = 225$, $8^2 = 64$
4. $d^2 = 225 + 64 = 289$
5. $d = \\sqrt{289} = 17$ prakrama.

$$\\text{Verification: } 17^2 = 289 \\quad \\checkmark$$`,
      },
      {
        slug: 'baudhayana-summary',
        title: 'Historical & Pedagogical Significance',
        pageType: 'SUMMARY',
        order: 4,
        estimatedMinutes: 4,
        contentMarkdown: `## Historical Perspective

### Key Scholarly Insights
- **Baudhayana (c. 800 BCE):** First explicit formulation of the general diagonal property for rectangles and squares.
- **Babylonian Tablets (Plimpton 322, c. 1800 BCE):** Tabulated Pythagorean triples earlier, but without geometric proof or statement of the general theorem.
- **Euclid (Elements I.47, c. 300 BCE):** First formal Greek axiomatic geometric proof.
- **Conclusion:** The theorem was discovered independently across ancient civilizations for monumental architecture, astronomy, and land survey.`,
      },
    ],
    resources: [
      {
        title: 'Baudhayana Sulbasutra: The Ancient Indian Pythagorean Theorem',
        url: 'https://mathshistory.st-andrews.ac.uk/Biographies/Baudhayana/',
        resourceType: 'ARTICLE',
        provider: 'OPEN_EDUCATIONAL_RESOURCE',
        authorOrPublisher: 'MacTutor History of Mathematics Archive, St Andrews',
      },
    ],
  },
  {
    topicTitle: 'Circling a Square',
    technique: 'Sulbasutra Vedic Geometric Quadrature',
    sutra: 'Mandala Parivartana',
    pages: [
      {
        slug: 'circling-square-intro',
        title: 'The Vedic Altar Quadrature Problem',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 5,
        contentMarkdown: `## Transforming Rectilinear into Curvilinear Altars

In Vedic ritual geometry, different sacrificial altars served different symbolic functions:
- The **Gārhapatya** altar was traditionally circular.
- The **Āhavanīya** altar was square.
- Crucially, both altars were required to have the **exact same surface area** (usually $7\\frac{1}{2}$ square puruṣas).

This practical religious demand led the Vedic geometers to develop algorithms for:
1. **Circling a Square:** Constructing a circle with the same area as a given square.
2. **Squaring a Circle:** Constructing a square with the same area as a given circle.`,
      },
      {
        slug: 'circling-square-geometric-method',
        title: "Baudhayana's Construction for Circling a Square",
        pageType: 'THEORY',
        order: 2,
        estimatedMinutes: 6,
        contentMarkdown: `## Baudhayana's Geometric Construction

### The Sulbasutra Algorithm (Baudhāyana 1.58)
Let the square have side length $2a$ and center $O$.
1. From the center $O$, draw a circle through the midpoints of the sides (radius $r_1 = a$).
2. Draw the circumscribed circle passing through the vertices (radius $r_2 = a\\sqrt{2}$).
3. The distance between the side midpoint and the vertex along the radial line is:
   $$\\Delta r = a\\sqrt{2} - a = a(\\sqrt{2} - 1)$$
4. Baudhayana prescribes choosing a circle whose radius extends by **one-third** of this difference:
   $$R = a + \\frac{1}{3}a(\\sqrt{2} - 1) = a \\left(1 + \\frac{\\sqrt{2} - 1}{3}\\right) = a \\left(\\frac{2 + \\sqrt{2}}{3}\\right)$$`,
      },
      {
        slug: 'circling-square-mathematical-accuracy',
        title: 'Mathematical Accuracy and Effective Pi',
        pageType: 'THEORY',
        order: 3,
        estimatedMinutes: 6,
        contentMarkdown: `## Evaluating the Precision

Let us check how close the circle's area is to the square's area:
- Square side $= 2a \\implies \\text{Area}_{\\text{square}} = 4a^2$.
- Circle area $= \\pi R^2 = \\pi a^2 \\left(\\frac{2 + \\sqrt{2}}{3}\\right)^2$.

Equating the two:
$$\\pi a^2 \\left(\\frac{2 + \\sqrt{2}}{3}\\right)^2 \\approx 4a^2$$
$$\\pi \\approx \\frac{36}{(2 + \\sqrt{2})^2} = \\frac{36}{4 + 4\\sqrt{2} + 2} = \\frac{36}{6 + 4\\sqrt{2}} = \\frac{18}{3 + 2\\sqrt{2}}$$
Multiplying by conjugate $(3 - 2\\sqrt{2})$:
$$\\pi \\approx 18(3 - 2\\sqrt{2}) = 54 - 36\\sqrt{2}$$

Substituting $\\sqrt{2} \\approx 1.41421356$:
$$\\pi_{\\text{effective}} = 54 - 36(1.41421356) = 54 - 50.911688 = \\mathbf{3.0883}$$

### Analysis
- This geometric construction has an error of approximately $1.7\\%$.
- For physical cord and bamboo altar construction, an error under $2\\%$ was well within the physical tolerances of handmade bricks!`,
      },
      {
        slug: 'circling-square-summary',
        title: 'Summary & Historical Lessons',
        pageType: 'SUMMARY',
        order: 4,
        estimatedMinutes: 4,
        contentMarkdown: `## Key Insights on Vedic Quadrature

1. **Practical Engineering over Pure Axiomatics:**
   Unlike the Greeks who sought theoretical proofs of compass-and-straightedge insolvability, Vedic geometers sought pragmatic, beautiful rope constructions for physical altars.
2. **Reversible Constructions:**
   The Sulbasutras also provide the reverse construction (squaring a circle by reducing the diameter by $2/15$ or $1/8$).`,
      },
    ],
    resources: [
      {
        title: 'Indian Mathematics: Sulba Sutras Geometry & Altar Constructions',
        url: 'https://mathshistory.st-andrews.ac.uk/Projects/Pearce/',
        resourceType: 'ARTICLE',
        provider: 'OPEN_EDUCATIONAL_RESOURCE',
        authorOrPublisher: 'MacTutor History of Mathematics Archive, St Andrews',
      },
    ],
  },
  {
    topicTitle: 'Concept of Pi',
    technique: 'Aryabhata & Baudhayana Circumference Approximations',
    sutra: 'Katapayadi Sankhya & Shulbasutras',
    pages: [
      {
        slug: 'pi-historical-intro',
        title: 'Approximations of Pi in Classical Indian Mathematics',
        pageType: 'INTRODUCTION',
        order: 1,
        estimatedMinutes: 5,
        contentMarkdown: `## The Ratio of Circumference to Diameter

The mathematical constant $\\pi = C / d$ has an illustrious history in Indian astronomy and mathematics.

From the early geometric approximations in the **Śulbasūtras** to the extraordinary precision of **Āryabhaṭa I** (499 CE) and the infinite series of **Mādhava of Saṅgamagrāma** (c. 1350–1425 CE), Indian mathematicians made monumental contributions to understanding $\\pi$.

### The Chronological Milestones
1. **Sulbasutras (c. 800 BCE):** Geometric estimates yielding $\\pi \\approx 3.088$ to $3.004$.
2. **Aryabhata (499 CE):** Rational fraction $\\pi \\approx \\frac{62832}{20000} = 3.1416$.
3. **Madhava of Sangamagrama (c. 1400 CE):** The discovery of the infinite series for $\\pi$ (predating Leibniz and Gregory by three centuries).`,
      },
      {
        slug: 'pi-aryabhata-verse',
        title: "Aryabhata's Famous Verse (499 CE)",
        pageType: 'THEORY',
        order: 2,
        estimatedMinutes: 6,
        contentMarkdown: `## Āryabhaṭīya (Gaṇitapāda, Verse 10)

In 499 CE, the 23-year-old mathematician Āryabhaṭa wrote:

$$\\text{चतुरधिकं शतमष्टगुणं द्वाषष्टिस्तथा सहस्राणाम्।}$$
$$\\text{अयुतद्वयविष्कम्भस्यासन्नो वृत्तपरिणाहः ॥}$$

### English Translation
> *"Add 4 to 100, multiply by 8, and add 62,000. By this rule the circumference of a circle with a diameter of 20,000 can be approached."*

### Mathematical Calculation
$$\\text{Circumference} = (100 + 4) \\times 8 + 62000 = 104 \\times 8 + 62000 = 832 + 62000 = 62832$$
$$\\text{Diameter} = 20000$$
$$\\pi = \\frac{62832}{20000} = \\mathbf{3.1416}$$

### Crucial Significance of *Āsanna* (Approaching)
Āryabhaṭa deliberately used the word **āsanna** (आसन्न, meaning *approaching* or *approximate*). Scholars like Nilakantha Somayaji noted that Āryabhaṭa recognized that the ratio cannot be expressed as an exact finite ratio of integers—an early intuition of the irrationality of $\\pi$!`,
      },
      {
        slug: 'pi-katapayadi-system',
        title: 'The Kaṭapayādi Alphanumeric System',
        pageType: 'THEORY',
        order: 3,
        estimatedMinutes: 6,
        contentMarkdown: `## Encoding Numbers in Sanskrit Verse: The Kaṭapayādi System

To memorize large astronomical constants easily, Indian astronomers created the **Kaṭapayādi** (कटपयादि) mnemonic system, where Sanskrit consonants correspond to decimal digits:

$$\\begin{array}{|c|c|c|c|c|c|c|c|c|c|}
\\hline
1 & 2 & 3 & 4 & 5 & 6 & 7 & 8 & 9 & 0 \\\\
\\hline
ka & kha & ga & gha & ṅa & ca & cha & ja & jha & ña \\\\
ṭa & ṭha & ḍa & ḍha & ṇa & ta & tha & da & dha & na \\\\
pa & pha & ba & bha & ma & & & & & \\\\
ya & ra & la & va & śa & ṣa & sa & ha & & \\\\
\\hline
\\end{array}$$

Vowels carry no numerical value. Words are read right-to-left (*aṅkānāṁ vāmato gatiḥ*).

### The Famous Pi Verse
Madhavan and later Kerala astronomers encoded $\\pi$ to **31 decimal places** in a single devotional verse praising Krishna:
$$\\text{गोपीभाग्यमधुव्रातः शृङ्गशोदधिसन्धिगः ...}$$
*(Gopībhāgya madhuvrātaḥ śṛṅgaśodadhi sandhigaḥ...)*

Decoding the consonants yields:
$$3.141592653589793238462643383279...$$`,
      },
      {
        slug: 'pi-summary',
        title: 'Summary & Mathematical Takeaways',
        pageType: 'SUMMARY',
        order: 4,
        estimatedMinutes: 4,
        contentMarkdown: `## Summary of Indian Contributions to $\\pi$

1. **Practical Engineering:** Early Shulbasutra geometric approximations sufficed for temple construction.
2. **Computational Leap:** Āryabhaṭa's $3.1416$ was the most accurate value of $\\pi$ in the world in the 5th century.
3. **Infinite Series Revolution:** Mādhava's series:
   $$\\frac{\\pi}{4} = 1 - \\frac{1}{3} + \\frac{1}{5} - \\frac{1}{7} + \\dots$$
   laid the bedrock for modern mathematical analysis centuries before Newton and Leibniz.`,
      },
    ],
    resources: [
      {
        title: 'Aryabhata and the Approximation of Pi',
        url: 'https://mathshistory.st-andrews.ac.uk/Biographies/Aryabhata_I/',
        resourceType: 'ARTICLE',
        provider: 'OPEN_EDUCATIONAL_RESOURCE',
        authorOrPublisher: 'MacTutor History of Mathematics Archive, St Andrews',
      },
    ],
  },
];

export const MODULE_5_PACKAGES = module5Topics;
