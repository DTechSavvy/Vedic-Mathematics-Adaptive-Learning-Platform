import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitAnswerDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'questionId must be a valid number' })
  @IsNotEmpty({ message: 'questionId is required' })
  questionId: number;

  @IsString({ message: 'answer must be a string' })
  @IsNotEmpty({ message: 'answer cannot be empty' })
  answer: string;
}
