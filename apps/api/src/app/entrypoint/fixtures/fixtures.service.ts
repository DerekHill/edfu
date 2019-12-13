import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HEADWORD_COLLECTION_NAME } from '../../constants';
import { Model } from 'mongoose';
import { HeadwordDocument } from '../../dictionary/headwords/interfaces/headword.interface';

@Injectable()
export class FixturesService {
  constructor(
    @InjectModel(HEADWORD_COLLECTION_NAME)
    private readonly headwordModel: Model<HeadwordDocument>
  ) {}
  create() {
    const headwords = [
      {
        oxId: 'food',
        homographC: null,
        word: 'food',
        topLevel: true
      },
      {
        oxId: 'drink',
        homographC: null,
        word: 'drink',
        topLevel: true
      }
    ];

    return Promise.all(
      headwords.map(word => {
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
