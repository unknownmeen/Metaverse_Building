import { IsString, IsNotEmpty, IsOptional, IsInt, IsEnum, IsDateString, MaxLength } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { Priority } from '@prisma/client';
import { sanitizeString } from '../../common/utils/sanitize.util';
import { IsFutureDate } from '../../common/validators/is-future-date.validator';

@InputType()
export class CreateMissionInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'عنوان مأموریت الزامی است' })
  @MaxLength(200, { message: 'عنوان مأموریت نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد' })
  @Transform(({ value }) => sanitizeString(value))
  title: string;

  @Field({ defaultValue: '' })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'توضیحات نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد' })
  @Transform(({ value }) => (typeof value === 'string' ? sanitizeString(value) : value))
  description?: string;

  @Field(() => Priority, { defaultValue: 'NORMAL' })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @Field()
  @IsDateString({}, { message: 'فرمت تاریخ سررسید نامعتبر است' })
  @IsFutureDate()
  dueDate: string;

  @Field(() => Number)
  @IsInt()
  assigneeId: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  productId: string;
}
