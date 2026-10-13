import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { TutorMode } from '../enums/tutor-mode.enum';

export class ImagePayloadDto {
  @IsString()
  @IsNotEmpty()
  data!: string; // Base64 encoded image string

  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @IsOptional()
  @IsString()
  fileName?: string;
}

export class SendTutorMessageDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message!: string;

  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  @IsInt()
  courseId?: number;

  @IsOptional()
  @IsInt()
  moduleId?: number;

  @IsOptional()
  @IsInt()
  topicId?: number;

  @IsOptional()
  @IsEnum(TutorMode)
  mode?: TutorMode;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ImagePayloadDto)
  image?: ImagePayloadDto;
}

