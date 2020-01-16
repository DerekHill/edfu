import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HEADWORD_COLLECTION_NAME } from '../../constants';
import { Model } from 'mongoose';
import {
  HeadwordRecord,
  HeadwordDocument
} from './interfaces/headword.interface';
import {
  EntrySearchesService,
  ThesaurusSearchesService
} from '../../oxford-searches/oxford-searches.service';
import { OxfordSearchRecord } from '../../oxford-searches/interfaces/oxford-search.interface';
import { SensesService } from '../senses/senses.service';
import { LexicalCategory } from '../../enums';
import { SenseRecord } from '../senses/interfaces/sense.interface';

@Injectable()
export class HeadwordsService {
  constructor(
    @InjectModel(HEADWORD_COLLECTION_NAME)
    private readonly headwordModel: Model<HeadwordDocument>,
    private readonly entrySearchesService: EntrySearchesService,
    private readonly thesaurusSearchesService: ThesaurusSearchesService,
    private readonly sensesService: SensesService
  ) {}

  //   Need to deal with stemming & normalisation
  async findOrCreateAndUpdateSenses(
    word: string,
    topLevel = false,
    synonymSenseId = null
  ): Promise<HeadwordRecord[]> {
    const existing: HeadwordRecord[] = await this.headwordModel
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

      const headwords = await Promise.all(
        entrySearchResults.map(record =>
          this.createHeadword(record, topLevel, synonymSenseId)
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
      return Promise.all(headwords.map(this.getLatest));
    }
  }

  find(oxId: string): Promise<HeadwordRecord[]> {
    return this.headwordModel
      .find({ oxId: oxId })
      .lean()
      .exec();
  }

  findOneById(id: string): Promise<HeadwordRecord> {
    return this.headwordModel.findById(id).exec();
  }

  findAll(): Promise<HeadwordRecord[]> {
    return this.headwordModel.find({}).exec();
  }

  search(chars: string): Promise<HeadwordRecord[]> {
    if (chars) {
      return this.headwordModel
        .find({ word: { $regex: `^${chars}`, $options: '$i' } })
        .exec();
    } else {
      return Promise.resolve([]);
    }
  }

  async makeTopLevel(
    oxId: string,
    homographC: number
  ): Promise<HeadwordRecord> {
    const updated = await this.headwordModel
      .findOneAndUpdate(
        { oxId: oxId, homographC: homographC },
        { $set: { topLevel: true } },
        { new: true }
      )
      .lean();

    const promises = [];

    for (const senseId of updated.ownSenseIds) {
      promises.push(this.findOrCreateHeadwordsForSense(senseId));
    }

    await Promise.all(promises);

    return updated;
  }

  async findOrCreateHeadwordsForSense(senseId: string): Promise<any> {
    const record = await this.sensesService.findOne(senseId);
    const promises = [];
    for (const synonym of record.synonyms) {
      promises.push(this.findOrCreateAndUpdateSenses(synonym, false, senseId));
    }
    return Promise.all(promises);
  }

  getLatest = (record: HeadwordRecord) => {
    return this.headwordModel
      .findById(record._id)
      .lean()
      .exec();
  };

  createHeadword = (
    record: OxfordSearchRecord,
    topLevel: boolean,
    synonymSenseId = null
  ): Promise<HeadwordRecord> => {
    const headword = {
      word: record.result.word,
      oxId: record.result.id,
      homographC: record.homographC,
      topLevel: topLevel,
      synonymSenseIds: synonymSenseId ? [synonymSenseId] : []
    };
    return this.headwordModel.create(headword);
  };

  createSenses = async (
    searchRecord: OxfordSearchRecord,
    topLevel: boolean
  ): Promise<SenseRecord[]> => {
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
    const senses: SenseRecord[] = await Promise.all(promises);

    await Promise.all(
      senses.map(record => {
        return this.addOwnSense(
          record.headwordOxId,
          record.headwordHomographC,
          record.senseId
        );
      })
    );

    if (topLevel) {
      const headwords = [];
      senses.map(record => {
        record.synonyms.map(word => {
          headwords.push(
            this.findOrCreateAndUpdateSenses(word, false, record.senseId)
          );
        });
      });
      await Promise.all(headwords);
    }

    return senses;
  };

  addOwnSense(oxId: string, homographC: number, senseId: string) {
    return this.headwordModel.updateOne(
      { oxId: oxId, homographC: homographC },
      { $addToSet: { ownSenseIds: senseId } }
    );
  }

  addSynonymSense(
    oxId: string,
    homographC: number,
    senseId: string
  ): Promise<HeadwordRecord> {
    return this.headwordModel
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
