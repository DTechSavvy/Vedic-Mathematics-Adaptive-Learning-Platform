import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const topics = await prisma.topic.findMany({
    include: { lessons: true, templates: true },
    orderBy: { id: 'asc' },
  });
  console.log(`Total topics: ${topics.length}`);
  for (const t of topics) {
    console.log(`Topic #${t.id} [${t.title}]: lesson ID=${t.lessons[0]?.id}, templates=${t.templates.length}`);
  }
}

main().finally(() => prisma.$disconnect());
