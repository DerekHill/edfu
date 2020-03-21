import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Body,
  Get,
  Param,
  Query
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ResponseSuccess, ResponseError } from '../../common/dto/response.dto';
import { videoFilter, copyExtension } from './utils/utils';
import { S3Service } from '../../s3/s3.service';
import { VimeoService, VimeoBuffer } from '../../vimeo/vimeo.service';
import { MAX_UPLOAD_SIZE_BYTES } from '@edfu/api-interfaces';

@Controller('signs')
export class SignsController {
  constructor(
    private s3Service: S3Service,
    private vimeoService: VimeoService
  ) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
      fileFilter: videoFilter
    })
  )
  @Post()
  async uploadSign(@UploadedFile() videoFile, @Body('oxId') oxId: string) {
    if (videoFile) {
      const buffer: VimeoBuffer = videoFile.buffer;
      buffer.size = buffer.byteLength;

      const videoId = await this.vimeoService.uploadBuffer(oxId, buffer);
      console.log('Uploaded to Vimeo with videoId:', videoId);
      const mediaUrl = `https://player.vimeo.com/video/${videoId}`;

      // S3 not awaited
      const s3Key = copyExtension(videoId, videoFile.originalname);
      this.s3Service.upload(buffer, s3Key).then(upload => {
        console.log('Uploaded to S3 with key:', upload.Key);
      });
      return new ResponseSuccess('SIGNS.UPLOADED_SUCCESSFULLY', {
        mediaUrl: mediaUrl,
        s3Key: s3Key
      });
    } else {
      return new ResponseError('SIGNS.ERROR.NO_FILE_ATTACHED');
    }
  }
}
