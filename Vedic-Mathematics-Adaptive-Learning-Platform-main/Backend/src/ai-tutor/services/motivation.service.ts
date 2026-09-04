import { Injectable } from '@nestjs/common';
import { StudentProfile } from '../interfaces/student-profile.interface';

@Injectable()
export class MotivationService {
  async generateMotivation(student: StudentProfile): Promise<string> {
    // Placeholder for AI integration and rule-based logic
    console.log(`MotivationService: Generating motivation for user ${student.userId}`);

    const motivations = [
      `Great work, ${student.userId}! Your accuracy is ${student.accuracy}%. Keep it up!`,
      `You've made significant progress. Focus on your weak topics like ${student.weakTopics[0] || 'fractions'} to improve further.`,
      `Every mistake is a learning opportunity. You're doing great!`,
      `Your mastery is ${student.mastery}%. Keep pushing to reach new heights!`,
    ];

    const randomIndex = Math.floor(Math.random() * motivations.length);
    return motivations[randomIndex];
  }
}
