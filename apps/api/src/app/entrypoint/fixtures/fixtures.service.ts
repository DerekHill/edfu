import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HEADWORD_COLLECTION_NAME } from '../../constants';
import { Model } from 'mongoose';
import { HeadwordDocument } from '../../dictionary/headwords/interfaces/headword.interface';

@Injectable()
export class FixturesService {
  constructor() // @InjectModel(HEADWORD_COLLECTION_NAME)
  // private readonly headwordModel: Model<HeadwordDocument>
  {
    // console.log(HEADWORD_COLLECTION_NAME);
  }
  //   create() {
  //     const headword = {
  //       oxId: 'food',
  //       homographC: null,
  //       word: 'food',
  //       topLevel: true,
  //       ownSenseIds: [],
  //       synonymSenseIds: []
  //     };

  //     return this.headwordModel
  //       .findOneAndUpdate(
  //         { oxId: headword.oxId, homographC: headword.homographC },
  //         headword,
  //         {
  //           upsert: true,
  //           new: true
  //         }
  //       )
  //       .lean()
  //       .exec();
  //   }
}
