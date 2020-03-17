import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import {
  GetObjectRequest,
  GetObjectOutput,
  PutObjectRequest,
  CompleteMultipartUploadOutput
} from 'aws-sdk/clients/s3';

const BUCKET_NAME = 'edfu';

@Injectable()
export class UploadService {
  s3: any;
  constructor() {
    this.s3 = new S3();
  }

  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
  // "Uploads an arbitrarily sized buffer, blob, or stream" (alternative to `putObject`)
  public async upload(
    file: Buffer | any,
    key: string
  ): Promise<CompleteMultipartUploadOutput> {
    const putParams: PutObjectRequest = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file
    };

    const managedUpload: S3.ManagedUpload = this.s3.upload(putParams);
    const uploaded: CompleteMultipartUploadOutput = await managedUpload.promise();
    return uploaded;
  }

  //   https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
  public async getObject(key: string): Promise<AWS.S3.Body> {
    const params: GetObjectRequest = {
      Bucket: BUCKET_NAME,
      Key: key
    };

    const fileObject: GetObjectOutput = await this.s3
      .getObject(params)
      .promise();

    const body: AWS.S3.Body = fileObject.Body;

    return body;
  }
}
