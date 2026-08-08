import { Injectable, Logger } from '@nestjs/common';

import { NLPOrchestratorService } from '../services/nlp-orchestrator.service';

import { GOLDEN_DATASET } from './golden-dataset';

@Injectable()
export class GoldenTestService {

  private readonly logger = new Logger(GoldenTestService.name);

  constructor(

    private readonly orchestrator: NLPOrchestratorService,

  ) {}

  async run(): Promise<void> {

    let intentCorrect = 0;
    let topicCorrect = 0;
    let emotionCorrect = 0;
    let goalCorrect = 0;
    let bloomCorrect = 0;
    let difficultyCorrect = 0;
    let misconceptionCorrect = 0;

    const total = GOLDEN_DATASET.length;

    this.logger.log(`Running ${total} Golden Dataset Tests...\n`);

    for (const sample of GOLDEN_DATASET) {

      const result = await this.orchestrator.analyze(sample.input);

      //-------------------------
      // Intent
      //-------------------------

      const predictedIntent =
        result.semantics.intent.primaryIntent;

      if (predictedIntent === sample.intent)
        intentCorrect++;

      //-------------------------
      // Topic
      //-------------------------

      const predictedTopic =
        result.semantics.topic.topic;

      if (predictedTopic === sample.topic)
        topicCorrect++;

      //-------------------------
      // Emotion
      //-------------------------

      const predictedEmotion =
        result.semantics.emotion.emotion;

      if (predictedEmotion === sample.emotion)
        emotionCorrect++;

      //-------------------------
      // Learning Goal
      //-------------------------

      const predictedGoal =
        result.semantics.learningGoal.goal;

      if (predictedGoal === sample.goal)
        goalCorrect++;

      //-------------------------
      // Bloom
      //-------------------------

      const predictedBloom =
        result.pedagogy.bloom.level;

      if (predictedBloom === sample.bloom)
        bloomCorrect++;

      //-------------------------
      // Difficulty
      //-------------------------

      const predictedDifficulty =
        result.pedagogy.difficulty.difficulty;

      if (predictedDifficulty === sample.difficulty)
        difficultyCorrect++;

      //-------------------------
      // Misconception
      //-------------------------

      const predictedMisconception =
        result.pedagogy.misconception.type;

      if (
        predictedMisconception === sample.misconception
      )
        misconceptionCorrect++;

      //-------------------------
      // Failed Cases
      //-------------------------

      const failed =

        predictedIntent !== sample.intent ||

        predictedTopic !== sample.topic ||

        predictedEmotion !== sample.emotion ||

        predictedGoal !== sample.goal ||

        predictedBloom !== sample.bloom ||

        predictedDifficulty !== sample.difficulty ||

        predictedMisconception !== sample.misconception;

      if (failed) {

        this.logger.warn('====================================');

        this.logger.warn(`INPUT`);

        this.logger.warn(sample.input);

        this.logger.warn('EXPECTED');

        this.logger.warn({

          intent: sample.intent,

          topic: sample.topic,

          emotion: sample.emotion,

          goal: sample.goal,

          bloom: sample.bloom,

          difficulty: sample.difficulty,

          misconception: sample.misconception,

        });

        this.logger.warn('PREDICTED');

        this.logger.warn({

          intent: predictedIntent,

          topic: predictedTopic,

          emotion: predictedEmotion,

          goal: predictedGoal,

          bloom: predictedBloom,

          difficulty: predictedDifficulty,

          misconception: predictedMisconception,

        });

      }

    }

    //-------------------------
    // Final Report
    //-------------------------

    this.logger.log('\n');

    this.logger.log('=========================================');
    this.logger.log('      GOLDEN DATASET TEST REPORT');
    this.logger.log('=========================================');

    this.logger.log(
      `Intent Accuracy        : ${((intentCorrect / total) * 100).toFixed(2)}%`,
    );

    this.logger.log(
      `Topic Accuracy         : ${((topicCorrect / total) * 100).toFixed(2)}%`,
    );

    this.logger.log(
      `Emotion Accuracy       : ${((emotionCorrect / total) * 100).toFixed(2)}%`,
    );

    this.logger.log(
      `Learning Goal Accuracy : ${((goalCorrect / total) * 100).toFixed(2)}%`,
    );

    this.logger.log(
      `Bloom Accuracy         : ${((bloomCorrect / total) * 100).toFixed(2)}%`,
    );

    this.logger.log(
      `Difficulty Accuracy    : ${((difficultyCorrect / total) * 100).toFixed(2)}%`,
    );

    this.logger.log(
      `Misconception Accuracy : ${((misconceptionCorrect / total) * 100).toFixed(2)}%`,
    );

    this.logger.log('=========================================');

  }

}