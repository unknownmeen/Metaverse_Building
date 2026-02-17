import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { StepStatus } from '@prisma/client';
import { UserEntity } from '../../user/entities/user.entity';

registerEnumType(StepStatus, { name: 'StepStatus' });

@ObjectType()
export class JudgingStepEntity {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field(() => StepStatus)
  status: StepStatus;

  @Field(() => Number)
  order: number;

  @Field(() => UserEntity, { nullable: true })
  judge?: UserEntity;
}