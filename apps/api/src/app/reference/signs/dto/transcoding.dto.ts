import { ObjectType, Field } from 'type-graphql';
import { Transcoding } from '@edfu/api-interfaces';

@ObjectType()
export class TranscodingDto implements Transcoding {
  @Field()
  s3Key: string;

  @Field()
  height: number;

  @Field()
  width: number;

  @Field()
  duration: number;

  @Field()
  size: number;

  @Field()
  bitrate: number;

  @Field()
  rotation: number;
}
