import { Module } from '@nestjs/common';
import { VimeoService } from './vimeo.service';

@Module({
  imports: [],
  providers: [VimeoService],
  exports: [VimeoService]
})
export class VimeoModule {}
