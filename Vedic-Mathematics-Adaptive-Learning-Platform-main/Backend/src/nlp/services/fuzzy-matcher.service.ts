import { Injectable } from '@nestjs/common';

@Injectable()
export class FuzzyMatcherService {

  calculateDistance(a: string, b: string): number {

    const matrix: number[][] = [];

    const aLength = a.length;
    const bLength = b.length;

    for (let i = 0; i <= bLength; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= aLength; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= bLength; i++) {

      for (let j = 1; j <= aLength; j++) {

        if (b.charAt(i - 1) === a.charAt(j - 1)) {

          matrix[i][j] = matrix[i - 1][j - 1];

        } else {

          matrix[i][j] = Math.min(

            matrix[i - 1][j - 1] + 1,

            matrix[i][j - 1] + 1,

            matrix[i - 1][j] + 1,

          );

        }

      }

    }

    return matrix[bLength][aLength];

  }

  similarity(a: string, b: string): number {

    const distance = this.calculateDistance(a, b);

    const maxLength = Math.max(a.length, b.length);

    if (maxLength === 0) {

      return 1;

    }

    return Number((1 - distance / maxLength).toFixed(2));

  }

  findBestMatch(

    input: string,

    dictionary: string[],

  ) {

    let bestWord = input;

    let bestScore = 0;

    for (const word of dictionary) {

      const score = this.similarity(

        input.toLowerCase(),

        word.toLowerCase(),

      );

      if (score > bestScore) {

        bestScore = score;

        bestWord = word;

      }

    }

    return {

      corrected: bestWord,

      confidence: bestScore,

    };

  }

}