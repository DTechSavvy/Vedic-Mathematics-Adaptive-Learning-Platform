import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AppService } from './app.service';
import { AiTutorModule } from './ai-tutor/ai-tutor.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CourseModule } from './course/course.module';
import { ModuleModule } from './module/module.module';
import { TopicModule } from './topic/topic.module';
import { LessonModule } from './lesson/lesson.module';
import { QuestionModule } from './question/question.module';
import { ProgressModule } from './progress/progress.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { AchievementModule } from './achievement/achievement.module';
import { NlpModule } from './nlp/nlp.module';
import { CurriculumModule } from './curriculum/curriculum.module';
import { validateEnvironment } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
      envFilePath: ['.env'],
    }),
    PrismaModule,
    AiTutorModule,
    AuthModule,
    UsersModule,
    CourseModule,
    ModuleModule,
    TopicModule,
    LessonModule,
    QuestionModule,
    ProgressModule,
    LeaderboardModule,
    AchievementModule,
    NlpModule,
    CurriculumModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
