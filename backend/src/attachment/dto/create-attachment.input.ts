import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsUrl } from 'class-validator';
import { AttachmentType } from '@prisma/client';

@InputType()
export class CreateAttachmentInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  url: string;

  @Field(() => AttachmentType)
  @IsEnum(AttachmentType)
  type: AttachmentType;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  productId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  missionId?: string;
}
