import { OXFORD_API_QUEUE_NAME } from '../../constants';
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { OxfordApiJobData } from './interfaces/oxford-api-job-data.interface';
import { EntryRecord } from './interfaces/entry.interface';
import { EntriesService } from './entries.service';

@Processor(OXFORD_API_QUEUE_NAME)
export class OxfordApiQueueConsumer {
  constructor(private entriesService: EntriesService) {}
  @Process()
  transcode(job: Job<OxfordApiJobData>): Promise<EntryRecord[]> {
    return this.entriesService.createWithOwnSensesOnly(job.data.chars);
  }
}
