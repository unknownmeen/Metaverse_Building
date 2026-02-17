import { ObjectType, Field } from '@nestjs/graphql';
import { MissionEntity } from '../../mission/entities/mission.entity';

@ObjectType()
export class ProductEntity {
  @Field()
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => String, { nullable: true })
  parentId: string | null;

  @Field(() => [ProductEntity], { nullable: true })
  children?: ProductEntity[];

  @Field(() => [MissionEntity], { nullable: true })
  missions?: MissionEntity[];
}
