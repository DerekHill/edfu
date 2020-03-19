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
import { videoFilter } from './utils/utils';
import { S3Service } from '../../s3/s3.service';
import { VimeoService, VimeoBuffer } from '../../vimeo/vimeo.service';

@Controller('signs')
export class SignsController {
  constructor(
    private s3Service: S3Service,
    private vimeoService: VimeoService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async uploadStatus(@Query('videoId') videoId: string) {
    const status = await this.vimeoService.getVideoStatus(videoId);
    return new ResponseSuccess('SIGNS.GET_STATUS_SUCCESS', {
      status: status
    });
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 8388608 },
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
      this.s3Service.upload(buffer, videoId).then(upload => {
        console.log('Uploaded to S3 with key:', upload.Key);
      });
      return new ResponseSuccess('SIGNS.UPLOADED_SUCCESSFULLY', {
        mediaUrl: mediaUrl
      });
    } else {
      return new ResponseError('SIGNS.ERROR.NO_FILE_ATTACHED');
    }
  }
}
