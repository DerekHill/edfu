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

@Controller('upload')
export class UploadController {
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 8388608 } }))
  uploadFile(@UploadedFile() file) {
    //   TODO: put this file somewhere
    console.log(file);
    if (!file) {
      return new ResponseError('UPLOAD.ERROR.NO_FILE_ATTACHED');
    }
    return new ResponseSuccess('UPLOAD.UPLOADED_SUCCESSFULLY');
  }
}
