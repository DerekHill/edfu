import { Injectable } from '@nestjs/common';
import { EntriesService } from '../../dictionary/entries/entries.service';

const WORDS = [
  //   'good morning',
  //   'good afternoon',
  //   'help',
  'more'
  //   'please',
  //   'thank you',
  //   'break'
];

@Injectable()
export class LoaderService {
  constructor(private readonly entriesService: EntriesService) {}

  async load() {
    const entryArrays = await Promise.all(
      WORDS.map(word => this.entriesService.findOrCreateWithOwnSensesOnly(word))
    );
    const entries = entryArrays.flat();

    console.log(entries);

    const relatedEntryArrays = await Promise.all(
      entries.map(entry =>
        this.entriesService.addRelatedEntries(entry.oxId, entry.homographC)
      )
    );

    const relatedEntries = relatedEntryArrays.flat();

    console.log(relatedEntries);
  }
}
