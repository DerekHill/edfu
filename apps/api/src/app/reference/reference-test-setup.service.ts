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
import { SignRecord, SenseSignRecordWithoutId } from '@edfu/api-interfaces';
import {
  EntryDocument,
  EntryRecord
} from './entries/interfaces/entry.interface';
import {
  EntrySenseDocument,
  EntrySenseRecord
} from './entry-senses/interfaces/entry-sense.interface';
import { SenseDocument } from './senses/interfaces/sense.interface';

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

  createEntry(entry: EntryRecord): Promise<EntryRecord> {
    return this.entryModel.create(entry);
  }

  createEntrySense(entrySense: EntrySenseRecord): Promise<EntrySenseRecord> {
    return this.entrySenseModel.create(entrySense);
  }

  createSenseSign(
    senseSign: SenseSignRecordWithoutId
  ): Promise<SenseSignRecord> {
    return this.senseSignModel.create(senseSign);
  }

  createSign(sign: SignRecord): Promise<SignRecord> {
    return this.signModel.create(sign);
  }
}
