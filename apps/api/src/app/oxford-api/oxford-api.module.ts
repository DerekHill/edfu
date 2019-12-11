import { Module, HttpModule } from '@nestjs/common';
import { OxfordApiService } from './oxford-api.service';

@Module({
  imports: [HttpModule],
  providers: [OxfordApiService],
  exports: [OxfordApiService]
})
export class OxfordApiModule {}
