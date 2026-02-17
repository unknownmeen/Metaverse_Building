import { IsString, IsNotEmpty, IsInt, MaxLength } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { sanitizeString } from '../../common/utils/sanitize.util';

@InputType()
export class CreateJudgingStepInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'عنوان گام داوری الزامی است' })
  @MaxLength(200, { message: 'عنوان گام داوری نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد' })
  @Transform(({ value }) => sanitizeString(value))
  title: string;

  @Field(() => Number)
  @IsInt()
  judgeId: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  missionId: string;
}
