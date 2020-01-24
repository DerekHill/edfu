import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HEADWORD_COLLECTION_NAME } from '../../constants';
import { Model } from 'mongoose';
import { HeadwordDocument } from '../../dictionary/headwords/interfaces/headword.interface';

const FOOD_SENSE_1_ID = 'm_en_gbus0378040.005';
const FOOD_SENSE_2_ID = 't_en_gb0005872.001';
const FOOD_SENSE_3_ID = 't_en_gb0005872.002';

const HEADWORDS = [
  {
    oxId: 'food',
    homographC: null,
    word: 'food',
    topLevel: true,
    ownSenseIds: [FOOD_SENSE_1_ID, FOOD_SENSE_2_ID, FOOD_SENSE_3_ID]
  },
  {
    oxId: 'drink',
    homographC: null,
    word: 'drink',
    topLevel: true
  },
  {
    oxId: 'sail',
    homographC: null,
    word: 'sail',
    topLevel: true
  }
];

const SENSES = [
  // dictionary
  {
    senseId: FOOD_SENSE_1_ID,
    headwordOxId: 'food',
    headwordHomographC: null,
    example: 'we need food and water',
    definition:
      'any nutritious substance that people or animals eat or drink or that plants absorb in order to maintain life and growth',
    synonyms: []
  },
  //   thesaurus
  {
    senseId: FOOD_SENSE_2_ID,
    headwordOxId: 'food',
    headwordHomographC: null,
    example: 'he went three days without food',
    synonyms: ['nourishment', 'sustenance', 'nutriment', 'subsistence']
  },
  //   thesaurus
  {
    senseId: FOOD_SENSE_3_ID,
    headwordOxId: 'food',
    headwordHomographC: null,
    example: 'food for the cattle and horses',
    synonyms: ['fodder', 'feed', 'forage']
  }
];

@Injectable()
export class FixturesService {
  constructor(
    @InjectModel(HEADWORD_COLLECTION_NAME)
    private readonly headwordModel: Model<HeadwordDocument>
  ) {}
  create() {
    console.log('create ran');
    return Promise.all(
      HEADWORDS.map(word => {
        return this.headwordModel
          .findOneAndUpdate(
            { oxId: word.oxId, homographC: word.homographC },
            word,
            {
              upsert: true,
              new: true
            }
          )
          .lean()
          .exec();
      })
    );
  }
}
