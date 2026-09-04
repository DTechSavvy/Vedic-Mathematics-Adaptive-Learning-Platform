import { Injectable } from '@nestjs/common';

import { ProcessedText } from '../interfaces/processed-text.interface';
import { EntityResult } from '../interfaces/entity-result.interface';

import { MATH_CONCEPTS } from '../constants/entities/math-concepts';
import { MATH_OPERATIONS } from '../constants/entities/math-operations';
import { VEDIC_TECHNIQUES } from '../constants/entities/vedic-techniques';

@Injectable()
export class EntityExtractorService {
  extract(processed: ProcessedText): EntityResult {
    const concepts: string[] = [];

    const techniques: string[] = [];

    const operations: string[] = [];

    const formulas: string[] = [];

    const numbers: number[] = [];

    const entities: string[] = [];

    for (const token of processed.correctedTokens) {
      if (MATH_CONCEPTS.includes(token)) {
        concepts.push(token);
      }

      if (VEDIC_TECHNIQUES.includes(token)) {
        techniques.push(token);
      }

      if (MATH_OPERATIONS.includes(token)) {
        operations.push(token);
      }

      if (/^\d+$/.test(token)) {
        numbers.push(Number(token));
      }
    }

    entities.push(
      ...concepts,

      ...techniques,

      ...operations,

      ...formulas,
    );

    return {
      concepts,

      techniques,

      operations,

      formulas,

      numbers,

      entities: [...new Set(entities)],
    };
  }
}
