import { ObjectType, Field, Int, ID } from 'type-graphql';
import { ObjectId } from 'bson';
import { DictionaryOrThesaurus, LexicalCategory } from './enums';

@ObjectType()
export class EntryDto {
  @Field(type => ID)
  _id: ObjectId;

  @Field()
  readonly oxId: string;

  @Field({ nullable: true })
  readonly homographC: number;

  @Field()
  readonly word: string;

  @Field()
  readonly relatedEntriesAdded: boolean;
}

@ObjectType()
export class SenseDto {
  @Field(type => ID)
  _id: ObjectId;

  @Field()
  readonly senseId: string;

  @Field()
  readonly entryOxId: string;

  // Currently nullable, but better to make nulls zero I suspect
  @Field({ nullable: true })
  readonly entryHomographC: number;

  @Field(type => String)
  readonly lexicalCategory?: LexicalCategory;

  @Field()
  readonly example: string;

  @Field()
  readonly definition: string;
}

@ObjectType()
export class EntrySenseDto {
  @Field(type => ID)
  _id: ObjectId;

  @Field()
  readonly oxId: string;

  @Field({ nullable: true })
  readonly homographC: number;

  @Field()
  readonly senseId: string;

  @Field()
  readonly confidence: number;
}
