import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ENTRY_COLLECTION_NAME,
  SENSE_COLLECTION_NAME,
  ENTRY_SENSE_COLLECTION_NAME,
  SENSE_SIGN_COLLECTION_NAME,
  SIGN_COLLECTION_NAME
} from '../../constants';
import { Model } from 'mongoose';
import {
  EntryDocument,
  EntryRecordWithoutId
} from '../../reference/entries/interfaces/entry.interface';
import {
  DictionarySenseRecordWithoutId,
  ThesaurusSenseRecordWithoutId,
  SenseDocument
} from '../../reference/senses/interfaces/sense.interface';
import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/enums';
import { HeadwordOrPhrase } from '../../enums';
import { EntrySenseRecordWithoutId } from '../../reference/entry-senses/interfaces/entry-sense.interface';
import { ObjectId } from 'bson';
import { SignRecord, SenseSignRecordWithoutId } from '@edfu/api-interfaces';
import { UsersService } from '../../users/users.service';

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

const SIGN_ID_MORE = new ObjectId('000000000000000000000001');
const SIGN_ID_HELP_1 = new ObjectId('000000000000000000000002');
const SIGN_ID_GOOD_MORNING_1 = new ObjectId('000000000000000000000003');
const SIGN_ID_PLEASE_1 = new ObjectId('000000000000000000000004');
const SIGN_ID_THANK_YOU_1 = new ObjectId('000000000000000000000005');
const SIGN_ID_GOOD_AFTERNOON = new ObjectId('000000000000000000000006');
const SIGN_ID_BREAK = new ObjectId('000000000000000000000007');
const SIGN_ID_PLEASE_2 = new ObjectId('000000000000000000000008');
const SIGN_ID_LOOK = new ObjectId('000000000000000000000009');
const SIGN_ID_HELP_2 = new ObjectId('00000000000000000000000A');
const SIGN_ID_TOILET = new ObjectId('00000000000000000000000B');
const SIGN_ID_BAD = new ObjectId('00000000000000000000000C');
const SIGN_ID_GOOD = new ObjectId('00000000000000000000000D');
const SIGN_ID_GOODBYE = new ObjectId('00000000000000000000000E');
const SIGN_ID_HELLO = new ObjectId('00000000000000000000000F');
const SIGN_ID_PLEASE_3 = new ObjectId('000000000000000000000010');
const SIGN_ID_STOP = new ObjectId('000000000000000000000011');
const SIGN_ID_YES = new ObjectId('000000000000000000000012');
const SIGN_ID_BEGIN = new ObjectId('000000000000000000000013');
const SIGN_ID_GOOD_MORNING_2 = new ObjectId('000000000000000000000014');
const SIGN_ID_HAPPY = new ObjectId('000000000000000000000015');
const SIGN_ID_NO = new ObjectId('000000000000000000000016');
const SIGN_ID_SAD = new ObjectId('000000000000000000000017');
const SIGN_ID_THANK_YOU_2 = new ObjectId('000000000000000000000018');
const SIGN_ID_FAST_SPEED = new ObjectId('000000000000000000000019');
const SIGN_ID_SLOW = new ObjectId('00000000000000000000001A');
const SIGN_ID_FAST_ABSTAIN = new ObjectId('00000000000000000000001B');

const FRED_USER_ID = new ObjectId('000000000000000000010001');

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
    ownEntryOxId: FOOD,
    ownEntryHomographC: 0,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    thesaurusSenseIds: [],
    lexicalCategory: LexicalCategory.noun,
    apiSenseIndex: 0,
    example: 'we need food and water',
    definition:
      'any nutritious substance that people or animals eat or drink or that plants absorb in order to maintain life and growth'
  },
  {
    senseId: FAST_1_DICT_ADJ_SENSE_1_ID,
    ownEntryOxId: FAST,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    apiSenseIndex: 0,
    thesaurusSenseIds: [FAST_1_THES_ADJ_SENSE_1_ID],
    example: 'a fast and powerful car',
    definition: 'moving or capable of moving at high speed'
  },
  {
    senseId: FAST_1_DICT_ADJ_SENSE_2_ID,
    ownEntryOxId: FAST,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    apiSenseIndex: 1,
    thesaurusSenseIds: [],
    example: 'I keep my watch fifteen minutes fast',
    definition: '(of a clock or watch) showing a time ahead of the correct time'
  },
  {
    senseId: FAST_1_DICT_ADJ_SENSE_3_ID,
    ownEntryOxId: FAST,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    apiSenseIndex: 2,
    thesaurusSenseIds: [FAST_1_THES_ADJ_SENSE_2_ID, 't_en_gb0005497.012'],
    example: 'he made a rope fast to each corner',
    definition: 'firmly fixed or attached'
  },
  {
    senseId: FAST_1_DICT_ADJ_SENSE_4_ID,
    ownEntryOxId: FAST,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    apiSenseIndex: 3,
    thesaurusSenseIds: [],
    example: 'a 35-mm colour film which is ten times faster than Kodacolor II',
    definition: '(of a film) needing only a short exposure'
  },
  {
    senseId: FAST_1_DICT_ADJ_SENSE_5_ID,
    ownEntryOxId: FAST,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    apiSenseIndex: 4,
    thesaurusSenseIds: [FAST_1_THES_ADJ_SENSE_3_ID],
    example: 'the dyes are boiled with the yarn to produce a fast colour',
    definition: '(of a dye) not fading in light or when washed'
  },
  {
    senseId: FAST_1_DICT_ADJ_SENSE_6_ID,
    ownEntryOxId: FAST,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    apiSenseIndex: 5,
    thesaurusSenseIds: [FAST_1_THES_ADJ_SENSE_6_ID],
    example: 'the fast life she led in London',
    definition:
      'engaging in or involving activities characterized by excitement, extranvagance, and risk-taking'
  },
  {
    senseId: FAST_1_DICT_ADJ_SENSE_7_ID,
    ownEntryOxId: FAST,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    apiSenseIndex: 6,
    thesaurusSenseIds: [],
    example: 'Mammy said, ‘Stop asking questions, you too damn farse.’',
    definition: '(of a person) prone to act in an unacceptably familiar way'
  },
  {
    senseId: FAST_1_DICT_ADV_SENSE_1_ID,
    ownEntryOxId: FAST,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adverb,
    apiSenseIndex: 0,
    thesaurusSenseIds: [],
    example: 'he was driving too fast',
    definition: 'at high speed'
  },
  {
    senseId: FAST_1_DICT_ADV_SENSE_2_ID,
    ownEntryOxId: FAST,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adverb,
    apiSenseIndex: 1,
    thesaurusSenseIds: [],
    example: 'the ship was held fast by the anchor chain',
    definition: 'so as to be hard to move; securely'
  },
  {
    senseId: FAST_1_DICT_ADV_SENSE_3_ID,
    ownEntryOxId: FAST,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adverb,
    apiSenseIndex: 2,
    thesaurusSenseIds: [],
    example: 'they were too fast asleep to reply',
    definition: 'so as to be hard to wake'
  },
  {
    senseId: FAST_2_DICT_VER_SENSE_1_ID,
    ownEntryOxId: FAST,
    ownEntryHomographC: 2,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.verb,
    apiSenseIndex: 0,
    thesaurusSenseIds: [FAST_2_THES_VER_SENSE_1_ID],
    example: 'the ministry instructed people to fast',
    definition:
      'abstain from all or some kinds of food or drink, especially as a religious observance'
  },
  {
    senseId: FAST_2_DICT_NOU_SENSE_1_ID,
    ownEntryOxId: FAST,
    ownEntryHomographC: 2,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.noun,
    apiSenseIndex: 0,
    thesaurusSenseIds: [FAST_2_THES_NOU_SENSE_1_ID],
    example: 'a five-day fast',
    definition: 'an act or period of fasting'
  },
  {
    senseId: BANK_1_DICT_NOU_SENSE_1_ID,
    ownEntryOxId: BANK,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.noun,
    apiSenseIndex: 0,
    thesaurusSenseIds: [BANK_1_THES_NOU_SENSE_1_ID],
    example: 'willows lined the bank of the stream',
    definition: 'the land alongside or sloping down to a river or lake'
  },
  {
    senseId: BANK_1_DICT_NOU_SENSE_2_ID,
    ownEntryOxId: BANK,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.noun,
    apiSenseIndex: 1,
    thesaurusSenseIds: [BANK_1_THES_NOU_SENSE_2_ID],
    example: 'a grassy bank',
    definition: 'a long, high mass or mound of a particular substance'
  },
  {
    senseId: BANK_1_DICT_NOU_SENSE_3_ID,
    ownEntryOxId: BANK,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.noun,
    apiSenseIndex: 2,
    thesaurusSenseIds: [BANK_1_THES_NOU_SENSE_3_ID],
    example:
      'the DJ had big banks of lights and speakers on either side of his console',
    definition:
      'a set of similar things, especially electrical or electronic devices, grouped together in rows'
  },
  {
    senseId: BANK_1_DICT_NOU_SENSE_4_ID,
    ownEntryOxId: BANK,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.noun,
    apiSenseIndex: 3,
    thesaurusSenseIds: [],
    example: 'a bank shot',
    definition: 'the cushion of a pool table'
  },
  {
    senseId: BANK_1_DICT_VER_SENSE_1_ID,
    ownEntryOxId: BANK,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.verb,
    apiSenseIndex: 0,
    thesaurusSenseIds: [BANK_1_THES_VER_SENSE_1_ID],
    example: 'the rain banked the soil up behind the gate',
    definition: 'heap (a substance) into a mass or mound'
  },
  {
    senseId: BANK_1_DICT_VER_SENSE_2_ID,
    ownEntryOxId: BANK,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.verb,
    apiSenseIndex: 1,
    thesaurusSenseIds: [BANK_1_THES_VER_SENSE_3_ID],
    example: 'the plane banked as if to return to the airport',
    definition:
      '(with reference to an aircraft or vehicle) tilt or cause to tilt sideways in making a turn'
  },
  {
    senseId: BANK_1_DICT_VER_SENSE_3_ID,
    ownEntryOxId: BANK,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.verb,
    apiSenseIndex: 2,
    thesaurusSenseIds: [],
    example:
      'he has built a four-cylinder locomotive for banking trains up the Lickey incline',
    definition:
      '(of a locomotive) provide additional power for (a train) in ascending an incline'
  },
  {
    senseId: BANK_1_DICT_VER_SENSE_4_ID,
    ownEntryOxId: BANK,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    thesaurusSenseIds: [],
    lexicalCategory: LexicalCategory.verb,
    apiSenseIndex: 3,
    example: 'it was the biggest rainbow trout that had ever been banked',
    definition: '(of an angler) succeed in landing (a fish)'
  },
  {
    senseId: BANK_1_DICT_VER_SENSE_5_ID,
    ownEntryOxId: BANK,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    thesaurusSenseIds: [],
    lexicalCategory: LexicalCategory.verb,
    apiSenseIndex: 4,
    example: 'I banked the eight ball off two cushions',
    definition:
      'in pool) play (a ball) so that it rebounds off a surface such as a cushion'
  },
  {
    senseId: BANK_2_DICT_NOU_SENSE_1_ID,
    ownEntryOxId: BANK,
    ownEntryHomographC: 2,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.noun,
    apiSenseIndex: 0,
    thesaurusSenseIds: [BANK_2_THES_NOU_SENSE_1_ID],
    example: 'a bank account',
    definition:
      'a financial establishment that uses money deposited by customers for investment, pays it out when required, makes loans at interest, and exchanges currency'
  },
  {
    senseId: BANK_2_DICT_VER_SENSE_1_ID,
    ownEntryOxId: BANK,
    ownEntryHomographC: 2,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.verb,
    apiSenseIndex: 0,
    thesaurusSenseIds: [BANK_2_THES_VER_SENSE_1_ID, BANK_2_THES_VER_SENSE_2_ID],
    example: 'she may have banked a cheque in the wrong account',
    definition: 'deposit (money or valuables) in a bank'
  },
  {
    senseId: SPEEDY_0_DICT_ADJ_SENSE_1_ID,
    ownEntryOxId: SPEEDY,
    ownEntryHomographC: 0,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    apiSenseIndex: 0,
    thesaurusSenseIds: [SPEEDY_0_THES_ADJ_SENSE_1_ID],
    example: 'a speedy recovery',
    definition: 'done or occurring quickly'
  },
  {
    senseId: SPEEDY_0_DICT_ADJ_SENSE_2_ID,
    ownEntryOxId: SPEEDY,
    ownEntryHomographC: 0,
    dictionaryOrThesaurus: DictionaryOrThesaurus.dictionary,
    lexicalCategory: LexicalCategory.adjective,
    apiSenseIndex: 1,
    thesaurusSenseIds: [SPEEDY_0_THES_ADJ_SENSE_2_ID],
    example: 'a speedy winger',
    definition: 'moving quickly'
  }
];

const THESAURUS_SENSES: ThesaurusSenseRecordWithoutId[] = [
  {
    senseId: FOOD_0_THES_NOU_SENSE_2_ID,
    ownEntryOxId: FOOD,
    ownEntryHomographC: 0,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    apiSenseIndex: 1,
    example: 'he went three days without food',
    synonyms: ['nourishment', 'sustenance', 'nutriment', 'subsistence']
  },
  {
    senseId: FOOD_0_THES_NOU_SENSE_3_ID,
    ownEntryOxId: FOOD,
    ownEntryHomographC: 0,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    apiSenseIndex: 2,
    example: 'food for the cattle and horses',
    synonyms: ['fodder', 'feed', 'forage']
  },
  {
    senseId: FAST_1_THES_ADJ_SENSE_1_ID,
    ownEntryOxId: FAST,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adjective,
    apiSenseIndex: 0,
    example: 'a fast sports car',
    synonyms: ['speedy', 'quick', 'swift', 'rapid']
  },
  {
    senseId: FAST_1_THES_ADJ_SENSE_2_ID,
    ownEntryOxId: FAST,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adjective,
    apiSenseIndex: 1,
    example: 'his hand slammed against the door, holding it fast',
    synonyms: ['secure', 'secured', 'fastened', 'tight']
  },
  {
    senseId: FAST_1_THES_ADJ_SENSE_3_ID,
    ownEntryOxId: FAST,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adjective,
    apiSenseIndex: 2,
    example: 'the dyes are boiled with yarn to produce a fast colour',
    synonyms: ['indelible', 'lasting', 'permanent', 'stable']
  },
  {
    senseId: FAST_1_THES_ADJ_SENSE_4_ID,
    ownEntryOxId: FAST,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adjective,
    apiSenseIndex: 3,
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
    ownEntryOxId: FAST,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adjective,
    apiSenseIndex: 4,
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
    ownEntryOxId: FAST,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adjective,
    apiSenseIndex: 5,
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
    ownEntryOxId: FAST,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adverb,
    apiSenseIndex: 0,
    example: 'she drove fast towards the gates',
    synonyms: ['quickly', 'rapidly', 'swiftly', 'speedily', 'briskly']
  },
  {
    senseId: FAST_1_THES_ADV_SENSE_2_ID,
    ownEntryOxId: FAST,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adverb,
    apiSenseIndex: 1,
    example: 'his wheels were stuck fast',
    synonyms: ['securely', 'tightly', 'immovably', 'fixedly', 'firmly']
  },
  {
    senseId: FAST_1_THES_ADV_SENSE_3_ID,
    ownEntryOxId: FAST,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adverb,
    apiSenseIndex: 2,
    example: "Richard's fast asleep",
    synonyms: ['deeply', 'sound', 'completely']
  },
  {
    senseId: FAST_1_THES_ADV_SENSE_4_ID,
    ownEntryOxId: FAST,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adverb,
    apiSenseIndex: 3,
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
    ownEntryOxId: FAST,
    ownEntryHomographC: 2,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.verb,
    apiSenseIndex: 0,
    example: 'the ministry instructed people to fast, pray, and read scripture',
    synonyms: []
  },
  {
    senseId: FAST_2_THES_NOU_SENSE_1_ID,
    ownEntryOxId: FAST,
    ownEntryHomographC: 2,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    apiSenseIndex: 0,
    example: 'a five-day fast',
    synonyms: []
  },
  {
    senseId: BANK_1_THES_NOU_SENSE_1_ID,
    ownEntryOxId: BANK,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    apiSenseIndex: 0,
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
    ownEntryOxId: BANK,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    apiSenseIndex: 1,
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
    ownEntryOxId: BANK,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    apiSenseIndex: 2,
    example: 'a bank of switches',
    synonyms: ['array', 'row', 'line', 'tier', 'group', 'series']
  },
  {
    senseId: BANK_1_THES_VER_SENSE_1_ID,
    ownEntryOxId: BANK,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.verb,
    apiSenseIndex: 0,
    example: 'they banked up the earth around their hollow',
    synonyms: ['stack', 'heap', 'pile']
  },
  {
    senseId: BANK_1_THES_VER_SENSE_2_ID,
    ownEntryOxId: BANK,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.verb,
    apiSenseIndex: 1,
    example: 'she banked up the fire',
    synonyms: ['damp', 'smother', 'stifle']
  },
  {
    senseId: BANK_1_THES_VER_SENSE_3_ID,
    ownEntryOxId: BANK,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.verb,
    apiSenseIndex: 2,
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
    ownEntryOxId: BANK,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    apiSenseIndex: 0,
    example: 'I paid the money into my bank',
    synonyms: []
  },
  {
    senseId: BANK_2_THES_NOU_SENSE_2_ID,
    ownEntryOxId: BANK,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    apiSenseIndex: 1,
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
    ownEntryOxId: BANK,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    apiSenseIndex: 0,
    example: 'I banked the cheque',
    synonyms: ['deposit']
  },
  {
    senseId: BANK_2_THES_VER_SENSE_2_ID,
    ownEntryOxId: BANK,
    ownEntryHomographC: 1,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.noun,
    apiSenseIndex: 1,
    example: 'the family has banked with Coutts for generations',
    synonyms: ['use']
  },
  {
    senseId: SPEEDY_0_THES_ADJ_SENSE_1_ID,
    ownEntryOxId: SPEEDY,
    ownEntryHomographC: 0,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adjective,
    apiSenseIndex: 0,
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
    ownEntryOxId: SPEEDY,
    ownEntryHomographC: 0,
    dictionaryOrThesaurus: DictionaryOrThesaurus.thesaurus,
    lexicalCategory: LexicalCategory.adjective,
    apiSenseIndex: 1,
    example: 'speedy hatchback',
    synonyms: ['fast']
  }
];

const ENTRY_SENSES: EntrySenseRecordWithoutId[] = [
  {
    oxId: FOOD,
    homographC: 0,
    senseId: FOOD_0_DICT_NOU_SENSE_1_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: FAST,
    homographC: 1,
    senseId: FAST_1_DICT_ADJ_SENSE_1_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: FAST,
    homographC: 1,
    senseId: FAST_1_DICT_ADJ_SENSE_2_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: FAST,
    homographC: 1,
    senseId: FAST_1_DICT_ADJ_SENSE_3_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: FAST,
    homographC: 1,
    senseId: FAST_1_DICT_ADJ_SENSE_4_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: FAST,
    homographC: 1,
    senseId: FAST_1_DICT_ADJ_SENSE_5_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: FAST,
    homographC: 1,
    senseId: FAST_1_DICT_ADJ_SENSE_6_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: FAST,
    homographC: 1,
    senseId: FAST_1_DICT_ADJ_SENSE_7_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: FAST,
    homographC: 1,
    senseId: FAST_1_DICT_ADV_SENSE_1_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: FAST,
    homographC: 1,
    senseId: FAST_1_DICT_ADV_SENSE_2_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: FAST,
    homographC: 1,
    senseId: FAST_1_DICT_ADV_SENSE_3_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: FAST,
    homographC: 2,
    senseId: FAST_2_DICT_VER_SENSE_1_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: FAST,
    homographC: 2,
    senseId: FAST_2_DICT_NOU_SENSE_1_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: BANK,
    homographC: 1,
    senseId: BANK_1_DICT_NOU_SENSE_1_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: BANK,
    homographC: 1,
    senseId: BANK_1_DICT_NOU_SENSE_2_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: BANK,
    homographC: 1,
    senseId: BANK_1_DICT_NOU_SENSE_3_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: BANK,
    homographC: 1,
    senseId: BANK_1_DICT_NOU_SENSE_4_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: BANK,
    homographC: 1,
    senseId: BANK_1_DICT_VER_SENSE_1_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: BANK,
    homographC: 1,
    senseId: BANK_1_DICT_VER_SENSE_2_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: BANK,
    homographC: 1,
    senseId: BANK_1_DICT_VER_SENSE_3_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: BANK,
    homographC: 1,
    senseId: BANK_1_DICT_VER_SENSE_4_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: BANK,
    homographC: 1,
    senseId: BANK_1_DICT_VER_SENSE_5_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: BANK,
    homographC: 2,
    senseId: BANK_2_DICT_NOU_SENSE_1_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: BANK,
    homographC: 2,
    senseId: BANK_2_DICT_VER_SENSE_1_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: SPEEDY,
    homographC: 0,
    senseId: SPEEDY_0_DICT_ADJ_SENSE_1_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },
  {
    oxId: SPEEDY,
    homographC: 0,
    senseId: SPEEDY_0_DICT_ADJ_SENSE_2_ID,
    similarity: 1,
    associationType: DictionaryOrThesaurus.dictionary
  },

  {
    oxId: SPEEDY,
    homographC: 0,
    senseId: FAST_1_DICT_ADJ_SENSE_1_ID,
    similarity: 0.381761462707106,
    associationType: DictionaryOrThesaurus.thesaurus
  },
  {
    oxId: SPEEDY,
    homographC: 0,
    senseId: FAST_1_DICT_ADJ_SENSE_2_ID,
    similarity: 0.187514542615853,
    associationType: DictionaryOrThesaurus.thesaurus
  },
  {
    oxId: SPEEDY,
    homographC: 0,
    senseId: FAST_1_DICT_ADJ_SENSE_3_ID,
    similarity: 0.257706585145461,
    associationType: DictionaryOrThesaurus.thesaurus
  },
  {
    oxId: SPEEDY,
    homographC: 0,
    senseId: FAST_1_DICT_ADJ_SENSE_4_ID,
    similarity: 0.210540626877511,
    associationType: DictionaryOrThesaurus.thesaurus
  },
  {
    oxId: SPEEDY,
    homographC: 0,
    senseId: FAST_1_DICT_ADJ_SENSE_5_ID,
    similarity: 0.0864320437801567,
    associationType: DictionaryOrThesaurus.thesaurus
  },
  {
    oxId: SPEEDY,
    homographC: 0,
    senseId: FAST_1_DICT_ADJ_SENSE_6_ID,
    similarity: 0.238039137005623,
    associationType: DictionaryOrThesaurus.thesaurus
  },
  {
    oxId: SPEEDY,
    homographC: 0,
    senseId: FAST_1_DICT_ADJ_SENSE_7_ID,
    similarity: 0.0864007882879364,
    associationType: DictionaryOrThesaurus.thesaurus
  }
];

const SENSE_SIGNS: SenseSignRecordWithoutId[] = [
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0423120.004',
    signId: SIGN_ID_GOOD_MORNING_1
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0422860.004',
    signId: SIGN_ID_GOOD_AFTERNOON
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0460970.006',
    signId: SIGN_ID_HELP_1
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0460970.023',
    signId: SIGN_ID_HELP_1
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0660470.077',
    signId: SIGN_ID_MORE
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0660470.005',
    signId: SIGN_ID_MORE
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0789530.019',
    signId: SIGN_ID_PLEASE_1
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus1044390.004',
    signId: SIGN_ID_THANK_YOU_1
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0123260.091',
    signId: SIGN_ID_BREAK
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0789530.019',
    signId: SIGN_ID_PLEASE_2
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0594070.036',
    signId: SIGN_ID_LOOK
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0460970.006',
    signId: SIGN_ID_HELP_2
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0460970.023',
    signId: SIGN_ID_HELP_2
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus1059000.006',
    signId: SIGN_ID_TOILET
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0066130.012',
    signId: SIGN_ID_BAD
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0422850.018',
    signId: SIGN_ID_GOOD
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0422880.015',
    signId: SIGN_ID_GOODBYE
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0460730.012',
    signId: SIGN_ID_HELLO
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0789530.019',
    signId: SIGN_ID_PLEASE_3
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0998540.023',
    signId: SIGN_ID_STOP
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus1175410.008',
    signId: SIGN_ID_YES
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0084170.016',
    signId: SIGN_ID_BEGIN
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0423120.004',
    signId: SIGN_ID_GOOD_MORNING_2
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0450170.009',
    signId: SIGN_ID_HAPPY
  },
  { userId: FRED_USER_ID, senseId: 'm_en_gbus0693820.021', signId: SIGN_ID_NO },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0891960.008',
    signId: SIGN_ID_SAD
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus1044390.004',
    signId: SIGN_ID_THANK_YOU_2
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0956650.006',
    signId: SIGN_ID_SLOW
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0352370.007',
    signId: SIGN_ID_FAST_SPEED
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0352370.035',
    signId: SIGN_ID_FAST_SPEED
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0352380.005',
    signId: SIGN_ID_FAST_ABSTAIN
  },
  {
    userId: FRED_USER_ID,
    senseId: 'm_en_gbus0352380.019',
    signId: SIGN_ID_FAST_ABSTAIN
  }
];

const SIGNS: SignRecord[] = [
  {
    _id: SIGN_ID_MORE,
    userId: FRED_USER_ID,
    mediaUrl:
      'https://0gis3zwqlg-flywheel.netdna-ssl.com/wp-content/uploads/2018/10/More.gif',
    mnemonic: 'Adding more to a pile',
    s3KeyOrig: 'fixtures_more.mp4'
  },
  {
    _id: SIGN_ID_HELP_1,
    userId: FRED_USER_ID,
    mediaUrl:
      'https://0gis3zwqlg-flywheel.netdna-ssl.com/wp-content/uploads/2018/10/Help-1.gif',
    mnemonic: 'Help your hand up',
    s3KeyOrig: 'fixtures_help_1.mp4'
  },
  {
    _id: SIGN_ID_GOOD_MORNING_1,
    userId: FRED_USER_ID,
    mediaUrl:
      'https://0gis3zwqlg-flywheel.netdna-ssl.com/wp-content/uploads/2018/10/Good_Morning.gif',
    mnemonic: 'Open the curtains',
    s3KeyOrig: 'fixtures_good_morning_1.mp4'
  },
  {
    _id: SIGN_ID_PLEASE_1,
    userId: FRED_USER_ID,
    mediaUrl:
      'https://0gis3zwqlg-flywheel.netdna-ssl.com/wp-content/uploads/2018/10/Please.gif',
    mnemonic: 'Please to the knees',
    s3KeyOrig: 'fixtures_please_1.mp4'
  },
  {
    _id: SIGN_ID_THANK_YOU_1,
    userId: FRED_USER_ID,
    mediaUrl:
      'https://0gis3zwqlg-flywheel.netdna-ssl.com/wp-content/uploads/2018/10/Thank_you.gif',
    mnemonic: 'Thank you to you',
    s3KeyOrig: 'fixtures_thank_you_1.mp4'
  },
  {
    _id: SIGN_ID_GOOD_AFTERNOON,
    userId: FRED_USER_ID,
    mediaUrl:
      'https://0gis3zwqlg-flywheel.netdna-ssl.com/wp-content/uploads/2018/10/Good_afternoon.gif',
    mnemonic: 'To the person you are speaking to',
    s3KeyOrig: 'fixtures_good_afternoon.mp4'
  },
  {
    _id: SIGN_ID_BREAK,
    userId: FRED_USER_ID,
    mediaUrl:
      'https://0gis3zwqlg-flywheel.netdna-ssl.com/wp-content/uploads/2018/10/Toilet_break.gif',
    mnemonic: '',
    s3KeyOrig: 'fixtures_break.mp4'
  },
  {
    _id: SIGN_ID_PLEASE_2,
    userId: FRED_USER_ID,
    mediaUrl:
      'https://thumbs.gfycat.com/FocusedSlipperyIcelandichorse-size_restricted.gif',
    mnemonic: '',
    s3KeyOrig: 'fixtures_please_2.mp4'
  },
  {
    _id: SIGN_ID_LOOK,
    userId: FRED_USER_ID,
    mediaUrl: 'https://thumbs.gfycat.com/HonorableDesertedBurro-mobile.mp4',
    mnemonic: '',
    s3KeyOrig: 'fixtures_look.mp4'
  },
  {
    _id: SIGN_ID_HELP_2,
    userId: FRED_USER_ID,
    mediaUrl: 'https://thumbs.gfycat.com/NeatUnequaledKudu-size_restricted.gif',
    mnemonic: '',
    s3KeyOrig: 'fixtures_help_2.mp4'
  },
  {
    _id: SIGN_ID_TOILET,
    userId: FRED_USER_ID,
    mediaUrl:
      'https://thumbs.gfycat.com/DemandingEnchantedAiredaleterrier-size_restricted.gif',
    mnemonic: '',
    s3KeyOrig: 'fixtures_toilet.mp4'
  },
  {
    _id: SIGN_ID_BAD,
    userId: FRED_USER_ID,
    mediaUrl: 'https://makaton.s3.eu-west-2.amazonaws.com/bad.mp4',
    mnemonic: '',
    s3KeyOrig: 'fixtures_bad.mp4'
  },
  {
    _id: SIGN_ID_GOOD,
    userId: FRED_USER_ID,
    mediaUrl: 'https://makaton.s3.eu-west-2.amazonaws.com/good.mp4',
    mnemonic: '',
    s3KeyOrig: 'fixtures_good.mp4'
  },
  {
    _id: SIGN_ID_GOODBYE,
    userId: FRED_USER_ID,
    mediaUrl: 'https://makaton.s3.eu-west-2.amazonaws.com/goodbye.mp4',
    mnemonic: '',
    s3KeyOrig: 'fixtures_goodbye.mp4'
  },
  {
    _id: SIGN_ID_HELLO,
    userId: FRED_USER_ID,
    mediaUrl: 'https://makaton.s3.eu-west-2.amazonaws.com/hello.mp4',
    mnemonic: '',
    s3KeyOrig: 'fixtures_hello.mp4'
  },
  {
    _id: SIGN_ID_PLEASE_3,
    userId: FRED_USER_ID,
    mediaUrl: 'https://makaton.s3.eu-west-2.amazonaws.com/please.mp4',
    mnemonic: '',
    s3KeyOrig: 'fixtures_please_3.mp4'
  },
  {
    _id: SIGN_ID_STOP,
    userId: FRED_USER_ID,
    mediaUrl: 'https://makaton.s3.eu-west-2.amazonaws.com/stop.mp4',
    mnemonic: '',
    s3KeyOrig: 'fixtures_stop.mp4'
  },
  {
    _id: SIGN_ID_YES,
    userId: FRED_USER_ID,
    mediaUrl: 'https://makaton.s3.eu-west-2.amazonaws.com/yes.mp4',
    mnemonic: '',
    s3KeyOrig: 'fixtures_yes.mp4'
  },
  {
    _id: SIGN_ID_BEGIN,
    userId: FRED_USER_ID,
    mediaUrl: 'https://makaton.s3.eu-west-2.amazonaws.com/begin.mp4',
    mnemonic: '',
    s3KeyOrig: 'fixtures_begin.mp4'
  },
  {
    _id: SIGN_ID_GOOD_MORNING_2,
    userId: FRED_USER_ID,
    mediaUrl: 'https://makaton.s3.eu-west-2.amazonaws.com/good_morning.mp4',
    mnemonic: '',
    s3KeyOrig: 'fixtures_good_morning_2.mp4'
  },
  {
    _id: SIGN_ID_HAPPY,
    userId: FRED_USER_ID,
    mediaUrl: 'https://makaton.s3.eu-west-2.amazonaws.com/happy.mp4',
    mnemonic: '',
    s3KeyOrig: 'fixtures_happy.mp4'
  },
  {
    _id: SIGN_ID_NO,
    userId: FRED_USER_ID,
    mediaUrl: 'https://makaton.s3.eu-west-2.amazonaws.com/no.mp4',
    mnemonic: '',
    s3KeyOrig: 'fixtures_no.mp4'
  },
  {
    _id: SIGN_ID_SAD,
    userId: FRED_USER_ID,
    mediaUrl: 'https://makaton.s3.eu-west-2.amazonaws.com/sad.mp4',
    mnemonic: '',
    s3KeyOrig: 'fixtures_sad.mp4'
  },
  {
    _id: SIGN_ID_THANK_YOU_2,
    userId: FRED_USER_ID,
    mediaUrl: 'https://makaton.s3.eu-west-2.amazonaws.com/thank_you.mp4',
    mnemonic: '',
    s3KeyOrig: 'fixtures_thank_you_2.mp4'
  },
  {
    _id: SIGN_ID_FAST_SPEED,
    userId: FRED_USER_ID,
    mediaUrl: 'https://makaton.s3.eu-west-2.amazonaws.com/fast.mp4',
    mnemonic: '',
    s3KeyOrig: 'fixtures_fast_speed.mp4'
  },
  {
    _id: SIGN_ID_SLOW,
    userId: FRED_USER_ID,
    mediaUrl: 'https://makaton.s3.eu-west-2.amazonaws.com/slow.mp4',
    mnemonic: '',
    s3KeyOrig: 'fixtures_slow.mp4'
  },
  {
    _id: SIGN_ID_FAST_ABSTAIN,
    userId: FRED_USER_ID,
    mediaUrl: 'https://makaton.s3.eu-west-2.amazonaws.com/fast_abstain.mp4',
    mnemonic: '',
    s3KeyOrig: 'fixtures_fast_abstain.mp4'
  }
];

const USER: any = {
  _id: FRED_USER_ID,
  username: 'fred',
  email: 'fred@gmail.com',
  password: 'pass',
  roles: ['User']
};

@Injectable()
export class FixturesService {
  constructor(
    @InjectModel(ENTRY_COLLECTION_NAME)
    private readonly entryModel: Model<EntryDocument>,
    @InjectModel(SENSE_COLLECTION_NAME)
    private readonly senseModel: Model<SenseDocument>,
    @InjectModel(ENTRY_SENSE_COLLECTION_NAME)
    private readonly entrySenseModel: Model<SenseDocument>,
    @InjectModel(SENSE_SIGN_COLLECTION_NAME)
    private readonly senseSignModel: Model<SenseDocument>,
    @InjectModel(SIGN_COLLECTION_NAME)
    private readonly signModel: Model<SenseDocument>,
    private userService: UsersService
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

  senseSignConditionsGenerator(obj: SenseSignRecordWithoutId) {
    return {
      senseId: obj.senseId,
      signId: obj.signId
    };
  }

  signConditionsGenerator(obj: SignRecord) {
    return {
      _id: obj._id
    };
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
    await this.populateCollection(
      this.senseSignModel,
      SENSE_SIGNS,
      this.senseSignConditionsGenerator
    );
    await this.populateCollection(
      this.signModel,
      SIGNS,
      this.signConditionsGenerator
    );
    await this.userService.createNewUser(USER);
    return console.log('Fixtures created!');
  }
}
