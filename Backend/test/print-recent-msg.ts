import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const messages = await prisma.tutorMessage.findMany({
    where: {
      createdAt: {
        gte: new Date('2026-09-25T08:00:00Z'),
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  for (const m of messages) {
    console.log(`=== [${m.role}] [${m.createdAt.toISOString()}] ===`);
    console.log(m.content);
    console.log('Metadata:', m.metadata);
  }
}

main().finally(() => prisma.$disconnect());
