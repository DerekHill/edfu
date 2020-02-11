import { Injectable } from '@nestjs/common';
import { EntriesService } from '../../dictionary/entries/entries.service';
import { SensesService } from '../../dictionary/senses/senses.service';

const WORDS = [
  'good morning',
  'good afternoon',
  'help',
  'more',
  'please',
  'thank you',
  'break'
];

@Injectable()
export class LoaderService {
  constructor(
    private readonly entriesService: EntriesService,
    private readonly sensesService: SensesService
  ) {}

  async load() {
    for (const word of WORDS) {
      console.log(`-----Loading ${word}-----`);
      await this.loadWord(word);
    }
  }

  printSenses() {
    return this.sensesService.printSenses();
  }

  async loadWord(word: string) {
    const entries = await this.entriesService.findOrCreateWithOwnSensesOnly(
      word
    );

    console.log('Entries:');
    console.log(entries.filter(i => i).map(i => i.oxId));

    const relatedEntryArrays = await Promise.all(
      entries.map(entry =>
        this.entriesService.addRelatedEntries(entry.oxId, entry.homographC)
      )
    );

    const relatedEntries = relatedEntryArrays.flat();

    console.log('relatedEntries:');
    console.log(relatedEntries.filter(i => i).map(i => i.oxId));
  }
}
