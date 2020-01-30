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
  readonly topLevel: boolean;

  @Field(type => [String])
  readonly ownSenseIds: string[];

  @Field(type => [String])
  readonly synonymSenseIds: string[];
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
  readonly dictionaryOrThesaurus?: DictionaryOrThesaurus;

  @Field(type => String)
  readonly lexicalCategory?: LexicalCategory;

  @Field()
  readonly example?: string;

  @Field()
  readonly definition?: string;

  @Field(type => [String])
  readonly synonyms: string[];
}
