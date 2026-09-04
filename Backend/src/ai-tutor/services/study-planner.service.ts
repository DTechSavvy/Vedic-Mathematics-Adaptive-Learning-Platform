import { Injectable } from '@nestjs/common';
import { StudentProfile } from '../interfaces/student-profile.interface';

@Injectable()
export class StudyPlannerService {
  async generateStudyPlan(student: StudentProfile): Promise<string[]> {
    // Placeholder for AI integration and rule-based logic
    console.log(
      `StudyPlannerService: Generating study plan for user ${student.userId}`,
    );
    const studyPlan: string[] = [];

    if (student.mastery < 40) {
      studyPlan.push('Prioritize revision on weak topics.');
      student.weakTopics.forEach((topic) => studyPlan.push(`Revise ${topic}`));
    } else if (student.mastery > 80) {
      studyPlan.push('Engage in advanced practice on strong topics.');
      student.strongTopics.forEach((topic) =>
        studyPlan.push(`Advanced practice for ${topic}`),
      );
    }

    // Example of adding more general practice
    studyPlan.push('Practice 10 mixed questions.');

    return studyPlan;
  }
}
