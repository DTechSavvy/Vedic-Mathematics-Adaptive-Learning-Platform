import { Injectable } from '@nestjs/common';

@Injectable()
export class MistakeAnalyzerService {
  async analyzeMistake(
    topic: string,
    question: string,
    studentAnswer: string,
    correctAnswer: string,
  ): Promise<string> {

    if (studentAnswer === correctAnswer) {
      return 'Answer is correct.';
    }

    switch (topic) {

      case 'Nikhilam Subtraction':
        return this.analyzeNikhilamMistake(
          studentAnswer,
          correctAnswer,
        );

      case 'Addition Without Carrying':
        return this.analyzeAdditionMistake(
          studentAnswer,
          correctAnswer,
        );

      default:
        return `
Incorrect answer.

Expected: ${correctAnswer}

Received: ${studentAnswer}

More detailed analysis will be available in future versions.
`;
    }
  }

  private analyzeNikhilamMistake(
    studentAnswer: string,
    correctAnswer: string,
  ): string {

    const diff =
      Math.abs(
        Number(studentAnswer) -
        Number(correctAnswer),
      );

    if (diff <= 2) {
      return `
You are very close.

Likely mistake:
Complement calculation error.

Correct answer:
${correctAnswer}
`;
    }

    return `
Incorrect Nikhilam subtraction.

Check your complement calculation carefully.

Correct answer:
${correctAnswer}
`;
  }

  private analyzeAdditionMistake(
    studentAnswer: string,
    correctAnswer: string,
  ): string {

    return `
Addition mistake detected.

Verify each digit separately and avoid carrying.

Correct answer:
${correctAnswer}
`;
  }
}
