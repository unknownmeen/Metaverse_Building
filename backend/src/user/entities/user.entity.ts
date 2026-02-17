import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { UserRole } from '@prisma/client';

registerEnumType(UserRole, { name: 'UserRole' });

@ObjectType()
export class UserEntity {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  phone: string;

  @Field(() => String, { nullable: true })
  avatarId: string | null;

  @Field(() => UserRole)
  role: UserRole;

  @Field(() => String, { nullable: true })
  avatar?: string;
}