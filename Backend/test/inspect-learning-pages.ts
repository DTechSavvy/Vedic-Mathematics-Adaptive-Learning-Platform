import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const totalPages = await prisma.learningPage.count();
  console.log(`Total LearningPages in DB: ${totalPages}`);

  const lessons = await prisma.lesson.findMany({
    include: {
      pages: { select: { id: true, slug: true, title: true, order: true } },
      resources: true,
      topic: { select: { id: true, title: true, moduleId: true } },
    },
    orderBy: { id: 'asc' },
    take: 5,
  });

  for (const l of lessons) {
    console.log(`Lesson #${l.id} [${l.title}] (Topic: ${l.topic?.title}):`);
    console.log(`  Pages count: ${l.pages.length}`);
    console.log(`  Resources count: ${l.resources.length}`);
    if (l.pages.length > 0) {
      console.log(`  First page: ID=${l.pages[0].id} slug=${l.pages[0].slug} title=${l.pages[0].title}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
