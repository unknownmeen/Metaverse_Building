import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { sanitizeString } from '../../common/utils/sanitize.util';

@InputType()
export class UpdateJudgingStepInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'عنوان گام داوری الزامی است' })
  @MaxLength(200, { message: 'عنوان گام داوری نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد' })
  @Transform(({ value }) => (typeof value === 'string' ? sanitizeString(value) : value))
  title?: string;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsInt()
  judgeId?: number;
}
