import { ObjectType, Field, Int, ID } from "type-graphql";
import { ObjectId } from "bson";

@ObjectType()
export class HeadwordDto {
  @Field(type => ID)
  _id: ObjectId;

  @Field()
  readonly oxId: string;

  @Field({ nullable: true })
  readonly homographC: number;

  @Field()
  readonly word: string;

  @Field()
  readonly topLevel: boolean;
}
