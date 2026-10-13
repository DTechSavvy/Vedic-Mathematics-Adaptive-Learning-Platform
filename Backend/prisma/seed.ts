import { PrismaClient, Difficulty } from '@prisma/client';
import { CANONICAL_ACHIEVEMENTS } from '../src/achievement/achievements.data';
import { CANONICAL_STORE_ITEMS } from '../src/gamification/store.data';

const prisma = new PrismaClient();

async function main() {
  console.log('=== IDEMPOTENT VEDIC MATHEMATICS SEED STARTING ===');

  // 1. Course
  let course = await prisma.course.findFirst({
    where: { title: 'Vedic Mathematics' },
  });

  if (!course) {
    course = await prisma.course.create({
      data: {
        title: 'Vedic Mathematics',
        description: 'AI-Driven Gamified Adaptive Learning Platform for Vedic Mathematics',
        order: 1,
      },
    });
    console.log(`Created Course: [${course.id}] ${course.title}`);
  } else {
    console.log(`Course exists: [${course.id}] ${course.title}`);
  }

  // 2. Modules & Topics
  const curriculumHierarchy = [
    {
      title: 'Introduction to Vedic Mathematics',
      order: 1,
      topics: [
        {
          title: 'History of Vedic Mathematics',
          order: 1,
          technique: 'Historical Foundations',
          sutra: 'Origin & Evolution',
          learningObjectives: [
            'Understand the Vedic origins of mental calculation',
            'Recognize the contributions of Swami Bharati Krishna Tirtha',
          ],
        },
        {
          title: 'Features of Vedic Mathematics',
          order: 2,
          technique: 'Holistic Mathematics',
          sutra: 'Sutra Architecture',
          learningObjectives: [
            'Appreciate the coherence and mental agility benefits',
            'Contrast Vedic methods with conventional vertical algorithms',
          ],
        },
        {
          title: 'Applications of Vedic Mathematics',
          order: 3,
          technique: 'Computational Speed',
          sutra: 'Applied Mathematics',
          learningObjectives: [
            'Identify real-world mental arithmetic applications',
            'Apply cross-checking techniques like Navasesh / Digit Sums',
          ],
        },
        {
          title: 'Sutras and Upsutras',
          order: 4,
          technique: 'Aphoristic Structures',
          sutra: '16 Sutras and 13 Sub-Sutras',
          learningObjectives: [
            'Memorize and recite the 16 core aphorisms',
            'Understand the functional grouping of Vedic Sutras',
          ],
        },
      ],
    },
    {
      title: 'High Speed Addition and Subtraction',
      order: 2,
      topics: [
        {
          title: 'Addition Without Carrying',
          order: 1,
          technique: 'Left-to-Right Mental Addition',
          sutra: 'Ekadhikena Purvena',
          learningObjectives: [
            'Add numbers from left to right mentally',
            'Maintain running cumulative totals without pencil carry marks',
          ],
        },
        {
          title: 'Dot Method Addition',
          order: 2,
          technique: 'Rekha Sthana Columnar Summation',
          sutra: 'Rekha Sthana',
          learningObjectives: [
            'Perform long column additions with dot-marked tens',
            'Read final place-value answers directly',
          ],
        },
        {
          title: 'Nikhilam Subtraction',
          order: 3,
          technique: 'All from 9 and Last from 10',
          sutra: 'Nikhilam Navatashcaramam Dashatah',
          learningObjectives: [
            'Subtract numbers from base powers of 10 instantaneously',
            'Calculate complements across multiple decimal places',
          ],
        },
        {
          title: 'Fraction Addition',
          order: 4,
          technique: 'Crosswise Fraction Summation',
          sutra: 'Urdhva-Tiryagbhyam',
          learningObjectives: [
            'Add arbitrary fractions using criss-cross multiplication',
            'Eliminate multi-step lowest common denominator calculations',
          ],
        },
        {
          title: 'Fraction Subtraction',
          order: 5,
          technique: 'Crosswise Fraction Subtraction',
          sutra: 'Urdhva-Tiryagbhyam',
          learningObjectives: [
            'Subtract fractions in a single mental cross-product line',
            'Simplify result fractions using common divisors',
          ],
        },
      ],
    },
    {
      title: 'Miracle Multiplication and Excellent Division',
      order: 3,
      topics: [
        {
          title: 'Base Method Multiplication',
          order: 1,
          technique: 'Base Deficiency & Surplus Multiplication',
          sutra: 'Nikhilam Navatashcaramam Dashatah',
          learningObjectives: [
            'Multiply numbers near bases 10, 100, and 1000',
            'Calculate algebraic cross-summation and deficiency products',
          ],
        },
        {
          title: 'Urdhva Tiryak Multiplication',
          order: 2,
          technique: 'Universal Vertically & Crosswise Multiplication',
          sutra: 'Urdhva-Tiryagbhyam',
          learningObjectives: [
            'Multiply 2-digit and 3-digit numbers universally in one line',
            'Accumulate mental cross-products with instantaneous carries',
          ],
        },
        {
          title: 'Multiplication by Series of 1s',
          order: 3,
          technique: 'Neighbor Addition Scheme',
          sutra: 'Ekadhikena Purvena',
          learningObjectives: [
            'Multiply any multi-digit number by 11, 111, and 1111',
            'Slide window sums from right to left mentally',
          ],
        },
        {
          title: 'Multiplication by Series of 9s',
          order: 4,
          technique: 'One Less and Decimal Complement',
          sutra: 'Ekanyunena Purvena',
          learningObjectives: [
            'Multiply numbers by strings of 9s instantly',
            'Split answers into (multiplicand - 1) | (9s complement)',
          ],
        },
        {
          title: 'Vinculum Method Division',
          order: 5,
          technique: 'Bar Number Division & Transposition',
          sutra: 'Paravartya Yojayet',
          learningObjectives: [
            'Transform negative deviations using vinculum bar notations',
            'Divide using single-line modified divisors',
          ],
        },
      ],
    },
    {
      title: 'Lightning Squares and Rapid Cubes',
      order: 4,
      topics: [
        {
          title: 'Squares Using Base Method',
          order: 1,
          technique: 'Yavadunam Squaring',
          sutra: 'Yavadunam Tavadunikritya Vargancha Yojayet',
          learningObjectives: [
            'Square numbers close to base 10, 100, and 1000',
            'Double the deviation and append the squared deficiency',
          ],
        },
        {
          title: 'Squares Ending in 5',
          order: 2,
          technique: 'Preceding Number Times One More',
          sutra: 'Ekadhikena Purvena',
          learningObjectives: [
            'Square any 2-digit or 3-digit number ending in 5 mentally',
            'Multiply preceding digits by n+1 and append 25',
          ],
        },
        {
          title: 'Dwandwa Yoga Sutra',
          order: 3,
          technique: 'Duplex Method for General Squaring & Square Roots',
          sutra: 'Dwandwa Yoga',
          learningObjectives: [
            'Compute Duplex for single, double, and triple digits',
            'Extract square roots step-by-step using duplex subtraction',
          ],
        },
        {
          title: 'Square Root of 2',
          order: 4,
          technique: 'Baudhayana Sulbasutra Continued Approximation',
          sutra: 'Baudhayana Shulbasutra',
          learningObjectives: [
            'Understand ancient Vedic continued fractions for √2',
            'Achieve 5 decimal place precision using rational increments',
          ],
        },
        {
          title: 'Cubing Using Yavadunam Sutra',
          order: 5,
          technique: 'Triple Deviation Base Cubing',
          sutra: 'Yavadunam',
          learningObjectives: [
            'Cube numbers near 10 and 100 in four structured columns',
            'Calculate base + 3d | 3d² | d³ layout',
          ],
        },
      ],
    },
    {
      title: 'Algebra and Geometry',
      order: 5,
      topics: [
        {
          title: 'Factoring Quadratic Equations',
          order: 1,
          technique: 'Adyamadyena & Anurupyena Factorization',
          sutra: 'Adyamadyenantyamantya',
          learningObjectives: [
            'Factor quadratic polynomials mentally in a single glance',
            'Check first-by-first and last-by-last roots',
          ],
        },
        {
          title: 'Baudhayana Theorem',
          order: 2,
          technique: 'Geometric Rope Triangles & Pythagorean Diagonals',
          sutra: 'Baudhayana Shulbasutra',
          learningObjectives: [
            'Explore the ancient Indian geometric theorem of diagonal areas',
            'Calculate hypotenuse and leg distances without square roots',
          ],
        },
        {
          title: 'Circling a Square',
          order: 3,
          technique: 'Sulbasutra Vedic Geometric Quadrature',
          sutra: 'Mandala Parivartana',
          learningObjectives: [
            'Construct an equal-area circle from a square using sacred geometry',
            'Calculate ratio transformations between rectilinear and curvilinear forms',
          ],
        },
        {
          title: 'Concept of Pi',
          order: 4,
          technique: 'Aryabhata & Baudhayana Circumference Approximations',
          sutra: 'Katapayadi Sankhya & Shulbasutras',
          learningObjectives: [
            'Understand Vedic approximations for π (3.1416 and 62832/20000)',
            'Encode mathematical constants using Katapayadi syllabic alphabets',
          ],
        },
      ],
    },
  ];

  for (const mData of curriculumHierarchy) {
    let module = await prisma.module.findFirst({
      where: {
        courseId: course.id,
        title: mData.title,
      },
    });

    if (!module) {
      module = await prisma.module.create({
        data: {
          title: mData.title,
          order: mData.order,
          courseId: course.id,
          difficulty: Difficulty.MEDIUM,
        },
      });
      console.log(`Created Module: [${module.id}] ${module.title}`);
    } else {
      await prisma.module.update({
        where: { id: module.id },
        data: { order: mData.order },
      });
    }

    for (const tData of mData.topics) {
      let topic = await prisma.topic.findFirst({
        where: {
          moduleId: module.id,
          title: tData.title,
        },
      });

      if (!topic) {
        topic = await prisma.topic.create({
          data: {
            title: tData.title,
            order: tData.order,
            moduleId: module.id,
            technique: tData.technique,
            sutra: tData.sutra,
            learningObjectives: tData.learningObjectives,
            difficulty: Difficulty.MEDIUM,
            estimatedMinutes: 15,
          },
        });
        console.log(`Created Topic: [${topic.id}] ${topic.title}`);
      } else {
        topic = await prisma.topic.update({
          where: { id: topic.id },
          data: {
            order: tData.order,
            technique: tData.technique,
            sutra: tData.sutra,
            learningObjectives: tData.learningObjectives,
          },
        });
      }

      // Ensure Lesson exists for this topic
      const existingLesson = await prisma.lesson.findFirst({
        where: { topicId: topic.id },
      });

      if (!existingLesson) {
        await prisma.lesson.create({
          data: {
            title: `${topic.title} Masterclass`,
            description: `Comprehensive instruction on ${topic.title} via classical Vedic algorithms.`,
            content: `Vedic mathematics approaches ${topic.title} through geometric intuition, symmetry, and mental place-value management.`,
            order: 1,
            difficulty: Difficulty.MEDIUM,
            learningObjectives: tData.learningObjectives,
            explanation: `The core insight of ${topic.title} is grounded in ${tData.sutra || 'Vedic principles'}. By identifying symmetries and deviations, complex computation collapses into single-line mental steps.`,
            steps: [
              'Step 1: Identify baseline numbers and calculate deviations or place-value weights.',
              'Step 2: Apply the governing Vedic Sutra to execute cross-operations.',
              'Step 3: Combine place-value partitions to produce the final single-line result.',
            ],
            sutra: tData.sutra,
            technique: tData.technique,
            estimatedMinutes: 15,
            topicId: topic.id,
            examples: {
              create: [
                {
                  question: `Illustrative Problem for ${topic.title}`,
                  solution: 'Step-by-step mental solution using Vedic partitioning.',
                  explanation: `Demonstrates the power of ${tData.technique} without scratch paper.`,
                  difficulty: Difficulty.EASY,
                  order: 1,
                  sutra: tData.sutra,
                  technique: tData.technique,
                },
                {
                  question: `Advanced Challenge for ${topic.title}`,
                  solution: 'Extended application with cross-carries and multi-digit terms.',
                  explanation: 'Reinforces speed and accuracy under challenging operands.',
                  difficulty: Difficulty.MEDIUM,
                  order: 2,
                  sutra: tData.sutra,
                  technique: tData.technique,
                },
              ],
            },
          },
        });
        console.log(`Created Lesson for: ${topic.title}`);
      }
    }
  }

  // 3. Question Templates (Idempotent upsert by topicId + templateType)
  const templateDefinitions = [
    {
      topicTitle: 'Features of Vedic Mathematics',
      title: 'Features of Vedic Mathematics Concept Check',
      templateType: 'CONCEPT_CHECK',
      difficulty: Difficulty.EASY,
      minValue: 1,
      maxValue: 10,
      explanation: 'Foundational concept check on the core features and holistic nature of Vedic mathematics.',
    },
    {
      topicTitle: 'Applications of Vedic Mathematics',
      title: 'Applications of Vedic Mathematics Concept Check',
      templateType: 'CONCEPT_CHECK',
      difficulty: Difficulty.EASY,
      minValue: 1,
      maxValue: 10,
      explanation: 'Foundational concept check on the computational speed and applied domains of Vedic methods.',
    },
    {
      topicTitle: 'Addition Without Carrying',
      title: 'Basic Addition Without Carry',
      templateType: 'ADD_WITHOUT_CARRY',
      difficulty: Difficulty.EASY,
      minValue: 10,
      maxValue: 99,
      explanation: 'Add numbers left-to-right without carrying using Vedic place value.',
    },
    {
      topicTitle: 'Nikhilam Subtraction',
      title: 'Nikhilam Subtraction Practice',
      templateType: 'NIKHILAM_SUBTRACTION',
      difficulty: Difficulty.EASY,
      minValue: 100,
      maxValue: 999,
      explanation: 'All from 9 and the last from 10.',
    },
    {
      topicTitle: 'Dot Method Addition',
      title: 'Dot Method Addition Practice',
      templateType: 'DOT_METHOD_ADDITION',
      difficulty: Difficulty.EASY,
      minValue: 10,
      maxValue: 99,
      explanation: 'Mark tens with a dot and add units directly.',
    },
    {
      topicTitle: 'Fraction Addition',
      title: 'Crosswise Fraction Addition',
      templateType: 'FRACTION_ADDITION',
      difficulty: Difficulty.EASY,
      minValue: 1,
      maxValue: 12,
      explanation: 'Cross-multiply numerator and denominator via Urdhva-Tiryagbhyam.',
    },
    {
      topicTitle: 'Fraction Subtraction',
      title: 'Crosswise Fraction Subtraction',
      templateType: 'FRACTION_SUBTRACTION',
      difficulty: Difficulty.EASY,
      minValue: 1,
      maxValue: 12,
      explanation: 'Subtract fractions mentally using cross-multiplication.',
    },
    {
      topicTitle: 'Base Method Multiplication',
      title: 'Nikhilam Base Multiplication',
      templateType: 'BASE_MULTIPLICATION',
      difficulty: Difficulty.EASY,
      minValue: 85,
      maxValue: 115,
      explanation: 'Multiply numbers near base 100 using cross-addition and deviation products.',
    },
    {
      topicTitle: 'Urdhva Tiryak Multiplication',
      title: 'Universal Vertically and Crosswise Multiplication',
      templateType: 'URDHVA_MULTIPLICATION',
      difficulty: Difficulty.MEDIUM,
      minValue: 11,
      maxValue: 99,
      explanation: 'Multiply 2-digit numbers vertically and crosswise in a single mental line.',
    },
    {
      topicTitle: 'Multiplication by Series of 1s',
      title: 'Multiplication by 11 & Series of 1s',
      templateType: 'SERIES_ONES_MULTIPLICATION',
      difficulty: Difficulty.EASY,
      minValue: 12,
      maxValue: 98,
      explanation: 'Slide and add neighbors to multiply by 11.',
    },
    {
      topicTitle: 'Multiplication by Series of 9s',
      title: 'Ekanyunena Multiplication by 9s',
      templateType: 'SERIES_NINES_MULTIPLICATION',
      difficulty: Difficulty.EASY,
      minValue: 12,
      maxValue: 98,
      explanation: 'Subtract 1 from multiplicand and append 9s complement.',
    },
    {
      topicTitle: 'Vinculum Method Division',
      title: 'Vinculum Division Practice',
      templateType: 'VINCULUM_DIVISION',
      difficulty: Difficulty.MEDIUM,
      minValue: 100,
      maxValue: 999,
      explanation: 'Convert high digits to vinculum bar numbers to simplify division.',
    },
    {
      topicTitle: 'Squares Using Base Method',
      title: 'Yavadunam Base Squaring',
      templateType: 'SQUARE_BASE_METHOD',
      difficulty: Difficulty.EASY,
      minValue: 85,
      maxValue: 115,
      explanation: 'Base + 2*deviation | deviation squared.',
    },
    {
      topicTitle: 'Squares Ending in 5',
      title: 'Ekadhikena Squaring Ending in 5',
      templateType: 'SQUARE_ENDING_FIVE',
      difficulty: Difficulty.EASY,
      minValue: 15,
      maxValue: 95,
      explanation: 'Multiply tens digit by one more (n * (n+1)) and append 25.',
    },
    {
      topicTitle: 'Dwandwa Yoga Sutra',
      title: 'Duplex Method Squaring',
      templateType: 'DWANDWA_SQUARE',
      difficulty: Difficulty.MEDIUM,
      minValue: 11,
      maxValue: 99,
      explanation: 'Calculate squares using digit duplexes.',
    },
    {
      topicTitle: 'Square Root of 2',
      title: 'Baudhayana Square Root of 2',
      templateType: 'SQUARE_ROOT_TWO',
      difficulty: Difficulty.MEDIUM,
      minValue: 1,
      maxValue: 5,
      explanation: '1 + 1/3 + 1/(3*4) - 1/(3*4*34) continued fraction calculation.',
    },
    {
      topicTitle: 'Cubing Using Yavadunam Sutra',
      title: 'Yavadunam Cubing Practice',
      templateType: 'YAVADUNAM_CUBING',
      difficulty: Difficulty.MEDIUM,
      minValue: 9,
      maxValue: 15,
      explanation: 'Calculate cubes using base + 3d | 3d² | d³.',
    },
    {
      topicTitle: 'Factoring Quadratic Equations',
      title: 'Quadratic Factoring by Adyamadyena',
      templateType: 'QUADRATIC_FACTORING',
      difficulty: Difficulty.MEDIUM,
      minValue: 1,
      maxValue: 10,
      explanation: 'First-by-first and last-by-last roots inspection.',
    },
    {
      topicTitle: 'Baudhayana Theorem',
      title: 'Baudhayana Pythagorean Triples',
      templateType: 'BAUDHAYANA_THEOREM',
      difficulty: Difficulty.EASY,
      minValue: 3,
      maxValue: 25,
      explanation: 'Diagonals of rectangles and rope geometry.',
    },
    {
      topicTitle: 'Circling a Square',
      title: 'Vedic Circling a Square',
      templateType: 'CIRCLING_SQUARE',
      difficulty: Difficulty.MEDIUM,
      minValue: 4,
      maxValue: 20,
      explanation: 'Area transformation from square to circle.',
    },
    {
      topicTitle: 'Concept of Pi',
      title: 'Vedic Pi Ratio Approximations',
      templateType: 'CONCEPT_OF_PI',
      difficulty: Difficulty.EASY,
      minValue: 7,
      maxValue: 28,
      explanation: 'Circumference to diameter calculation using 22/7 and 62832/20000.',
    },
  ];

  for (const tDef of templateDefinitions) {
    const topic = await prisma.topic.findFirst({
      where: { title: tDef.topicTitle },
    });

    if (topic) {
      const existingTemplate = await prisma.questionTemplate.findFirst({
        where: {
          topicId: topic.id,
          templateType: tDef.templateType,
        },
      });

      if (!existingTemplate) {
        await prisma.questionTemplate.create({
          data: {
            topicId: topic.id,
            title: tDef.title,
            templateType: tDef.templateType,
            difficulty: tDef.difficulty,
            minValue: tDef.minValue,
            maxValue: tDef.maxValue,
            explanation: tDef.explanation,
          },
        });
        console.log(`Created QuestionTemplate: ${tDef.title}`);
      }
    }
  }

  // 4. Seed Canonical 100 Achievements into AchievementDefinition
  console.log('\n--- Seeding 100 Canonical Achievements ---');
  let achievementsSeeded = 0;
  for (const ach of CANONICAL_ACHIEVEMENTS) {
    await prisma.achievementDefinition.upsert({
      where: { id: ach.id },
      update: {
        title: ach.title,
        description: ach.description,
        category: ach.category,
        icon: ach.icon,
        rarity: ach.rarity,
        targetValue: ach.targetValue,
        rewardXp: ach.rewardXp,
        rewardCoins: ach.rewardCoins,
        rewardStars: ach.rewardStars,
        rewardStones: ach.rewardStones,
        order: ach.order,
      },
      create: {
        id: ach.id,
        title: ach.title,
        description: ach.description,
        category: ach.category,
        icon: ach.icon,
        rarity: ach.rarity,
        targetValue: ach.targetValue,
        rewardXp: ach.rewardXp,
        rewardCoins: ach.rewardCoins,
        rewardStars: ach.rewardStars,
        rewardStones: ach.rewardStones,
        order: ach.order,
      },
    });
    achievementsSeeded++;
  }
  console.log(`Upserted ${achievementsSeeded} Achievements in AchievementDefinition.`);

  // 5. Seed Canonical Store Items
  console.log('\n--- Seeding Canonical Store Items ---');
  let storeItemsSeeded = 0;
  for (const item of CANONICAL_STORE_ITEMS) {
    await prisma.storeItem.upsert({
      where: { id: item.id },
      update: {
        title: item.title,
        description: item.description,
        category: item.category,
        costCoins: item.costCoins,
        costStones: item.costStones,
        icon: item.icon,
        metadata: (item.metadata || {}) as any,
      },
      create: {
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        costCoins: item.costCoins,
        costStones: item.costStones,
        icon: item.icon,
        metadata: (item.metadata || {}) as any,
      },
    });
    storeItemsSeeded++;
  }
  console.log(`Upserted ${storeItemsSeeded} Store Items in StoreItem.`);

  console.log('\n=== IDEMPOTENT SEED COMPLETED SUCCESSFULLY ===');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });