import { IsString, IsOptional, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { sanitizeString } from '../../common/utils/sanitize.util';
import { IsValidAvatar } from '../../common/validators/is-valid-avatar.validator';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'نام کاربری نمی‌تواند خالی باشد' })
  @MaxLength(100, { message: 'نام کاربری نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد' })
  @Transform(({ value }) => (typeof value === 'string' ? sanitizeString(value) : value))
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsValidAvatar()
  avatarId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'رمز عبور باید حداقل ۶ کاراکتر باشد' })
  @MaxLength(128, { message: 'رمز عبور نمی‌تواند بیشتر از ۱۲۸ کاراکتر باشد' })
  password?: string;
}
