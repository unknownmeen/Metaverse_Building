import { ObjectType, Field } from '@nestjs/graphql';
import { UserEntity } from '../../user/entities/user.entity';

@ObjectType()
export class ChatMessageEntity {
  @Field()
  id: string;

  @Field()
  text: string;

  @Field()
  createdAt: Date;

  @Field(() => UserEntity, { nullable: true })
  sender?: UserEntity;

  @Field(() => String, { nullable: true })
  fileName?: string | null;

  @Field(() => String, { nullable: true })
  fileUrl?: string | null;

  @Field(() => String, { nullable: true })
  stepId?: string | null;
}
