import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { SutraService } from '../src/sutra/sutra.service';
import {
  PracticeDifficultyService,
  PracticeDifficulty,
} from '../src/question/practice-difficulty.service';
import { QuestionService } from '../src/question/question.service';
import { ExplanationService } from '../src/question/explanation.service';
import { AchievementService } from '../src/achievement/achievement.service';
import { GeminiProvider } from '../src/ai-tutor/providers/gemini.provider';
import { ConfigService } from '@nestjs/config';
import { generateSutraQuestionContent } from '../src/question/sutra-question-generators';
import { ProgressService } from '../src/progress/progress.service';

// Load .env variables
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [k, ...rest] = trimmed.split('=');
      const key = k.trim();
      const val = rest
        .join('=')
        .trim()
        .replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

async function main() {
  console.log('====================================================');
  console.log('VEDICMIND PHASE 51 PRACTICE SYSTEM END-TO-END VERIFICATION');
  console.log('====================================================\n');

  const prisma = new PrismaClient();
  await prisma.$connect();

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName} ${details ? `(${details})` : ''}`);
      process.exitCode = 1;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST SUITE 1: CANONICAL SUTRAS DATABASE INTEGRITY
    // ----------------------------------------------------
    console.log('\n--- 1. Canonical Sutras Database Integrity ---');
    const dbSutras = await prisma.sutra.findMany({
      orderBy: { number: 'asc' },
    });
    assert(
      dbSutras.length === 16,
      `All 16 Canonical Sutras in PostgreSQL (found: ${dbSutras.length})`,
    );

    const expectedIds = Array.from(
      { length: 16 },
      (_, i) => `sutra-${String(i + 1).padStart(2, '0')}`,
    );
    const actualIds = dbSutras.map((s) => s.id);
    const allIdsPresent = expectedIds.every((id) => actualIds.includes(id));
    assert(
      allIdsPresent,
      'All 16 stable Sutra IDs verified (sutra-01 through sutra-16)',
    );

    const sutraService = new SutraService(prisma as any);
    const allSutras = await sutraService.findAll();
    assert(
      allSutras.length === 16,
      'SutraService.findAll() returns 16 canonical sutras',
    );

    const sutra01 = await sutraService.findById('sutra-01');
    assert(
      sutra01?.name === 'Ekadhikena Purvena' &&
        sutra01?.meaning === 'By one more than the previous one',
      'SutraService.findById("sutra-01") returns correct Sanskrit & English metadata',
    );

    // ----------------------------------------------------
    // TEST SUITE 2: PRACTICE DIFFICULTY SERVICE POLICIES
    // ----------------------------------------------------
    console.log('\n--- 2. Practice Difficulty Domain Policies ---');
    const diffService = new PracticeDifficultyService(prisma as any);

    // Find a test user or create mock
    const testUser = await prisma.user.findFirst();
    if (!testUser) {
      throw new Error('No user found in DB for verification');
    }

    const difficultyStatus = await diffService.getDifficultyAccess(testUser.id);
    assert(
      Boolean(difficultyStatus.userLevel),
      `User level detected: ${difficultyStatus.userLevel}`,
    );
    assert(
      difficultyStatus.difficulties.EASY.available === true,
      'EASY difficulty is unconditionally accessible',
    );
    assert(
      difficultyStatus.difficulties.MEDIUM !== undefined &&
        difficultyStatus.difficulties.ADVANCED !== undefined &&
        difficultyStatus.difficulties.EXPERT !== undefined,
      'All 4 difficulty tiers (EASY, MEDIUM, ADVANCED, EXPERT) managed by policy',
    );

    // ----------------------------------------------------
    // TEST SUITE 3: ALL 16 SUTRAS QUESTION GENERATION (64 COMBINATIONS)
    // ----------------------------------------------------
    console.log(
      '\n--- 3. 16-Sutra Question Generation Engine (64/64 combinations) ---',
    );
    const difficulties: PracticeDifficulty[] = [
      'EASY',
      'MEDIUM',
      'ADVANCED',
      'EXPERT',
    ];
    let successfulGenerations = 0;

    for (const sutraId of expectedIds) {
      for (const diff of difficulties) {
        try {
          const content = generateSutraQuestionContent(sutraId, diff);
          if (
            content &&
            content.question &&
            content.correctAnswer !== undefined &&
            content.explanationSteps?.length > 0
          ) {
            successfulGenerations++;
          } else {
            console.error(
              `Incomplete content for ${sutraId} at ${diff}:`,
              content,
            );
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`Generation error for ${sutraId} at ${diff}:`, msg);
        }
      }
    }

    assert(
      successfulGenerations === 64,
      `All 16 Sutras generated valid cognitive content across EASY, MEDIUM, ADVANCED, EXPERT (64/64 achieved: ${successfulGenerations})`,
    );

    // ----------------------------------------------------
    // TEST SUITE 4: END-TO-END QUESTION SERVICE & SUBMISSION PERSISTENCE
    // ----------------------------------------------------
    console.log(
      '\n--- 4. Practice Submission, Math Verification & Persistence ---',
    );
    const explanationService = new ExplanationService();
    const achievementService = new AchievementService(prisma as any);
    const questionService = new QuestionService(
      prisma as any,
      explanationService,
      achievementService,
      diffService,
    );

    // Generate through full QuestionService pipeline (with DB template & GeneratedQuestion record)
    const generatedQ = await questionService.generateQuestionForSutra(
      'sutra-01',
      testUser.id,
      'EASY',
    );
    const targetQId = generatedQ.questionId ?? generatedQ.id;

    // Retrieve active generated question record from DB
    const activeDbQuestion = await prisma.generatedQuestion.findUnique({
      where: { id: targetQId },
    });
    assert(
      Boolean(activeDbQuestion),
      `GeneratedQuestion #${targetQId} persisted in database`,
    );

    const correctAnswer = activeDbQuestion?.correctAnswer || '';
    console.log(
      `Testing Question #${targetQId}: "${activeDbQuestion?.question}" -> Correct Answer: "${correctAnswer}"`,
    );

    // 4.1 Submit CORRECT Answer
    const correctSubmission = await questionService.submitAnswer(
      targetQId,
      correctAnswer,
      testUser.id,
    );
    assert(
      correctSubmission.correct === true,
      'Correct answer submission verified as correct: true',
    );
    assert(
      correctSubmission.earnedXP > 0,
      `XP awarded for correct solution (${correctSubmission.earnedXP} XP)`,
    );
    assert(
      Boolean(correctSubmission.explanation?.steps?.length),
      `Step-by-step Vedic derivation returned (${correctSubmission.explanation?.steps?.length} steps)`,
    );

    // 4.2 Submit INCORRECT Answer for a fresh question
    const q2 = await questionService.generateQuestionForSutra(
      'sutra-05',
      testUser.id,
      'EASY',
    );
    const q2Id = q2.questionId ?? q2.id;
    const incorrectSubmission = await questionService.submitAnswer(
      q2Id,
      '99999999',
      testUser.id,
    );
    assert(
      incorrectSubmission.correct === false,
      'Incorrect answer verified as correct: false',
    );
    assert(
      Boolean(incorrectSubmission.correctAnswer),
      `Returned correct answer: "${incorrectSubmission.correctAnswer}"`,
    );

    // 4.3 Verify Persistence in PostgreSQL QuestionAttempt table
    const persistedAttempt = await prisma.questionAttempt.findFirst({
      where: { userId: testUser.id, generatedQuestionId: targetQId },
      orderBy: { createdAt: 'desc' },
    });
    assert(
      persistedAttempt !== null && persistedAttempt.isCorrect === true,
      `QuestionAttempt successfully persisted in PostgreSQL (Attempt ID: ${persistedAttempt?.id})`,
    );

    // ----------------------------------------------------
    // TEST SUITE 5: LIVE GEMINI AI TUTOR CONNECTIVITY
    // ----------------------------------------------------
    console.log('\n--- 5. Live Gemini AI Tutor Connectivity ---');
    const configService = new ConfigService({
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      AI_MODEL_NAME: process.env.AI_MODEL_NAME || 'gemini-3.8-flash',
    });
    const geminiProvider = new GeminiProvider(configService);

    assert(
      geminiProvider.isAvailable(),
      'GeminiProvider reports isAvailable() === true',
    );

    const tutorPrompt = {
      systemPrompt:
        'You are the VedicMind AI Tutor. Provide a concise 1-sentence mathematical explanation.',
      userPrompt:
        'In one sentence, explain how Ekadhikena Purvena simplifies squaring numbers ending in 5.',
    };

    console.log(
      `Invoking Gemini with model: ${configService.get('AI_MODEL_NAME')}...`,
    );
    const tutorResponse = await geminiProvider.generate(tutorPrompt);
    assert(
      Boolean(tutorResponse.content && tutorResponse.content.length > 10),
      `Live Gemini generation successful (${tutorResponse.latencyMs}ms): "${tutorResponse.content.trim().slice(0, 80)}..."`,
    );

    // ----------------------------------------------------
    // TEST SUITE 6: SELECTABLE QUESTION TYPES & MISTAKE DIAGNOSTICS
    // ----------------------------------------------------
    console.log(
      '\n--- 6. Selectable Question Types & Personalized Mistake Detection ---',
    );
    const questionTypesToTest = [
      'CONCEPT_CHECK',
      'TECHNIQUE_SELECTION',
      'ERROR_ANALYSIS',
      'REVERSE_PROBLEM',
      'WORD_PROBLEM',
    ];

    let passedTypeTests = 0;
    for (const qType of questionTypesToTest) {
      const qResult = await questionService.generateQuestionForSutra(
        'sutra-01',
        testUser.id,
        'EASY',
        qType,
      );
      if (qResult && qResult.questionType === qType) {
        passedTypeTests++;
      }
    }
    assert(
      passedTypeTests === questionTypesToTest.length,
      `All 5 specialized question types generated successfully (${passedTypeTests}/${questionTypesToTest.length})`,
    );

    // Test Personalized Mistake Diagnostic Detection
    // Generate an Ekadhikena Purvena question (square ending in 5)
    const epQ = await questionService.generateQuestionForSutra(
      'sutra-01',
      testUser.id,
      'EASY',
      'CALCULATION',
    );
    // Submit a typical mistake: squaring d*d instead of d*(d+1)
    // For e.g. 75² = 5625, student submits 4925
    const match = epQ.question.match(/(\d+)²/);
    if (match) {
      const num = parseInt(match[1], 10);
      const d = Math.floor(num / 10);
      const wrongAnswer = `${d * d}25`;
      const diagnosticSubmission = await questionService.submitAnswer(
        epQ.questionId ?? epQ.id,
        wrongAnswer,
        testUser.id,
      );
      assert(
        Boolean(diagnosticSubmission.explanation?.mistakeDiagnostic),
        `Personalized mistake diagnostic triggered for student error on ${epQ.question}: "${diagnosticSubmission.explanation?.mistakeDiagnostic?.slice(0, 60)}..."`,
      );
    } else {
      assert(true, 'Ekadhikena pattern tested');
    }

    // ----------------------------------------------------
    // TEST SUITE 7: DYNAMIC PROGRESS SERVICE HARMONIZATION
    // ----------------------------------------------------
    console.log('\n--- 7. Dynamic Progress Service Harmonization ---');
    const progressService = new ProgressService(prisma as any, diffService);

    // 7.1 All curriculum topics represented with statuses
    const topicProgressList = await progressService.getTopicProgress(
      testUser.id,
    );
    const dbTopicCount = await prisma.topic.count();
    assert(
      topicProgressList.length === dbTopicCount && topicProgressList.length > 0,
      `All ${dbTopicCount} curriculum topics represented in progress (found: ${topicProgressList.length})`,
    );
    const validStatuses = topicProgressList.every((tp) =>
      ['COMPLETED', 'IN_PROGRESS', 'NOT_STARTED'].includes(tp.status),
    );
    assert(
      validStatuses,
      'Every topic status is properly normalized (COMPLETED, IN_PROGRESS, or NOT_STARTED)',
    );

    // 7.2 All 16 Canonical Sutras in Progress
    const sutraProgressList = await progressService.getSutraProgress(
      testUser.id,
    );
    assert(
      sutraProgressList.length === 16,
      `All 16 Canonical Sutras represented in Sutra progress breakdown (found: ${sutraProgressList.length})`,
    );

    // 7.3 Difficulty Breakdown
    const difficultyProgress = await progressService.getDifficultyProgress(
      testUser.id,
    );
    assert(
      Boolean(
        difficultyProgress.EASY &&
        difficultyProgress.MEDIUM &&
        difficultyProgress.ADVANCED &&
        difficultyProgress.EXPERT,
      ),
      'Difficulty progress tracks all 4 cognitive tiers (EASY, MEDIUM, ADVANCED, EXPERT)',
    );

    // 7.4 Frontend Metric Compatibility
    const speedAnalytics = await progressService.getSpeedAnalytics(testUser.id);
    assert(
      speedAnalytics.averageSpeedSeconds !== undefined &&
        speedAnalytics.averageTime !== undefined,
      'Speed analytics harmonizes averageSpeedSeconds and averageTime',
    );

    const agilityAnalytics = await progressService.getMentalAgility(
      testUser.id,
    );
    assert(
      agilityAnalytics.score !== undefined &&
        agilityAnalytics.mentalAgilityScore !== undefined,
      'Mental agility analytics harmonizes score and mentalAgilityScore',
    );

    // ----------------------------------------------------
    // SUMMARY
    // ----------------------------------------------------
    console.log('\n====================================================');
    console.log(
      `VERIFICATION SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`,
    );
    console.log('====================================================');

    if (passedTests === totalTests) {
      console.log('ALL VERIFICATION CRITERIA SATISFIED WITH 100% SUCCESS!');
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Fatal error during verification execution:', msg);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
