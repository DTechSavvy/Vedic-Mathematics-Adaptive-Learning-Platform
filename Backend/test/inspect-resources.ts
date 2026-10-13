import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const resources = await prisma.learningResource.findMany({
    select: {
      id: true,
      topicId: true,
      lessonId: true,
      resourceType: true,
      title: true,
      url: true,
      embedUrl: true,
      provider: true,
    },
    orderBy: { id: 'asc' },
  });

  console.log(`Total Resources: ${resources.length}`);
  for (const r of resources) {
    console.log(`[${r.id}] Type: ${r.resourceType} | Topic: ${r.topicId} | Title: "${r.title}" | URL: ${r.url} | Embed: ${r.embedUrl}`);
  }
}

main().finally(() => prisma.$disconnect());
