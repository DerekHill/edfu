import { ObjectType, Field, Int, ID, registerEnumType } from 'type-graphql';
import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/enums';
import { SenseForEntryDtoInterface } from '@edfu/api-interfaces';

registerEnumType(DictionaryOrThesaurus, {
  name: 'DictionaryOrThesaurus'
});

registerEnumType(LexicalCategory, {
  name: 'LexicalCategory'
});

@ObjectType()
export class SenseForEntryDto implements SenseForEntryDtoInterface {
  @Field()
  readonly oxId: string;

  @Field()
  readonly homographC: number;

  @Field()
  readonly ownEntryOxId: string;

  @Field()
  readonly ownEntryHomographC: number;

  @Field(type => ID)
  readonly senseId: string;

  @Field(type => LexicalCategory)
  readonly lexicalCategory: LexicalCategory;

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
