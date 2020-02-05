import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ENTRY_COLLECTION_NAME, TF_MODEL_NAME } from '../../constants';
import { Model } from 'mongoose';
import {
  EntryRecord,
  EntryDocument,
  EntryRecordWithoutId
} from './interfaces/entry.interface';
import {
  EntrySearchesService,
  ThesaurusSearchesService
} from '../../oxford-searches/oxford-searches.service';
import { OxfordSearchRecord } from '../../oxford-searches/interfaces/oxford-search.interface';
import { SensesService } from '../senses/senses.service';
import { LexicalCategory, DictionaryOrThesaurus } from '@edfu/api-interfaces';
import {
  DictionarySenseRecord,
  ThesaurusSenseRecord
} from '../senses/interfaces/sense.interface';
import { HeadwordOrPhrase } from '../../enums';
import { EntrySensesService } from '../entry-senses/entry-senses.service';
import { EntrySenseRecord } from '../entry-senses/interfaces/entry-sense.interface';
import { SimilarityService } from '../similarity/similarity.service';

@Injectable()
export class EntriesService {
  constructor(
    @InjectModel(ENTRY_COLLECTION_NAME)
    private readonly entryModel: Model<EntryDocument>,
    private readonly entrySearchesService: EntrySearchesService,
    private readonly thesaurusSearchesService: ThesaurusSearchesService,
    private readonly sensesService: SensesService,
    private readonly entrySensesService: EntrySensesService,
    private readonly similarityService: SimilarityService
  ) {}

  async findOrCreateWithOwnSensesOnly(chars: string): Promise<EntryRecord[]> {
    const existing: EntryRecord[] = await this.entryModel
      .find({
        word: chars
      })
      .lean();

    if (existing.length) {
      return existing;
    }

    const entrySearchResults = await this.entrySearchesService.findOrFetch(
      chars
    );

    this.throwErrorIfNotFound(entrySearchResults, chars);

    const entries = await Promise.all(
      entrySearchResults.map(record => this.createEntryFromSearchRecord(record))
    );

    await Promise.all(
      entrySearchResults.map(record =>
        this.findOrCreateSensesWithAssociations(record)
      )
    );

    return Promise.all(entries.map(this.getLatest));
  }

  findOrCreateSensesWithAssociations = async (
    searchRecord: OxfordSearchRecord
  ): Promise<DictionarySenseRecord[]> => {
    const promises = [];
    for (const categoryEntries of searchRecord.result.lexicalEntries) {
      const lexicalCategory =
        LexicalCategory[categoryEntries.lexicalCategory.id];
      for (const entry of categoryEntries.entries) {
        for (const sense of entry.senses) {
          promises.push(
            this.sensesService.findOrCreateDictionarySenseWithAssociation(
              searchRecord.result.id,
              searchRecord.homographC,
              lexicalCategory,
              sense
            )
          );
        }
      }
    }
    return promises;
  };

  getLatest = (record: EntryRecord) => {
    return this.entryModel
      .findById(record._id)
      .lean()
      .exec();
  };

  async addRelatedEntries(
    oxId: string,
    homographC: number
  ): Promise<EntryRecord[]> {
    const res = await this.entryModel
      .findOne({ oxId: oxId, homographC: homographC })
      .lean()
      .exec();

    if (!res) {
      throw new Error(
        `Entry not found with oxId: ${oxId} and homographC: ${homographC}`
      );
    }

    const thesaurusSearchResults = await this.thesaurusSearchesService.findOrFetch(
      oxId
    );

    this.throwErrorIfNotFound(thesaurusSearchResults, oxId);

    const matchingResult: OxfordSearchRecord = this.filterResultsByHomographC(
      thesaurusSearchResults,
      homographC
    );

    if (!matchingResult) {
      throw new Error(`No thesaurus result for ${oxId}`);
    }

    const promises1 = [];
    for (const categoryEntries of matchingResult.result.lexicalEntries) {
      const lexicalCategory =
        LexicalCategory[categoryEntries.lexicalCategory.id];
      for (const entry of categoryEntries.entries) {
        for (const sense of entry.senses) {
          promises1.push(
            this.sensesService.findOrCreateThesaurusSenseWithoutAssociation(
              matchingResult.result.id,
              matchingResult.homographC,
              lexicalCategory,
              sense
            )
          );
        }
      }
    }
    const senses: ThesaurusSenseRecord[] = await Promise.all(promises1);

    const linkedSensePairings = await Promise.all(
      senses.map(sense =>
        this.sensesService.populateThesaurusLinkedSenses(sense)
      )
    );

    const foundLinkSensePairings = linkedSensePairings.filter(
      l => l.dictionarySenses.length
    );

    const promises2 = [];

    for (const sensePairing of foundLinkSensePairings) {
      for (const dictionarySense of sensePairing.dictionarySenses) {
        for (const synonym of sensePairing.thesaurusSense.synonyms) {
          promises2.push(
            this.findOrCreateSynonymEntryAndAssociations(
              dictionarySense,
              synonym,
              sensePairing.thesaurusSense.lexicalCategory,
              sensePairing.thesaurusSense.example
            )
          );
        }
      }
    }

    const newSynonymEntries: EntryRecord[][] = await Promise.all(promises2);

    return newSynonymEntries.flat();
  }

  throwErrorIfNotFound(results: OxfordSearchRecord[], string: string) {
    if (results.length === 0) {
      throw new Error(`searchesService error for chars: ${string}`);
    }

    if (results.length === 1 && results[0].found === false) {
      throw new Error(`${string} not found`);
    }
  }

  filterResultsByHomographC(
    results: OxfordSearchRecord[],
    homographC: number
  ): OxfordSearchRecord {
    if (!results || !results.length) {
      return null;
    }
    return results.filter(result => result.homographC === homographC)[0];
  }

  async findOrCreateSynonymEntryAndAssociations(
    dictionarySense: DictionarySenseRecord,
    synonym: string,
    thesaurusSenseLexicalCategory: LexicalCategory,
    thesaurusSenseExample: string
  ): Promise<EntryRecord[]> {
    const entries = await this.findOrCreateWithOwnSensesOnly(synonym);
    if (!entries) {
      return null;
    }

    const similarity = await this.similarityService.getSimilarity(
      dictionarySense.example,
      thesaurusSenseExample
    );

    const promises = entries.map(entry => {
      if (dictionarySense.lexicalCategory === thesaurusSenseLexicalCategory) {
        return this.entrySensesService.findOrCreate(
          entry.oxId,
          entry.homographC,
          dictionarySense.senseId,
          DictionaryOrThesaurus.thesaurus,
          similarity
        );
      }
    });

    await Promise.all(promises);

    return entries;
  }

  createEntryFromSearchRecord = (
    record: OxfordSearchRecord
  ): Promise<EntryRecord> => {
    const entry: EntryRecordWithoutId = {
      word: record.result.word,
      oxId: record.result.id,
      homographC: record.homographC,
      relatedEntriesAdded: false,
      headwordOrPhrase: HeadwordOrPhrase[record.result.type]
    };
    return this.entryModel.create(entry);
  };

  find(oxId: string): Promise<EntryRecord[]> {
    return this.entryModel
      .find({ oxId: oxId })
      .lean()
      .exec();
  }

  findOneById(id: string): Promise<EntryRecord> {
    return this.entryModel.findById(id).exec();
  }

  findAll(): Promise<EntryRecord[]> {
    return this.entryModel.find({}).exec();
  }

  search(chars: string): Promise<EntryRecord[]> {
    if (chars) {
      return this.entryModel
        .find({ word: { $regex: `^${chars}`, $options: '$i' } })
        .exec();
    } else {
      return Promise.resolve([]);
    }
  }
}
