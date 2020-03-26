import { HydratedSense, SignRecord, UniqueEntry } from '@edfu/api-interfaces';
import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/enums';

const MAX_SENSES_LIMIT = 20;

export interface SenseGroup {
  lexicalCategory: LexicalCategory;
  senses: HydratedSense[];
}

export interface UniqueEntryWithSenseGroups extends UniqueEntry {
  senseGroups: SenseGroup[];
}

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
  sortAndFilter(senses: HydratedSense[], filter = true): HydratedSense[] {
    senses = senses.sort(this._compareSensesByHomographSenseIndexAndSimilarity);

    if (filter) {
      senses = this._filterForSensesWithDifferentSigns(senses);
      senses = this._removeThesaurusSensesIfHaveDictionarySense(senses);
      senses = this._applyMaxSensesLimit(senses);
    }
    return senses;
  }

  _compareSensesByHomographSenseIndexAndSimilarity(
    a: HydratedSense,
    b: HydratedSense
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

  _filterForSensesWithDifferentSigns(senses: HydratedSense[]): HydratedSense[] {
    const allSignsIds = new Set();
    return senses.filter(sense => {
      if (this._noNewSigns(allSignsIds, sense.signs)) {
        return false;
      }
      sense.signs.forEach(sign => allSignsIds.add(sign._id));
      return sense.signs && sense.signs.length;
    });
  }

  _noNewSigns(allSignsIds: Set<any>, signs: SignRecord[]): boolean {
    const intersection = new Set(
      [...signs].filter(sign => allSignsIds.has(sign._id))
    );

    return intersection.size === signs.length;
  }

  _applyMaxSensesLimit(senses: HydratedSense[]): HydratedSense[] {
    return senses.slice(0, MAX_SENSES_LIMIT);
  }

  _extractRelevantSensesPreservingOrder(
    senses: HydratedSense[],
    uniqueEntry: UniqueEntry
  ): HydratedSense[] {
    return senses.filter(
      sense =>
        sense.oxId === uniqueEntry.oxId &&
        sense.homographC === uniqueEntry.homographC
    );
  }

  _removeThesaurusSensesIfHaveDictionarySense(
    senses: HydratedSense[]
  ): HydratedSense[] {
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
