import { Injectable } from '@nestjs/common';
import { EntriesService } from '../../reference/entries/entries.service';
import { SensesService } from '../../reference/senses/senses.service';

@Injectable()
export class LoaderService {
  constructor(
    private readonly entriesService: EntriesService,
    private readonly sensesService: SensesService
  ) {}

  async load(words: string[]) {
    for (const word of words) {
      console.log(`-----Loading ${word}-----`);
      await this.loadWord(word);
      const WAIT_TIME_MILLISECONDS = 60 * 1000;
      await new Promise(resolve => setTimeout(resolve, WAIT_TIME_MILLISECONDS));
    }
    console.log('finished loading words');
  }

  printSenses() {
    return this.sensesService.printSenses();
  }

  async loadWord(word: string) {
    const entries = await this.entriesService.findOrCreateWithOwnSensesOnly(
      word,
      false
    );

    console.log('Entries:');
    console.log(entries.filter(i => i).map(i => i.oxId));

    const relatedEntryArrays = await Promise.all(
      entries.map(entry =>
        this.entriesService.addRelatedEntries(
          {
            oxId: entry.oxId,
            homographC: entry.homographC
          },
          true
        )
      )
    );

    const relatedEntries = relatedEntryArrays.flat();

    console.log('Unqueued relatedEntries (also need to clear queue):');
    console.log(relatedEntries.filter(i => i).map(i => i.oxId));
  }
}
