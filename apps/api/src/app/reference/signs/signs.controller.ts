import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ResponseSuccess, ResponseError } from '../../common/dto/response.dto';
import { videoFilter } from './utils/utils';
import { S3Service } from '../../s3/s3.service';
import { VimeoService } from '../../vimeo/vimeo.service';

@Controller('signs')
export class SignsController {
  constructor(
    private s3Service: S3Service,
    private vimeoService: VimeoService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 8388608 },
      fileFilter: videoFilter
    })
  )
  async uploadSign(@UploadedFile() videoFile) {
    const oxId = 'food';
    if (videoFile) {
      const buffer: Buffer = videoFile.buffer;

      const videoId = await this.vimeoService.uploadBuffer(oxId, buffer);
      console.log('Uploaded to Vimeo with videoId:', videoId);
      const mediaUrl = `https://player.vimeo.com/video/${videoId}`;

      // S3 not awaited
      this.s3Service.upload(buffer, videoId).then(upload => {
        console.log('Uploaded to S3 with key:', upload.Key);
      });
      return new ResponseSuccess('UPLOAD.UPLOADED_SUCCESSFULLY', {
        mediaUrl: mediaUrl
      });
    } else {
      return new ResponseError('UPLOAD.ERROR.NO_FILE_ATTACHED');
    }
  }
}
