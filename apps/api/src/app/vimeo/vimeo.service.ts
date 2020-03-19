import { promisify } from 'util';
import { Injectable } from '@nestjs/common';
import { VimeoGetVideoBody } from './vimeo.video.body.types';
import { VimeoVideoStatus } from '@edfu/api-interfaces';

const Vimeo = require('vimeo').Vimeo;

export type VimeoUploadDoneFn = (uri: string) => string;

export type VimeoProgressFn = (
  bytes_uploaded: number,
  bytes_total: number
) => void;

export type VimeoErrorFn = (error: Error) => void;

export interface SmooshedResponseBody {
  body: VimeoGetVideoBody;
  status_code: number;
  headers: any;
}

export interface VimeoUploadParams {
  readonly name: string;
  readonly description: string;
}

export interface VimeoCommonGetParams {
  readonly method: string;
  readonly path: string;
}

export interface VimeoBuffer extends Buffer {
  size?: number;
}

enum VimeoUploadOrTranscodeStatus {
  in_progress = 'in_progress',
  complete = 'complete',
  error = 'error'
}

type PromisifiableCallback = (error: Error, value: any) => any;

const client = new Vimeo(
  process.env.VIMEO_CLIENT_ID,
  process.env.VIMEO_CLIENT_SECRET,
  process.env.VIMEO_ACCESS_TOKEN
);

const promisifableRequest = (
  params: VimeoCommonGetParams,
  outerCb: PromisifiableCallback
) => {
  const innerCb = (
    error: Error,
    body: VimeoGetVideoBody,
    status_code: number,
    headers: any
  ) => {
    return outerCb(error, { body, status_code, headers });
  };
  return client.request(params, innerCb);
};

const promisifiedRequest = promisify(promisifableRequest);

const promisifiableUpload = (
  video: VimeoBuffer,
  params: VimeoUploadParams,
  progressFn: VimeoProgressFn,
  errorFn: VimeoErrorFn,
  outerCb: PromisifiableCallback
) => {
  const doneFn: VimeoUploadDoneFn = (uri: string) => {
    return outerCb(null, uri);
  };
  return client.upload(video, params, doneFn, progressFn, errorFn);
};

const promisifiedUpload = promisify(promisifiableUpload);

const vimeoProgressFn: VimeoProgressFn = (
  bytes_uploaded: number,
  bytes_total: number
) => {
  const percentage = ((bytes_uploaded / bytes_total) * 100).toFixed(2);
  console.log(bytes_uploaded, bytes_total, percentage + '%');
};

const vimeoErrorFn: VimeoErrorFn = (error: any) => {
  console.error(error);
  throw error;
};

@Injectable()
export class VimeoService {
  constructor() {}

  uploadBuffer(name: string, file: Buffer) {
    const params: VimeoUploadParams = {
      name: name,
      description: name
    };

    return this.upload(file, params);
  }

  upload(video: VimeoBuffer, params: VimeoUploadParams) {
    return promisifiedUpload(video, params, vimeoProgressFn, vimeoErrorFn).then(
      uri => this._extractVideoId(uri)
    );
  }

  commonGet(params: VimeoCommonGetParams): Promise<SmooshedResponseBody> {
    return promisifiedRequest(params);
  }

  async getVideoStatus(videoId: string): Promise<VimeoVideoStatus> {
    const getParams: VimeoCommonGetParams = {
      method: 'GET',
      path: `/videos/${videoId}`
    };
    try {
      const res = await this.commonGet(getParams);
      return this._extractStatusFromApiResponse(res);
    } catch (error) {
      if (error.message.match(/The requested video couldn't be found/)) {
        return VimeoVideoStatus.not_found;
      } else {
        throw error;
      }
    }
  }

  _extractStatusFromApiResponse(body: SmooshedResponseBody): VimeoVideoStatus {
    return body.body.status;
  }

  _extractVideoId(uri: string): string {
    const idRegex = /\d*$/;
    return uri.match(idRegex)[0];
  }
}
