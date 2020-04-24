import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  DictionaryOrThesaurus,
  LexicalCategory,
  SensePureDtoInterface
} from '@edfu/api-interfaces';

@ObjectType()
export class SensePureDto implements SensePureDtoInterface {
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
  @Field(type => DictionaryOrThesaurus)
  readonly dictionaryOrThesaurus: DictionaryOrThesaurus;
}
