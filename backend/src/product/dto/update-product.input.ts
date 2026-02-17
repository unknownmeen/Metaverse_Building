import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { sanitizeString } from '../../common/utils/sanitize.util';

@InputType()
export class UpdateProductInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'عنوان محصول نمی‌تواند خالی باشد' })
  @MaxLength(200, { message: 'عنوان محصول نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد' })
  @Transform(({ value }) => (typeof value === 'string' ? sanitizeString(value) : value))
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'توضیحات نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد' })
  @Transform(({ value }) => (typeof value === 'string' ? sanitizeString(value) : value))
  description?: string;
}
