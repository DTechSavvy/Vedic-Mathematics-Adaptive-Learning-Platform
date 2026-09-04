import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.create({
    data: {
      title: 'Vedic Mathematics',
      description: 'AI Powered Vedic Mathematics Learning Platform',
    },
  });

  const modules = [
    {
      title: 'Introduction to Vedic Mathematics',
      topics: [
        'History of Vedic Mathematics',
        'Features of Vedic Mathematics',
        'Applications of Vedic Mathematics',
        'Sutras and Upsutras',
      ],
    },

    {
      title: 'High Speed Addition and Subtraction',
      topics: [
        'Addition Without Carrying',
        'Dot Method Addition',
        'Nikhilam Subtraction',
        'Fraction Addition',
        'Fraction Subtraction',
      ],
    },

    {
      title: 'Miracle Multiplication and Excellent Division',
      topics: [
        'Base Method Multiplication',
        'Urdhva Tiryak Multiplication',
        'Multiplication by Series of 1s',
        'Multiplication by Series of 9s',
        'Vinculum Method Division',
      ],
    },

    {
      title: 'Lightning Squares and Rapid Cubes',
      topics: [
        'Squares Using Base Method',
        'Squares Ending in 5',
        'Dwandwa Yoga Sutra',
        'Square Root of 2',
        'Cubing Using Yavadunam Sutra',
      ],
    },

    {
      title: 'Algebra and Geometry',
      topics: [
        'Factoring Quadratic Equations',
        'Baudhayana Theorem',
        'Circling a Square',
        'Concept of Pi',
      ],
    },
  ];

  for (const moduleData of modules) {
    const module = await prisma.module.create({
      data: {
        title: moduleData.title,
        courseId: course.id,
      },
    });

    for (const topicTitle of moduleData.topics) {
      await prisma.topic.create({
        data: {
          title: topicTitle,
          moduleId: module.id,
        },
      });
    }
  }
  //---------------------------- UNIT 1 TOPICS -----------------------------> //
  const additionTopic = await prisma.topic.findFirst({
  where: {
    title: 'Addition Without Carrying',
  },
});

if (additionTopic) {
  await prisma.questionTemplate.create({
    data: {
      topicId: additionTopic.id,
      title: 'Basic Addition Without Carry',
      templateType: 'ADD_WITHOUT_CARRY',
      difficulty: 'EASY',
      minValue: 10,
      maxValue: 99,
      explanation:
        'Add numbers without carrying using Vedic Mathematics techniques.',
    },
  });
 }
const subtractionTopic =
  await prisma.topic.findFirst({
    where: {
      title: 'Nikhilam Subtraction',
    },
  });

if (subtractionTopic) {
  await prisma.questionTemplate.create({
    data: {
      topicId: subtractionTopic.id,
      title: 'Nikhilam Subtraction Practice',

      templateType:
        'NIKHILAM_SUBTRACTION',

      difficulty: 'EASY',

      minValue: 100,

      maxValue: 999,

      explanation:
        'All from 9 and the last from 10.',
    },
  });
 }
 const dotMethodTopic =
  await prisma.topic.findFirst({
    where: {
      title: 'Dot Method Addition',
    },
  });

if (dotMethodTopic) {
  await prisma.questionTemplate.create({
    data: {
      topicId: dotMethodTopic.id,

      title: 'Dot Method Practice',

      templateType:
        'DOT_METHOD_ADDITION',

      difficulty: 'EASY',

      minValue: 10,
      maxValue: 99,

      explanation:
        'Addition using Dot Method.',
    },
  });
 }
 const fractionAdditionTopic =
  await prisma.topic.findFirst({
    where: {
      title: 'Fraction Addition',
    },
  });

if (fractionAdditionTopic) {
  await prisma.questionTemplate.create({
    data: {
      topicId:
        fractionAdditionTopic.id,

      title:
        'Fraction Addition Practice',

      templateType:
        'FRACTION_ADDITION',

      difficulty: 'EASY',

      explanation:
        'Add fractions with same denominator.',
    },
  });
 }
 const fractionSubtractionTopic =
  await prisma.topic.findFirst({
    where: {
      title: 'Fraction Subtraction',
    },
  });

if (fractionSubtractionTopic) {
  await prisma.questionTemplate.create({
    data: {
      topicId:
        fractionSubtractionTopic.id,

      title:
        'Fraction Subtraction Practice',

      templateType:
        'FRACTION_SUBTRACTION',

      difficulty: 'EASY',

      explanation:
        'Subtract fractions with same denominator.',
    },
  });
 }
 //---------------------------- UNIT 2 TOPICS -----------------------------> //

 const baseMultiplicationTopic =
  await prisma.topic.findFirst({
    where: {
      title: 'Base Method Multiplication',
    },
  });

if (baseMultiplicationTopic) {
  await prisma.questionTemplate.create({
    data: {
      topicId: baseMultiplicationTopic.id,

      title:
        'Base Method Multiplication Practice',

      templateType:
        'BASE_MULTIPLICATION',

      difficulty: 'EASY',

      minValue: 90,

      maxValue: 110,

      explanation:
        'Multiplication using Vedic Base Method.',
    },
  });
 }
 const urdhvaTopic =
  await prisma.topic.findFirst({
    where: {
      title: 'Urdhva Tiryak Multiplication',
    },
  });

if (urdhvaTopic) {
  await prisma.questionTemplate.create({
    data: {
      topicId: urdhvaTopic.id,

      title:
        'Urdhva Tiryak Multiplication Practice',

      templateType:
        'URDHVA_MULTIPLICATION',

      difficulty: 'EASY',

      minValue: 10,

      maxValue: 99,

      explanation:
        'Vertical and Crosswise Multiplication.',
    },
  });
 }
 const seriesOnesTopic =
  await prisma.topic.findFirst({
    where: {
      title:
        'Multiplication by Series of 1s',
    },
  });

if (seriesOnesTopic) {
  await prisma.questionTemplate.create({
    data: {
      topicId: seriesOnesTopic.id,

      title:
        'Multiplication by Series of 1s Practice',

      templateType:
        'SERIES_ONES_MULTIPLICATION',

      difficulty: 'EASY',

      minValue: 100,

      maxValue: 999,

      explanation:
        'Multiplication using series of 1s.',
    },
  });
 }
 const seriesNinesTopic =
  await prisma.topic.findFirst({
    where: {
      title:
        'Multiplication by Series of 9s',
    },
  });

if (seriesNinesTopic) {
  await prisma.questionTemplate.create({
    data: {
      topicId: seriesNinesTopic.id,

      title:
        'Multiplication by Series of 9s Practice',

      templateType:
        'SERIES_NINES_MULTIPLICATION',

      difficulty: 'EASY',

      minValue: 100,

      maxValue: 999,

      explanation:
        'Multiply using 999 shortcut.',
    },
  });
 }
 const vinculumTopic =
  await prisma.topic.findFirst({
    where: {
      title:
        'Vinculum Method Division',
    },
  });

if (vinculumTopic) {
  await prisma.questionTemplate.create({
    data: {
      topicId:
        vinculumTopic.id,

      title:
        'Vinculum Division Practice',

      templateType:
        'VINCULUM_DIVISION',

      difficulty: 'EASY',

      explanation:
        'Practice division using Vinculum concepts.',
    },
  });
 }

        //---------------------------- UNIT 3 TOPICS -----------------------------> //

 const squaresEndingFiveTopic =
  await prisma.topic.findFirst({
    where: {
      title: 'Squares Ending in 5',
    },
  });

if (squaresEndingFiveTopic) {
  await prisma.questionTemplate.create({
    data: {
      topicId:
        squaresEndingFiveTopic.id,

      title:
        'Squares Ending in 5 Practice',

      templateType:
        'SQUARE_ENDING_FIVE',

      difficulty: 'EASY',

      minValue: 15,

      maxValue: 95,

      explanation:
        'Square numbers ending in 5.',
    },
  });
 }
 const squaresBaseTopic =
  await prisma.topic.findFirst({
    where: {
      title: 'Squares Using Base Method',
    },
  });

if (squaresBaseTopic) {
  await prisma.questionTemplate.create({
    data: {
      topicId: squaresBaseTopic.id,

      title:
        'Squares Using Base Method Practice',

      templateType:
        'SQUARE_BASE_METHOD',

      difficulty: 'EASY',

      minValue: 90,

      maxValue: 99,

      explanation:
        'Find squares using the base method.',
    },
  });
 }
 const dwandwaTopic =
  await prisma.topic.findFirst({
    where: {
      title: 'Dwandwa Yoga Sutra',
    },
  });

if (dwandwaTopic) {
  await prisma.questionTemplate.create({
    data: {
      topicId: dwandwaTopic.id,

      title:
        'Dwandwa Yoga Practice',

      templateType:
        'DWANDWA_YOGA',

      difficulty: 'EASY',

      minValue: 10,

      maxValue: 99,

      explanation:
        'Square numbers using Dwandwa Yoga.',
    },
  });
 }
 const cubeTopic =
  await prisma.topic.findFirst({
    where: {
      title:
        'Cubing Using Yavadunam Sutra',
    },
  });

if (cubeTopic) {
  await prisma.questionTemplate.create({
    data: {
      topicId: cubeTopic.id,

      title:
        'Cubing Using Yavadunam Practice',

      templateType:
        'YAVADUNAM_CUBE',

      difficulty: 'MEDIUM',

      minValue: 95,

      maxValue: 105,

      explanation:
        'Cube numbers near a base using Yavadunam.',
    },
  });
 }
 const rootTwoTopic =
  await prisma.topic.findFirst({
    where: {
      title: 'Square Root of 2',
    },
  });

if (rootTwoTopic) {
  await prisma.questionTemplate.create({
    data: {
      topicId: rootTwoTopic.id,

      title:
        'Square Root of 2 Practice',

      templateType:
        'SQUARE_ROOT_TWO',

      difficulty: 'EASY',

      explanation:
        'Approximation of square root of 2.',
    },
  });
 }
 const baudhayanaTopic =
  await prisma.topic.findFirst({
    where: {
      title: 'Baudhayana Theorem',
    },
  });

if (baudhayanaTopic) {
  await prisma.questionTemplate.create({
    data: {
      topicId: baudhayanaTopic.id,

      title:
        'Baudhayana Theorem Practice',

      templateType:
        'BAUDHAYANA_THEOREM',

      difficulty: 'EASY',

      explanation:
        'Find hypotenuse using Baudhayana Theorem.',
    },
  });
 }
 const factoringTopic =
  await prisma.topic.findFirst({
    where: {
      title:
        'Factoring Quadratic Equations',
    },
  });

if (factoringTopic) {
  await prisma.questionTemplate.create({
    data: {
      topicId:
        factoringTopic.id,

      title:
        'Factoring Quadratics Practice',

      templateType:
        'FACTOR_QUADRATIC',

      difficulty: 'MEDIUM',

      explanation:
        'Factor quadratic equations.',
    },
  });
 }
 const piTopic =
  await prisma.topic.findFirst({
    where: {
      title: 'Concept of Pi',
    },
  });

if (piTopic) {
  await prisma.questionTemplate.create({
    data: {
      topicId: piTopic.id,

      title:
        'Concept of Pi Practice',

      templateType:
        'CONCEPT_OF_PI',

      difficulty: 'EASY',

      explanation:
        'Calculate circumference using Pi.',
    },
  });
 }
 const circlingSquareTopic =
  await prisma.topic.findFirst({
    where: {
      title: 'Circling a Square',
    },
  });

if (circlingSquareTopic) {
  await prisma.questionTemplate.create({
    data: {
      topicId:
        circlingSquareTopic.id,

      title:
        'Circling a Square Practice',

      templateType:
        'CIRCLING_SQUARE',

      difficulty: 'MEDIUM',

      explanation:
        'Find radius of circle around a square.',
    },
  });
 }

  console.log('Final syllabus seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });