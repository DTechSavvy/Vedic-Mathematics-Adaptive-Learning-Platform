import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deduplicate() {
  console.log('=== STARTING SAFE CURRICULUM DEDUPLICATION ===');

  // 1. Fetch Course 1 (Canonical Course)
  const canonicalCourse = await prisma.course.findFirst({
    where: { id: 1 },
    include: {
      modules: {
        include: {
          topics: true,
        },
      },
    },
  });

  if (!canonicalCourse) {
    throw new Error('Canonical Course with ID 1 not found!');
  }

  console.log(`Canonical Course [${canonicalCourse.id}] "${canonicalCourse.title}" found.`);
  console.log(`Canonical Modules: ${canonicalCourse.modules.length}`);

  const canonicalTopics = canonicalCourse.modules.flatMap((m) => m.topics);
  console.log(`Canonical Topics: ${canonicalTopics.length}`);
  const canonicalTopicIds = new Set(canonicalTopics.map((t) => t.id));

  // Map of topic title -> canonical topic id
  const titleToCanonicalTopicId = new Map<string, number>();
  for (const t of canonicalTopics) {
    titleToCanonicalTopicId.set(t.title.trim().toLowerCase(), t.id);
  }

  // 2. Identify all non-canonical topics
  const allTopics = await prisma.topic.findMany();
  const duplicateTopics = allTopics.filter((t) => !canonicalTopicIds.has(t.id));
  console.log(`Found ${duplicateTopics.length} duplicate topics to reconcile and prune.`);

  // 3. Map any dependent records on duplicate topics to canonical topics
  for (const dup of duplicateTopics) {
    const canonicalId = titleToCanonicalTopicId.get(dup.title.trim().toLowerCase());
    if (canonicalId) {
      // Re-link any lessons if any exist
      await prisma.lesson.updateMany({
        where: { topicId: dup.id },
        data: { topicId: canonicalId },
      });

      // Re-link question templates if any exist
      await prisma.questionTemplate.updateMany({
        where: { topicId: dup.id },
        data: { topicId: canonicalId },
      });

      // Re-link user progress
      const userProgressEntries = await prisma.userProgress.findMany({
        where: { topicId: dup.id },
      });
      for (const up of userProgressEntries) {
        const existingCanonicalUp = await prisma.userProgress.findUnique({
          where: {
            userId_topicId: {
              userId: up.userId,
              topicId: canonicalId,
            },
          },
        });
        if (!existingCanonicalUp) {
          await prisma.userProgress.create({
            data: {
              userId: up.userId,
              topicId: canonicalId,
              mastery: up.mastery,
              completed: up.completed,
            },
          });
        }
        await prisma.userProgress.delete({ where: { id: up.id } });
      }

      // Re-link tutor conversations
      await prisma.tutorConversation.updateMany({
        where: { topicId: dup.id },
        data: { topicId: canonicalId },
      });

      // Re-link knowledge documents
      await prisma.knowledgeDocument.updateMany({
        where: { topicId: dup.id },
        data: { topicId: canonicalId },
      });
    }
  }

  // 4. Delete duplicate topics
  const deleteTopicsRes = await prisma.topic.deleteMany({
    where: {
      id: { notIn: Array.from(canonicalTopicIds) },
    },
  });
  console.log(`Pruned ${deleteTopicsRes.count} duplicate topic records.`);

  // 5. Delete duplicate modules
  const canonicalModuleIds = canonicalCourse.modules.map((m) => m.id);
  const deleteModulesRes = await prisma.module.deleteMany({
    where: {
      id: { notIn: canonicalModuleIds },
    },
  });
  console.log(`Pruned ${deleteModulesRes.count} duplicate module records.`);

  // 6. Delete duplicate courses
  const deleteCoursesRes = await prisma.course.deleteMany({
    where: {
      id: { not: 1 },
    },
  });
  console.log(`Pruned ${deleteCoursesRes.count} duplicate course records.`);

  // 7. Verify final counts
  const finalCourseCount = await prisma.course.count();
  const finalModuleCount = await prisma.module.count();
  const finalTopicCount = await prisma.topic.count();
  const finalAttemptCount = await prisma.questionAttempt.count();
  const finalUserProgressCount = await prisma.userProgress.count();

  console.log('\n=== DEDUPLICATION COMPLETE ===');
  console.log(`Active Courses: ${finalCourseCount} (expected: 1)`);
  console.log(`Active Modules: ${finalModuleCount} (expected: 5)`);
  console.log(`Active Topics: ${finalTopicCount} (expected: 23)`);
  console.log(`Question Attempts preserved: ${finalAttemptCount}`);
  console.log(`User Progress entries preserved: ${finalUserProgressCount}`);
}

deduplicate()
  .catch((err) => {
    console.error('Deduplication failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
