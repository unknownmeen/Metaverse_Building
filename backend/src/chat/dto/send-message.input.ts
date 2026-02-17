import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { sanitizeString } from '../../common/utils/sanitize.util';

@InputType()
export class SendMessageInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  missionId: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Message text cannot be empty' })
  @MaxLength(5000, { message: 'Message text cannot exceed 5000 characters' })
  @Transform(({ value }) => sanitizeString(value))
  text: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'File name cannot exceed 255 characters' })
  fileName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'File URL cannot exceed 1000 characters' })
  fileUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64, { message: 'Invalid judging step id' })
  stepId?: string;
}
