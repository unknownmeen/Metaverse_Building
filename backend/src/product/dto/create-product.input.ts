import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { sanitizeString } from '../../common/utils/sanitize.util';

@InputType()
export class CreateProductInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'عنوان محصول الزامی است' })
  @MaxLength(200, { message: 'عنوان محصول نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد' })
  @Transform(({ value }) => sanitizeString(value))
  title: string;

  @Field({ defaultValue: '' })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'توضیحات نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد' })
  @Transform(({ value }) => (typeof value === 'string' ? sanitizeString(value) : value))
  description?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  parentId: string;
}
