import { IsString, IsOptional, IsNotEmpty, IsEnum, IsDateString, MaxLength } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { Priority } from '@prisma/client';
import { sanitizeString } from '../../common/utils/sanitize.util';
import { IsFutureDate } from '../../common/validators/is-future-date.validator';

@InputType()
export class UpdateMissionInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'عنوان مأموریت نمی‌تواند خالی باشد' })
  @MaxLength(200, { message: 'عنوان مأموریت نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد' })
  @Transform(({ value }) => (typeof value === 'string' ? sanitizeString(value) : value))
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'توضیحات نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد' })
  @Transform(({ value }) => (typeof value === 'string' ? sanitizeString(value) : value))
  description?: string;

  @Field(() => Priority, { nullable: true })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString({}, { message: 'فرمت تاریخ سررسید نامعتبر است' })
  @IsFutureDate()
  dueDate?: string;
}
