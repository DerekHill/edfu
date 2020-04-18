import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  SENSE_SIGN_COLLECTION_NAME,
  SIGN_COLLECTION_NAME,
  ENTRY_COLLECTION_NAME,
  ENTRY_SENSE_COLLECTION_NAME,
  SENSE_COLLECTION_NAME
} from '../constants';
import { Model } from 'mongoose';
import {
  SenseSignDocument,
  SenseSignRecord
} from './signs/interfaces/sense-sign.interface';
import { SignDocument } from './signs/interfaces/sign.interface';
import { SignRecord } from '@edfu/api-interfaces';
import {
  EntryDocument,
  EntryRecord
} from './entries/interfaces/entry.interface';
import {
  EntrySenseDocument,
  EntrySenseRecord
} from './entry-senses/interfaces/entry-sense.interface';
import {
  SenseDocument,
  DictionarySenseRecordWithoutId
} from './senses/interfaces/sense.interface';
import { HeadwordOrPhrase } from '../enums';
import { ObjectId } from 'bson';
import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/enums';

const DEFAULT_OXID = 'oxId';
const DEFAULT_SENSE_ID = 'senseId';

@Injectable()
export class ReferenceTestSetupService {
  constructor(
    @InjectModel(ENTRY_COLLECTION_NAME)
    private readonly entryModel: Model<EntryDocument>,
    @InjectModel(ENTRY_SENSE_COLLECTION_NAME)
    private readonly entrySenseModel: Model<EntrySenseDocument>,
    @InjectModel(SENSE_COLLECTION_NAME)
    private readonly senseModel: Model<SenseDocument>,
    @InjectModel(SENSE_SIGN_COLLECTION_NAME)
    private readonly senseSignModel: Model<SenseSignDocument>,
    @InjectModel(SIGN_COLLECTION_NAME)
    private readonly signModel: Model<SignDocument>
  ) {}

  createEntry(params: any): Promise<EntryRecord> {
    const defaults: EntryRecord = {
      _id: new ObjectId(),
      oxId: DEFAULT_OXID,
      homographC: 0,
      word: DEFAULT_OXID,
      relatedEntriesAdded: false,
      headwordOrPhrase: HeadwordOrPhrase.headword
    };
    return this.entryModel.create({ ...defaults, ...params });
  }

  createEntrySense(params: any): Promise<EntrySenseRecord> {
    const defaults = {
      _id: new ObjectId(),
      oxId: DEFAULT_OXID,
      homographC: 0,
      senseId: DEFAULT_SENSE_ID,
      associationType: DictionaryOrThesaurus.dictionary,
      similarity: 0.7
    };
    return this.entrySenseModel.create({ ...defaults, ...params });
  }

  createSense(params: any): Promise<SenseDocument> {
    const defaults: DictionarySenseRecordWithoutId = {
      senseId: DEFAULT_SENSE_ID,
      ownEntryOxId: 'jump',
      ownEntryHomographC: 0,
      lexicalCategory: LexicalCategory.noun,
      apiSenseIndex: 0,
      dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
      thesaurusSenseIds: [],
      definition: 'jump in the air',
      example: 'look how high it jumped!'
    };
    return this.senseModel.create({ ...defaults, ...params });
  }

  // Remove in favour of SignTestSetupService
  createSenseSign(params: any): Promise<SenseSignRecord> {
    const defaults = {
      userId: new ObjectId(),
      senseId: DEFAULT_SENSE_ID,
      signId: new ObjectId()
    };
    return this.senseSignModel.create({ ...defaults, ...params });
  }

  // Remove in favour of SignTestSetupService
  createSign(params: any): Promise<SignRecord> {
    const defaults = {
      _id: new ObjectId(),
      userId: new ObjectId(),
      mnemonic: 'remember me',
      s3KeyOrig: '1234.mp4'
    };
    return this.signModel.create({ ...defaults, ...params });
  }
}
