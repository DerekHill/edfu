import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Apollo, QueryRef } from 'apollo-angular';
import { SenseForEntryDto, SenseSignDto } from '@edfu/api-interfaces';
import { DictionaryOrThesaurus } from '@edfu/enums';
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
  senses: SenseForEntryDto[];
}

interface SignSearchVariables {
  senseId: string;
}

interface SignsResult {
  signs: SenseSignDto[];
}

@Component({
  selector: 'edfu-search',
  templateUrl: './search.component.html'
})
export class SearchComponent implements OnInit, OnDestroy {
  searchFormControl = new FormControl();
  searchChars$: Observable<string>;

  oxIdsSearchRef: QueryRef<OxIdsResult, OxIdSearchVariables>;
  oxIds$: Observable<string[]>;
  oxId$: BehaviorSubject<string>;

  sensesSearchRef: QueryRef<SensesResult, SenseSearchVariables>;
  senses$: Observable<SenseForEntryDto[]>;
  sensesBs$: BehaviorSubject<SenseForEntryDto[]>;

  signsSearchRef: QueryRef<SignsResult, SignSearchVariables>;
  senseSigns$: Observable<SenseSignDto[]>;
  senseSignsBs$: BehaviorSubject<SenseSignDto[]>;

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
          oxIds(searchString: $searchString)
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
          senses(oxId: $oxId) {
            oxId
            senseId
            lexicalCategory
            apiSenseIndex
            example
            definition
            associationType
            similarity
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
      map(senses => this._sortSenses(senses)),
      map(senses => this._groupAndFilterByLexicalCategory(senses))
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
        this.onSenseClick(null, senses[0]);
      }
      this.sensesBs$.next(senses);
    });

    this.senseSigns$.subscribe(signs => {
      this.senseSignsBs$.next(signs);
    });
  }

  onOxIdSelect(oxId: string) {
    this.oxId$.next(oxId);
    this.sensesSearchRef.setVariables({
      oxId: oxId
    });
  }

  onSenseClick(event, sense: SenseForEntryDto) {
    this.signsSearchRef.setVariables({
      senseId: sense.senseId
    });
  }

  clearSearchField() {
    this.sensesBs$.next(null);
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

  _sortSenses(senses: SenseForEntryDto[]): SenseForEntryDto[] {
    return senses.sort(this._compareSenses);
  }

  _compareSenses(a: SenseForEntryDto, b: SenseForEntryDto) {
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

  _groupAndFilterByLexicalCategory(
    senses: SenseForEntryDto[]
  ): SenseForEntryDto[] {
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

  ngOnDestroy() {}
}
