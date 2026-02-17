import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { MissionStatus, Priority } from '@prisma/client';
import { UserEntity } from '../../user/entities/user.entity';
import { JudgingStepEntity } from '../../judging/entities/judging-step.entity';

registerEnumType(MissionStatus, { name: 'MissionStatus' });
registerEnumType(Priority, { name: 'Priority' });

@ObjectType()
export class MissionEntity {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => MissionStatus)
  status: MissionStatus;

  @Field(() => Priority)
  priority: Priority;

  @Field()
  dueDate: Date;

  @Field()
  createdAt: Date;

  @Field(() => UserEntity, { nullable: true })
  assignee?: UserEntity;

  @Field(() => [JudgingStepEntity], { nullable: true })
  judgingSteps?: JudgingStepEntity[];
}