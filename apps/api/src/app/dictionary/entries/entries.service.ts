import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ENTRY_COLLECTION_NAME } from '../../constants';
import { Model } from 'mongoose';
import { EntryRecord, EntryDocument } from './interfaces/entry.interface';
import {
  EntrySearchesService,
  ThesaurusSearchesService
} from '../../oxford-searches/oxford-searches.service';
import { OxfordSearchRecord } from '../../oxford-searches/interfaces/oxford-search.interface';
import { SensesService } from '../senses/senses.service';
import { LexicalCategory } from '@edfu/api-interfaces';
import {
  DictionarySenseRecord,
  ThesaurusSenseRecord
} from '../senses/interfaces/sense.interface';

@Injectable()
export class EntriesService {
  constructor(
    @InjectModel(ENTRY_COLLECTION_NAME)
    private readonly entryModel: Model<EntryDocument>,
    private readonly entrySearchesService: EntrySearchesService,
    private readonly thesaurusSearchesService: ThesaurusSearchesService,
    private readonly sensesService: SensesService
  ) {}

  async findOrCreateAndUpdateSenses(
    word: string,
    topLevel = false,
    synonymSenseId = null
  ): Promise<EntryRecord[]> {
    const existing: EntryRecord[] = await this.entryModel
      .find({
        word: word
      })
      .lean();

    if (existing.length) {
      if (existing.length === 1 && synonymSenseId) {
        const record = existing[0];
        return Promise.all([
          this.addSynonymSense(record.oxId, record.homographC, synonymSenseId)
        ]);
      }
      return existing;
    } else {
      let entrySearchResults: OxfordSearchRecord[];
      let thesaurusSearchResults: OxfordSearchRecord[];

      [entrySearchResults, thesaurusSearchResults] = await Promise.all([
        this.entrySearchesService.findOrFetch(word),
        this.thesaurusSearchesService.findOrFetch(word)
      ]);

      if (entrySearchResults.length === 0) {
        throw new Error(`entrySearchesService error for word: ${word}`);
      }

      if (
        entrySearchResults.length === 1 &&
        entrySearchResults[0].found === false
      ) {
        throw new Error(`Word: ${word} not found in dictionary`);
      }

      const entries = await Promise.all(
        entrySearchResults.map(record =>
          this.createEntry(record, topLevel, synonymSenseId)
        )
      );

      await Promise.all(
        entrySearchResults
          .map(record => this.createSenses(record, topLevel))
          .concat(
            thesaurusSearchResults.map(record =>
              this.createSenses(record, topLevel)
            )
          )
      );
      return Promise.all(entries.map(this.getLatest));
    }
  }

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

  async makeTopLevel(oxId: string, homographC: number): Promise<EntryRecord> {
    const updated = await this.entryModel
      .findOneAndUpdate(
        { oxId: oxId, homographC: homographC },
        { $set: { topLevel: true } },
        { new: true }
      )
      .lean();

    const promises = [];

    for (const senseId of updated.ownSenseIds) {
      promises.push(this.findOrCreateEntriesForSense(senseId));
    }

    await Promise.all(promises);

    return updated;
  }

  async findOrCreateEntriesForSense(senseId: string): Promise<any> {
    const record = await this.sensesService.findOne(senseId);
    const promises = [];
    for (const synonym of record.synonyms) {
      promises.push(this.findOrCreateAndUpdateSenses(synonym, false, senseId));
    }
    return Promise.all(promises);
  }

  getLatest = (record: EntryRecord) => {
    return this.entryModel
      .findById(record._id)
      .lean()
      .exec();
  };

  createEntry = (
    record: OxfordSearchRecord,
    topLevel: boolean,
    synonymSenseId = null
  ): Promise<EntryRecord> => {
    const entry = {
      word: record.result.word,
      oxId: record.result.id,
      homographC: record.homographC,
      topLevel: topLevel,
      synonymSenseIds: synonymSenseId ? [synonymSenseId] : []
    };
    return this.entryModel.create(entry);
  };

  createSenses = async (
    searchRecord: OxfordSearchRecord,
    topLevel: boolean
  ): Promise<DictionarySenseRecord[] | ThesaurusSenseRecord[]> => {
    const promises = [];
    for (const categoryEntries of searchRecord.result.lexicalEntries) {
      const lexicalCategory =
        LexicalCategory[categoryEntries.lexicalCategory.id];
      for (const entry of categoryEntries.entries) {
        for (const sense of entry.senses) {
          promises.push(
            this.sensesService.findOrCreate(
              searchRecord.result.id,
              searchRecord.homographC,
              lexicalCategory,
              sense
            )
          );
        }
      }
    }
    // Arbitrarily include just ThesaurusSenseRecord.  Not clear why map does
    // not work if include union type
    const senses: ThesaurusSenseRecord[] = await Promise.all(promises);

    await Promise.all(
      senses.map(record => {
        return this.addOwnSense(
          record.entryOxId,
          record.entryHomographC,
          record.senseId
        );
      })
    );

    if (topLevel) {
      const entries = [];
      senses.map(record => {
        record.synonyms.map(word => {
          entries.push(
            this.findOrCreateAndUpdateSenses(word, false, record.senseId)
          );
        });
      });
      await Promise.all(entries);
    }

    return senses;
  };

  addOwnSense(oxId: string, homographC: number, senseId: string) {
    return this.entryModel.updateOne(
      { oxId: oxId, homographC: homographC },
      { $addToSet: { ownSenseIds: senseId } }
    );
  }

  addSynonymSense(
    oxId: string,
    homographC: number,
    senseId: string
  ): Promise<EntryRecord> {
    return this.entryModel
      .findOneAndUpdate(
        { oxId: oxId, homographC: homographC },
        {
          $addToSet: { synonymSenseIds: senseId }
        },
        {
          new: true
        }
      )
      .lean()
      .exec();
  }
}
