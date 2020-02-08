import { ObjectType, Field, Int, ID, registerEnumType } from 'type-graphql';
import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/enums';

registerEnumType(DictionaryOrThesaurus, {
  name: 'DictionaryOrThesaurus'
});

registerEnumType(LexicalCategory, {
  name: 'LexicalCategory'
});

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

@ObjectType()
export class SenseForEntryDto {
  @Field()
  readonly oxId: string;

  @Field()
  readonly homographC: number;

  @Field()
  readonly senseId: string;

  @Field(type => LexicalCategory)
  readonly lexicalCategory?: LexicalCategory;

  @Field()
  readonly apiSenseIndex: number;

  @Field({ nullable: true })
  readonly example: string;

  @Field()
  readonly definition: string;

  @Field(type => DictionaryOrThesaurus)
  readonly associationType: DictionaryOrThesaurus;

  @Field()
  readonly similarity: number;
}
