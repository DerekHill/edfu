import {
  SenseHydratedDtoInterface,
  SignDtoInterface
} from '@edfu/api-interfaces';
import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/api-interfaces';

const MAX_SENSES_LIMIT = 20;

const lexicalCategoryOrder = [
  LexicalCategory.noun,
  LexicalCategory.verb,
  LexicalCategory.adjective,
  LexicalCategory.adverb,
  LexicalCategory.pronoun,
  LexicalCategory.preposition,
  LexicalCategory.conjunction,
  LexicalCategory.interjection,
  LexicalCategory.determiner,
  LexicalCategory.residual,
  LexicalCategory.other
];

export class SenseArrangerService {
  sortAndFilter(
    senses: SenseHydratedDtoInterface[],
    filter = true
  ): SenseHydratedDtoInterface[] {
    senses = senses.sort(this._compareSensesByHomographSenseIndexAndSimilarity);

    if (filter) {
      senses = this._filterForSensesWithDifferentSigns(senses);
      senses = this._removeThesaurusSensesIfHaveDictionarySense(senses);
      senses = this._applyMaxSensesLimit(senses);
    }
    return senses;
  }

  _compareSensesByHomographSenseIndexAndSimilarity(
    a: SenseHydratedDtoInterface,
    b: SenseHydratedDtoInterface
  ) {
    if (a.homographC !== b.homographC) {
      if (a.homographC < b.homographC) {
        return -1;
      } else {
        return 1;
      }
    } else {
      const aLexicalPosition = lexicalCategoryOrder.indexOf(a.lexicalCategory);
      const bLexicalPosition = lexicalCategoryOrder.indexOf(b.lexicalCategory);
      if (aLexicalPosition !== bLexicalPosition) {
        if (aLexicalPosition < bLexicalPosition) {
          return -1;
        } else {
          return 1;
        }
      } else {
        if (a.apiSenseIndex !== b.apiSenseIndex) {
          if (a.apiSenseIndex < b.apiSenseIndex) {
            return -1;
          } else {
            return 1;
          }
        } else {
          if (a.similarity < b.similarity) {
            return -1;
          } else {
            return 1;
          }
        }
      }
    }
  }

  _filterForSensesWithDifferentSigns(
    senses: SenseHydratedDtoInterface[]
  ): SenseHydratedDtoInterface[] {
    const allSignsIds = new Set();
    return senses.filter(sense => {
      if (this._noNewSigns(allSignsIds, sense.signs)) {
        return false;
      }
      sense.signs.forEach(sign => allSignsIds.add(sign._id));
      return sense.signs && sense.signs.length;
    });
  }

  _noNewSigns(allSignsIds: Set<any>, signs: SignDtoInterface[]): boolean {
    const intersection = new Set(
      [...signs].filter(sign => allSignsIds.has(sign._id))
    );

    return intersection.size === signs.length;
  }

  _applyMaxSensesLimit(
    senses: SenseHydratedDtoInterface[]
  ): SenseHydratedDtoInterface[] {
    return senses.slice(0, MAX_SENSES_LIMIT);
  }

  _removeThesaurusSensesIfHaveDictionarySense(
    senses: SenseHydratedDtoInterface[]
  ): SenseHydratedDtoInterface[] {
    const dictionarySenses = senses.filter(
      sense => sense.associationType === DictionaryOrThesaurus.dictionary
    );
    if (dictionarySenses.length) {
      return dictionarySenses;
    } else {
      return senses;
    }
  }
}
