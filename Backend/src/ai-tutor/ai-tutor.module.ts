import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NlpModule } from '../nlp/nlp.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AiTutorController } from './ai-tutor.controller';
import { AiTutorService } from './ai-tutor.service';
import { GeminiProvider } from './providers/gemini.provider';
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

import { AiRateLimitGuard } from './guards/ai-rate-limit.guard';

@Module({
  imports: [PrismaModule, NlpModule, ConfigModule],
  controllers: [AiTutorController],
  providers: [
    AiTutorService,
    AiRateLimitGuard,
    TutorNlpService,
    MathSolverService,
    KnowledgeService,
    TutorContextService,
    ConversationService,
    PromptService,
    LlmService,
    GeminiProvider,
    GuardrailService,
    // Legacy support services
    StudentProfileBuilderService,
    DoubtSolverService,
    MistakeAnalyzerService,
    StudyPlannerService,
    RecommendationService,
    MotivationService,
  ],
  exports: [
    AiTutorService,
    ConversationService,
    KnowledgeService,
    MathSolverService,
  ],
})
export class AiTutorModule {}
