import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import {
  DictionaryOrThesaurus,
  LexicalCategory,
  SenseHydratedDtoInterface
} from '@edfu/api-interfaces';
import { SignDto } from '../../signs/dto/sign.dto';

registerEnumType(DictionaryOrThesaurus, {
  name: 'DictionaryOrThesaurus'
});

registerEnumType(LexicalCategory, {
  name: 'LexicalCategory'
});

@ObjectType()
export class SenseHydratedDto implements SenseHydratedDtoInterface {
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
  readonly example?: string;

  @Field({ nullable: true })
  readonly definition?: string;

  @Field(type => DictionaryOrThesaurus)
  readonly associationType: DictionaryOrThesaurus;

  @Field()
  readonly similarity: number;

  @Field(type => [SignDto], { nullable: true })
  readonly signs?: SignDto[];
}
