import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import type { MathVerificationResult } from './interfaces/math-verification.interface';
import { SendTutorMessageDto } from './dto/tutor-message.dto';
import {
  MathFeedback,
  SourceReference,
  StructuredTutorResponseDto,
} from './dto/tutor-response.dto';
import { TutorMode } from './enums/tutor-mode.enum';
import { TutorIntent } from './enums/tutor-intent.enum';
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
import { ImageAnalysisService, ImageAnalysisResult } from './services/image-analysis.service';
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
    private readonly imageAnalysisService: ImageAnalysisService,
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

    // 2. Multimodal Image Analysis & Guardrail
    let imageAnalysis: ImageAnalysisResult | null = null;
    let inlineImage: { data: string; mimeType: string } | undefined = undefined;

    if (dto.image && dto.image.data) {
      const validated = this.imageAnalysisService.validateImage(dto.image);
      inlineImage = { data: validated.cleanBase64, mimeType: validated.mimeType };

      imageAnalysis = await this.imageAnalysisService.analyzeAndVerifyImage(
        dto.image,
        dto.message,
      );

      // Handle Image Domain Guardrail or Clarification redirection
      if (imageAnalysis.guardrailResponse) {
        await this.conversationService.addMessage(
          conversation.id,
          'user',
          dto.message || 'Please analyze this mathematical problem image.',
          {
            attachmentType: 'image',
            mimeType: validated.mimeType,
            fileName: dto.image.fileName || 'problem.png',
            imageAnalysis: imageAnalysis.understanding,
          },
        );
        const assistantMsg = await this.conversationService.addMessage(
          conversation.id,
          'assistant',
          imageAnalysis.guardrailResponse,
          {
            isGuardrailRedirect: imageAnalysis.isOffTopic,
            requiresClarification: imageAnalysis.understanding.requiresClarification,
            imageAnalysis: imageAnalysis.understanding,
          },
        );
        return {
          conversationId: conversation.id,
          messageId: assistantMsg.id,
          response: imageAnalysis.guardrailResponse,
          mode: dto.mode || TutorMode.CONCEPT,
          intent: TutorIntent.ASK_CONCEPT,
          math: null,
          sourceRefs: [
            {
              title: 'Vedic Mathematics Tutor Guardrail',
              sutra: 'General Vedic Math',
              technique: 'Domain & Image Verification',
            },
          ],
          suggestedActions: [
            'How does Nikhilam multiplication work?',
            'Show me how to multiply 98 × 97 mentally',
            'Explain Urdhva Tiryagbhyam sutra',
          ],
          imageUnderstanding: {
            correlationId: imageAnalysis.understanding.correlationId,
            isImageReadable: imageAnalysis.understanding.isImageReadable,
            containsMathematics: imageAnalysis.understanding.containsMathematics,
            detectedContentType: imageAnalysis.understanding.detectedContentType,
            extractedText: imageAnalysis.understanding.extractedText,
            mathematicalExpression: imageAnalysis.understanding.mathematicalExpression,
            confidence: imageAnalysis.understanding.confidence,
          },
        };
      }
    } else {
      // Check if user is referencing an image that wasn't attached
      const refersToImage =
        /\b(?:img|image|photo|picture|pic|screenshot)\b/i.test(dto.message) &&
        /\b(?:look|see|check|explain|solve|view|analyze|read|go through|attached|in the)\b/i.test(dto.message);

      if (refersToImage) {
        const helpfulResponse =
          "It looks like you're referring to an image, but no image file was attached to your message. Please click the **camera icon** (📷) in the input bar below to select and upload your photo or screenshot of the Vedic mathematics problem, and I will be delighted to analyze it step-by-step for you!";

        await this.conversationService.addMessage(
          conversation.id,
          'user',
          dto.message,
          { intent: 'missing_image_attachment', mode: dto.mode || TutorMode.CONCEPT },
        );
        const assistantMsg = await this.conversationService.addMessage(
          conversation.id,
          'assistant',
          helpfulResponse,
          { isMissingImageGuidance: true },
        );
        return {
          conversationId: conversation.id,
          messageId: assistantMsg.id,
          response: helpfulResponse,
          mode: dto.mode || TutorMode.CONCEPT,
          intent: TutorIntent.ASK_CONCEPT,
          math: null,
          sourceRefs: [
            {
              title: 'Vedic Mathematics Visual Tutor',
              sutra: 'General Vedic Math',
              technique: 'Multimodal Problem Solving',
            },
          ],
          suggestedActions: [
            'Click camera icon to upload problem photo',
            'How does Nikhilam multiplication work?',
            'Explain Urdhva Tiryagbhyam sutra',
          ],
        };
      }

      // Text-only Domain Guardrail Check
      const domainCheck = this.guardrailService.isOffTopic(dto.message);
      if (domainCheck.isOffTopic && domainCheck.redirectResponse) {
        await this.conversationService.addMessage(
          conversation.id,
          'user',
          dto.message,
          { intent: 'off_topic', mode: dto.mode || TutorMode.CONCEPT },
        );
        const assistantMsg = await this.conversationService.addMessage(
          conversation.id,
          'assistant',
          domainCheck.redirectResponse,
          { isGuardrailRedirect: true },
        );
        return {
          conversationId: conversation.id,
          messageId: assistantMsg.id,
          response: domainCheck.redirectResponse,
          mode: dto.mode || TutorMode.CONCEPT,
          intent: TutorIntent.ASK_CONCEPT,
          math: null,
          sourceRefs: [
            {
              title: 'Vedic Mathematics Curriculum Guide',
              sutra: 'General Vedic Math',
              technique: 'Domain Guardrail',
            },
          ],
          suggestedActions: [
            'How does Nikhilam multiplication work?',
            'Show me how to multiply 98 × 97 mentally',
            'Explain Urdhva Tiryagbhyam sutra',
          ],
        };
      }
    }

    // 3. Process student message with NLP understanding
    const nlpResult = await this.tutorNlpService.process(
      dto.message || (imageAnalysis?.understanding.extractedText ?? ''),
      dto.mode,
    );
    const effectiveMode = dto.mode || nlpResult.recommendedMode;

    // 4. Deterministic math evaluation / verification (prioritize verified image math)
    let mathVerification: MathVerificationResult | null = null;
    if (imageAnalysis?.mathVerification) {
      mathVerification = imageAnalysis.mathVerification;
    } else if (nlpResult.mathExpression) {
      mathVerification = this.mathSolverService.verify(
        nlpResult.mathExpression,
        nlpResult.studentAnswer,
      );
    }

    // 5. Retrieve bounded learner context
    const learnerContext = await this.tutorContextService.buildContext(
      userId,
      dto.topicId || imageAnalysis?.matchedTopicId,
      dto.moduleId,
      dto.courseId,
      conversation.summary,
    );

    // 6. Retrieve curriculum knowledge (RAG)
    const knowledge = await this.knowledgeService.retrieveRelevant({
      topicId: dto.topicId || imageAnalysis?.matchedTopicId,
      technique: nlpResult.technique || imageAnalysis?.understanding.detectedTopic || undefined,
      sutra: nlpResult.sutra || imageAnalysis?.understanding.detectedSutra || undefined,
      query: dto.message || (imageAnalysis?.understanding.extractedText ?? ''),
    });

    // 6. Fetch recent conversation memory
    const recentHistory = await this.conversationService.getRecentMessages(
      conversation.id,
      6,
    );

    // Build structured prompt with image understanding
    const promptRequest = this.promptService.buildPrompt({
      studentMessage: dto.message || (imageAnalysis ? 'Please analyze this problem and provide the step-by-step Vedic solution.' : ''),
      nlp: nlpResult,
      mode: effectiveMode,
      context: learnerContext,
      knowledge,
      recentHistory,
      mathVerification,
      inlineImage,
      imageUnderstanding: imageAnalysis?.understanding,
    });

    // Invoke LLM provider via clean abstraction
    const llmResponse = await this.llmService.generateResponse(promptRequest);

    // Run response guardrails
    const finalResponseText = this.guardrailService.applyGuardrails({
      rawResponse: llmResponse.content,
      mode: effectiveMode,
      mathVerification,
    });

    const userMetadata: Record<string, any> = { intent: nlpResult.intent, mode: effectiveMode };
    if (dto.image) {
      userMetadata.attachmentType = 'image';
      userMetadata.mimeType = dto.image.mimeType;
      userMetadata.fileName = dto.image.fileName || 'problem.png';
    }

    await this.conversationService.addMessage(
      conversation.id,
      'user',
      dto.message,
      userMetadata,
    );
    await this.conversationService.setTitleFromMessage(
      conversation.id,
      dto.message,
    );

    // Persist assistant message to conversation memory
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
      imageUnderstanding: imageAnalysis?.understanding
        ? {
            correlationId: imageAnalysis.understanding.correlationId,
            isImageReadable: imageAnalysis.understanding.isImageReadable,
            containsMathematics: imageAnalysis.understanding.containsMathematics,
            detectedContentType: imageAnalysis.understanding.detectedContentType,
            extractedText: imageAnalysis.understanding.extractedText,
            mathematicalExpression: imageAnalysis.understanding.mathematicalExpression,
            confidence: imageAnalysis.understanding.confidence,
          }
        : null,
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
