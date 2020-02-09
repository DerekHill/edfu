import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ENTRY_COLLECTION_NAME,
  TF_MODEL_NAME,
  MONGO_DUPLICATE_ERROR_CODE
} from '../../constants';
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
import { LexicalCategory, DictionaryOrThesaurus } from '@edfu/enums';
import {
  DictionarySenseRecord,
  ThesaurusSenseRecord
} from '../senses/interfaces/sense.interface';
import { HeadwordOrPhrase } from '../../enums';
import { EntrySensesService } from '../entry-senses/entry-senses.service';
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
      .collation({ locale: 'en', strength: 2 })
      .lean();

    if (existing.length) {
      return existing;
    }

    const entrySearchResults: OxfordSearchRecord[] = await this.entrySearchesService.findOrFetch(
      chars
    );

    if (
      this.isNotFoundInOxfordApi(
        DictionaryOrThesaurus.dictionary,
        entrySearchResults,
        chars
      )
    ) {
      return [];
    }

    const entries = await Promise.all(
      entrySearchResults.map(record =>
        this.findOrCreateEntryFromSearchRecord(record)
      )
    );

    await Promise.all(
      entrySearchResults
        .map(record => this.findOrCreateSensesWithAssociations(record))
        .flat()
    );

    return Promise.all(entries.map(this.getLatest));
  }

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

    if (
      this.isNotFoundInOxfordApi(
        DictionaryOrThesaurus.thesaurus,
        thesaurusSearchResults,
        oxId
      )
    ) {
      return [];
    }

    const matchingResult: OxfordSearchRecord = this.filterResultsByHomographC(
      thesaurusSearchResults,
      homographC
    );

    if (!matchingResult) {
      console.warn(
        `No thesaurus result for ${oxId} with homographC: ${homographC}`
      );
      return [];
    }

    const promises1: Promise<ThesaurusSenseRecord>[] = [];
    for (const categoryEntries of matchingResult.result.lexicalEntries) {
      const lexicalCategory =
        LexicalCategory[categoryEntries.lexicalCategory.id];
      for (const entry of categoryEntries.entries) {
        entry.senses.forEach((sense, index) => {
          promises1.push(
            this.sensesService.findOrCreateThesaurusSenseWithoutAssociation(
              matchingResult.result.id,
              matchingResult.homographC,
              lexicalCategory,
              index,
              sense
            )
          );
        });
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

  findOrCreateSensesWithAssociations = (
    searchRecord: OxfordSearchRecord
  ): Promise<DictionarySenseRecord>[] => {
    const promises: Promise<DictionarySenseRecord>[] = [];
    for (const categoryEntries of searchRecord.result.lexicalEntries) {
      const lexicalCategory =
        LexicalCategory[categoryEntries.lexicalCategory.id];
      for (const entry of categoryEntries.entries) {
        entry.senses.forEach((sense, index) => {
          promises.push(
            this.sensesService.findOrCreateDictionarySenseWithAssociation(
              searchRecord.result.id,
              searchRecord.homographC,
              lexicalCategory,
              index,
              sense
            )
          );
        });
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

  isNotFoundInOxfordApi(
    dictionaryOrThesaurus: DictionaryOrThesaurus,
    results: OxfordSearchRecord[],
    string: string
  ) {
    if (!results || results.length === 0) {
      throw new Error(
        `${dictionaryOrThesaurus}: searchesService error for chars: ${string}`
      );
    }

    if (results.length === 1 && !results[0].result) {
      console.warn(
        `${string} not found in ${dictionaryOrThesaurus} in Oxford API`
      );
      return true;
    } else {
      return false;
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
    let entries: EntryRecord[];

    entries = await this.findOrCreateWithOwnSensesOnly(synonym);

    if (!entries.length) {
      return [];
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

  findOrCreateEntryFromSearchRecord = async (
    record: OxfordSearchRecord
  ): Promise<EntryRecord> => {
    const conditions = {
      oxId: record.result.id,
      homographC: record.homographC
    };

    const entry: EntryRecordWithoutId = {
      ...conditions,
      ...{
        word: record.result.word,
        relatedEntriesAdded: false,
        headwordOrPhrase: HeadwordOrPhrase[record.result.type]
      }
    };

    try {
      return await this.entryModel
        .findOneAndUpdate(conditions, entry, {
          upsert: true,
          new: true
        })
        .lean()
        .exec();
    } catch (error) {
      if (error.code === MONGO_DUPLICATE_ERROR_CODE) {
        return this.entryModel
          .findOne(conditions)
          .lean()
          .exec();
      } else {
        throw error;
      }
    }
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
