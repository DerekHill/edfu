import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  HEADWORD_COLLECTION_NAME,
  SENSE_COLLECTION_NAME
} from '../../constants';
import { Model } from 'mongoose';
import {
  HeadwordDocument,
  HeadwordRecordWithoutId
} from '../../dictionary/headwords/interfaces/headword.interface';
import {
  SenseDocument,
  SenseRecordWithoutId
} from '../../dictionary/senses/interfaces/sense.interface';

const FOOD = 'food';

const FOOD_SENSE_1_ID = 'm_en_gbus0378040.005';
const FOOD_SENSE_2_ID = 't_en_gb0005872.001';
const FOOD_SENSE_3_ID = 't_en_gb0005872.002';

const HEADWORDS: HeadwordRecordWithoutId[] = [
  {
    oxId: FOOD,
    homographC: null,
    word: FOOD,
    topLevel: true,
    ownSenseIds: [FOOD_SENSE_1_ID, FOOD_SENSE_2_ID, FOOD_SENSE_3_ID],
    synonymSenseIds: []
  },
  {
    oxId: 'drink',
    homographC: null,
    word: 'drink',
    topLevel: true,
    ownSenseIds: [],
    synonymSenseIds: []
  },
  {
    oxId: 'toast',
    homographC: null,
    word: 'toast',
    topLevel: true,
    ownSenseIds: [],
    synonymSenseIds: []
  }
];

const SENSES: SenseRecordWithoutId[] = [
  // dictionary
  {
    senseId: FOOD_SENSE_1_ID,
    headwordOxId: FOOD,
    headwordHomographC: null,
    example: 'we need food and water',
    definition:
      'any nutritious substance that people or animals eat or drink or that plants absorb in order to maintain life and growth',
    synonyms: []
  },
  //   thesaurus
  {
    senseId: FOOD_SENSE_2_ID,
    headwordOxId: FOOD,
    headwordHomographC: null,
    example: 'he went three days without food',
    synonyms: ['nourishment', 'sustenance', 'nutriment', 'subsistence']
  },
  //   thesaurus
  {
    senseId: FOOD_SENSE_3_ID,
    headwordOxId: FOOD,
    headwordHomographC: null,
    example: 'food for the cattle and horses',
    synonyms: ['fodder', 'feed', 'forage']
  }
];

@Injectable()
export class FixturesService {
  constructor(
    @InjectModel(HEADWORD_COLLECTION_NAME)
    private readonly headwordModel: Model<HeadwordDocument>,
    @InjectModel(SENSE_COLLECTION_NAME)
    private readonly senseModel: Model<SenseDocument>
  ) {}

  populateCollection(model: Model<any>, data: object[], conditionsGenerator) {
    return Promise.all(
      data.map(obj => {
        const conditions = conditionsGenerator(obj);
        return model
          .findOneAndUpdate(conditions, obj, {
            upsert: true,
            new: true
          })
          .lean()
          .exec();
      })
    );
  }

  headwordConditionsGenerator(obj: HeadwordRecordWithoutId) {
    return { oxId: obj.oxId, homographC: obj.homographC };
  }

  senseConditionsGenerator(obj: SenseRecordWithoutId) {
    return { senseId: obj.senseId };
  }

  async create() {
    await this.populateCollection(
      this.headwordModel,
      HEADWORDS,
      this.headwordConditionsGenerator
    );
    await this.populateCollection(
      this.senseModel,
      SENSES,
      this.senseConditionsGenerator
    );
    return console.log('Fixtures created!');
  }
}
