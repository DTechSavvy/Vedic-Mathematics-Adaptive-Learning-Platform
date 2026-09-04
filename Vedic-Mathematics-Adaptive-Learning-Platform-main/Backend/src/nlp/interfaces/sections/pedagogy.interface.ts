import { DifficultyResult } from '../difficulty-result.interface';
import { BloomResult } from '../bloom-result.interface';
import { MisconceptionResult } from '../misconception-result.interface';

export interface NLPPedagogy {

  difficulty: DifficultyResult;

  bloom: BloomResult;

  misconception: MisconceptionResult;

}