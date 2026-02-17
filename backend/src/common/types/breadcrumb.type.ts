import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class BreadcrumbItemType {
  @Field()
  id: string;

  @Field()
  title: string;
}