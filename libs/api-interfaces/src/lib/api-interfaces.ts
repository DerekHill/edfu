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

  @Field()
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

  // 1) Believe that Typescript can't handle @FieldResolver().  So need to make this optional
  // So can assign EntrySenseDto[] in EntrySensesResolver, even though this does not have senses
  // 2) Make this nullable to deal with what happens if have entrySense but not corresponding sense
  // Might be better way
  @Field(type => SenseDto, { nullable: true })
  readonly sense?: SenseDto;

  @Field(type => String)
  readonly associationType: DictionaryOrThesaurus;

  @Field()
  readonly similarity: number;
}
