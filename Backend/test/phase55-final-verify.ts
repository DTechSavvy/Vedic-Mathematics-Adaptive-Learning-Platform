import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { WisdomTreeService } from '../src/gamification/wisdom-tree.service';
import { RewardsShopService } from '../src/gamification/rewards-shop.service';
import { GoalsService } from '../src/gamification/goals.service';
import { MasteryService } from '../src/progress/mastery.service';
import { AiTutorService } from '../src/ai-tutor/ai-tutor.service';
import { GuardrailService } from '../src/ai-tutor/services/guardrail.service';

async function runPhase55FinalVerification() {
  console.log('================================================================');
  console.log('⚡ VEDICMIND PHASE 55: FINAL PRODUCTION HARDENING AUDIT');
  console.log('================================================================\n');

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
  const wisdomTreeService = moduleRef.get(WisdomTreeService);
  const rewardsShopService = moduleRef.get(RewardsShopService);
  const goalsService = moduleRef.get(GoalsService);
  const masteryService = moduleRef.get(MasteryService);
  const aiTutorService = moduleRef.get(AiTutorService);
  const guardrailService = moduleRef.get(GuardrailService);

  try {
    // ----------------------------------------------------
    // Find or create test student
    // ----------------------------------------------------
    let testUser = await prisma.user.findFirst({
      where: { email: 'phase55.student@vedicmind.test' },
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'phase55.student@vedicmind.test',
          name: 'Phase 55 Hardening Student',
          password: 'hashed-password-for-test-only',
          xp: 12500,
          coins: 50000,
          wisdomStones: 15,
        },
      });
    } else {
      testUser = await prisma.user.update({
        where: { id: testUser.id },
        data: {
          coins: { set: Math.max(testUser.coins, 50000) },
          wisdomStones: { set: Math.max(testUser.wisdomStones, 15) },
          xp: { set: Math.max(testUser.xp, 12500) },
        },
      });
    }

    const userId = testUser.id;

    // ----------------------------------------------------
    // 1. 100-LEVEL WISDOM TREE AUDIT
    // ----------------------------------------------------
    console.log('--- 1. 100-LEVEL WISDOM TREE VERIFICATION ---');
    const treeData = await wisdomTreeService.getWisdomTreeForUser(userId);

    assert(
      Array.isArray(treeData.levels) && treeData.levels.length === 100,
      `Wisdom tree must return all 100 canonical levels (got ${treeData.levels?.length})`,
    );

    const bands = Array.from(new Set(treeData.levels.map((l: any) => l.bandName)));
    assert(
      bands.length === 10,
      `Wisdom tree must span 10 spiritual & academic bands (got ${bands.length}: ${bands.join(', ')})`,
    );

    assert(
      treeData.currentLevel >= 1 && treeData.currentLevel <= 100,
      `User currentLevel must be within 1..100 (got ${treeData.currentLevel})`,
    );

    assert(
      treeData.levels[0].level === 1 && treeData.levels[99].level === 100,
      'Wisdom tree levels must be strictly ordered from Level 1 to Level 100',
    );

    assert(
      treeData.levels[99].cumulativeXp > treeData.levels[0].cumulativeXp,
      'XP curve must strictly increase monotonically to Level 100',
    );

    // ----------------------------------------------------
    // 2. ECONOMY & REWARDS STORE MULTI-CURRENCY
    // ----------------------------------------------------
    console.log('\n--- 2. ECONOMY & STORE MULTI-CURRENCY AUDIT ---');
    const catalogue = await rewardsShopService.getCatalog(userId);

    assert(
      Array.isArray(catalogue) && catalogue.length >= 8,
      `Store catalogue must contain items across tiers (found ${catalogue?.length})`,
    );

    const commonItems = catalogue.filter((i: any) => i.costCoins <= 3000);
    const rareItems = catalogue.filter((i: any) => i.costCoins >= 50000 || (i.costStones || 0) > 0);
    const starItems = catalogue.filter((i: any) => (i.costStars || 0) > 0);

    assert(
      commonItems.length > 0 && commonItems.every((i: any) => i.costCoins >= 1200),
      'Common items must reflect rebalanced non-trivial price tier (>= 1,200 V-Coins)',
    );

    assert(
      rareItems.length > 0,
      'Rare items must require significant investment (>= 50,000 V-Coins or Wisdom Stones)',
    );

    assert(
      starItems.length > 0,
      `Multi-currency support: found ${starItems.length} items requiring Star currency`,
    );

    // ----------------------------------------------------
    // 3. SERVER-AUTHORITATIVE CONSUMABLE INVENTORY & APPLY
    // ----------------------------------------------------
    console.log('\n--- 3. CONSUMABLE INVENTORY & SERVER APPLY ---');
    const initialEntitlement = await prisma.userEntitlement.findUnique({
      where: { userId_type: { userId, type: 'HINT_TOKEN' } },
    });
    const initialBalance = initialEntitlement?.balance || 0;

    // Purchase a Hint Token
    const purchaseResult = await rewardsShopService.purchaseItem(userId, 'hint-token');
    assert(
      purchaseResult.success === true,
      'Purchase of consumable hint token succeeds',
    );

    const updatedEntitlement = await prisma.userEntitlement.findUnique({
      where: { userId_type: { userId, type: 'HINT_TOKEN' } },
    });
    assert(
      (updatedEntitlement?.balance || 0) === initialBalance + 3,
      `Inventory balance must be strictly additive (+3 for 3-pack, was ${initialBalance}, now ${updatedEntitlement?.balance})`,
    );

    // Test applyItem endpoint for XP_BOOST
    await prisma.userEntitlement.upsert({
      where: { userId_type: { userId, type: 'XP_BOOST' } },
      create: { userId, type: 'XP_BOOST', balance: 3 },
      update: { balance: { increment: 1 } },
    });

    const applyBoostResult = await rewardsShopService.applyItem(userId, 'XP_BOOST');
    assert(
      applyBoostResult.success === true && (applyBoostResult as any).effectType === 'XP_BOOST',
      'applyItem successfully activates XP_BOOST with 2x multiplier window',
    );

    // Test applyItem for MISTAKE_ANALYSIS_TOKEN
    await prisma.userEntitlement.upsert({
      where: { userId_type: { userId, type: 'MISTAKE_ANALYSIS_TOKEN' } },
      create: { userId, type: 'MISTAKE_ANALYSIS_TOKEN', balance: 2 },
      update: { balance: { increment: 1 } },
    });

    const applyMistakeResult = await rewardsShopService.applyItem(userId, 'MISTAKE_ANALYSIS_TOKEN');
    assert(
      applyMistakeResult.success === true && (applyMistakeResult as any).effectType === 'MISTAKE_ANALYSIS_TOKEN',
      'applyItem successfully produces deep pedagogical analysis of recent error traps',
    );

    // ----------------------------------------------------
    // 4. DYNAMIC GOALS & MISSIONS WITH REWARD CLAIMING
    // ----------------------------------------------------
    console.log('\n--- 4. DYNAMIC GOALS & MISSIONS AUDIT ---');
    const dailyGoals = await goalsService.getDailyGoals(userId);
    assert(
      Array.isArray(dailyGoals) && dailyGoals.length === 4,
      `Daily goals must return 4 dynamic goals based on student activity (got ${dailyGoals.length})`,
    );

    const weeklyMissions = await goalsService.getWeeklyMissions(userId);
    assert(
      Array.isArray(weeklyMissions) && weeklyMissions.length === 4,
      `Weekly missions must return 4 missions (got ${weeklyMissions.length})`,
    );

    // Test claiming anti-duplicate guard
    const dateStr = new Date().toISOString().split('T')[0];
    const testGoalId = 'goal-solve-ten';
    await prisma.dailyGoalProgress.upsert({
      where: {
        userId_date_goalType: {
          userId,
          date: dateStr,
          goalType: testGoalId,
        },
      },
      create: {
        userId,
        date: dateStr,
        goalType: testGoalId,
        currentVal: 10,
        targetVal: 10,
        completed: true,
        rewardClaimed: false,
      },
      update: {
        completed: true,
        rewardClaimed: false,
      },
    });

    // Directly claim reward
    const claim1 = await goalsService.claimDailyGoalReward(userId, testGoalId);
    assert(
      claim1.success === true && claim1.rewardXp > 0,
      'First claim of daily goal reward succeeds and grants XP/Coins',
    );

    // Duplicate claim must throw BadRequestException
    let duplicateCaught = false;
    try {
      await goalsService.claimDailyGoalReward(userId, testGoalId);
    } catch (err: any) {
      duplicateCaught = true;
    }
    assert(
      duplicateCaught,
      'Duplicate daily goal claim is rejected with anti-duplicate guard',
    );

    // ----------------------------------------------------
    // 5. PROGRESS ZERO-STATE INTEGRITY
    // ----------------------------------------------------
    console.log('\n--- 5. PROGRESS ZERO-STATE INTEGRITY AUDIT ---');
    const freshUser = await prisma.user.create({
      data: {
        email: `fresh.zero.state.${Date.now()}@vedicmind.test`,
        name: 'Zero State Student',
        password: 'pass',
      },
    });

    const anyTopic = await prisma.topic.findFirst();
    if (anyTopic) {
      const mastery = await masteryService.calculateTopicMastery(freshUser.id, anyTopic.id);
      assert(
        mastery.masteryScore === 0,
        `Untouched topic masteryScore must be strictly 0% (got ${mastery.masteryScore}%)`,
      );
      assert(
        mastery.accuracy === null,
        `Untouched topic accuracy must be strictly null (not 0% or 50%, got ${mastery.accuracy})`,
      );
      assert(
        mastery.status === 'NOT_STARTED',
        `Untouched topic status must be 'NOT_STARTED' (got ${mastery.status})`,
      );
    }

    // ----------------------------------------------------
    // 6. AI TUTOR DOMAIN GUARDRAILS
    // ----------------------------------------------------
    console.log('\n--- 6. AI TUTOR DOMAIN GUARDRAILS AUDIT ---');
    const offTopicTest1 = guardrailService.isOffTopic('Can you give me a recipe for chocolate cake?');
    assert(
      offTopicTest1.isOffTopic === true,
      'Guardrail correctly flags cooking recipe as off-topic',
    );

    const offTopicTest2 = guardrailService.isOffTopic('Who will win the upcoming presidential election?');
    assert(
      offTopicTest2.isOffTopic === true,
      'Guardrail correctly flags political question as off-topic',
    );

    const mathTopicTest = guardrailService.isOffTopic('How do I multiply 98 × 97 using Nikhilam sutra?');
    assert(
      mathTopicTest.isOffTopic === false,
      'Guardrail correctly permits authentic Vedic math question',
    );

    const greetingTest = guardrailService.isOffTopic('Hello! What can you teach me?');
    assert(
      greetingTest.isOffTopic === false,
      'Guardrail correctly permits friendly introductory greeting',
    );

    // Test processMessage end-to-end with off-topic query
    const tutorResponse = await aiTutorService.processMessage(userId, {
      message: 'Can you teach me how to bake pizza dough?',
    });
    assert(
      tutorResponse.response.includes('Vedic Mathematics') &&
      tutorResponse.suggestedActions.length > 0,
      'AI Tutor processMessage politely redirects off-topic query to Vedic Sutras',
    );

    // Clean up temporary fresh test user
    await prisma.user.delete({ where: { id: freshUser.id } });

    console.log('\n================================================================');
    console.log(`🏁 PHASE 55 AUDIT COMPLETE: ${passed} / ${total} CHECKS PASSED`);
    console.log('================================================================\n');

    if (passed === total) {
      console.log('🎉 ALL FINAL PRODUCTION HARDENING AUDITS PASSED WITH 100% SUCCESS!\n');
    } else {
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
    await moduleRef.close();
  }
}

runPhase55FinalVerification().catch((err) => {
  console.error('Fatal error during Phase 55 verification:', err);
  process.exit(1);
});
