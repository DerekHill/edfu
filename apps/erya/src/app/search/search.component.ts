import {
  Component,
  OnInit,
  OnDestroy,
  Pipe,
  PipeTransform
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Apollo, QueryRef } from 'apollo-angular';
import {
  SenseForEntryDtoInterface,
  UniqueEntry,
  SenseSignDtoInterface,
  SignRecord
} from '@edfu/api-interfaces';
import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/enums';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { ApolloQueryResult } from 'apollo-client';
import { HotkeysService, Hotkey } from 'angular2-hotkeys';

interface OxIdSearchVariables {
  searchString?: string;
}

interface OxIdsResult {
  oxIds: string[];
}

interface SenseSearchVariables {
  oxId: string;
}

interface SensesResult {
  senses: SenseForEntryDtoInterface[];
}

interface SignSearchVariables {
  senseId: string;
}

interface SignsResult {
  signs: SenseSignDtoInterface[];
}

interface SenseGroup {
  lexicalCategory: LexicalCategory;
  senses: SenseForEntryDtoInterface[];
}

interface UniqueEntryWithSenseGroups extends UniqueEntry {
  senseGroups: SenseGroup[];
}

@Pipe({ name: 'removeUnderscores' })
export class RemoveUnderscoresPipe implements PipeTransform {
  transform(string: string): string {
    return string.replace('_', ' ');
  }
}

@Component({
  selector: 'edfu-search',
  templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit, OnDestroy {
  //   @Input() sense: SenseForEntryDtoInterface;

  searchFormControl = new FormControl();
  searchChars$: Observable<string>;

  oxIdsSearchRef: QueryRef<OxIdsResult, OxIdSearchVariables>;
  oxIds$: Observable<string[]>;
  oxId$: BehaviorSubject<string>;

  sensesSearchRef: QueryRef<SensesResult, SenseSearchVariables>;
  senses$: Observable<SenseForEntryDtoInterface[]>;

  sensesBs$: BehaviorSubject<UniqueEntryWithSenseGroups[]>;

  signsSearchRef: QueryRef<SignsResult, SignSearchVariables>;
  senseSigns$: Observable<SenseSignDtoInterface[]>;
  senseSignsBs$: BehaviorSubject<SenseSignDtoInterface[]>;

  constructor(private apollo: Apollo, private _hotkeysService: HotkeysService) {
    this._hotkeysService.add(
      new Hotkey(
        'esc',
        (event: KeyboardEvent): boolean => {
          this.clearSearchField();
          return false;
        },
        ['INPUT', 'SELECT', 'TEXTAREA']
      )
    );
  }

  ngOnInit() {
    this.searchChars$ = this.searchFormControl.valueChanges.pipe(startWith(''));

    this.sensesBs$ = new BehaviorSubject(null);
    this.senseSignsBs$ = new BehaviorSubject(null);
    this.oxId$ = new BehaviorSubject(null);

    this.oxIdsSearchRef = this.apollo.watchQuery<
      OxIdsResult,
      OxIdSearchVariables
    >({
      query: gql`
        query OxIdSearchQuery($searchString: String! = "") {
          oxIds(searchString: $searchString, filter: true)
        }
      `
    });

    this.oxIds$ = this.oxIdsSearchRef.valueChanges.pipe(
      map((res: ApolloQueryResult<OxIdsResult>) => res.data.oxIds)
    );

    // Probably better way of avoiding error on initial subscription than setting defaults which get sent to the server
    this.sensesSearchRef = this.apollo.watchQuery<
      SensesResult,
      SenseSearchVariables
    >({
      query: gql`
        query EntrySensesQuery($oxId: String! = "") {
          senses(oxId: $oxId, filter: true) {
            oxId
            homographC
            senseId
            lexicalCategory
            apiSenseIndex
            example
            definition
            associationType
            similarity
            signs {
              _id
              mnemonic
              mediaUrl
            }
          }
        }
      `
    });

    this.signsSearchRef = this.apollo.watchQuery<
      SignsResult,
      SignSearchVariables
    >({
      query: gql`
        query SignsQuery($senseId: String! = "") {
          signs(senseId: $senseId) {
            senseId
            signId
            sign {
              _id
              mnemonic
              mediaUrl
            }
          }
        }
      `
    });

    this.senses$ = this.sensesSearchRef.valueChanges.pipe(
      map((res: ApolloQueryResult<SensesResult>) => res.data.senses),
      map(senses => this._sortSensesByFit(senses)),
      map(senses => this._filterForSensesWithDifferentSigns(senses)),
      map(senses => this._applyMaxSensesLimit(senses)),
      map(senses => this._groupSensesByLexicalCategoryAsList(senses))
    );

    this.senseSigns$ = this.signsSearchRef.valueChanges.pipe(
      map((res: ApolloQueryResult<SignsResult>) => res.data.signs)
    );

    this.searchChars$.subscribe(input => {
      if (typeof input === 'string') {
        this.oxIdsSearchRef.setVariables({
          searchString: input
        });
      } else if (typeof input === 'object') {
        //   Do nothing. Use `onGroupSelect` instead
      }
    });

    this.senses$.subscribe(senses => {
      if (senses.length === 1) {
        this.onChildSenseEvent(senses[0]);
      }
      this.sensesBs$.next(this._createUniqueEntryWithSenseGroupsArray(senses));
    });

    this.senseSigns$.subscribe(signs => {
      this.senseSignsBs$.next(signs);
    });
  }

  displayWithoutUnderscores(oxId: string): string {
    return oxId ? oxId.replace('_', ' ') : '';
  }

  onOxIdSelect(oxId: string) {
    this.oxId$.next(oxId);
    this.sensesSearchRef.setVariables({
      oxId: oxId
    });
  }

  onChildSenseEvent(sense) {
    this.signsSearchRef.setVariables({
      senseId: sense.senseId
    });
  }

  clearSearchField() {
    this.senseSignsBs$.next(null);
    this.searchFormControl.reset();
    // Needs to be cleared because otherwise valueChanges will not fire if next search is the same
    // Might be better way to clear this without sending request to API
    this.sensesSearchRef.setVariables({
      oxId: ''
    });
    this.signsSearchRef.setVariables({
      senseId: ''
    });
  }

  _createUniqueEntryWithSenseGroupsArray(
    senses: SenseForEntryDtoInterface[]
  ): UniqueEntryWithSenseGroups[] {
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
    senses: SenseForEntryDtoInterface[],
    uniqueEntry: UniqueEntry
  ): SenseForEntryDtoInterface[] {
    return senses.filter(
      sense =>
        sense.oxId === uniqueEntry.oxId &&
        sense.homographC === uniqueEntry.homographC
    );
  }

  _sortSensesByFit(
    senses: SenseForEntryDtoInterface[]
  ): SenseForEntryDtoInterface[] {
    return senses.sort(this._compareSensesForFit);
  }

  _applyMaxSensesLimit(
    senses: SenseForEntryDtoInterface[]
  ): SenseForEntryDtoInterface[] {
    const MAX_SENSES_LIMIT = 10;
    return senses.slice(0, MAX_SENSES_LIMIT);
  }

  _compareSensesForFit(
    a: SenseForEntryDtoInterface,
    b: SenseForEntryDtoInterface
  ) {
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

  _groupSensesByLexicalCategoryAsList(
    senses: SenseForEntryDtoInterface[]
  ): SenseForEntryDtoInterface[] {
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

  _groupSensesByLexicalCategoryAsObjects(
    senses: SenseForEntryDtoInterface[]
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

  _filterForSensesWithDifferentSigns(
    senses: SenseForEntryDtoInterface[]
  ): SenseForEntryDtoInterface[] {
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

  ngOnDestroy() {}
}
