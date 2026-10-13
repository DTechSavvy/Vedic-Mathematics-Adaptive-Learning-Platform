import { PrismaClient } from '@prisma/client';
import { LearningContentService } from '../src/lesson/learning-content.service';

const prisma = new PrismaClient();
const service = new LearningContentService(prisma as any);

async function main() {
  console.log('--- Test 1: getLessonPages(1) with content ---');
  const res1 = await service.getLessonPages(1);
  console.log('Lesson 1 Title:', res1.lesson.title);
  console.log('Lesson 1 Pages count:', res1.pages.length);
  console.log('Lesson 1 Stats:', res1.stats);

  console.log('\n--- Test 2: getPageDetails(1, 1) ---');
  const page1 = await service.getPageDetails(1, 1);
  console.log('Page 1 Title:', page1.title);
  console.log('Page 1 slug:', page1.slug);
  console.log('Navigation:', page1.navigation);

  console.log('\n--- Test 3: getLessonPages(9999) non-existent ---');
  try {
    await service.getLessonPages(9999);
    console.error('FAIL: Expected 404');
  } catch (err: any) {
    console.log('PASS: Correctly threw NotFoundException:', err.message);
  }

  console.log('\n--- Test 4: getPageDetails(9999, 1) non-existent ---');
  try {
    await service.getPageDetails(9999, 1);
    console.error('FAIL: Expected 404');
  } catch (err: any) {
    console.log('PASS: Correctly threw NotFoundException:', err.message);
  }
}

main().finally(() => prisma.$disconnect());
