import { Module, HttpModule } from '@nestjs/common';
import { OxfordApiService } from './oxford-api.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [OxfordApiService],
  exports: [OxfordApiService]
})
export class OxfordApiModule {}
