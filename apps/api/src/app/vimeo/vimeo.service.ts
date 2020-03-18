import { Injectable } from '@nestjs/common';
import { VimeoGetVideoBody } from './vimeo.video.body.types';

const Vimeo = require('vimeo').Vimeo;

export type VimeoUploadDoneFn = (uri: string) => void;

export type VimeoProgressFn = (
  bytes_uploaded: number,
  bytes_total: number
) => void;

export type VimeoErrorFn = (error: Error) => void;

export type VimeoCallback = (
  error: Error,
  body: VimeoGetVideoBody,
  status_code: number,
  headers: any
) => void;

export interface VimeoUploadParams {
  readonly name: string;
  readonly description: string;
}

export interface VimeoGetParams {
  readonly method: string;
  readonly path: string;
}

export interface VimeoBuffer extends Buffer {
  size?: number;
}

@Injectable()
export class VimeoService {
  client: any;
  constructor() {
    this.client = new Vimeo(
      process.env.VIMEO_CLIENT_ID,
      process.env.VIMEO_CLIENT_SECRET,
      process.env.VIMEO_ACCESS_TOKEN
    );
  }

  upload(
    video: VimeoBuffer,
    params: VimeoUploadParams,
    doneFn: VimeoUploadDoneFn,
    progressFn: VimeoProgressFn,
    errorFn: VimeoErrorFn
  ) {
    return this.client.upload(video, params, doneFn, progressFn, errorFn);
  }

  getVideo(params: VimeoGetParams, callback: VimeoCallback) {
    return this.client.request(params, callback);
  }

  getVideoIdFromUri(uri: string): string {
    const idRegex = /\d*$/;
    return uri.match(idRegex)[0];
  }
}
