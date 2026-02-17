import { IsEnum } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { StepStatus } from '@prisma/client';

@InputType()
export class UpdateStepStatusInput {
  @Field(() => StepStatus)
  @IsEnum(StepStatus)
  status: StepStatus;
}