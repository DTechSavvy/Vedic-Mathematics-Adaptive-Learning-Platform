import { Injectable } from '@nestjs/common';
import { StudentProfile } from '../interfaces/student-profile.interface';

@Injectable()
export class RecommendationService {
  async recommendNextTopic(
    student: StudentProfile,
  ): Promise<string> {

    if (
      student.mistakeAnalysis &&
      student.mistakeAnalysis.length > 0
    ) {
      const latestMistake =
        student.mistakeAnalysis[0];

      if (
        latestMistake.includes(
          'Complement',
        )
      ) {
        return `
You appear to be struggling with complement calculations.

Recommended Topic:
Nikhilam Subtraction

Recommended Action:
Practice 10 complement-finding exercises before attempting full subtraction questions.
`;
      }

      if (
        latestMistake.includes(
          'Addition',
        )
      ) {
        return `
You are making mistakes in digit-wise addition.

Recommended Topic:
Addition Without Carrying

Recommended Action:
Practice 10 addition questions while focusing on each digit separately.
`;
      }
    }

    if (
      student.weakTopics &&
      student.weakTopics.length > 0
    ) {
      return `
Focus on improving:

${student.weakTopics[0]}

Current mastery is below target.

Recommended Action:
Solve 10-15 additional practice questions in this topic.
`;
    }

    if (
      student.strongTopics &&
      student.strongTopics.length > 0
    ) {
      const randomIndex =
        Math.floor(
          Math.random() *
            student.strongTopics.length,
        );

      return `
You are performing well in:

${student.strongTopics[randomIndex]}

Recommended Action:
Attempt more challenging questions to increase mastery.
`;
    }

    return `
No major weaknesses detected.

Recommended Action:
Explore a new topic and continue regular practice.
`;
  }
}