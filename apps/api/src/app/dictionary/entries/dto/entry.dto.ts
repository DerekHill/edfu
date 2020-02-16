import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class EntryDto {
  @Field()
  readonly oxId: string;

  @Field()
  readonly homographC: number;

  @Field()
  readonly word: string;

  @Field()
  readonly relatedEntriesAdded: boolean;
}
