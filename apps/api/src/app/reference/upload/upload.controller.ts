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
import { UploadService } from './upload.service';
import { videoFilter, standardiseFileName } from './utils/utils';

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 8388608 },
      fileFilter: videoFilter
    })
  )
  async uploadFile(@UploadedFile() file) {
    //   TODO: record this as sign
    if (file) {
      const res = await this.uploadService.upload(
        file.buffer,
        standardiseFileName(file.originalname)
      );
    } else {
      return new ResponseError('UPLOAD.ERROR.NO_FILE_ATTACHED');
    }
    return new ResponseSuccess('UPLOAD.UPLOADED_SUCCESSFULLY');
  }
}
