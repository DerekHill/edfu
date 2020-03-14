import { HydratedSense, SignRecord, UniqueEntry } from '@edfu/api-interfaces';
import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/enums';

export interface SenseGroup {
  lexicalCategory: LexicalCategory;
  senses: HydratedSense[];
}

export interface UniqueEntryWithSenseGroups extends UniqueEntry {
  senseGroups: SenseGroup[];
}

export class SenseArrangerService {
  sortFilterAndGroup(
    senses: HydratedSense[],
    filter = true
  ): UniqueEntryWithSenseGroups[] {
    const sortedSenses = this.sortAndFilter(senses, filter);
    return this.groupSenses(sortedSenses);
  }

  sortAndFilter(senses: HydratedSense[], filter = true): HydratedSense[] {
    senses = this._sortSensesByFit(senses);
    if (filter) {
      senses = this._filterForSensesWithDifferentSigns(senses);
      senses = this._applyMaxSensesLimit(senses);
    }
    return this._groupSensesByLexicalCategoryAsList(senses);
  }

  _sortSensesByFit(senses: HydratedSense[]): HydratedSense[] {
    return senses.sort(this._compareSensesForFit);
  }

  _compareSensesForFit(a: HydratedSense, b: HydratedSense) {
    if (a.associationType !== b.associationType) {
      if (a.associationType === DictionaryOrThesaurus.dictionary) {
        return -1;
      } else {
        return 1;
      }
    } else {
      if (a.associationType === DictionaryOrThesaurus.dictionary) {
        if (a.apiSenseIndex < b.apiSenseIndex) {
          return -1;
        } else {
          return 1;
        }
      } else {
        if (a.similarity > b.similarity) {
          return -1;
        } else {
          return 1;
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
    const MAX_SENSES_LIMIT = 10;
    return senses.slice(0, MAX_SENSES_LIMIT);
  }

  _groupSensesByLexicalCategoryAsList(
    senses: HydratedSense[]
  ): HydratedSense[] {
    const categoryOrder = senses.reduce((acc, curr) => {
      const cat = curr.lexicalCategory;
      if (!acc.includes(cat)) {
        acc.push(cat);
      }
      return acc;
    }, []);

    const grouped = [];
    for (const cat of categoryOrder) {
      for (const sense of senses) {
        if (sense.lexicalCategory === cat) {
          grouped.push(sense);
        }
      }
    }

    return grouped;
  }

  groupSenses(senses: HydratedSense[]): UniqueEntryWithSenseGroups[] {
    const uniqueEntries: UniqueEntry[] = [];
    for (const sense of senses) {
      if (
        !uniqueEntries.some(
          entry =>
            entry.oxId === sense.oxId && entry.homographC === sense.homographC
        )
      ) {
        uniqueEntries.push({ oxId: sense.oxId, homographC: sense.homographC });
      }
    }
    const uniqueEntryWithSenseGroupsArray: UniqueEntryWithSenseGroups[] = [];
    for (const entry of uniqueEntries) {
      const relevantSenses = this._extractRelevantSensesPreservingOrder(
        senses,
        entry
      );

      uniqueEntryWithSenseGroupsArray.push({
        oxId: entry.oxId,
        homographC: entry.homographC,
        senseGroups: this._groupSensesByLexicalCategoryAsObjects(relevantSenses)
      });
    }

    return uniqueEntryWithSenseGroupsArray;
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

  _groupSensesByLexicalCategoryAsObjects(
    senses: HydratedSense[]
  ): SenseGroup[] {
    const categoryOrder = senses.reduce((acc, curr) => {
      const cat = curr.lexicalCategory;
      if (!acc.includes(cat)) {
        acc.push(cat);
      }
      return acc;
    }, []);
    const groups: SenseGroup[] = [];
    for (const cat of categoryOrder) {
      groups.push({
        lexicalCategory: cat,
        senses: senses.filter(sense => sense.lexicalCategory === cat)
      });
    }

    return groups;
  }
}
