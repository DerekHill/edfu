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
import { videoFilter, standardiseFileName } from './utils/utils';
import { S3Service } from '../../s3/s3.service';

@Controller('signs')
export class SignsController {
  constructor(private s3Service: S3Service) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 8388608 },
      fileFilter: videoFilter
    })
  )
  async createSign(@UploadedFile() videoFile) {
    //   TODO: record this as sign
    if (videoFile) {
      console.log();
      const res = await this.s3Service.upload(
        videoFile.buffer,
        standardiseFileName(videoFile.originalname)
      );
    } else {
      return new ResponseError('UPLOAD.ERROR.NO_FILE_ATTACHED');
    }
    return new ResponseSuccess('UPLOAD.UPLOADED_SUCCESSFULLY');
  }
}
