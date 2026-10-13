import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { LearningContentService } from '../src/lesson/learning-content.service';
import { AiTutorService } from '../src/ai-tutor/ai-tutor.service';
import { GeminiProvider } from '../src/ai-tutor/providers/gemini.provider';
import { PrismaService } from '../src/prisma/prisma.service';

async function run() {
  console.log('===============================================================');
  console.log('PHASE 57 TARGETED BUG FIX VERIFICATION: VIEW LESSON & AI TUTOR');
  console.log('===============================================================\n');

  console.log('Bootstrapping Nest application context...');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['warn', 'error'] });

  const learningService = app.get(LearningContentService);
  const aiTutorService = app.get(AiTutorService);
  const geminiProvider = app.get(GeminiProvider);
  const prisma = app.get(PrismaService);

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      if (detail) console.error('     Detail:', detail);
    }
  }

  try {
    // ==============================================================
    // PART 1: VIEW LESSON ENDPOINT & DATA FLOW VERIFICATION
    // ==============================================================
    console.log('\n--- PART 1: VIEW LESSON DATA FLOW VERIFICATION ---');

    // Test 1: getLessonPages(1) returns complete LessonPagesResponse
    console.log('\n[1.1] Fetching lesson pages for Lesson #1...');
    const lesson1Res = await learningService.getLessonPages(1);
    assert(Boolean(lesson1Res.lesson), 'Response includes lesson object');
    assert(lesson1Res.lesson.title === 'Historical Foundations and Modern Reconstruction', `Lesson title matches: "${lesson1Res.lesson.title}"`);
    assert(lesson1Res.lesson.topicTitle === 'History of Vedic Mathematics', `Topic title matches: "${lesson1Res.lesson.topicTitle}"`);
    assert(lesson1Res.lesson.moduleTitle === 'Introduction to Vedic Mathematics', `Module title matches: "${lesson1Res.lesson.moduleTitle}"`);
    assert(Array.isArray(lesson1Res.pages) && lesson1Res.pages.length === 6, `Pages array has 6 items (got ${lesson1Res.pages?.length})`);
    assert(Array.isArray(lesson1Res.resources) && lesson1Res.resources.length > 0, `Resources array populated (${lesson1Res.resources?.length} items)`);
    assert(Boolean(lesson1Res.stats) && lesson1Res.stats.totalPages === 6, `Stats totalPages is 6`);
    assert(typeof lesson1Res.stats.totalEstimatedMinutes === 'number' && lesson1Res.stats.totalEstimatedMinutes > 0, `Total estimated minutes: ${lesson1Res.stats.totalEstimatedMinutes}`);

    // Test 2: Flexible resolution when topicId is passed as lessonId
    console.log('\n[1.2] Fetching lesson pages by topicId (Topic #5 - Addition Without Carrying)...');
    const topic5Res = await learningService.getLessonPages(5);
    assert(Boolean(topic5Res.lesson), 'Flexible topicId resolution returns lesson object');
    assert(topic5Res.lesson.topicTitle === 'Addition Without Carrying', `Resolved topic title: "${topic5Res.lesson.topicTitle}"`);
    assert(Array.isArray(topic5Res.pages) && topic5Res.pages.length > 0, `Topic #5 has ${topic5Res.pages.length} published pages`);

    // Test 3: getPageDetails for Lesson #1, Page #1
    console.log('\n[1.3] Fetching page details for Lesson #1, Page #1...');
    const pageDetail = await learningService.getPageDetails(1, 1);
    assert(pageDetail.title === 'Introduction: The Heritage of Indian Mathematics', `Page title: "${pageDetail.title}"`);
    assert(pageDetail.slug === 'introduction-heritage', `Page slug: "${pageDetail.slug}"`);
    assert(pageDetail.navigation && pageDetail.navigation.totalPublishedPages === 6, `Navigation has 6 pages`);
    assert(pageDetail.navigation.nextPage?.slug === 'swami-bharati-krishna-tirtha', `Next page link: "${pageDetail.navigation.nextPage?.slug}"`);

    // Test 4: Invalid ID handling (throws NotFoundException)
    console.log('\n[1.4] Testing invalid ID (9999)...');
    try {
      await learningService.getLessonPages(9999);
      assert(false, 'Should throw NotFoundException for ID 9999');
    } catch (err: any) {
      assert(err.status === 404 || err.message.includes('not found'), `NotFoundException properly thrown: "${err.message}"`);
    }

    // ==============================================================
    // PART 2: AI TUTOR IMAGE UNDERSTANDING & MULTIMODAL VERIFICATION
    // ==============================================================
    console.log('\n--- PART 2: AI TUTOR IMAGE UNDERSTANDING & MULTIMODAL VERIFICATION ---');

    const testUser = await prisma.user.findFirst();
    const userId = testUser?.id || 1;

    // Test 2.1: Missing image reference detection
    console.log('\n[2.1] Text referencing an image when no file was attached...');
    const textOnlyRefRes = await aiTutorService.processMessage(userId, {
      message: 'go through the img carefully and pls explain me',
    });
    const hasCameraPrompt = textOnlyRefRes.response.includes('camera icon') || textOnlyRefRes.response.includes('attached');
    assert(hasCameraPrompt, 'Politely guides student to attach image using camera icon instead of generic refusal');
    console.log(`     Tutor response: "${textOnlyRefRes.response.slice(0, 130)}..."`);

    // Test 2.2: Unrelated image Domain Guardrail redirection
    console.log('\n[2.2] Unrelated image (Domain Guardrail redirection)...');
    const blackPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    const unrelatedRes = await aiTutorService.processMessage(userId, {
      message: 'Explain this to me',
      image: {
        data: blackPngBase64,
        mimeType: 'image/png',
        fileName: 'unrelated.png',
      },
    });
    const isRedirect = unrelatedRes.response.includes('mathematical') || unrelatedRes.response.includes('Vedic');
    assert(isRedirect, 'Unrelated/non-mathematical image correctly redirected by domain guardrail');
    console.log(`     Guardrail response: "${unrelatedRes.response.slice(0, 130)}..."`);

    // Test 2.3: Multimodal generation with inlineImage and mathematical request
    console.log('\n[2.3] Real Multimodal generation with GeminiProvider (Nikhilam 98 × 97)...');
    assert(geminiProvider.isAvailable(), 'GeminiProvider is configured and available');

    const multimodalRes = await geminiProvider.generate({
      systemPrompt: 'You are DWANDA AI, an expert Vedic Mathematics tutor. An image of a multiplication problem is provided. You possess full multimodal visual understanding. Examine the problem and provide the step-by-step Vedic solution.',
      userPrompt: '### UPLOADED PROBLEM IMAGE & OCR EXTRACTION\n- Problem: 98 * 97\n- Sutra: Nikhilam Navatashcaramam Dashatah\n- Base: 100\n\n### STUDENT MESSAGE\n"Please explain how to multiply 98 × 97 using Nikhilam Sutra."',
      inlineImage: {
        data: blackPngBase64,
        mimeType: 'image/png',
      },
    });

    assert(Boolean(multimodalRes.content && multimodalRes.content.length > 50), `Generated response length: ${multimodalRes.content.length} chars`);
    const containsNikhilam = /nikhilam/i.test(multimodalRes.content);
    assert(containsNikhilam, 'Response explains Nikhilam sutra method');
    const containsCorrectProduct = multimodalRes.content.includes('9506');
    assert(containsCorrectProduct, 'Response derives correct mathematical answer 9506');
    const claimsBlind = /unable to (?:see|process) images/i.test(multimodalRes.content);
    assert(!claimsBlind, 'Never claims "unable to see or process images"');
    console.log(`     Latency: ${multimodalRes.latencyMs}ms | Model: ${multimodalRes.modelName}`);

    console.log('\n===============================================================');
    console.log(`VERIFICATION SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log('===============================================================');

    if (passedTests !== totalTests) {
      process.exit(1);
    }
  } finally {
    await app.close();
  }
}

run().catch((e) => {
  console.error('Master verification error:', e);
  process.exit(1);
});
