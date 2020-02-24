import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SENSE_COLLECTION_NAME,
  MONGO_DUPLICATE_ERROR_CODE
} from '../../constants';
import {
  SenseDocument,
  DictionarySenseRecord,
  ThesaurusSenseRecord,
  SharedSenseRecordWithoutId,
  DictionarySenseRecordWithoutId,
  ThesaurusSenseRecordWithoutId,
  LinkedSensePairing
} from './interfaces/sense.interface';
import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/enums';
import { oc } from 'ts-optchain';
import {
  OxSense,
  OxSubsense
} from '../../oxford-api/interfaces/oxford-api.interface';
import { EntrySensesService } from '../entry-senses/entry-senses.service';
import { EntrySenseRecord } from '../entry-senses/interfaces/entry-sense.interface';
import { SenseForEntryDto } from './dto/sense.dto';

const PROSCRIBED_REGISTERS = [
  'rare',
  'literary',
  'derogatory',
  'dated',
  'archaic'
  //   "informal",
];

@Injectable()
export class SensesService {
  constructor(
    @InjectModel(SENSE_COLLECTION_NAME)
    private readonly senseModel: Model<SenseDocument>,
    private readonly entrySensesService: EntrySensesService
  ) {}

  async findOrCreateDictionarySenseWithAssociation(
    ownEntryOxId: string,
    ownEntryHomographC: number,
    lexicalCategory: LexicalCategory,
    apiSenseIndex: number,
    oxSense: OxSense
  ): Promise<DictionarySenseRecord> {
    const senseId = this.extractSenseId(oxSense);

    const sense: DictionarySenseRecordWithoutId = {
      ownEntryOxId: ownEntryOxId,
      ownEntryHomographC: ownEntryHomographC,
      dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
      lexicalCategory: lexicalCategory,
      apiSenseIndex: apiSenseIndex,
      senseId: senseId,
      thesaurusSenseIds: this.extractThesaurusLinks(oxSense),
      example: this.extractExample(oxSense),
      definition: this.extractDefinition(oxSense)
    };

    const ownSimilarity = 1;

    await this.entrySensesService.findOrCreate(
      ownEntryOxId,
      ownEntryHomographC,
      senseId,
      DictionaryOrThesaurus.dictionary,
      ownSimilarity
    );

    return this.findOneAndUpdate(senseId, sense);
  }

  findOrCreateThesaurusSenseWithoutAssociation(
    ownEntryOxId: string,
    ownEntryHomographC: number,
    lexicalCategory: LexicalCategory,
    apiSenseIndex: number,
    oxSense: OxSense
  ): Promise<ThesaurusSenseRecord> {
    const senseId = this.extractSenseId(oxSense);

    const sense: ThesaurusSenseRecordWithoutId = {
      ownEntryOxId: ownEntryOxId,
      ownEntryHomographC: ownEntryHomographC,
      dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
      lexicalCategory: lexicalCategory,
      apiSenseIndex: apiSenseIndex,
      senseId: senseId,
      example: this.extractExample(oxSense),
      synonyms: this._extractSynonyms(oxSense)
    };

    return this.findOneAndUpdate<ThesaurusSenseRecord>(senseId, sense);
  }

  async findOneAndUpdate<
    T extends ThesaurusSenseRecord | DictionarySenseRecord
  >(senseId: string, sense: SharedSenseRecordWithoutId): Promise<T> {
    const conditions = { senseId: senseId };

    try {
      return await this.senseModel
        .findOneAndUpdate(conditions, sense, {
          upsert: true,
          new: true
        })
        .lean()
        .exec();
    } catch (error) {
      if (error.code === MONGO_DUPLICATE_ERROR_CODE) {
        return this.senseModel
          .findOne(conditions)
          .lean()
          .exec();
      } else {
        throw error;
      }
    }
  }

  extractThesaurusLinks(oxSense: OxSense): string[] {
    if (oxSense.thesaurusLinks) {
      return oxSense.thesaurusLinks.map(obj => obj.sense_id);
    } else {
      return [];
    }
  }

  async populateThesaurusLinkedSenses(
    thesaurusSense: ThesaurusSenseRecord
  ): Promise<LinkedSensePairing> {
    const dictionarySenses: DictionarySenseRecord[] = await this.senseModel
      .find({
        thesaurusSenseIds: thesaurusSense.senseId
      })
      .lean()
      .exec();

    return {
      thesaurusSense: thesaurusSense,
      dictionarySenses: dictionarySenses
    };
  }

  findOne(senseId: string): Promise<DictionarySenseRecord> {
    return this.senseModel
      .findOne({
        senseId: senseId,
        dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary
      })
      .lean()
      .exec();
  }

  findMany(senseIds: string[]): Promise<DictionarySenseRecord[]> {
    return this.senseModel
      .find()
      .where('senseId')
      .in(senseIds)
      .where('dictionaryOrThesaurus')
      .equals(DictionaryOrThesaurus.dictionary)
      .lean()
      .exec();
  }

  async getSensesForOxIdCaseInsensitive(
    oxId: string
  ): Promise<SenseForEntryDto[]> {
    const entrySenses = await this.entrySensesService.findByOxIdCaseInsensitive(
      oxId
    );
    return this.getValidSenses(entrySenses);
  }

  async getSensesForEntry(
    oxId: string,
    homographC: number
  ): Promise<SenseForEntryDto[]> {
    const entrySenses = await this.entrySensesService.findByEntryProperties(
      oxId,
      homographC
    );
    return this.getValidSenses(entrySenses);
  }

  private async getValidSenses(
    entrySenses: EntrySenseRecord[]
  ): Promise<SenseForEntryDto[]> {
    const entrySensesById = entrySenses.reduce((acc, curr) => {
      acc[curr.senseId] = curr;
      return acc;
    }, {});

    const senseIds = entrySenses.map(i => i.senseId);

    const senses = await this.senseModel.find({
      senseId: { $in: senseIds },
      definition: { $ne: null }
    });

    return senses.map(sense => {
      const entrySense = entrySensesById[sense.senseId];
      return {
        oxId: entrySense.oxId,
        ownEntryOxId: sense.ownEntryOxId,
        ownEntryHomographC: sense.ownEntryHomographC,
        homographC: entrySense.homographC,
        senseId: sense.senseId,
        lexicalCategory: sense.lexicalCategory,
        apiSenseIndex: sense.apiSenseIndex,
        example: sense.example,
        definition: sense.definition,
        associationType: entrySense.associationType,
        similarity: entrySense.similarity
      };
    });
  }

  _extractSynonyms(oxSense: OxSense): string[] {
    const res: string[] = [];

    if (this.includesProscribedRegisters(oxSense)) {
      return [];
    }

    if (oxSense.synonyms) {
      for (const synonym of oxSense.synonyms) {
        if (this.doesNotContainSpaces(synonym.text)) {
          res.push(synonym.text);
        }
      }
    }

    if (oxSense.subsenses) {
      for (const subsense of oxSense.subsenses) {
        if (!this.includesProscribedRegisters(subsense)) {
          if (subsense.synonyms) {
            for (const synonym of subsense.synonyms) {
              if (this.doesNotContainSpaces(synonym.text)) {
                res.push(synonym.text);
              }
            }
          }
        }
      }
    }

    return [...new Set(res)];
  }

  private includesProscribedRegisters(sense: OxSense | OxSubsense): boolean {
    return (
      sense.registers && PROSCRIBED_REGISTERS.includes(sense.registers[0].id)
    );
  }

  private doesNotContainSpaces(text: string): boolean {
    return !/\s/.test(text);
  }

  private extractSenseId(oxSense: OxSense): string {
    return oxSense.id;
  }

  private extractExample(oxSense: OxSense): string {
    return oc(oxSense).examples[0].text();
  }

  private extractDefinition(oxSense: OxSense): string {
    return oc(oxSense).definitions[0]();
  }

  async printSenses() {
    const senses = await this.senseModel
      .find(
        {
          dictionaryOrThesaurus: 'dictionary',
          ownEntryOxId: {
            $in: [
              'good_morning',
              'good_afternoon',
              'help',
              'more',
              'please',
              'thank_you',
              'break'
            ]
          }
        },
        { _id: 0, ownEntryOxId: 1, senseId: 1, definition: 1, example: 1 }
      )
      .lean()
      .exec();
    //   .replace(/,/g, '')
    for (const sense of senses) {
      console.log(
        `${sense.ownEntryOxId},${sense.senseId},${this.replace(
          sense.definition
        )},${this.replace(sense.example)}`
      );
    }
  }

  replace(string) {
    if (string) {
      return string.replace(/,/g, '');
    } else {
      return '';
    }
  }
}
