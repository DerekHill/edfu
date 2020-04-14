import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Body,
  ValidationPipe,
  HttpException,
  HttpStatus
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { videoFilter, copyExtension } from './utils/utils';
import { S3Service } from '../../s3/s3.service';
import { MAX_UPLOAD_SIZE_BYTES, BasicUser } from '@edfu/api-interfaces';
import { CurrentUserRest } from '../../common/decorators/current-user.decorator';
import { CreateSignDto } from './dto/create-sign.dto';
import { InjectQueue } from '@nestjs/bull';
import { TRANSCODE_QUEUE_NAME } from '../../constants';
import { Queue } from 'bull';
import { TranscodeJobData } from '../../transcode/interfaces/transcode-job-data.interface';
import { SignsService } from './signs.service';
import { UsersService } from '../../users/users.service';
import { HttpErrorMessages } from '@edfu/enums';

@Controller('signs')
export class SignsController {
  constructor(
    private readonly s3Service: S3Service,
    private readonly signsService: SignsService,
    private readonly usersService: UsersService,
    @InjectQueue(TRANSCODE_QUEUE_NAME)
    private transcodeQueue: Queue<TranscodeJobData>
  ) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
      fileFilter: videoFilter
    })
  )
  @Post()
  async uploadSign(
    @UploadedFile() videoFile,
    @CurrentUserRest() user: BasicUser,
    @Body(new ValidationPipe()) createSignDto: CreateSignDto
  ) {
    if (videoFile) {
      const fullUser = await this.usersService.findByEmail(user.email);
      const sign = await this.signsService.createSignWithAssociations(
        fullUser._id,
        createSignDto
      );

      const s3Key = copyExtension(sign.id, videoFile.originalname);

      await Promise.all([
        this.s3Service.upload(videoFile.buffer, s3Key).then(upload => {
          console.log('Uploaded to S3 with key:', upload.Key);
        }),
        this.signsService.findSignByIdAndUpdate(sign._id, { s3KeyOrig: s3Key })
      ]);

      await this.transcodeQueue.add({
        s3KeyOrig: s3Key
      });

      return { ...sign.toObject(), ...{ s3KeyOrig: s3Key } };
    } else {
      throw new HttpException(
        HttpErrorMessages.SIGNS__NO_FILE_ATTACHED,
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
