import { Injectable } from '@nestjs/common';
import { StudentProfile } from './interfaces/student-profile.interface';
import { TutorResponse } from './interfaces/tutor-response.interface';

import { DoubtSolverService } from './services/doubt-solver.service';
import { MistakeAnalyzerService } from './services/mistake-analyzer.service';
import { StudyPlannerService } from './services/study-planner.service';
import { RecommendationService } from './services/recommendation.service';
import { MotivationService } from './services/motivation.service';
import { StudentProfileBuilderService } from './student-profile-builder.service';
@Injectable()
export class AiTutorService {
  constructor(
    private readonly doubtSolverService: DoubtSolverService,
    private readonly mistakeAnalyzerService: MistakeAnalyzerService,
    private readonly studyPlannerService: StudyPlannerService,
    private readonly recommendationService: RecommendationService,
    private readonly motivationService: MotivationService,
    private readonly profileBuilder: StudentProfileBuilderService,
  ) {}

  async generateTutorResponse(student: StudentProfile): Promise<TutorResponse> {
    // Orchestrate calls to individual services
    const feedback = await this.doubtSolverService.answerDoubt(
      student.weakTopics[0] || 'general',
      'Can you explain my recent mistakes?',
    );
    const recommendation = await this.recommendationService.recommendNextTopic(student);
    const studyPlan = await this.studyPlannerService.generateStudyPlan(student);
    const motivation = await this.motivationService.generateMotivation(student);

    return {
      feedback,
      recommendation,
      studyPlan,
      motivation,
    };
  }

  async generateTutorResponseForUser(
    userId: number,
  ) {
    const profile =
      await this.profileBuilder.build(
        userId,
    );

  return this.generateTutorResponse(
    profile,
  );
 }

  // Example of how other services might be called directly if needed
  async analyzeStudentMistake(
    topic: string,
    question: string,
    studentAnswer: string,
    correctAnswer: string,
  ): Promise<string> {
    return this.mistakeAnalyzerService.analyzeMistake(topic, question, studentAnswer, correctAnswer);
  }

  async getDoubtExplanation(topic: string, question: string): Promise<string> {
    return this.doubtSolverService.answerDoubt(topic, question);
  }
}
