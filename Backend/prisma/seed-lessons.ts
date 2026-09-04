import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding lessons...');
  const topics = await prisma.topic.findMany();

  for (const topic of topics) {
    const existingLesson = await prisma.lesson.findFirst({ where: { topicId: topic.id } });
    if (!existingLesson) {
      await prisma.lesson.create({
        data: {
          title: `${topic.title} Lesson`,
          description: `Learn about ${topic.title} using Vedic methods.`,
          content: `This is the comprehensive content for ${topic.title}.`,
          order: 1,
          difficulty: 'MEDIUM',
          learningObjectives: ['Understand the method', 'Apply the method'],
          explanation: `The concept behind ${topic.title} relies on ancient Vedic techniques...`,
          steps: [
            "Step 1: Identify the base.",
            "Step 2: Apply the sutra.",
            "Step 3: Combine results."
          ],
          sutra: 'Nikhilam Navatashcaramam Dashatah',
          technique: 'Base Method',
          estimatedMinutes: 15,
          topicId: topic.id,
          examples: {
            create: [
              {
                question: 'Example 1 Question',
                solution: 'Example 1 Solution',
                explanation: 'Here is how to solve Example 1.',
                difficulty: 'EASY',
                order: 1
              },
              {
                question: 'Example 2 Question',
                solution: 'Example 2 Solution',
                explanation: 'Here is how to solve Example 2.',
                difficulty: 'MEDIUM',
                order: 2
              }
            ]
          }
        }
      });
      console.log(`Created lesson for topic: ${topic.title}`);
    } else {
      console.log(`Lesson already exists for topic: ${topic.title}`);
    }
  }
  
  console.log('Lessons seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
