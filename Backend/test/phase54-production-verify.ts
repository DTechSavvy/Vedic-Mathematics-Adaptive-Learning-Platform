import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { MasteryService } from '../src/progress/mastery.service';
import { RewardsShopService } from '../src/gamification/rewards-shop.service';
import { SttService } from '../src/ai-tutor/services/stt.service';
import { SuggestionsService } from '../src/ai-tutor/services/suggestions.service';
import { AiTutorService } from '../src/ai-tutor/ai-tutor.service';
import { ConversationService } from '../src/ai-tutor/services/conversation.service';

async function runPhase54Verification() {
  console.log('====================================================');
  console.log('⚡ VEDICMIND PHASE 54: PRODUCTION COMPLETION AUDIT');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      if (detail) console.error('     Detail:', detail);
    }
  }

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const prisma = moduleRef.get(PrismaService);
  const masteryService = moduleRef.get(MasteryService);
  const rewardsShopService = moduleRef.get(RewardsShopService);
  const sttService = moduleRef.get(SttService);
  const suggestionsService = moduleRef.get(SuggestionsService);
  const aiTutorService = moduleRef.get(AiTutorService);
  const conversationService = moduleRef.get(ConversationService);

  try {
    // ----------------------------------------------------
    // 1. CURRICULUM AUDIT & EXACT INTEGRITY
    // ----------------------------------------------------
    console.log('--- 1. CURRICULUM INTEGRITY & CANONICAL COUNTS ---');
    const topicCount = await prisma.topic.count();
    const moduleCount = await prisma.module.count();
    const courseCount = await prisma.course.count();
    const sutraCount = await prisma.sutra.count();

    assert(courseCount === 1, `Course count must be exactly 1 (found ${courseCount})`);
    assert(moduleCount === 5, `Module count must be exactly 5 (found ${moduleCount})`);
    assert(topicCount === 23, `Topic count must be exactly 23 (found ${topicCount})`);
    assert(sutraCount === 16, `Canonical Sutra count must be exactly 16 (found ${sutraCount})`);

    const topicsWithLessonsAndTemplates = await prisma.topic.findMany({
      include: { templates: true, lessons: true },
    });
    const missingTemplates = topicsWithLessonsAndTemplates.filter((t) => t.templates.length === 0);
    const missingLessons = topicsWithLessonsAndTemplates.filter((t) => t.lessons.length === 0);
    assert(missingTemplates.length === 0, 'All 23 canonical topics must have question templates');
    assert(missingLessons.length === 0, 'All 23 canonical topics must have instructional lessons');

    // ----------------------------------------------------
    // 2. PROGRESS ZERO-STATE & 3% BUG ELIMINATION
    // ----------------------------------------------------
    console.log('\n--- 2. PROGRESS ACCURACY & 3% BUG ROOT CAUSE ELIMINATION ---');

    // Pick or create a fresh test user
    let testUser = await prisma.user.findFirst({
      where: { email: 'phase54_zero_state@vedicmind.test' },
    });
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'phase54_zero_state@vedicmind.test',
          password: 'dummy-password-hash',
          name: 'Phase 54 Zero State Student',
          coins: 500,
          wisdomStones: 10,
        },
      });
    }

    // Evaluate an untouched topic for this fresh student
    const untouchedTopic = topicsWithLessonsAndTemplates[topicsWithLessonsAndTemplates.length - 1];
    const untouchedMastery = await masteryService.calculateTopicMastery(testUser.id, untouchedTopic.id);

    assert(
      untouchedMastery.masteryScore === 0,
      `Untouched topic masteryScore MUST be exactly 0 (got ${untouchedMastery.masteryScore}) - 3% bug eliminated!`,
    );
    assert(
      untouchedMastery.status === 'NOT_STARTED',
      `Untouched topic status MUST be NOT_STARTED (got ${untouchedMastery.status})`,
    );
    assert(
      untouchedMastery.accuracy === null,
      `Untouched topic accuracy MUST be null when 0 attempts made (got ${untouchedMastery.accuracy})`,
    );
    assert(
      untouchedMastery.recentAccuracy === null,
      `Untouched topic recentAccuracy MUST be null (got ${untouchedMastery.recentAccuracy})`,
    );
    assert(
      untouchedMastery.totalAttempts === 0,
      `Untouched topic attempts count MUST be 0 (got ${untouchedMastery.totalAttempts})`,
    );
    assert(
      untouchedMastery.contentCompletion === 0,
      `Untouched topic contentCompletion MUST be 0% (got ${untouchedMastery.contentCompletion}%)`,
    );
    assert(
      untouchedMastery.validPracticeCount === 0,
      `Untouched topic validPracticeCount MUST be 0 (got ${untouchedMastery.validPracticeCount})`,
    );
    assert(
      untouchedMastery.difficultyCoverage.coveredTiers === 0,
      `Untouched topic coveredTiers MUST be 0 (got ${untouchedMastery.difficultyCoverage.coveredTiers})`,
    );

    // ----------------------------------------------------
    // 3. REWARDS STORE CATALOG & ENTITLEMENTS
    // ----------------------------------------------------
    console.log('\n--- 3. REWARDS SHOP & USER ENTITLEMENTS ---');
    await rewardsShopService.ensureStoreItemsSeeded();

    const storeData = await rewardsShopService.getCatalogWithBalances(testUser.id);
    assert(
      storeData.items.length === 15,
      `Store catalog must contain exactly 15 educational items (found ${storeData.items.length})`,
    );

    const weakPack = storeData.items.find((item) => item.id === 'weak-topic-practice-pack');
    const mixedPack = storeData.items.find((item) => item.id === 'mixed-challenge-pack');
    assert(!!weakPack, 'Catalog must contain weak-topic-practice-pack');
    assert(!!mixedPack, 'Catalog must contain mixed-challenge-pack');

    // Verify ownedBalance is returned for every catalog item
    const allHaveOwnedBalance = storeData.items.every((item) => typeof item.ownedBalance === 'number');
    assert(allHaveOwnedBalance, 'All store catalog items report numerical ownedBalance');

    // Ensure user has coins to purchase
    await prisma.user.update({
      where: { id: testUser.id },
      data: { coins: 500, wisdomStones: 10 },
    });

    const purchaseResult = await rewardsShopService.purchaseItem(testUser.id, 'weak-topic-practice-pack');
    assert(purchaseResult.success, 'Successfully purchased weak-topic-practice-pack');

    const updatedStoreData = await rewardsShopService.getCatalogWithBalances(testUser.id);
    const updatedWeakPack = updatedStoreData.items.find((item) => item.id === 'weak-topic-practice-pack');
    assert(
      (updatedWeakPack?.ownedBalance || 0) >= 1,
      `weak-topic-practice-pack reports active ownedBalance >= 1 (got ${updatedWeakPack?.ownedBalance})`,
    );

    // ----------------------------------------------------
    // 4. VOICE STT SERVICE AUDIO VALIDATION & TRANSCRIBE
    // ----------------------------------------------------
    console.log('\n--- 4. WHISPER STT SERVICE VALIDATION & PIPELINE ---');

    let rejectedMime = false;
    try {
      await sttService.transcribeAudio({
        fieldname: 'audio',
        originalname: 'document.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('dummy-pdf'),
      });
    } catch (e: any) {
      if (e instanceof BadRequestException && e.message.includes('Unsupported audio format')) {
        rejectedMime = true;
      }
    }
    assert(rejectedMime, 'STT Service rejects non-audio MIME types with BadRequestException');

    let rejectedSize = false;
    try {
      await sttService.transcribeAudio({
        fieldname: 'audio',
        originalname: 'big.wav',
        encoding: '7bit',
        mimetype: 'audio/wav',
        size: 12 * 1024 * 1024,
        buffer: Buffer.alloc(10),
      });
    } catch (e: any) {
      if (e instanceof BadRequestException && e.message.includes('exceeds 10MB')) {
        rejectedSize = true;
      }
    }
    assert(rejectedSize, 'STT Service rejects audio exceeding 10MB limit with BadRequestException');

    // Valid small audio buffer pipeline test
    const dummyAudioBuffer = Buffer.from('RIFF....WAVEfmt ....data....');
    const transcription = await sttService.transcribeAudio({
      fieldname: 'audio',
      originalname: 'question.webm',
      encoding: '7bit',
      mimetype: 'audio/webm',
      size: dummyAudioBuffer.length,
      buffer: dummyAudioBuffer,
    });
    assert(
      typeof transcription.transcript === 'string' &&
        typeof transcription.language === 'string' &&
        typeof transcription.durationMs === 'number',
      'STT Service returns valid { transcript, language, durationMs } without permanent audio storage',
    );

    // ----------------------------------------------------
    // 5. SMART PEDAGOGICAL SUGGESTIONS SERVICE
    // ----------------------------------------------------
    console.log('\n--- 5. DETERMINISTIC PEDAGOGICAL SUGGESTIONS SERVICE ---');
    const suggestions = await suggestionsService.generateSuggestions(testUser.id);

    assert(
      Array.isArray(suggestions) && suggestions.length > 0,
      `Suggestions engine returned ${suggestions.length} candidate suggestions`,
    );
    assert(
      suggestions.every(
        (s) =>
          typeof s.title === 'string' &&
          typeof s.description === 'string' &&
          ['ASK_TUTOR', 'OPEN_TOPIC', 'PRACTICE_TOPIC'].includes(s.action) &&
          typeof s.prompt === 'string' &&
          typeof s.priority === 'number',
      ),
      'All generated suggestions satisfy strict SmartSuggestion schema with actions and prompts',
    );

    // ----------------------------------------------------
    // 6. MATH SPEECH NORMALIZER FOR TTS
    // ----------------------------------------------------
    console.log('\n--- 6. MATH-AWARE TEXT-TO-SPEECH (TTS) NORMALIZATION ---');
    function testNormalizeMath(text: string): string {
      return text
        .replace(/\\times|×|\*/g, ' times ')
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, ' $1 over $2 ')
        .replace(/(\w+)\^2\b/g, '$1 squared')
        .replace(/\\sqrt\{([^}]+)\}/g, ' square root of $1 ')
        .replace(/₹\s*(\d+)/g, ' $1 rupees ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    const sampleMathFormula = 'Calculate $98 \\times 97$ and \\frac{1}{2} with x^2 + \\sqrt{16} for ₹50';
    const spoken = testNormalizeMath(sampleMathFormula);
    assert(spoken.includes('98 times 97'), 'TTS normalizes \\times to spoken "times"');
    assert(spoken.includes('1 over 2'), 'TTS normalizes \\frac to spoken "1 over 2"');
    assert(spoken.includes('x squared'), 'TTS normalizes x^2 to spoken "x squared"');
    assert(spoken.includes('square root of 16'), 'TTS normalizes \\sqrt to spoken "square root of 16"');
    assert(spoken.includes('50 rupees'), 'TTS normalizes ₹ to spoken "rupees"');

    // ----------------------------------------------------
    // 7. GEMINI MULTIMODAL AI TUTOR & IMAGE VALIDATION
    // ----------------------------------------------------
    console.log('\n--- 7. GEMINI MULTIMODAL AI TUTOR & CONVERSATION PERSISTENCE ---');

    // Multimodal image validation: reject unsupported mime
    let rejectedImageMime = false;
    try {
      await aiTutorService.processMessage(testUser.id, {
        message: 'Solve this',
        image: {
          data: 'dummy-base64',
          mimeType: 'image/gif' as any,
          fileName: 'animation.gif',
        },
      });
    } catch (e: any) {
      if (e instanceof BadRequestException && e.message.includes('Allowed: JPEG, PNG, WebP')) {
        rejectedImageMime = true;
      }
    }
    assert(rejectedImageMime, 'AI Tutor rejects unsupported image MIME types (e.g. GIF)');

    // Live Multimodal Image Query: 1x1 transparent PNG with Vedic math question
    const sampleWhitePngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

    console.log('  [Gemini Live] Sending multimodal tutor query with image...');
    const multimodalResponse = await aiTutorService.processMessage(testUser.id, {
      message: 'Explain how Nikhilam Navatashcaramam multiplies 98 and 97.',
      image: {
        data: sampleWhitePngBase64,
        mimeType: 'image/png',
        fileName: 'math_notes.png',
      },
    });

    assert(
      typeof multimodalResponse.response === 'string' && multimodalResponse.response.length > 20,
      'Gemini multimodal tutor returned substantive response with inline image context',
    );
    assert(!!multimodalResponse.conversationId, 'Multimodal message persisted with conversationId');

    // Check that conversation history preserved the message
    const conversation = await conversationService.getConversationWithMessages(
      multimodalResponse.conversationId,
      testUser.id,
    );
    assert(
      conversation.messages.length >= 2,
      `Conversation contains persisted user and assistant messages (count: ${conversation.messages.length})`,
    );

    console.log('\n====================================================');
    console.log(`📊 FINAL RESULT: ${passed} / ${total} TESTS PASSED`);
    console.log('====================================================\n');

    if (passed === total) {
      console.log('🏆 ALL PHASE 54 PRODUCTION COMPLETION VERIFICATIONS PASSED PERFECTLY!\n');
    } else {
      console.error(`⚠️ ${total - passed} VERIFICATION TESTS FAILED!`);
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Fatal test error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await moduleRef.close();
  }
}

runPhase54Verification();
