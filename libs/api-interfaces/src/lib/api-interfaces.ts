import { ObjectType, Field, Int, ID } from 'type-graphql';
import { ObjectId } from 'bson';
import { DictionaryOrThesaurus, LexicalCategory } from '..';

export interface Message {
  message: string;
}

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

@ObjectType()
export class SenseDto {
  @Field(type => ID)
  _id: ObjectId;

  @Field()
  readonly senseId: string;

  @Field()
  readonly headwordOxId: string;

  // Currently nullable, but better to make nulls zero I suspect
  @Field({ nullable: true })
  readonly headwordHomographC: number;

  @Field()
  readonly dictionaryOrThesaurus?: DictionaryOrThesaurus;

  @Field()
  readonly lexicalCategory?: LexicalCategory;

  @Field()
  readonly example?: string;

  @Field()
  readonly definition?: string;

  @Field()
  readonly synonyms: string[];
}
