import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ENTRY_COLLECTION_NAME,
  SENSE_COLLECTION_NAME,
  ENTRY_SENSE_COLLECTION_NAME
} from '../../constants';
import { Model } from 'mongoose';
import {
  EntryDocument,
  EntryRecordWithoutId
} from '../../dictionary/entries/interfaces/entry.interface';
import {
  DictionarySenseRecordWithoutId,
  ThesaurusSenseRecordWithoutId,
  SenseDocument
} from '../../dictionary/senses/interfaces/sense.interface';
import { SignRecordWithoutId } from '../../dictionary/signs/interfaces/sign.interface';
import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/api-interfaces';
import { HeadwordOrPhrase } from '../../enums';
import { EntrySenseRecordWithoutId } from '../../dictionary/entry-senses/interfaces/entry-sense.interface';

const FOOD = 'food';
const FAST = 'fast';
const BANK = 'bank';
const SPEEDY = 'speedy';

const FOOD_0_DICT_NOU_SENSE_1_ID = 'm_en_gbus0378040.005';
const FOOD_0_THES_NOU_SENSE_2_ID = 't_en_gb0005872.001';
const FOOD_0_THES_NOU_SENSE_3_ID = 't_en_gb0005872.002';

const FAST_1_DICT_ADJ_SENSE_1_ID = 'm_en_gbus0352370.007';
const FAST_1_DICT_ADJ_SENSE_2_ID = 'm_en_gbus0352370.018';
const FAST_1_DICT_ADJ_SENSE_3_ID = 'm_en_gbus0352370.021';
const FAST_1_DICT_ADJ_SENSE_4_ID = 'm_en_gbus0352370.024';
const FAST_1_DICT_ADJ_SENSE_5_ID = 'm_en_gbus0352370.027';
const FAST_1_DICT_ADJ_SENSE_6_ID = 'm_en_gbus0352370.029';
const FAST_1_DICT_ADJ_SENSE_7_ID = 'm_en_gbus0352370.031';
const FAST_1_DICT_ADV_SENSE_1_ID = 'm_en_gbus0352370.035';
const FAST_1_DICT_ADV_SENSE_2_ID = 'm_en_gbus0352370.041';
const FAST_1_DICT_ADV_SENSE_3_ID = 'm_en_gbus0352370.044';
const FAST_2_DICT_VER_SENSE_1_ID = 'm_en_gbus0352380.005';
const FAST_2_DICT_NOU_SENSE_1_ID = 'm_en_gbus0352380.019';

const FAST_1_THES_ADJ_SENSE_1_ID = 't_en_gb0005497.001'; // Linked to FAST_1_DICT_ADJ_SENSE_1_ID
const FAST_1_THES_ADJ_SENSE_2_ID = 't_en_gb0005497.002'; // Linked to FAST_1_DICT_ADJ_SENSE_3_ID
const FAST_1_THES_ADJ_SENSE_3_ID = 't_en_gb0005497.003'; // Linked to FAST_1_DICT_ADJ_SENSE_5_ID
const FAST_1_THES_ADJ_SENSE_4_ID = 't_en_gb0005497.004';
const FAST_1_THES_ADJ_SENSE_5_ID = 't_en_gb0005497.005';
const FAST_1_THES_ADJ_SENSE_6_ID = 't_en_gb0005497.006'; // Linked to FAST_1_DICT_ADJ_SENSE_6_ID
const FAST_1_THES_ADV_SENSE_1_ID = 't_en_gb0005497.007';
const FAST_1_THES_ADV_SENSE_2_ID = 't_en_gb0005497.008';
const FAST_1_THES_ADV_SENSE_3_ID = 't_en_gb0005497.009';
const FAST_1_THES_ADV_SENSE_4_ID = 't_en_gb0005497.010';
const FAST_2_THES_VER_SENSE_1_ID = 't_en_gb0005498.001'; // Linked to FAST_2_DICT_VER_SENSE_1_ID
const FAST_2_THES_NOU_SENSE_1_ID = 't_en_gb0005498.002'; // Linked to FAST_2_DICT_NOU_SENSE_1_ID

const BANK_1_DICT_NOU_SENSE_1_ID = 'm_en_gbus0071450.008';
const BANK_1_DICT_NOU_SENSE_2_ID = 'm_en_gbus0071450.012';
const BANK_1_DICT_NOU_SENSE_3_ID = 'm_en_gbus0071450.017';
const BANK_1_DICT_NOU_SENSE_4_ID = 'm_en_gbus0071450.020';
const BANK_1_DICT_VER_SENSE_1_ID = 'm_en_gbus0071450.023';
const BANK_1_DICT_VER_SENSE_2_ID = 'm_en_gbus0071450.034';
const BANK_1_DICT_VER_SENSE_3_ID = 'm_en_gbus0071450.037';
const BANK_1_DICT_VER_SENSE_4_ID = 'm_en_gbus0071450.039';
const BANK_1_DICT_VER_SENSE_5_ID = 'm_en_gbus0071450.041';
const BANK_2_DICT_NOU_SENSE_1_ID = 'm_en_gbus0071460.005';
const BANK_2_DICT_VER_SENSE_1_ID = 'm_en_gbus0071460.015';

const BANK_1_THES_NOU_SENSE_1_ID = 't_en_gb0001138.001'; // Linked to BANK_1_DICT_NOU_SENSE_1_ID
const BANK_1_THES_NOU_SENSE_2_ID = 't_en_gb0001138.002'; // Linked to BANK_1_DICT_NOU_SENSE_2_ID
const BANK_1_THES_NOU_SENSE_3_ID = 't_en_gb0001138.003'; // Linked to BANK_1_DICT_NOU_SENSE_3_ID
const BANK_1_THES_VER_SENSE_1_ID = 't_en_gb0001138.004'; // Linked to BANK_1_DICT_VER_SENSE_1_ID
const BANK_1_THES_VER_SENSE_2_ID = 't_en_gb0001138.005';
const BANK_1_THES_VER_SENSE_3_ID = 't_en_gb0001138.006'; // Linked to BANK_1_DICT_VER_SENSE_2_ID
const BANK_2_THES_NOU_SENSE_1_ID = 't_en_gb0001139.001'; // Linked to BANK_2_DICT_NOU_SENSE_1_ID
const BANK_2_THES_NOU_SENSE_2_ID = 't_en_gb0001139.002';
const BANK_2_THES_VER_SENSE_1_ID = 't_en_gb0001139.003'; // Linked to BANK_2_DICT_VER_SENSE_1_ID
const BANK_2_THES_VER_SENSE_2_ID = 't_en_gb0001139.004'; // Linked to BANK_2_DICT_VER_SENSE_1_ID as well

const SPEEDY_0_DICT_ADJ_SENSE_1_ID = 'm_en_gbus0976550.008';
const SPEEDY_0_DICT_ADJ_SENSE_2_ID = 'm_en_gbus0976550.013';

const SPEEDY_0_THES_ADJ_SENSE_1_ID = 't_en_gb0013890.001'; // Linked to SPEEDY_DICT_ADJ_SENSE_1_ID
const SPEEDY_0_THES_ADJ_SENSE_2_ID = 't_en_gb0013890.002'; // Linked to SPEEDY_DICT_ADJ_SENSE_2_ID

const ENTRIES: EntryRecordWithoutId[] = [
  {
    oxId: FOOD,
    homographC: 0,
    word: FOOD,
    relatedEntriesAdded: true,
    headwordOrPhrase: HeadwordOrPhrase.headword
  },
  {
    oxId: FAST,
    homographC: 1,
    word: FAST,
    relatedEntriesAdded: true,
    headwordOrPhrase: HeadwordOrPhrase.headword
  },
  {
    oxId: FAST,
    homographC: 2,
    word: FAST,
    relatedEntriesAdded: true,
    headwordOrPhrase: HeadwordOrPhrase.headword
  },
  {
    oxId: BANK,
    homographC: 1,
    word: BANK,
    relatedEntriesAdded: true,
    headwordOrPhrase: HeadwordOrPhrase.headword
  },
  {
    oxId: BANK,
    homographC: 2,
    word: BANK,
    relatedEntriesAdded: true,
    headwordOrPhrase: HeadwordOrPhrase.headword
  },
  {
    oxId: SPEEDY,
    homographC: 0,
    word: SPEEDY,
    relatedEntriesAdded: true,
    headwordOrPhrase: HeadwordOrPhrase.headword
  },
  {
    oxId: 'drink',
    homographC: 0,
    word: 'drink',
    relatedEntriesAdded: true,
    headwordOrPhrase: HeadwordOrPhrase.headword
  },
  {
    oxId: 'toast',
    homographC: 0,
    word: 'toast',
    relatedEntriesAdded: true,
    headwordOrPhrase: HeadwordOrPhrase.headword
  }
];

const DICTIONARY_SENSES: DictionarySenseRecordWithoutId[] = [
  {
    senseId: FOOD_0_DICT_NOU_SENSE_1_ID,
    entryOxId: FOOD,
    entryHomographC: 0,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    thesaurusSenseIds: [],
    lexicalCategory: LexicalCategory.noun,
    example: 'we need food and water',
    definition:
      'any nutritious substance that people or animals eat or drink or that plants absorb in order to maintain life and growth'
  },
  {
    senseId: FAST_1_DICT_ADJ_SENSE_1_ID,
    entryOxId: FAST,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    thesaurusSenseIds: [FAST_1_THES_ADJ_SENSE_1_ID],
    example: 'a fast and powerful car',
    definition: 'moving or capable of moving at high speed'
  },
  {
    senseId: FAST_1_DICT_ADJ_SENSE_2_ID,
    entryOxId: FAST,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    thesaurusSenseIds: [],
    example: 'I keep my watch fifteen minutes fast',
    definition: '(of a clock or watch) showing a time ahead of the correct time'
  },
  {
    senseId: FAST_1_DICT_ADJ_SENSE_3_ID,
    entryOxId: FAST,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    thesaurusSenseIds: [FAST_1_THES_ADJ_SENSE_2_ID, 't_en_gb0005497.012'],
    example: 'he made a rope fast to each corner',
    definition: 'firmly fixed or attached'
  },
  {
    senseId: FAST_1_DICT_ADJ_SENSE_4_ID,
    entryOxId: FAST,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    thesaurusSenseIds: [],
    example: 'a 35-mm colour film which is ten times faster than Kodacolor II',
    definition: '(of a film) needing only a short exposure'
  },
  {
    senseId: FAST_1_DICT_ADJ_SENSE_5_ID,
    entryOxId: FAST,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    thesaurusSenseIds: [FAST_1_THES_ADJ_SENSE_3_ID],
    example: 'the dyes are boiled with the yarn to produce a fast colour',
    definition: '(of a dye) not fading in light or when washed'
  },
  {
    senseId: FAST_1_DICT_ADJ_SENSE_6_ID,
    entryOxId: FAST,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    thesaurusSenseIds: [FAST_1_THES_ADJ_SENSE_6_ID],
    example: 'the fast life she led in London',
    definition:
      'engaging in or involving activities characterized by excitement, extranvagance, and risk-taking'
  },
  {
    senseId: FAST_1_DICT_ADJ_SENSE_7_ID,
    entryOxId: FAST,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    thesaurusSenseIds: [],
    example: 'Mammy said, ‘Stop asking questions, you too damn farse.’',
    definition: '(of a person) prone to act in an unacceptably familiar way'
  },
  {
    senseId: FAST_1_DICT_ADV_SENSE_1_ID,
    entryOxId: FAST,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adverb,
    thesaurusSenseIds: [],
    example: 'he was driving too fast',
    definition: 'at high speed'
  },
  {
    senseId: FAST_1_DICT_ADV_SENSE_2_ID,
    entryOxId: FAST,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adverb,
    thesaurusSenseIds: [],
    example: 'the ship was held fast by the anchor chain',
    definition: 'so as to be hard to move; securely'
  },
  {
    senseId: FAST_1_DICT_ADV_SENSE_3_ID,
    entryOxId: FAST,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adverb,
    thesaurusSenseIds: [],
    example: 'they were too fast asleep to reply',
    definition: 'so as to be hard to wake'
  },
  {
    senseId: FAST_2_DICT_VER_SENSE_1_ID,
    entryOxId: FAST,
    entryHomographC: 2,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.verb,
    thesaurusSenseIds: [FAST_2_THES_VER_SENSE_1_ID],
    example: 'the ministry instructed people to fast',
    definition:
      'abstain from all or some kinds of food or drink, especially as a religious observance'
  },
  {
    senseId: FAST_2_DICT_NOU_SENSE_1_ID,
    entryOxId: FAST,
    entryHomographC: 2,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.noun,
    thesaurusSenseIds: [FAST_2_THES_NOU_SENSE_1_ID],
    example: 'a five-day fast',
    definition: 'an act or period of fasting'
  },
  {
    senseId: BANK_1_DICT_NOU_SENSE_1_ID,
    entryOxId: BANK,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.noun,
    thesaurusSenseIds: [BANK_1_THES_NOU_SENSE_1_ID],
    example: 'willows lined the bank of the stream',
    definition: 'the land alongside or sloping down to a river or lake'
  },
  {
    senseId: BANK_1_DICT_NOU_SENSE_2_ID,
    entryOxId: BANK,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.noun,
    thesaurusSenseIds: [BANK_1_THES_NOU_SENSE_2_ID],
    example: 'a grassy bank',
    definition: 'a long, high mass or mound of a particular substance'
  },
  {
    senseId: BANK_1_DICT_NOU_SENSE_3_ID,
    entryOxId: BANK,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.noun,
    thesaurusSenseIds: [BANK_1_THES_NOU_SENSE_3_ID],
    example:
      'the DJ had big banks of lights and speakers on either side of his console',
    definition:
      'a set of similar things, especially electrical or electronic devices, grouped together in rows'
  },
  {
    senseId: BANK_1_DICT_NOU_SENSE_4_ID,
    entryOxId: BANK,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.noun,
    thesaurusSenseIds: [],
    example: 'a bank shot',
    definition: 'the cushion of a pool table'
  },
  {
    senseId: BANK_1_DICT_VER_SENSE_1_ID,
    entryOxId: BANK,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.verb,
    thesaurusSenseIds: [BANK_1_THES_VER_SENSE_1_ID],
    example: 'the rain banked the soil up behind the gate',
    definition: 'heap (a substance) into a mass or mound'
  },
  {
    senseId: BANK_1_DICT_VER_SENSE_2_ID,
    entryOxId: BANK,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.verb,
    thesaurusSenseIds: [BANK_1_THES_VER_SENSE_3_ID],
    example: 'the plane banked as if to return to the airport',
    definition:
      '(with reference to an aircraft or vehicle) tilt or cause to tilt sideways in making a turn'
  },
  {
    senseId: BANK_1_DICT_VER_SENSE_3_ID,
    entryOxId: BANK,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.verb,
    thesaurusSenseIds: [],
    example:
      'he has built a four-cylinder locomotive for banking trains up the Lickey incline',
    definition:
      '(of a locomotive) provide additional power for (a train) in ascending an incline'
  },
  {
    senseId: BANK_1_DICT_VER_SENSE_4_ID,
    entryOxId: BANK,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    thesaurusSenseIds: [],
    lexicalCategory: LexicalCategory.verb,
    example: 'it was the biggest rainbow trout that had ever been banked',
    definition: '(of an angler) succeed in landing (a fish)'
  },
  {
    senseId: BANK_1_DICT_VER_SENSE_5_ID,
    entryOxId: BANK,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    thesaurusSenseIds: [],
    lexicalCategory: LexicalCategory.verb,
    example: 'I banked the eight ball off two cushions',
    definition:
      'in pool) play (a ball) so that it rebounds off a surface such as a cushion'
  },
  {
    senseId: BANK_2_DICT_NOU_SENSE_1_ID,
    entryOxId: BANK,
    entryHomographC: 2,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.noun,
    thesaurusSenseIds: [BANK_2_THES_NOU_SENSE_1_ID],
    example: 'a bank account',
    definition:
      'a financial establishment that uses money deposited by customers for investment, pays it out when required, makes loans at interest, and exchanges currency'
  },
  {
    senseId: BANK_2_DICT_VER_SENSE_1_ID,
    entryOxId: BANK,
    entryHomographC: 2,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.verb,
    thesaurusSenseIds: [BANK_2_THES_VER_SENSE_1_ID, BANK_2_THES_VER_SENSE_2_ID],
    example: 'she may have banked a cheque in the wrong account',
    definition: 'deposit (money or valuables) in a bank'
  },
  {
    senseId: SPEEDY_0_DICT_ADJ_SENSE_1_ID,
    entryOxId: SPEEDY,
    entryHomographC: 0,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    thesaurusSenseIds: [SPEEDY_0_THES_ADJ_SENSE_1_ID],
    example: 'a speedy recovery',
    definition: 'done or occurring quickly'
  },
  {
    senseId: SPEEDY_0_DICT_ADJ_SENSE_2_ID,
    entryOxId: SPEEDY,
    entryHomographC: 0,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    thesaurusSenseIds: [SPEEDY_0_THES_ADJ_SENSE_2_ID],
    example: 'a speedy winger',
    definition: 'moving quickly'
  }
];

const THESAURUS_SENSES: ThesaurusSenseRecordWithoutId[] = [
  {
    senseId: FOOD_0_THES_NOU_SENSE_2_ID,
    entryOxId: FOOD,
    entryHomographC: 0,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    example: 'he went three days without food',
    synonyms: ['nourishment', 'sustenance', 'nutriment', 'subsistence']
  },
  {
    senseId: FOOD_0_THES_NOU_SENSE_3_ID,
    entryOxId: FOOD,
    entryHomographC: 0,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    example: 'food for the cattle and horses',
    synonyms: ['fodder', 'feed', 'forage']
  },
  {
    senseId: FAST_1_THES_ADJ_SENSE_1_ID,
    entryOxId: FAST,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adjective,
    example: 'a fast sports car',
    synonyms: ['speedy', 'quick', 'swift', 'rapid']
  },
  {
    senseId: FAST_1_THES_ADJ_SENSE_2_ID,
    entryOxId: FAST,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adjective,
    example: 'his hand slammed against the door, holding it fast',
    synonyms: ['secure', 'secured', 'fastened', 'tight']
  },
  {
    senseId: FAST_1_THES_ADJ_SENSE_3_ID,
    entryOxId: FAST,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adjective,
    example: 'the dyes are boiled with yarn to produce a fast colour',
    synonyms: ['indelible', 'lasting', 'permanent', 'stable']
  },
  {
    senseId: FAST_1_THES_ADJ_SENSE_4_ID,
    entryOxId: FAST,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adjective,
    example: 'they remained fast friends',
    synonyms: [
      'loyal',
      'devoted',
      'faithful',
      'firm',
      'steadfast',
      'staunch',
      'true',
      'boon',
      'bosom',
      'inseparable'
    ]
  },
  {
    senseId: FAST_1_THES_ADJ_SENSE_5_ID,
    entryOxId: FAST,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adjective,
    example: 'a fast woman',
    synonyms: [
      'promiscuous',
      'licentious',
      'dissolute',
      'impure',
      'unchaste',
      'wanton',
      'abandoned'
    ]
  },
  {
    senseId: FAST_1_THES_ADJ_SENSE_6_ID,
    entryOxId: FAST,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adjective,
    example: 'the fast life she led in London',
    synonyms: [
      'wild',
      'dissipated',
      'dissolute',
      'debauched',
      'intemperate',
      'immoderate',
      'louche',
      'rakish',
      'decadent',
      'unrestrained',
      'reckless',
      'profligate',
      'self-indulgent',
      'shameless',
      'sinful',
      'immoral',
      'extravagant'
    ]
  },
  {
    senseId: FAST_1_THES_ADV_SENSE_1_ID,
    entryOxId: FAST,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adverb,
    example: 'she drove fast towards the gates',
    synonyms: ['quickly', 'rapidly', 'swiftly', 'speedily', 'briskly']
  },
  {
    senseId: FAST_1_THES_ADV_SENSE_2_ID,
    entryOxId: FAST,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adverb,
    example: 'his wheels were stuck fast',
    synonyms: ['securely', 'tightly', 'immovably', 'fixedly', 'firmly']
  },
  {
    senseId: FAST_1_THES_ADV_SENSE_3_ID,
    entryOxId: FAST,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adverb,
    example: "Richard's fast asleep",
    synonyms: ['deeply', 'sound', 'completely']
  },
  {
    senseId: FAST_1_THES_ADV_SENSE_4_ID,
    entryOxId: FAST,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adverb,
    example: 'she lived fast and dangerously',
    synonyms: [
      'wildly',
      'dissolutely',
      'intemperately',
      'immoderately',
      'rakishly',
      'recklessly',
      'self-indulgently',
      'extravagantly'
    ]
  },
  {
    senseId: FAST_2_THES_VER_SENSE_1_ID,
    entryOxId: FAST,
    entryHomographC: 2,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.verb,
    example: 'the ministry instructed people to fast, pray, and read scripture',
    synonyms: []
  },
  {
    senseId: FAST_2_THES_NOU_SENSE_1_ID,
    entryOxId: FAST,
    entryHomographC: 2,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    example: 'a five-day fast',
    synonyms: []
  },
  {
    senseId: BANK_1_THES_NOU_SENSE_1_ID,
    entryOxId: BANK,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    example: 'the banks of Lake Michigan',
    synonyms: [
      'edge',
      'side',
      'embankment',
      'levee',
      'border',
      'verge',
      'boundary',
      'margin',
      'rim',
      'fringe',
      'fringes',
      'flank',
      'brink',
      'perimeter',
      'circumference',
      'extremity',
      'periphery',
      'limit',
      'outer limit',
      'limits',
      'bound',
      'bounds'
    ]
  },
  {
    senseId: BANK_1_THES_NOU_SENSE_2_ID,
    entryOxId: BANK,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    example: 'a grassy bank',
    synonyms: [
      'slope',
      'rise',
      'incline',
      'gradient',
      'ramp',
      'acclivity',
      'tump'
    ]
  },
  {
    senseId: BANK_1_THES_NOU_SENSE_3_ID,
    entryOxId: BANK,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    example: 'a bank of switches',
    synonyms: ['array', 'row', 'line', 'tier', 'group', 'series']
  },
  {
    senseId: BANK_1_THES_VER_SENSE_1_ID,
    entryOxId: BANK,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.verb,
    example: 'they banked up the earth around their hollow',
    synonyms: ['stack', 'heap', 'pile']
  },
  {
    senseId: BANK_1_THES_VER_SENSE_2_ID,
    entryOxId: BANK,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.verb,
    example: 'she banked up the fire',
    synonyms: ['damp', 'smother', 'stifle']
  },
  {
    senseId: BANK_1_THES_VER_SENSE_3_ID,
    entryOxId: BANK,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.verb,
    example: 'she taught him how to bank the plane',
    synonyms: [
      'tilt',
      'lean',
      'tip',
      'slant',
      'incline',
      'angle',
      'slope',
      'list',
      'camber',
      'pitch',
      'dip',
      'cant'
    ]
  },
  {
    senseId: BANK_2_THES_NOU_SENSE_1_ID,
    entryOxId: BANK,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    example: 'I paid the money into my bank',
    synonyms: []
  },
  {
    senseId: BANK_2_THES_NOU_SENSE_2_ID,
    entryOxId: BANK,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    example: 'a blood bank',
    synonyms: [
      'store',
      'reserve',
      'accumulation',
      'stock',
      'stockpile',
      'inventory',
      'supply',
      'pool',
      'fund',
      'cache',
      'hoard'
    ]
  },
  {
    senseId: BANK_2_THES_VER_SENSE_1_ID,
    entryOxId: BANK,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    example: 'I banked the cheque',
    synonyms: ['deposit']
  },
  {
    senseId: BANK_2_THES_VER_SENSE_2_ID,
    entryOxId: BANK,
    entryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    example: 'the family has banked with Coutts for generations',
    synonyms: ['use']
  },
  {
    senseId: SPEEDY_0_THES_ADJ_SENSE_1_ID,
    entryOxId: SPEEDY,
    entryHomographC: 0,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adjective,
    example: 'a speedy reply',
    synonyms: [
      'rapid',
      'swift',
      'quick',
      'fast',
      'prompt',
      'immediate',
      'expeditious',
      'express',
      'brisk',
      'sharp',
      'unhesitating'
    ]
  },
  {
    senseId: SPEEDY_0_THES_ADJ_SENSE_2_ID,
    entryOxId: SPEEDY,
    entryHomographC: 0,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adjective,
    example: 'speedy hatchback',
    synonyms: ['fast']
  }
];

const ENTRY_SENSES: EntrySenseRecordWithoutId[] = [
  {
    oxId: FOOD,
    homographC: 0,
    senseId: FOOD_0_DICT_NOU_SENSE_1_ID,
    confidence: 1
  },
  {
    oxId: FAST,
    homographC: 1,
    senseId: FAST_1_DICT_ADJ_SENSE_1_ID,
    confidence: 1
  },
  {
    oxId: FAST,
    homographC: 1,
    senseId: FAST_1_DICT_ADJ_SENSE_2_ID,
    confidence: 1
  },
  {
    oxId: FAST,
    homographC: 1,
    senseId: FAST_1_DICT_ADJ_SENSE_3_ID,
    confidence: 1
  },
  {
    oxId: FAST,
    homographC: 1,
    senseId: FAST_1_DICT_ADJ_SENSE_4_ID,
    confidence: 1
  },
  {
    oxId: FAST,
    homographC: 1,
    senseId: FAST_1_DICT_ADJ_SENSE_5_ID,
    confidence: 1
  },
  {
    oxId: FAST,
    homographC: 1,
    senseId: FAST_1_DICT_ADJ_SENSE_6_ID,
    confidence: 1
  },
  {
    oxId: FAST,
    homographC: 1,
    senseId: FAST_1_DICT_ADJ_SENSE_7_ID,
    confidence: 1
  },
  {
    oxId: FAST,
    homographC: 1,
    senseId: FAST_1_DICT_ADV_SENSE_1_ID,
    confidence: 1
  },
  {
    oxId: FAST,
    homographC: 1,
    senseId: FAST_1_DICT_ADV_SENSE_2_ID,
    confidence: 1
  },
  {
    oxId: FAST,
    homographC: 1,
    senseId: FAST_1_DICT_ADV_SENSE_3_ID,
    confidence: 1
  },
  {
    oxId: FAST,
    homographC: 2,
    senseId: FAST_2_DICT_VER_SENSE_1_ID,
    confidence: 1
  },
  {
    oxId: FAST,
    homographC: 2,
    senseId: FAST_2_DICT_NOU_SENSE_1_ID,
    confidence: 1
  },
  {
    oxId: BANK,
    homographC: 1,
    senseId: BANK_1_DICT_NOU_SENSE_1_ID,
    confidence: 1
  },
  {
    oxId: BANK,
    homographC: 1,
    senseId: BANK_1_DICT_NOU_SENSE_2_ID,
    confidence: 1
  },
  {
    oxId: BANK,
    homographC: 1,
    senseId: BANK_1_DICT_NOU_SENSE_3_ID,
    confidence: 1
  },
  {
    oxId: BANK,
    homographC: 1,
    senseId: BANK_1_DICT_NOU_SENSE_4_ID,
    confidence: 1
  },
  {
    oxId: BANK,
    homographC: 1,
    senseId: BANK_1_DICT_VER_SENSE_1_ID,
    confidence: 1
  },
  {
    oxId: BANK,
    homographC: 1,
    senseId: BANK_1_DICT_VER_SENSE_2_ID,
    confidence: 1
  },
  {
    oxId: BANK,
    homographC: 1,
    senseId: BANK_1_DICT_VER_SENSE_3_ID,
    confidence: 1
  },
  {
    oxId: BANK,
    homographC: 1,
    senseId: BANK_1_DICT_VER_SENSE_4_ID,
    confidence: 1
  },
  {
    oxId: BANK,
    homographC: 1,
    senseId: BANK_1_DICT_VER_SENSE_5_ID,
    confidence: 1
  },
  {
    oxId: BANK,
    homographC: 2,
    senseId: BANK_2_DICT_NOU_SENSE_1_ID,
    confidence: 1
  },
  {
    oxId: BANK,
    homographC: 2,
    senseId: BANK_2_DICT_VER_SENSE_1_ID,
    confidence: 1
  },
  {
    oxId: SPEEDY,
    homographC: 0,
    senseId: SPEEDY_0_DICT_ADJ_SENSE_1_ID,
    confidence: 1
  },
  {
    oxId: SPEEDY,
    homographC: 0,
    senseId: SPEEDY_0_DICT_ADJ_SENSE_2_ID,
    confidence: 1
  },
  {
    oxId: SPEEDY,
    homographC: 0,
    senseId: FAST_1_DICT_ADJ_SENSE_1_ID,
    confidence: 0.1
  },
  {
    oxId: SPEEDY,
    homographC: 0,
    senseId: FAST_1_DICT_ADJ_SENSE_2_ID,
    confidence: 0.1
  },
  {
    oxId: SPEEDY,
    homographC: 0,
    senseId: FAST_1_DICT_ADJ_SENSE_3_ID,
    confidence: 0.1
  },
  {
    oxId: SPEEDY,
    homographC: 0,
    senseId: FAST_1_DICT_ADJ_SENSE_4_ID,
    confidence: 0.1
  },
  {
    oxId: SPEEDY,
    homographC: 0,
    senseId: FAST_1_DICT_ADJ_SENSE_5_ID,
    confidence: 0.1
  },
  {
    oxId: SPEEDY,
    homographC: 0,
    senseId: FAST_1_DICT_ADJ_SENSE_6_ID,
    confidence: 0.1
  },
  {
    oxId: SPEEDY,
    homographC: 0,
    senseId: FAST_1_DICT_ADJ_SENSE_7_ID,
    confidence: 0.1
  }
];

@Injectable()
export class FixturesService {
  constructor(
    @InjectModel(ENTRY_COLLECTION_NAME)
    private readonly entryModel: Model<EntryDocument>,
    @InjectModel(SENSE_COLLECTION_NAME)
    private readonly senseModel: Model<SenseDocument>,
    @InjectModel(ENTRY_SENSE_COLLECTION_NAME)
    private readonly entrySenseModel: Model<SenseDocument>
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

  entryConditionsGenerator(obj: EntryRecordWithoutId) {
    return { oxId: obj.oxId, homographC: obj.homographC };
  }

  senseConditionsGenerator(
    obj: DictionarySenseRecordWithoutId | ThesaurusSenseRecordWithoutId
  ) {
    return { senseId: obj.senseId };
  }

  entrySenseConditionsGenerator(obj: EntrySenseRecordWithoutId) {
    return { oxId: obj.oxId, homographC: obj.homographC, senseId: obj.senseId };
  }

  async create() {
    await this.populateCollection(
      this.entryModel,
      ENTRIES,
      this.entryConditionsGenerator
    );
    await this.populateCollection(
      this.senseModel,
      DICTIONARY_SENSES,
      this.senseConditionsGenerator
    );
    await this.populateCollection(
      this.senseModel,
      THESAURUS_SENSES,
      this.senseConditionsGenerator
    );
    await this.populateCollection(
      this.entrySenseModel,
      ENTRY_SENSES,
      this.entrySenseConditionsGenerator
    );
    return console.log('Fixtures created!');
  }
}
