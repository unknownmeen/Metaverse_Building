import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { AttachmentType } from '@prisma/client';

registerEnumType(AttachmentType, { name: 'AttachmentType' });

@ObjectType()
export class AttachmentEntity {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  url: string;

  @Field(() => AttachmentType)
  type: AttachmentType;

  @Field(() => String, { nullable: true })
  productId: string | null;

  @Field(() => String, { nullable: true })
  missionId: string | null;

  @Field()
  createdAt: Date;
}
