import { PrismaClient } from '@prisma/client';
import { MasteryService } from '../src/progress/mastery.service';
import { PracticeDifficultyService } from '../src/question/practice-difficulty.service';
import { LessonService } from '../src/lesson/lesson.service';
import { RewardsShopService } from '../src/gamification/rewards-shop.service';
import { QuestionValidationGateService } from '../src/question/question-validation-gate.service';
import { LearningStateService } from '../src/progress/learning-state.service';
import { GoalsService } from '../src/gamification/goals.service';
import { WisdomTreeService } from '../src/gamification/wisdom-tree.service';

const prisma = new PrismaClient();

async function runPhase53Verification() {
  console.log('====================================================');
  console.log('⚡ VEDICMIND PHASE 53: PRODUCTION HARDENING AUDIT');
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

  try {
    // 1. Curriculum Integrity & Template Coverage
    console.log('--- 1. CURRICULUM INTEGRITY & TEMPLATE COVERAGE ---');
    const topicCount = await prisma.topic.count();
    const moduleCount = await prisma.module.count();
    const courseCount = await prisma.course.count();
    const sutraCount = await prisma.sutra.count();

    assert(topicCount === 23, `Topic count must be exactly 23 (found ${topicCount})`);
    assert(moduleCount === 5, `Module count must be exactly 5 (found ${moduleCount})`);
    assert(courseCount === 1, `Course count must be exactly 1 (found ${courseCount})`);
    assert(sutraCount === 16, `Canonical Sutra count must be exactly 16 (found ${sutraCount})`);

    // Verify 100% template coverage for all 23 topics
    const topics = await prisma.topic.findMany({
      include: { templates: true, lessons: true },
      orderBy: { id: 'asc' },
    });
    const topicsWithoutTemplates = topics.filter((t) => t.templates.length === 0);
    assert(
      topicsWithoutTemplates.length === 0,
      `All 23 topics must have practice templates (missing: ${topicsWithoutTemplates.map((t) => t.title).join(', ') || 'none'})`,
    );

    const topicsWithoutLessons = topics.filter((t) => t.lessons.length === 0);
    assert(
      topicsWithoutLessons.length === 0,
      `All 23 topics must have instructional lessons (missing: ${topicsWithoutLessons.map((t) => t.title).join(', ') || 'none'})`,
    );

    // Get or create dedicated test user
    let testUser = await prisma.user.findFirst({
      where: { email: 'phase53_test_scholar@vedicmind.org' },
    });
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          name: 'Phase53 Scholar',
          email: 'phase53_test_scholar@vedicmind.org',
          password: 'hashed_test_password',
          learningLevel: 'BEGINNER',
          coins: 500,
          xp: 100,
          level: 1,
        },
      });
    }

    // Instantiate core services with prisma cast
    const p = prisma as any;
    const goalsService = new GoalsService(p);
    const wisdomTreeService = new WisdomTreeService(p);
    const masteryService = new MasteryService(p);
    const difficultyService = new PracticeDifficultyService(p);
    const lessonService = new LessonService(p);
    const rewardsService = new RewardsShopService(p);
    const validationGateService = new QuestionValidationGateService(p);
    const learningStateService = new LearningStateService(
      p,
      masteryService,
      difficultyService,
      wisdomTreeService,
      goalsService,
      rewardsService,
    );

    // 2. Lesson Progress Engine & Content Gate
    console.log('\n--- 2. LESSON PROGRESS ENGINE & CONTENT GATE ---');
    const firstLesson = topics[0].lessons[0];
    const startRes = await lessonService.startLesson(testUser.id, firstLesson.id);
    assert(
      startRes.status === 'OPENED' || startRes.status === 'IN_PROGRESS' || startRes.status === 'COMPLETED',
      `startLesson registers valid status (got ${startRes.status})`,
    );

    const completeRes = await lessonService.completeLesson(testUser.id, firstLesson.id);
    assert(completeRes.status === 'COMPLETED', `completeLesson registers status COMPLETED`);

    const lessonProg = await lessonService.getLessonProgress(testUser.id, firstLesson.id);
    assert(lessonProg.status === 'COMPLETED', `Lesson status persisted as COMPLETED`);

    // 3. Pedagogical Mastery Formula & Hard Gates
    console.log('\n--- 3. PEDAGOGICAL MASTERY HARD GATES ---');
    const topicMastery = await masteryService.calculateTopicMastery(testUser.id, topics[0].id);
    assert(
      topicMastery.contentCompletion === 100,
      `Topic content completion is 100% after lesson complete (got ${topicMastery.contentCompletion}%)`,
    );
    assert(
      topicMastery.contentStatus === 'COMPLETED',
      `Content status is COMPLETED`,
    );

    // Uncompleted topic must NOT have 100% content completion
    const uncompletedTopicMastery = await masteryService.calculateTopicMastery(testUser.id, topics[1].id);
    assert(
      uncompletedTopicMastery.contentCompletion === 0,
      `Unstarted lesson has 0% content completion`,
    );
    assert(
      !uncompletedTopicMastery.isMastered,
      `Uncompleted topic cannot be MASTERED without fulfilling content gate`,
    );

    // 4. Rigorous Difficulty Progression Gates
    console.log('\n--- 4. RIGOROUS DIFFICULTY PROGRESSION GATES ---');
    const diffAccess = await difficultyService.getDifficultyAccess(testUser.id);
    assert(diffAccess.unlockedDifficulties.includes('EASY'), `EASY tier is always unlocked by default`);

    const mediumAccess = diffAccess.access.find((a) => a.difficulty === 'MEDIUM');
    assert(
      mediumAccess !== undefined && typeof mediumAccess.unlocked === 'boolean',
      `Medium tier access evaluated with explicit criteria`,
    );

    const advancedAccess = diffAccess.access.find((a) => a.difficulty === 'ADVANCED');
    assert(
      advancedAccess !== undefined,
      `Advanced tier access evaluated with competence requirement`,
    );

    // 5. Store Entitlements & Hint Tokens
    console.log('\n--- 5. STORE ENTITLEMENTS & HINT TOKENS ---');
    // Award 600 coins for testing store purchases
    await prisma.user.update({
      where: { id: testUser.id },
      data: { coins: 600 },
    });

    const storeCatalog = await rewardsService.getCatalog(testUser.id);
    assert(storeCatalog.length >= 8, `Catalog has ${storeCatalog.length} educational items`);
    const hintItem = storeCatalog.find((i) => i.id === 'hint-token');
    assert(hintItem !== undefined, `Hint token catalog item exists`);

    // Purchase hint token
    const purchase = await rewardsService.purchaseItem(testUser.id, 'hint-token');
    assert(purchase.success, `Successfully purchased hint token with V-Coins`);

    const entitlements = await rewardsService.getUserEntitlements(testUser.id);
    assert(
      entitlements['HINT_TOKEN'] && entitlements['HINT_TOKEN'].balance >= 1,
      `HINT_TOKEN entitlement active with balance >= 1 (got ${entitlements['HINT_TOKEN']?.balance})`,
    );

    // Create a dummy question to test hint consumption
    const template = topics[0].templates[0];
    const dummyQuestion = await prisma.generatedQuestion.create({
      data: {
        userId: testUser.id,
        templateId: template.id,
        question: '73 + 24',
        correctAnswer: '97',
      },
    });

    const initialHintBalance = entitlements['HINT_TOKEN'].balance;
    const hintResult = await rewardsService.useHintToken(testUser.id, dummyQuestion.id);
    assert(hintResult.success, `useHintToken consumed token successfully`);
    assert(
      hintResult.remainingHints === initialHintBalance - 1,
      `Hint token balance decremented correctly (${hintResult.remainingHints})`,
    );
    assert(
      hintResult.hint.length > 5 && hintResult.shortcutRule.length > 3,
      `Hint produces pedagogical clue and Sutra shortcut rule`,
    );

    // 6. Question Validation Gate & Indian Context
    console.log('\n--- 6. QUESTION VALIDATION GATE & INDIAN CURRENCY ---');
    const validMathCheck = await validationGateService.validateQuestion(testUser.id, {
      question: 'Calculate 105 * 108',
      correctAnswer: '11340',
      explanationSteps: ['105 * 108 = 11340'],
      questionType: 'DIRECT_CALCULATION',
    });
    assert(validMathCheck.isValid, `Valid calculation passes validation gate`);

    const invalidMathCheck = await validationGateService.validateQuestion(testUser.id, {
      question: 'Calculate 12 * 12',
      correctAnswer: '145', // Wrong: 144
      explanationSteps: ['Step: 12 * 12 = 144'],
      questionType: 'DIRECT_CALCULATION',
    });
    assert(!invalidMathCheck.isValid, `Invalid calculation correctly rejected by math check`);

    const rupeeCurrencyCheck = await validationGateService.validateQuestion(testUser.id, {
      question: 'A Jaipur handloom worker earns ₹450 per saree. How much for 11 sarees?',
      correctAnswer: '4950',
      explanationSteps: ['Multiply 450 by 11 to get ₹4950'],
      questionType: 'WORD_PROBLEM',
    });
    assert(rupeeCurrencyCheck.isValid, `Valid Indian currency context (₹) passes validation gate`);

    const dollarCurrencyCheck = await validationGateService.validateQuestion(testUser.id, {
      question: 'A merchant charges $45 for a basket. What is the total?',
      correctAnswer: '90',
      explanationSteps: ['Multiply by 2 to get $90'],
      questionType: 'WORD_PROBLEM',
    });
    assert(
      Boolean(!dollarCurrencyCheck.isValid && dollarCurrencyCheck.failureReason?.includes('currency')),
      `Legacy dollar ($) correctly rejected by Indian context filter`,
    );

    // 7. Authoritative Learning State (Single Source of Truth)
    console.log('\n--- 7. AUTHORITATIVE LEARNING STATE (SINGLE SOURCE OF TRUTH) ---');
    const authState = await learningStateService.getAuthoritativeState(testUser.id);
    assert(authState.user.id === testUser.id, `Authoritative state returns correct user`);
    assert(authState.summary.totalTopicsCount === 23, `Authoritative summary reports exactly 23 topics`);
    assert(authState.summary.totalSutrasCount === 16, `Authoritative summary reports exactly 16 sutras`);
    assert(authState.topics.length === 23, `All 23 topics present in authoritative state`);
    assert(authState.sutras.length === 16, `All 16 sutras present in authoritative state`);
    assert(authState.difficultyAccess !== undefined, `Authoritative state contains difficulty access policy`);
    assert(authState.wisdomTree !== undefined, `Authoritative state contains wisdom tree data`);
    assert(authState.entitlements !== undefined, `Authoritative state contains user entitlements`);
    assert(authState.recommendation !== undefined, `Authoritative state contains pedagogical recommendation`);

    const dashboardOverview = await learningStateService.getDashboardOverview(testUser.id);
    assert(dashboardOverview.stats.canonicalTopicsCount === 23, `Dashboard overview reports 23 canonical topics`);
    assert(dashboardOverview.stats.canonicalSutrasCount === 16, `Dashboard overview reports 16 canonical sutras`);

    console.log('\n====================================================');
    console.log(`📊 FINAL RESULT: ${passed} / ${total} TESTS PASSED`);
    console.log('====================================================');

    if (passed === total) {
      console.log('\n🏆 ALL PHASE 53 HARDENING VERIFICATIONS PASSED PERFECTLY!\n');
    } else {
      console.error(`\n⚠️ ${total - passed} VERIFICATION(S) FAILED.\n`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase53Verification();
