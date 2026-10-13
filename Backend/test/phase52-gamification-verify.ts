import { PrismaClient } from '@prisma/client';
import { TechniqueSelectionService } from '../src/question/technique-selection.service';
import { MasteryService } from '../src/progress/mastery.service';
import { GamificationService } from '../src/gamification/gamification.service';
import { RewardsShopService } from '../src/gamification/rewards-shop.service';
import { WisdomTreeService } from '../src/gamification/wisdom-tree.service';
import { GoalsService } from '../src/gamification/goals.service';
import { AchievementService } from '../src/achievement/achievement.service';
import { LeaderboardService } from '../src/leaderboard/leaderboard.service';

const prisma = new PrismaClient();

async function runVerification() {
  console.log('====================================================');
  console.log('⚡ VEDICMIND PHASE 52: GAMIFICATION & MASTERY AUDIT');
  console.log('====================================================\n');

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
    // 1. Curriculum Canonical Deduplication
    console.log('--- 1. CURRICULUM INTEGRITY ---');
    const topicCount = await prisma.topic.count();
    const moduleCount = await prisma.module.count();
    const courseCount = await prisma.course.count();
    const sutraCount = await prisma.sutra.count();

    assert(topicCount === 23, `Topic count must be exactly 23 (found ${topicCount})`);
    assert(moduleCount === 5, `Module count must be exactly 5 (found ${moduleCount})`);
    assert(courseCount === 1, `Course count must be exactly 1 (found ${courseCount})`);
    assert(sutraCount === 16, `Canonical Sutra count must be exactly 16 (found ${sutraCount})`);

    // 2. Achievements Catalog
    console.log('\n--- 2. 100 ACHIEVEMENTS ENGINE ---');
    const achievementDefCount = await prisma.achievementDefinition.count();
    assert(achievementDefCount === 100, `Achievement definitions must be exactly 100 (found ${achievementDefCount})`);

    const categories = await prisma.achievementDefinition.groupBy({
      by: ['category'],
      _count: { id: true },
    });
    assert(categories.length === 10, `Achievement categories must be 10 (found ${categories.length})`);
    console.log('     Categories verified:', categories.map((c) => `${c.category}: ${c._count.id}`).join(', '));

    // Get a test user
    const testUser = await prisma.user.findFirst();
    if (!testUser) {
      throw new Error('No user found in database to run tests against');
    }
    console.log(`\nUsing test user: ID ${testUser.id} (${testUser.email})`);

    // 3. Technique Selection Service Anti-Leak
    console.log('\n--- 3. TECHNIQUE SELECTION ANTI-LEAK ---');
    const techniqueService = new TechniqueSelectionService(prisma as any);
    const targetTopicId = 1; // Ekadhikena Purvena topic
    const targetSutraId = 'sutra-01';

    const techQuestion = await techniqueService.generateTechniqueQuestion(
      testUser.id,
      targetTopicId,
      targetSutraId,
      'EASY',
    );

    assert(
      techQuestion.questionType === 'TECHNIQUE_SELECTION',
      'Question type must be TECHNIQUE_SELECTION',
    );
    assert(
      techQuestion.technique === 'Strategy Identification',
      'Technique metadata must be masked to generic label',
    );
    assert(
      techQuestion.options && techQuestion.options.length === 4,
      'Technique question must present 4 distinct options',
    );
    assert(
      techQuestion.options.includes(techQuestion.correctAnswer),
      'Options must include the correct answer',
    );
    assert(
      !techQuestion.question.toLowerCase().includes('ekadhikena'),
      'Question prompt must NOT reveal the target sutra/technique directly',
    );

    // 4. Multi-Dimensional Mastery
    console.log('\n--- 4. MULTI-DIMENSIONAL MASTERY ---');
    const masteryService = new MasteryService(prisma as any);
    const allTopicsMastery = await masteryService.getAllTopicsMastery(testUser.id);
    assert(
      allTopicsMastery.length === 23,
      `getAllTopicsMastery must return all 23 canonical topics (found ${allTopicsMastery.length})`,
    );

    const allSutrasMastery = await masteryService.getAllSutrasMastery(testUser.id);
    assert(
      allSutrasMastery.length === 16,
      `getAllSutrasMastery must return all 16 canonical sutras (found ${allSutrasMastery.length})`,
    );

    const firstTopicMastery = await masteryService.getTopicMastery(testUser.id, targetTopicId);
    assert(firstTopicMastery !== null, 'getTopicMastery returns valid structure');
    assert(
      typeof firstTopicMastery?.isMastered === 'boolean',
      'Mastery evaluation contains boolean isMastered',
    );
    assert(
      typeof firstTopicMastery?.totalAttempts === 'number',
      'Mastery evaluation contains numeric totalAttempts',
    );

    // 5. Gamification & Anti-Farming Economy
    console.log('\n--- 5. SUSTAINABLE ECONOMY & ANTI-FARMING ---');
    const gamificationService = new GamificationService(prisma as any);
    
    // Normal reward
    const normalReward = await gamificationService.evaluatePracticeRewards({
      userId: testUser.id,
      isCorrect: true,
      difficulty: 'MEDIUM',
      timeTakenSeconds: 15,
      isDuplicateQuestion: false,
    });
    assert(normalReward.earnedCoins > 0, `Normal correct answer awards coins (earned: ${normalReward.earnedCoins})`);
    assert(!normalReward.isDiminishedReward, 'Normal correct answer does not trigger diminished reward');

    // Duplicate / farming question
    const farmingReward = await gamificationService.evaluatePracticeRewards({
      userId: testUser.id,
      isCorrect: true,
      difficulty: 'MEDIUM',
      timeTakenSeconds: 15,
      isDuplicateQuestion: true,
    });
    assert(farmingReward.isDiminishedReward, 'Duplicate practice question triggers diminished reward rate');
    assert(farmingReward.earnedCoins <= normalReward.earnedCoins, 'Diminished coins must be <= normal coins');

    // Verify CoinTransaction recorded in database
    const lastTransaction = await prisma.coinTransaction.findFirst({
      where: { userId: testUser.id },
      orderBy: { createdAt: 'desc' },
    });
    assert(lastTransaction !== null, 'CoinTransaction record was successfully created');
    assert(lastTransaction?.amount !== undefined, `Transaction has auditable amount (${lastTransaction?.amount})`);

    // 6. Rewards Shop Catalog & Purchase Logic
    console.log('\n--- 6. REWARDS SHOP & ACADEMIC PREREQUISITES ---');
    const shopService = new RewardsShopService(prisma as any);
    const catalog = await shopService.getCatalog(testUser.id);
    assert(catalog.length === 10, `Store catalog contains exactly 10 items (found ${catalog.length})`);
    assert(catalog[0].costCoins !== undefined, 'Catalog items include costCoins');

    // 7. 100-Level Wisdom Tree
    console.log('\n--- 7. 100-LEVEL WISDOM TREE ---');
    const treeService = new WisdomTreeService(prisma as any);
    const treeOverview = await treeService.getWisdomTreeForUser(testUser.id);
    assert(treeOverview.currentLevel >= 1 && treeOverview.currentLevel <= 100, `Wisdom tree level in range 1-100 (${treeOverview.currentLevel})`);
    assert(treeOverview.bands.length === 10, `Wisdom tree has 10 progression bands (found ${treeOverview.bands.length})`);
    assert(treeOverview.progressPercentage >= 0 && treeOverview.progressPercentage <= 100, `Progress percentage valid (${treeOverview.progressPercentage}%)`);

    // 8. Daily Goals & Weekly Missions
    console.log('\n--- 8. GOALS & MISSIONS ---');
    const goalsService = new GoalsService(prisma as any);
    const dailyGoals = await goalsService.getDailyGoals(testUser.id);
    const weeklyMissions = await goalsService.getWeeklyMissions(testUser.id);
    assert(dailyGoals.length >= 3, `Daily goals count must be at least 3 (found ${dailyGoals.length})`);
    assert(weeklyMissions.length >= 3, `Weekly missions count must be at least 3 (found ${weeklyMissions.length})`);

    // 9. Multi-Metric Leaderboard
    console.log('\n--- 9. MULTI-METRIC BALANCED LEADERBOARD ---');
    const leaderboardService = new LeaderboardService(prisma as any);
    const weeklyBoard = await leaderboardService.getLeaderboard(testUser.id, 'weekly');
    const allTimeBoard = await leaderboardService.getLeaderboard(testUser.id, 'allTime');
    assert(weeklyBoard.entries.length > 0, `Weekly leaderboard returns entries (found ${weeklyBoard.entries.length})`);
    assert(allTimeBoard.entries.length > 0, `All-time leaderboard returns entries (found ${allTimeBoard.entries.length})`);
    assert(weeklyBoard.entries[0].learningScore !== undefined, 'Entries include calculated Balanced Learning Score');
    assert(weeklyBoard.entries[0].masteredTopicsCount !== undefined, 'Entries include topic mastery counts');
    assert(weeklyBoard.entries[0].masteredSutrasCount !== undefined, 'Entries include sutra mastery counts');

    // 10. Idempotent Achievements Evaluation
    console.log('\n--- 10. IDEMPOTENT ACHIEVEMENT EVALUATION ---');
    const achievementService = new AchievementService(prisma as any);
    const firstEval = await achievementService.evaluateAchievements(testUser.id);
    const secondEval = await achievementService.evaluateAchievements(testUser.id);
    assert(Array.isArray(firstEval), 'Achievement evaluation returns array');
    assert(secondEval.length === 0, `Second evaluation is strictly idempotent and unlocks 0 new achievements (found ${secondEval.length})`);

    console.log('\n====================================================');
    console.log(`📊 FINAL RESULT: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log('====================================================');

    if (passedTests === totalTests) {
      console.log('🎉 ALL INTEGRITY, MASTERY, ECONOMY, AND GAMIFICATION AUDITS PASSED!');
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal error during verification:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runVerification();
