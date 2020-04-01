import { ObjectType, Field, registerEnumType } from 'type-graphql';
import { Transcoding, HandbrakePreset } from '@edfu/api-interfaces';

registerEnumType(HandbrakePreset, {
  name: 'HandbrakePreset'
});

@ObjectType()
export class TranscodingDto implements Transcoding {
  @Field()
  height: number;

  @Field()
  width: number;

  @Field()
  durationSeconds: number;

  @Field()
  s3Key: string;

  @Field()
  size: number;

  @Field(type => HandbrakePreset)
  preset: HandbrakePreset;
}
