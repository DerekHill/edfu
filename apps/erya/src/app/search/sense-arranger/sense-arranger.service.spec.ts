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
    describe('_filterForSensesWithDifferentSigns()', () => {
      it('filters out senses with no signs at all', () => {
        const sign: SignRecord = {
          _id: new ObjectId(),
          userId: new ObjectId(),
          mnemonic: 'remember me',
          s3KeyOrig: '1234'
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
          s3KeyOrig: '1234'
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

    describe('_removeThesaurusSensesIfHaveDictionarySense()', () => {
      it('filters out thesaurus senses if there is a dictionary sense present', () => {
        const senses: HydratedSense[] = [
          createSense({
            associationType: DictionaryOrThesaurus.dictionary
          }),
          createSense({
            associationType: DictionaryOrThesaurus.thesaurus
          })
        ];
        const res = service._removeThesaurusSensesIfHaveDictionarySense(senses);
        expect(res.length).toBe(1);
      });

      it('returns all senses if there is no thesaurus sense present', () => {
        const senses: HydratedSense[] = [
          createSense({
            associationType: DictionaryOrThesaurus.dictionary
          }),
          createSense({
            associationType: DictionaryOrThesaurus.dictionary
          })
        ];
        const res = service._removeThesaurusSensesIfHaveDictionarySense(senses);
        expect(res.length).toBe(2);
      });
    });
  });
});
