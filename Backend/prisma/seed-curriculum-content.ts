import { PrismaClient, Difficulty } from '@prisma/client';
import { MODULE_1_PACKAGES } from './curriculum-data/module1-data';
import { MODULE_2_PACKAGES } from './curriculum-data/module2-data';
import { MODULE_3_PACKAGES } from './curriculum-data/module3-data';
import { MODULE_4_PACKAGES } from './curriculum-data/module4-data';
import { MODULE_5_PACKAGES } from './curriculum-data/module5-data';
import { TopicContentPackage } from './curriculum-data/types';

const prisma = new PrismaClient();

const allPackages: TopicContentPackage[] = [
  ...MODULE_1_PACKAGES,
  ...MODULE_2_PACKAGES,
  ...MODULE_3_PACKAGES,
  ...MODULE_4_PACKAGES,
  ...MODULE_5_PACKAGES,
];

async function seedCurriculumContent() {
  console.log('🚀 Starting Master Curriculum Content Ingestion...');
  console.log(`📦 Found ${allPackages.length} canonical topics to seed across 5 modules.`);

  let totalPagesUpserted = 0;
  let totalResourcesUpserted = 0;
  let totalLessonsProcessed = 0;

  for (const pkg of allPackages) {
    // 1. Locate existing Topic by canonical title
    const topic = await prisma.topic.findFirst({
      where: {
        title: {
          equals: pkg.topicTitle,
          mode: 'insensitive',
        },
      },
      include: {
        lessons: true,
      },
    });

    if (!topic) {
      console.warn(`⚠️ Warning: Canonical topic "${pkg.topicTitle}" not found in database. Skipping.`);
      continue;
    }

    // 2. Ensure an active Lesson exists for this Topic
    let lesson = topic.lessons[0];
    if (!lesson) {
      lesson = await prisma.lesson.create({
        data: {
          topicId: topic.id,
          title: pkg.lessonTitle || `${topic.title}: Theory & Applications`,
          description: pkg.lessonDescription || `Comprehensive lesson for ${topic.title}.`,
          content: `Comprehensive learning module for ${topic.title} utilizing ${pkg.technique || 'Vedic techniques'} and Sutra: ${pkg.sutra || 'Canonical Sutra'}.`,
          difficulty: pkg.difficulty || Difficulty.EASY,
          order: 1,
          sutra: pkg.sutra || null,
          technique: pkg.technique || null,
          estimatedMinutes: pkg.estimatedMinutes || 20,
        },
      });
      console.log(`  + Created primary lesson for topic: "${topic.title}" (ID: ${lesson.id})`);
    } else {
      // Update lesson metadata if needed
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          title: pkg.lessonTitle || lesson.title,
          description: pkg.lessonDescription || lesson.description,
          sutra: pkg.sutra || lesson.sutra,
          technique: pkg.technique || lesson.technique,
        },
      });
    }

    totalLessonsProcessed++;

    // 3. Upsert Learning Pages for this Lesson
    for (const pageData of pkg.pages) {
      await prisma.learningPage.upsert({
        where: {
          lessonId_slug: {
            lessonId: lesson.id,
            slug: pageData.slug,
          },
        },
        update: {
          title: pageData.title,
          pageType: pageData.pageType,
          order: pageData.order,
          contentMarkdown: pageData.contentMarkdown,
          learningObjectives: pageData.learningObjectives || [],
          estimatedMinutes: pageData.estimatedMinutes || 5,
          difficulty: pageData.difficulty || Difficulty.EASY,
          isPublished: true,
        },
        create: {
          lessonId: lesson.id,
          slug: pageData.slug,
          title: pageData.title,
          pageType: pageData.pageType,
          order: pageData.order,
          contentMarkdown: pageData.contentMarkdown,
          learningObjectives: pageData.learningObjectives || [],
          estimatedMinutes: pageData.estimatedMinutes || 5,
          difficulty: pageData.difficulty || Difficulty.EASY,
          isPublished: true,
        },
      });

      totalPagesUpserted++;
    }

    // 4. Upsert Learning Resources for this Topic & Lesson
    if (pkg.resources && pkg.resources.length > 0) {
      // Remove stale/old resources for this topic to guarantee 100% freshness
      await prisma.learningResource.deleteMany({
        where: { topicId: topic.id },
      });

      for (const resData of pkg.resources) {
        await prisma.learningResource.create({
          data: {
            topicId: topic.id,
            lessonId: lesson.id,
            title: resData.title,
            description: resData.description || null,
            resourceType: resData.resourceType,
            url: resData.url,
            provider: resData.provider || null,
            authorOrPublisher: resData.authorOrPublisher || null,
            embedUrl: resData.embedUrl || null,
            attributionText: resData.attributionText || null,
            licenseType: resData.licenseType || null,
            isVerified: true,
            isActive: true,
          },
        });
        totalResourcesUpserted++;
      }
    }
  }

  console.log('✅ Curriculum Content Seeding Complete!');
  console.log(`📊 Statistics:`);
  console.log(`   - Topics Covered: ${allPackages.length}`);
  console.log(`   - Lessons Verified/Attached: ${totalLessonsProcessed}`);
  console.log(`   - Learning Pages Upserted: ${totalPagesUpserted}`);
  console.log(`   - Verified Resources Upserted: ${totalResourcesUpserted}`);
}

seedCurriculumContent()
  .catch((e) => {
    console.error('❌ Seeding failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
