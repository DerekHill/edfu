import { SenseArrangerService } from './sense-arranger.service';
import { HydratedSense, SignRecord } from '@edfu/api-interfaces';
import { LexicalCategory, DictionaryOrThesaurus } from '@edfu/enums';
import { ObjectId } from 'bson';

const createSense = (params: any): HydratedSense => {
  const defaults = {
    oxId: 'oxId',
    homographC: 0,
    senseId: 'senseId',
    lexicalCategory: LexicalCategory.noun,
    apiSenseIndex: 0,
    example: 'example',
    definition: 'definition',
    associationType: DictionaryOrThesaurus.dictionary,
    similarity: 1
  };

  return { ...defaults, ...params };
};

describe('SenseArrangerService', () => {
  let service: SenseArrangerService;
  beforeEach(() => {
    service = new SenseArrangerService();
  });
  describe('Sorting and filtering', () => {
    describe('_sortSensesByFit()', () => {
      it('sorts first by associationType, then index for dictionary and similarity for thesaurus', () => {
        const FIRST = 'should_be_first_because_dictionary_with_low_index';
        const SECOND = 'should_be_second_because_dictionary_with_high_index';
        const THIRD = 'should_be_third_because_thesaurus_with_high_similarity';
        const FOURTH = 'should_be_fourth_because_thesaurus_with_low_similarity';
        const lowSimilarity = 0.3;
        const highSimilarity = 0.8;
        const lowApiSenseIndex = 0;
        const highApiSenseIndex = 1;
        const senses: HydratedSense[] = [
          createSense({
            senseId: FOURTH,
            lexicalCategory: LexicalCategory.noun,
            apiSenseIndex: lowApiSenseIndex,
            associationType: DictionaryOrThesaurus.thesaurus,
            similarity: lowSimilarity
          }),
          createSense({
            senseId: THIRD,
            lexicalCategory: LexicalCategory.noun,
            apiSenseIndex: lowApiSenseIndex,
            associationType: DictionaryOrThesaurus.thesaurus,
            similarity: highSimilarity
          }),
          createSense({
            senseId: SECOND,
            lexicalCategory: LexicalCategory.noun,
            apiSenseIndex: highApiSenseIndex,
            associationType: DictionaryOrThesaurus.dictionary,
            similarity: highSimilarity
          }),
          createSense({
            senseId: FIRST,
            lexicalCategory: LexicalCategory.noun,
            apiSenseIndex: lowApiSenseIndex,
            associationType: DictionaryOrThesaurus.dictionary,
            similarity: highSimilarity
          })
        ];
        const res = service._sortSensesByFit(senses);
        expect(res.map(r => r.senseId)).toEqual([FIRST, SECOND, THIRD, FOURTH]);
      });
    });

    describe('_groupSensesByLexicalCategoryAsList()', () => {
      it('works', () => {
        const NOUN1 = 'noun1';
        const VERB = 'verb';
        const NOUN2 = 'noun2';
        const senses: HydratedSense[] = [
          createSense({
            senseId: NOUN1,
            lexicalCategory: LexicalCategory.noun
          }),
          createSense({
            senseId: VERB,
            lexicalCategory: LexicalCategory.verb
          }),
          createSense({
            senseId: NOUN2,
            lexicalCategory: LexicalCategory.noun
          })
        ];
        const res = service._groupSensesByLexicalCategoryAsList(senses);
        expect(res.map(r => r.senseId)).toEqual([NOUN1, NOUN2, VERB]);
      });
    });

    describe('_filterForSensesWithDifferentSigns()', () => {
      it('filters out senses with no signs at all', () => {
        const sign: SignRecord = {
          _id: new ObjectId(),
          userId: new ObjectId(),
          mnemonic: 'remember me',
          mediaUrl: 'www.my_picture_link',
          s3Key: '1234'
        };
        const senses: HydratedSense[] = [
          createSense({
            signs: []
          }),
          createSense({
            signs: [sign]
          })
        ];
        const res = service._filterForSensesWithDifferentSigns(senses);
        expect(res.length).toBe(1);
      });

      it('filers out senses which have signs already seen', () => {
        const sign: SignRecord = {
          _id: new ObjectId(),
          userId: new ObjectId(),
          mnemonic: 'remember me',
          mediaUrl: 'www.my_picture_link',
          s3Key: '1234'
        };
        const senses: HydratedSense[] = [
          createSense({
            signs: [sign]
          }),
          createSense({
            signs: [sign]
          }),
          createSense({
            signs: [sign]
          })
        ];
        const res = service._filterForSensesWithDifferentSigns(senses);
        expect(res.length).toBe(1);
      });
    });
  });

  describe('Grouping senses', () => {
    it('works with homographs', () => {
      const homographC_1 = 1;
      const homographC_2 = 2;
      const FAST_1_NOUN_GOOD = 1;
      const FAST_1_NOUN_POOR = 2;
      const FAST_1_ADJ_MEDIUM = 3;
      const FAST_2 = 4;
      const senses: HydratedSense[] = [
        createSense({
          senseId: FAST_1_NOUN_GOOD,
          homographC: homographC_1,
          lexicalCategory: LexicalCategory.noun,
          associationType: DictionaryOrThesaurus.dictionary,
          apiSenseIndex: 0
        }),
        createSense({
          senseId: FAST_1_NOUN_POOR,
          homographC: homographC_1,
          lexicalCategory: LexicalCategory.noun,
          associationType: DictionaryOrThesaurus.thesaurus
        }),
        createSense({
          senseId: FAST_1_ADJ_MEDIUM,
          homographC: homographC_1,
          lexicalCategory: LexicalCategory.adjective,
          associationType: DictionaryOrThesaurus.dictionary,
          apiSenseIndex: 1
        }),
        createSense({
          senseId: FAST_2,
          homographC: homographC_2
        })
      ];
      const res = service.groupSenses(senses);
      expect(res.length).toBe(2);
      expect(res[0].senseGroups.length).toBe(2);
      expect(res[0].senseGroups[0].lexicalCategory).toBe(LexicalCategory.noun);
      expect(res[0].senseGroups[0].senses[0].senseId).toBe(FAST_1_NOUN_GOOD);
    });

    it('works with capitalisation variations', () => {
      const oxId_1 = 'orange';
      const oxId_2 = 'Orange';
      const COLOUR_GOOD = 1;
      const COLOUR_POOR = 2;
      const FRUIT_MEDIUM = 3;
      const senses: HydratedSense[] = [
        createSense({
          oxId: oxId_1,
          senseId: COLOUR_GOOD,
          associationType: DictionaryOrThesaurus.dictionary,
          apiSenseIndex: 0
        }),
        createSense({
          oxId: oxId_1,
          senseId: COLOUR_POOR,
          associationType: DictionaryOrThesaurus.thesaurus
        }),
        createSense({
          oxId: oxId_2,
          senseId: FRUIT_MEDIUM,
          associationType: DictionaryOrThesaurus.dictionary,
          apiSenseIndex: 1
        })
      ];
      const res = service.groupSenses(senses);
      expect(res[0].oxId).toBe(oxId_1);
    });
  });
});
