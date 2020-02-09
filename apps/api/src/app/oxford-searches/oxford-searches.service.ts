import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ENTRY_SEARCH_COLLECTION_NAME,
  THESAURUS_SEARCH_COLLECTION_NAME,
  MONGO_DUPLICATE_ERROR_CODE
} from '../constants';
import { Model } from 'mongoose';
import {
  OxfordSearchDocument,
  OxfordSearchRecord
} from './interfaces/oxford-search.interface';
import { OxfordApiService } from '../oxford-api/oxford-api.service';
import { oc } from 'ts-optchain';
import { OxResult } from '../oxford-api/interfaces/oxford-api.interface';

@Injectable()
export class BaseSearchesService {
  constructor(
    @InjectModel(ENTRY_SEARCH_COLLECTION_NAME)
    private readonly searchModel: Model<OxfordSearchDocument>,
    protected readonly oxfordApiService: OxfordApiService
  ) {}

  protected getOxfordApiResults(searchTerm: string) {
    return Promise.resolve(null); // overwrite in subclass
  }

  async findOrFetch(searchTerm: string): Promise<OxfordSearchRecord[]> {
    const existing = await this.searchModel
      .find({
        oxIdOrSearchTermLowercase: searchTerm
      })
      .collation({ locale: 'en', strength: 2 })
      .lean();

    if (existing.length) {
      return existing;
    }
    console.log(this.constructor.name, ': Calling oxford API for ', searchTerm);
    const results: OxResult[] = await this.getOxfordApiResults(searchTerm);
    if (results.length === 0) {
      results.push(null);
    }

    return await Promise.all(
      results.map((result: OxResult) => {
        return this.findOrCreateFromResult(searchTerm, result);
      })
    );
  }

  findOrCreateFromResult = async (
    searchTerm: string,
    result: OxResult
  ): Promise<OxfordSearchRecord> => {
    const homographC = this.extractHomographC(result);
    const oxIdOrSearchTermLowercase = this.extractOxIdOrSearchTermLowercase(
      searchTerm,
      result
    );

    const conditions = {
      oxIdOrSearchTermLowercase: oxIdOrSearchTermLowercase,
      homographC: homographC
    };

    const allParams = { ...conditions, ...{ result: result } };

    try {
      return await this.searchModel
        .findOneAndUpdate(conditions, allParams, {
          upsert: true,
          new: true
        })
        .lean()
        .exec();
    } catch (error) {
      if (error.code === MONGO_DUPLICATE_ERROR_CODE) {
        return this.searchModel
          .findOne(conditions)
          .lean()
          .exec();
      } else {
        throw error;
      }
    }
  };

  extractHomographC(result: any) {
    const homographNumber = oc(
      result
    ).lexicalEntries[0].entries[0].homographNumber();
    if (homographNumber) {
      return parseInt(homographNumber[0], 10);
    } else {
      return 0;
    }
  }

  extractOxIdOrSearchTermLowercase(
    searchTerm: string,
    result: OxResult
  ): string {
    if (result) {
      return result.id;
    } else {
      return searchTerm.toLowerCase();
    }
  }
}

@Injectable()
export class ThesaurusSearchesService extends BaseSearchesService {
  constructor(
    @InjectModel(THESAURUS_SEARCH_COLLECTION_NAME)
    private readonly thesaurusSearchModel: Model<OxfordSearchDocument>,
    oxfordService: OxfordApiService
  ) {
    super(thesaurusSearchModel, oxfordService);
  }

  protected getOxfordApiResults(searchTerm: string) {
    return this.oxfordApiService.getThesauruses(searchTerm);
  }
}

@Injectable()
export class EntrySearchesService extends BaseSearchesService {
  constructor(
    @InjectModel(ENTRY_SEARCH_COLLECTION_NAME)
    private readonly entrySearchModel: Model<OxfordSearchDocument>,
    oxfordService: OxfordApiService
  ) {
    super(entrySearchModel, oxfordService);
  }

  protected getOxfordApiResults(searchTerm: string) {
    return this.oxfordApiService.getEntries(searchTerm);
  }
}
