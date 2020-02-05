import { ObjectType, Field, Int, ID } from 'type-graphql';
import { ObjectId } from 'bson';
import { DictionaryOrThesaurus, LexicalCategory } from './enums';

@ObjectType()
export class EntryDto {
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
export class SenseForEntryDto {
  @Field()
  readonly oxId: string;

  @Field()
  readonly homographC: number;

  @Field()
  readonly senseId: string;

  @Field(type => String)
  readonly lexicalCategory?: LexicalCategory;

  @Field()
  readonly example: string;

  @Field()
  readonly definition: string;

  @Field(type => String)
  readonly associationType: DictionaryOrThesaurus;

  @Field()
  readonly similarity: number;
}
