import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ENTRY_SEARCH_COLLECTION_NAME,
  THESAURUS_SEARCH_COLLECTION_NAME
} from '../constants';
import { Model } from 'mongoose';
import {
  OxfordSearchDocument,
  OxfordSearchRecord
} from './interfaces/oxford-search.interface';
import { CreateOxfordSearchDto } from './dto/create-oxford-search.dto';
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

  protected getOxfordEntries(searchTerm: string) {
    return Promise.resolve(['Overwrite in subclass']);
  }

  async findOrFetch(searchTerm: string): Promise<OxfordSearchRecord[]> {
    const existing = await this.searchModel
      .find({
        normalizedSearchTerm: searchTerm
      })
      .lean();

    if (existing.length) {
      return existing;
    } else {
      const results: Array<any> = await this.getOxfordEntries(searchTerm);
      if (results.length === 0) {
        results.push(null);
      }
      return await Promise.all(
        results.map((result: OxResult) => {
          return this.createFromResult(searchTerm, result);
        })
      );
    }
  }

  createFromResult = async (
    searchTerm: string,
    result: OxResult
  ): Promise<OxfordSearchRecord> => {
    const obj: CreateOxfordSearchDto = {
      normalizedSearchTerm: searchTerm,
      result: result,
      homographC: this.extractHomographNumberC(result),
      found: Boolean(result)
    };

    let createdEntrySearch: OxfordSearchDocument;

    try {
      createdEntrySearch = await this.searchModel.create(obj);
    } catch (error) {
      if (error.code === 11000) {
        return null;
      } else {
        throw error;
      }
    }
    return createdEntrySearch.toObject();
  };

  async count(normalizedSearchTerm: string, homographC: number) {
    return await this.searchModel.countDocuments({
      normalizedSearchTerm: normalizedSearchTerm,
      homographC: homographC
    });
  }

  extractHomographNumberC(result: any) {
    const homographNumber = oc(
      result
    ).lexicalEntries[0].entries[0].homographNumber();
    if (homographNumber) {
      return parseInt(homographNumber[0], 10);
    } else {
      return null;
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

  protected getOxfordEntries(searchTerm: string) {
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

  protected getOxfordEntries(searchTerm: string) {
    return this.oxfordApiService.getEntries(searchTerm);
  }
}
