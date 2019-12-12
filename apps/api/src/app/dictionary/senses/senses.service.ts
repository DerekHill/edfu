import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SENSE_COLLECTION_NAME } from '../../constants';
import { SenseDocument, SenseRecord } from './interfaces/sense.interface';
import { LexicalCategory, DictionaryOrThesaurus } from '../../enums';
import { oc } from 'ts-optchain';
import {
  OxSense,
  OxThesaurusLink,
  OxSubsense
} from '../../oxford-api/interfaces/oxford-api.interface';

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
    private readonly senseModel: Model<SenseDocument>
  ) {}

  async findOrCreate(
    headwordOxId: string,
    headwordHomographC: number,
    lexicalCategory: LexicalCategory,
    oxSense: OxSense
  ): Promise<SenseRecord> {
    const senseId = this.extractSenseId(oxSense);

    const sense = {
      headwordOxId: headwordOxId,
      headwordHomographC: headwordHomographC,
      dictionaryOrThesaurus: this.determineDictionaryOrThesaurus(oxSense),
      lexicalCategory: lexicalCategory,
      senseId: senseId,
      thesaurusLinks: this.extractThesaurusLinks(oxSense),
      example: this.extractExample(oxSense),
      definition: this.extractDefinition(oxSense),
      synonyms: this.extractSynonyms(oxSense)
    };

    return this.senseModel
      .findOneAndUpdate({ senseId: senseId }, sense, {
        upsert: true,
        new: true
      })
      .lean()
      .exec();
  }

  findOne(senseId: string): Promise<SenseRecord> {
    return this.senseModel
      .findOne({ senseId: senseId })
      .lean()
      .exec();
  }

  extractSynonyms(oxSense: OxSense): string[] {
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

  private extractThesaurusLinks(oxSense: OxSense): OxThesaurusLink[] {
    return oc(oxSense).thesaurusLinks();
  }

  private determineDictionaryOrThesaurus(
    oxSense: OxSense
  ): DictionaryOrThesaurus {
    if (oxSense.definitions) {
      return DictionaryOrThesaurus.dictionary;
    } else {
      return DictionaryOrThesaurus.thesaurus;
    }
  }
}
