import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const messages = await prisma.tutorMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 15,
  });

  console.log(`Found ${messages.length} recent tutor messages:`);
  for (const m of messages) {
    console.log(`[${m.createdAt.toISOString()}] [${m.role}]:`);
    console.log(`  Content: ${m.content.slice(0, 150)}...`);
    console.log(`  Metadata:`, JSON.stringify(m.metadata));
  }
}

main().finally(() => prisma.$disconnect());
