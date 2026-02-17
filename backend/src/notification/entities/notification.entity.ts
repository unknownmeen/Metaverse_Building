import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { NotificationType } from '@prisma/client';
import { UserEntity } from '../../user/entities/user.entity';

registerEnumType(NotificationType, { name: 'NotificationType' });

@ObjectType()
export class NotificationEntity {
  @Field()
  id: string;

  @Field(() => NotificationType)
  type: NotificationType;

  @Field()
  text: string;

  @Field()
  read: boolean;

  @Field()
  createdAt: Date;

  @Field(() => String, { nullable: true })
  missionId: string | null;

  @Field(() => String, { nullable: true })
  stepId: string | null;

  @Field(() => UserEntity, { nullable: true })
  sender?: UserEntity | null;
}