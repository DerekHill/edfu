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
import { SignRecordWithoutId } from '../../dictionary/signs/interfaces/sign.interface';
import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/api-interfaces';

const FOOD = 'food';
const FAST = 'fast';
const BANK = 'bank';
const SPEEDY = 'speedy';

const FOOD_SENSE_1_ID = 'm_en_gbus0378040.005';
const FOOD_SENSE_2_ID = 't_en_gb0005872.001';
const FOOD_SENSE_3_ID = 't_en_gb0005872.002';

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
const FAST_2_DICT_NOU_SENSE_1_ID = 'm_en_gbus0352380.005';

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

const SPEEDY_DICT_ADJ_SENSE_1_ID = 'm_en_gbus0976550.008';
const SPEEDY_DICT_ADJ_SENSE_2_ID = 'm_en_gbus0976550.013';

const SPEEDY_THES_ADJ_SENSE_1_ID = 't_en_gb0013890.001'; // Linked to SPEEDY_DICT_ADJ_SENSE_1_ID
const SPEEDY_THES_ADJ_SENSE_2_ID = 't_en_gb0013890.002'; // Linked to SPEEDY_DICT_ADJ_SENSE_2_ID

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
    oxId: FAST,
    homographC: 1,
    word: FAST,
    topLevel: true,
    ownSenseIds: [
      FAST_1_DICT_ADJ_SENSE_1_ID,
      FAST_1_DICT_ADJ_SENSE_2_ID,
      FAST_1_DICT_ADJ_SENSE_3_ID,
      FAST_1_DICT_ADJ_SENSE_4_ID,
      FAST_1_DICT_ADJ_SENSE_5_ID,
      FAST_1_DICT_ADJ_SENSE_6_ID,
      FAST_1_DICT_ADJ_SENSE_7_ID,
      FAST_1_DICT_ADV_SENSE_1_ID,
      FAST_1_DICT_ADV_SENSE_2_ID,
      FAST_1_DICT_ADV_SENSE_3_ID
    ],
    synonymSenseIds: []
  },
  {
    oxId: FAST,
    homographC: 2,
    word: FAST,
    topLevel: true,
    ownSenseIds: [FAST_2_DICT_VER_SENSE_1_ID, FAST_2_DICT_NOU_SENSE_1_ID],
    synonymSenseIds: []
  },
  {
    oxId: BANK,
    homographC: 1,
    word: BANK,
    topLevel: true,
    ownSenseIds: [
      BANK_1_DICT_NOU_SENSE_1_ID,
      BANK_1_DICT_NOU_SENSE_2_ID,
      BANK_1_DICT_NOU_SENSE_3_ID,
      BANK_1_DICT_NOU_SENSE_4_ID,
      BANK_1_DICT_VER_SENSE_1_ID,
      BANK_1_DICT_VER_SENSE_2_ID,
      BANK_1_DICT_VER_SENSE_3_ID,
      BANK_1_DICT_VER_SENSE_4_ID,
      BANK_1_DICT_VER_SENSE_5_ID
    ],
    synonymSenseIds: []
  },
  {
    oxId: BANK,
    homographC: 2,
    word: BANK,
    topLevel: true,
    ownSenseIds: [BANK_2_DICT_NOU_SENSE_1_ID, BANK_2_DICT_VER_SENSE_1_ID],
    synonymSenseIds: []
  },
  {
    oxId: SPEEDY,
    homographC: null,
    word: SPEEDY,
    topLevel: true,
    ownSenseIds: [SPEEDY_DICT_ADJ_SENSE_1_ID, SPEEDY_DICT_ADJ_SENSE_2_ID],
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
  {
    senseId: FOOD_SENSE_1_ID,
    headwordOxId: FOOD,
    headwordHomographC: null,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    example: 'we need food and water',
    definition:
      'any nutritious substance that people or animals eat or drink or that plants absorb in order to maintain life and growth',
    synonyms: []
  },
  {
    senseId: FOOD_SENSE_2_ID,
    headwordOxId: FOOD,
    headwordHomographC: null,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    example: 'he went three days without food',
    synonyms: ['nourishment', 'sustenance', 'nutriment', 'subsistence']
  },
  {
    senseId: FOOD_SENSE_3_ID,
    headwordOxId: FOOD,
    headwordHomographC: null,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    example: 'food for the cattle and horses',
    synonyms: ['fodder', 'feed', 'forage']
  },
  {
    senseId: FAST_1_DICT_ADJ_SENSE_1_ID,
    headwordOxId: FAST,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    thesaurusLinks: [
      {
        entry_id: 'fast',
        sense_id: FAST_1_THES_ADJ_SENSE_1_ID
      }
    ],
    example: 'a fast and powerful car',
    definition: 'moving or capable of moving at high speed',
    synonyms: []
  },
  {
    senseId: FAST_1_DICT_ADJ_SENSE_2_ID,
    headwordOxId: FAST,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    example: 'I keep my watch fifteen minutes fast',
    definition:
      '(of a clock or watch) showing a time ahead of the correct time',
    synonyms: []
  },
  {
    senseId: FAST_1_DICT_ADJ_SENSE_3_ID,
    headwordOxId: FAST,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    thesaurusLinks: [
      {
        entry_id: 'fast',
        sense_id: FAST_1_THES_ADJ_SENSE_2_ID
      },
      {
        entry_id: 'make_fast',
        sense_id: 't_en_gb0005497.012'
      }
    ],
    example: 'he made a rope fast to each corner',
    definition: 'firmly fixed or attached',
    synonyms: []
  },
  {
    senseId: FAST_1_DICT_ADJ_SENSE_4_ID,
    headwordOxId: FAST,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    example: 'a 35-mm colour film which is ten times faster than Kodacolor II',
    definition: '(of a film) needing only a short exposure',
    synonyms: []
  },
  {
    senseId: FAST_1_DICT_ADJ_SENSE_5_ID,
    headwordOxId: FAST,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    thesaurusLinks: [
      {
        entry_id: 'fast',
        sense_id: FAST_1_THES_ADJ_SENSE_3_ID
      }
    ],
    example: 'the dyes are boiled with the yarn to produce a fast colour',
    definition: '(of a dye) not fading in light or when washed',
    synonyms: []
  },
  {
    senseId: FAST_1_DICT_ADJ_SENSE_6_ID,
    headwordOxId: FAST,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    thesaurusLinks: [
      {
        entry_id: 'fast',
        sense_id: FAST_1_THES_ADJ_SENSE_6_ID
      }
    ],
    example: 'the fast life she led in London',
    definition:
      'engaging in or involving activities characterized by excitement, extranvagance, and risk-taking',
    synonyms: []
  },
  {
    senseId: FAST_1_DICT_ADJ_SENSE_7_ID,
    headwordOxId: FAST,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    example: 'Mammy said, ‘Stop asking questions, you too damn farse.’',
    definition: '(of a person) prone to act in an unacceptably familiar way',
    synonyms: []
  },
  {
    senseId: FAST_1_DICT_ADV_SENSE_1_ID,
    headwordOxId: FAST,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adverb,
    example: 'he was driving too fast',
    definition: 'at high speed',
    synonyms: []
  },
  {
    senseId: FAST_1_DICT_ADV_SENSE_2_ID,
    headwordOxId: FAST,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adverb,
    example: 'the ship was held fast by the anchor chain',
    definition: 'so as to be hard to move; securely',
    synonyms: []
  },
  {
    senseId: FAST_1_DICT_ADV_SENSE_3_ID,
    headwordOxId: FAST,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adverb,
    example: 'they were too fast asleep to reply',
    definition: 'so as to be hard to wake',
    synonyms: []
  },
  {
    senseId: FAST_2_DICT_VER_SENSE_1_ID,
    headwordOxId: FAST,
    headwordHomographC: 2,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.verb,
    thesaurusLinks: [
      {
        entry_id: 'fast',
        sense_id: FAST_2_THES_VER_SENSE_1_ID
      }
    ],
    example: 'the ministry instructed people to fast',
    definition:
      'abstain from all or some kinds of food or drink, especially as a religious observance',
    synonyms: []
  },
  {
    senseId: FAST_2_DICT_NOU_SENSE_1_ID,
    headwordOxId: FAST,
    headwordHomographC: 2,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.noun,
    thesaurusLinks: [
      {
        entry_id: 'fast',
        sense_id: FAST_2_THES_NOU_SENSE_1_ID
      }
    ],
    example: 'a five-day fast',
    definition: 'an act or period of fasting',
    synonyms: []
  },
  {
    senseId: BANK_1_DICT_NOU_SENSE_1_ID,
    headwordOxId: BANK,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.noun,
    thesaurusLinks: [
      {
        entry_id: 'bank',
        sense_id: BANK_1_THES_NOU_SENSE_1_ID
      }
    ],
    example: 'willows lined the bank of the stream',
    definition: 'the land alongside or sloping down to a river or lake',
    synonyms: []
  },
  {
    senseId: BANK_1_DICT_NOU_SENSE_2_ID,
    headwordOxId: BANK,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.noun,
    thesaurusLinks: [
      {
        entry_id: 'bank',
        sense_id: BANK_1_THES_NOU_SENSE_2_ID
      }
    ],
    example: 'a grassy bank',
    definition: 'a long, high mass or mound of a particular substance',
    synonyms: []
  },
  {
    senseId: BANK_1_DICT_NOU_SENSE_3_ID,
    headwordOxId: BANK,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.noun,
    thesaurusLinks: [
      {
        entry_id: 'bank',
        sense_id: BANK_1_THES_NOU_SENSE_3_ID
      }
    ],
    example:
      'the DJ had big banks of lights and speakers on either side of his console',
    definition:
      'a set of similar things, especially electrical or electronic devices, grouped together in rows',
    synonyms: []
  },
  {
    senseId: BANK_1_DICT_NOU_SENSE_4_ID,
    headwordOxId: BANK,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.noun,
    example: 'a bank shot',
    definition: 'the cushion of a pool table',
    synonyms: []
  },
  {
    senseId: BANK_1_DICT_VER_SENSE_1_ID,
    headwordOxId: BANK,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.verb,
    thesaurusLinks: [
      {
        entry_id: 'bank',
        sense_id: BANK_1_THES_VER_SENSE_1_ID
      }
    ],
    example: 'the rain banked the soil up behind the gate',
    definition: 'heap (a substance) into a mass or mound',
    synonyms: []
  },
  {
    senseId: BANK_1_DICT_VER_SENSE_2_ID,
    headwordOxId: BANK,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.verb,
    thesaurusLinks: [
      {
        entry_id: 'bank',
        sense_id: BANK_1_THES_VER_SENSE_3_ID
      }
    ],
    example: 'the plane banked as if to return to the airport',
    definition:
      '(with reference to an aircraft or vehicle) tilt or cause to tilt sideways in making a turn',
    synonyms: []
  },
  {
    senseId: BANK_1_DICT_VER_SENSE_3_ID,
    headwordOxId: BANK,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.verb,
    example:
      'he has built a four-cylinder locomotive for banking trains up the Lickey incline',
    definition:
      '(of a locomotive) provide additional power for (a train) in ascending an incline',
    synonyms: []
  },
  {
    senseId: BANK_1_DICT_VER_SENSE_4_ID,
    headwordOxId: BANK,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.verb,
    example: 'it was the biggest rainbow trout that had ever been banked',
    definition: '(of an angler) succeed in landing (a fish)',
    synonyms: []
  },
  {
    senseId: BANK_1_DICT_VER_SENSE_5_ID,
    headwordOxId: BANK,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.verb,
    example: 'I banked the eight ball off two cushions',
    definition:
      'in pool) play (a ball) so that it rebounds off a surface such as a cushion',
    synonyms: []
  },
  {
    senseId: BANK_2_DICT_NOU_SENSE_1_ID,
    headwordOxId: BANK,
    headwordHomographC: 2,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.noun,
    thesaurusLinks: [
      {
        entry_id: 'bank',
        sense_id: BANK_2_THES_NOU_SENSE_1_ID
      }
    ],
    example: 'a bank account',
    definition:
      'a financial establishment that uses money deposited by customers for investment, pays it out when required, makes loans at interest, and exchanges currency',
    synonyms: []
  },
  {
    senseId: BANK_2_DICT_VER_SENSE_1_ID,
    headwordOxId: BANK,
    headwordHomographC: 2,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.verb,
    thesaurusLinks: [
      {
        entry_id: 'bank',
        sense_id: BANK_2_THES_VER_SENSE_1_ID
      },
      {
        entry_id: 'bank',
        sense_id: BANK_2_THES_VER_SENSE_2_ID
      }
    ],
    example: 'she may have banked a cheque in the wrong account',
    definition: 'deposit (money or valuables) in a bank',
    synonyms: []
  },
  {
    senseId: FAST_1_THES_ADJ_SENSE_1_ID,
    headwordOxId: FAST,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adjective,
    example: 'a fast sports car',
    synonyms: ['speedy', 'quick', 'swift', 'rapid']
  },
  {
    senseId: FAST_1_THES_ADJ_SENSE_2_ID,
    headwordOxId: FAST,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adjective,
    example: 'his hand slammed against the door, holding it fast',
    synonyms: ['secure', 'secured', 'fastened', 'tight']
  },
  {
    senseId: FAST_1_THES_ADJ_SENSE_3_ID,
    headwordOxId: FAST,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adjective,
    example: 'the dyes are boiled with yarn to produce a fast colour',
    synonyms: ['indelible', 'lasting', 'permanent', 'stable']
  },
  {
    senseId: FAST_1_THES_ADJ_SENSE_4_ID,
    headwordOxId: FAST,
    headwordHomographC: 1,
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
    headwordOxId: FAST,
    headwordHomographC: 1,
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
    headwordOxId: FAST,
    headwordHomographC: 1,
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
    headwordOxId: FAST,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adverb,
    example: 'she drove fast towards the gates',
    synonyms: ['quickly', 'rapidly', 'swiftly', 'speedily', 'briskly']
  },
  {
    senseId: FAST_1_THES_ADV_SENSE_2_ID,
    headwordOxId: FAST,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adverb,
    example: 'his wheels were stuck fast',
    synonyms: ['securely', 'tightly', 'immovably', 'fixedly', 'firmly']
  },
  {
    senseId: FAST_1_THES_ADV_SENSE_3_ID,
    headwordOxId: FAST,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adverb,
    example: "Richard's fast asleep",
    synonyms: ['deeply', 'sound', 'completely']
  },
  {
    senseId: FAST_1_THES_ADV_SENSE_4_ID,
    headwordOxId: FAST,
    headwordHomographC: 1,
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
    headwordOxId: FAST,
    headwordHomographC: 2,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.verb,
    example: 'the ministry instructed people to fast, pray, and read scripture',
    synonyms: []
  },
  {
    senseId: FAST_2_THES_NOU_SENSE_1_ID,
    headwordOxId: FAST,
    headwordHomographC: 2,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    example: 'a five-day fast',
    synonyms: []
  },
  {
    senseId: BANK_1_THES_NOU_SENSE_1_ID,
    headwordOxId: BANK,
    headwordHomographC: 1,
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
    headwordOxId: BANK,
    headwordHomographC: 1,
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
    headwordOxId: BANK,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    example: 'a bank of switches',
    synonyms: ['array', 'row', 'line', 'tier', 'group', 'series']
  },
  {
    senseId: BANK_1_THES_VER_SENSE_1_ID,
    headwordOxId: BANK,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.verb,
    example: 'they banked up the earth around their hollow',
    synonyms: ['stack', 'heap', 'pile']
  },
  {
    senseId: BANK_1_THES_VER_SENSE_2_ID,
    headwordOxId: BANK,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.verb,
    example: 'she banked up the fire',
    synonyms: ['damp', 'smother', 'stifle']
  },
  {
    senseId: BANK_1_THES_VER_SENSE_3_ID,
    headwordOxId: BANK,
    headwordHomographC: 1,
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
    headwordOxId: BANK,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    example: 'I paid the money into my bank',
    synonyms: []
  },
  {
    senseId: BANK_2_THES_NOU_SENSE_2_ID,
    headwordOxId: BANK,
    headwordHomographC: 1,
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
    headwordOxId: BANK,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    example: 'I banked the cheque',
    synonyms: ['deposit']
  },
  {
    senseId: BANK_2_THES_VER_SENSE_2_ID,
    headwordOxId: BANK,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    example: 'the family has banked with Coutts for generations',
    synonyms: ['use']
  },
  {
    senseId: SPEEDY_DICT_ADJ_SENSE_1_ID,
    headwordOxId: SPEEDY,
    headwordHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    example: 'the family has banked with Coutts for generations',
    synonyms: ['use']
  },
  {
    senseId: SPEEDY_DICT_ADJ_SENSE_1_ID,
    headwordOxId: SPEEDY,
    headwordHomographC: null,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    thesaurusLinks: [
      {
        entry_id: 'speedy',
        sense_id: SPEEDY_THES_ADJ_SENSE_1_ID
      }
    ],
    example: 'a speedy recovery',
    definition: 'done or occurring quickly',
    synonyms: []
  },
  {
    senseId: SPEEDY_DICT_ADJ_SENSE_2_ID,
    headwordOxId: SPEEDY,
    headwordHomographC: null,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    thesaurusLinks: [
      {
        entry_id: 'speedy',
        sense_id: SPEEDY_THES_ADJ_SENSE_2_ID
      }
    ],
    example: 'a speedy winger',
    definition: 'moving quickly',
    synonyms: []
  },
  {
    senseId: SPEEDY_THES_ADJ_SENSE_1_ID,
    headwordOxId: SPEEDY,
    headwordHomographC: null,
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
    senseId: SPEEDY_THES_ADJ_SENSE_2_ID,
    headwordOxId: SPEEDY,
    headwordHomographC: null,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adjective,
    example: 'speedy hatchback',
    synonyms: ['fast']
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
