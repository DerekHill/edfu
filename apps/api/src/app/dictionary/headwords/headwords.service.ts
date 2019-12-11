import { Injectable, Inject, forwardRef } from '@nestjs/common';
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
    @Inject(forwardRef(() => SensesService))
    private readonly sensesService: SensesService
  ) {}

  //   Need to deal with stemming & normalisation
  async findOrCreateFromWord(
    word: string,
    topLevel = false
  ): Promise<HeadwordRecord[]> {
    const existing = await this.headwordModel.find({
      word: word
    });

    if (existing.length) {
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
        entrySearchResults.map(record => this.createHeadword(record, topLevel))
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
      promises.push(
        this.sensesService.findOrCreateHeadwordsForExistingSynonyms(senseId)
      );
    }

    await Promise.all(promises);

    return updated;
  }

  getLatest = (record: HeadwordRecord) => {
    return this.headwordModel
      .findById(record._id)
      .lean()
      .exec();
  };

  createHeadword = async (
    record: OxfordSearchRecord,
    topLevel: boolean
  ): Promise<HeadwordRecord> => {
    const headword = {
      word: record.result.word,
      oxId: record.result.id,
      homographC: record.homographC,
      topLevel: topLevel
    };
    const doc = await this.headwordModel.create(headword);
    return doc.toObject();
  };

  createSenses = async (
    record: OxfordSearchRecord,
    topLevel: boolean
  ): Promise<SenseRecord[]> => {
    const promises = [];
    for (const categoryEntries of record.result.lexicalEntries) {
      const lexicalCategory =
        LexicalCategory[categoryEntries.lexicalCategory.id];
      for (const entry of categoryEntries.entries) {
        for (const sense of entry.senses) {
          promises.push(
            this.sensesService.findOrCreate(
              record.result.id,
              record.homographC,
              lexicalCategory,
              sense,
              topLevel
            )
          );
        }
      }
    }
    return Promise.all(promises);
  };

  addOwnSense(oxId: string, homographC: number, senseId: string) {
    return this.headwordModel.update(
      { oxId: oxId, homographC: homographC },
      { $addToSet: { ownSenseIds: senseId } }
    );
  }

  addSynonymSense(oxId: string, homographC: number, senseId: string) {
    return this.headwordModel.update(
      { oxId: oxId, homographC: homographC },
      { $addToSet: { synonymSenseIds: senseId } }
    );
  }
}
