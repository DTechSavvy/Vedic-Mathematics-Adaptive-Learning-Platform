import { Injectable, Logger } from '@nestjs/common';
import type { MathVerificationResult } from './interfaces/math-verification.interface';
import { SendTutorMessageDto } from './dto/tutor-message.dto';
import {
  MathFeedback,
  SourceReference,
  StructuredTutorResponseDto,
} from './dto/tutor-response.dto';
import { TutorMode } from './enums/tutor-mode.enum';
import { StudentProfile } from './interfaces/student-profile.interface';
import { TutorResponse } from './interfaces/tutor-response.interface';
import { ConversationService } from './services/conversation.service';
import { DoubtSolverService } from './services/doubt-solver.service';
import { GuardrailService } from './services/guardrail.service';
import { KnowledgeService } from './services/knowledge.service';
import { LlmService } from './services/llm.service';
import { MathSolverService } from './services/math-solver.service';
import { MistakeAnalyzerService } from './services/mistake-analyzer.service';
import { MotivationService } from './services/motivation.service';
import { PromptService } from './services/prompt.service';
import { RecommendationService } from './services/recommendation.service';
import { StudyPlannerService } from './services/study-planner.service';
import { TutorContextService } from './services/tutor-context.service';
import { TutorNlpService } from './services/tutor-nlp.service';
import { StudentProfileBuilderService } from './student-profile-builder.service';

@Injectable()
export class AiTutorService {
  private readonly logger = new Logger(AiTutorService.name);

  constructor(
    private readonly tutorNlpService: TutorNlpService,
    private readonly mathSolverService: MathSolverService,
    private readonly knowledgeService: KnowledgeService,
    private readonly tutorContextService: TutorContextService,
    private readonly conversationService: ConversationService,
    private readonly promptService: PromptService,
    private readonly llmService: LlmService,
    private readonly guardrailService: GuardrailService,
    // Legacy services preserved for backward compatibility
    private readonly doubtSolverService: DoubtSolverService,
    private readonly mistakeAnalyzerService: MistakeAnalyzerService,
    private readonly studyPlannerService: StudyPlannerService,
    private readonly recommendationService: RecommendationService,
    private readonly motivationService: MotivationService,
    private readonly profileBuilder: StudentProfileBuilderService,
  ) {}

  /**
   * Primary Production Pipeline:
   * Student Message -> Authenticated Identity -> NLP Processing -> Learner Context ->
   * Knowledge Retrieval -> Prompt Builder -> LLM Abstraction -> Math Solver ->
   * Guardrails -> Persistence -> Structured Response
   */
  async processMessage(
    userId: number,
    dto: SendTutorMessageDto,
  ): Promise<StructuredTutorResponseDto> {
    const startTime = Date.now();

    // 1. Resolve or create conversation with strict user ownership
    const conversation = await this.conversationService.getOrCreateConversation(
      userId,
      dto.conversationId,
      {
        topicId: dto.topicId,
        moduleId: dto.moduleId,
        courseId: dto.courseId,
      },
    );

    // 2. Process student message with NLP understanding
    const nlpResult = await this.tutorNlpService.process(dto.message, dto.mode);
    const effectiveMode = dto.mode || nlpResult.recommendedMode;

    // 3. Deterministic math evaluation / verification
    let mathVerification: MathVerificationResult | null = null;
    if (nlpResult.mathExpression) {
      mathVerification = this.mathSolverService.verify(
        nlpResult.mathExpression,
        nlpResult.studentAnswer,
      );
    }

    // 4. Retrieve bounded learner context
    const learnerContext = await this.tutorContextService.buildContext(
      userId,
      dto.topicId,
      dto.moduleId,
      dto.courseId,
      conversation.summary,
    );

    // 5. Retrieve curriculum knowledge (RAG)
    const knowledge = await this.knowledgeService.retrieveRelevant({
      topicId: dto.topicId,
      technique: nlpResult.technique,
      sutra: nlpResult.sutra,
      query: dto.message,
    });

    // 6. Fetch recent conversation memory
    const recentHistory = await this.conversationService.getRecentMessages(
      conversation.id,
      6,
    );

    // 7. Persist user message to conversation memory
    await this.conversationService.addMessage(
      conversation.id,
      'user',
      dto.message,
      {
        intent: nlpResult.intent,
        mode: effectiveMode,
      },
    );

    // 8. Build structured prompt
    const promptRequest = this.promptService.buildPrompt({
      studentMessage: dto.message,
      nlp: nlpResult,
      mode: effectiveMode,
      context: learnerContext,
      knowledge,
      recentHistory,
      mathVerification,
    });

    // 9. Invoke LLM provider via clean abstraction
    const llmResponse = await this.llmService.generateResponse(promptRequest);

    // 10. Run response guardrails
    const finalResponseText = this.guardrailService.applyGuardrails({
      rawResponse: llmResponse.content,
      mode: effectiveMode,
      mathVerification,
    });

    // 11. Persist assistant message to conversation memory
    const assistantMessage = await this.conversationService.addMessage(
      conversation.id,
      'assistant',
      finalResponseText,
      {
        intent: nlpResult.intent,
        mode: effectiveMode,
        math: mathVerification,
        latencyMs: llmResponse.latencyMs,
        modelName: llmResponse.modelName,
        providerName: llmResponse.providerName,
      },
    );

    // 12. Build math feedback (protecting answers in HINT mode)
    let mathFeedback: MathFeedback | null = null;
    if (mathVerification && mathVerification.parsedResult !== null) {
      if (effectiveMode === TutorMode.HINT) {
        // DO NOT expose correctAnswer in HINT mode
        mathFeedback = {
          expression: mathVerification.expression,
          studentAnswer: mathVerification.studentAnswer || null,
          correctAnswer: null,
          isCorrect: null,
        };
      } else {
        mathFeedback = {
          expression: mathVerification.expression,
          studentAnswer: mathVerification.studentAnswer || null,
          correctAnswer: String(mathVerification.parsedResult),
          isCorrect: mathVerification.isCorrect,
        };
      }
    }

    // 13. Map source references
    const sourceRefs: SourceReference[] = knowledge.map((k) => ({
      title: k.title,
      sutra: k.sutra,
      technique: k.technique,
      source: k.source,
    }));

    // 14. Calculate pedagogical suggested actions
    const suggestedActions = this.calculateSuggestedActions(
      effectiveMode,
      mathVerification,
    );

    this.logger.log(
      `Tutor pipeline completed for user ${userId} in ${Date.now() - startTime}ms [Intent: ${nlpResult.intent}, Mode: ${effectiveMode}]`,
    );

    return {
      conversationId: conversation.id,
      messageId: assistantMessage.id,
      intent: nlpResult.intent,
      mode: effectiveMode,
      response: finalResponseText,
      math: mathFeedback,
      sourceRefs,
      suggestedActions,
    };
  }

  private calculateSuggestedActions(
    mode: TutorMode,
    mathVerification?: MathVerificationResult | null,
  ): string[] {
    switch (mode) {
      case TutorMode.HINT:
        return ['TRY_NEXT_STEP', 'ASK_ANOTHER_HINT', 'SHOW_SOLUTION'];

      case TutorMode.CHECK_ANSWER:
        if (mathVerification?.isCorrect === true) {
          return ['TRY_SIMILAR_PROBLEM', 'NEXT_DIFFICULTY', 'LEARN_NEW_SUTRA'];
        }
        return ['EXPLAIN_MY_MISTAKE', 'GIVE_ME_A_HINT', 'TRY_AGAIN'];

      case TutorMode.GUIDED:
        return ['NEXT_STEP', 'SHOW_EXAMPLE', 'EXPLAIN_WHY'];

      case TutorMode.SOLUTION:
        return ['PRACTICE_ANOTHER', 'EXPLAIN_METHOD', 'TEST_MY_SPEED'];

      case TutorMode.PRACTICE:
        return ['CHECK_MY_ANSWER', 'GIVE_HINT', 'EXPLAIN_RULE'];

      case TutorMode.CONCEPT:
      default:
        return ['SHOW_EXAMPLE', 'PRACTICE_THIS_SUTRA', 'ASK_A_DOUBT'];
    }
  }

  // ==========================================
  // Legacy Methods preserved for compatibility
  // ==========================================

  async generateTutorResponse(student: StudentProfile): Promise<TutorResponse> {
    const feedback = await this.doubtSolverService.answerDoubt(
      student.weakTopics[0] || 'general',
      'Can you explain my recent mistakes?',
    );
    const recommendation =
      await this.recommendationService.recommendNextTopic(student);
    const studyPlan = await this.studyPlannerService.generateStudyPlan(student);
    const motivation = await this.motivationService.generateMotivation(student);

    return {
      feedback,
      recommendation,
      studyPlan,
      motivation,
    };
  }

  async generateTutorResponseForUser(userId: number) {
    const profile = await this.profileBuilder.build(userId);
    return this.generateTutorResponse(profile);
  }

  async analyzeStudentMistake(
    topic: string,
    question: string,
    studentAnswer: string,
    correctAnswer: string,
  ): Promise<string> {
    return this.mistakeAnalyzerService.analyzeMistake(
      topic,
      question,
      studentAnswer,
      correctAnswer,
    );
  }

  async getDoubtExplanation(topic: string, question: string): Promise<string> {
    return this.doubtSolverService.answerDoubt(topic, question);
  }
}
