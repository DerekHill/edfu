import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Apollo, QueryRef } from 'apollo-angular';
import { EntryDto, SenseForEntryDto, SignDto } from '@edfu/api-interfaces';
import { DictionaryOrThesaurus } from '@edfu/enums';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { ApolloQueryResult } from 'apollo-client';

interface HomographGroup {
  word: string;
  entries: EntryDto[];
}

interface EntrySearchVariables {
  searchString?: string;
}

interface EntrySearchResult {
  search: EntryDto[];
}

interface SenseSearchVariables {
  oxId: string;
  homographC: number;
}

interface SensesResult {
  senses: SenseForEntryDto[];
}

interface SignSearchVariables {
  senseId: string;
}

interface SignsResult {
  signs: SignDto[];
}

@Component({
  selector: 'edfu-first',
  templateUrl: './first.component.html'
})
export class FirstComponent implements OnInit, OnDestroy {
  searchFormControl = new FormControl();

  searchChars$: Observable<string>;

  entriesSearchRef: QueryRef<EntrySearchResult, EntrySearchVariables>;
  entries$: Observable<EntryDto[]>;
  homographGroups$: Observable<HomographGroup[]>;

  homographGroup$: BehaviorSubject<HomographGroup>;

  sensesSearchRef: QueryRef<SensesResult, SenseSearchVariables>;
  senses$: Observable<SenseForEntryDto[]>;

  signsSearchRef: QueryRef<SignsResult, SignSearchVariables>;
  signs$: Observable<SignDto[]>;

  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.searchChars$ = this.searchFormControl.valueChanges.pipe(startWith(''));

    this.homographGroup$ = new BehaviorSubject(null);

    this.entriesSearchRef = this.apollo.watchQuery<
      EntrySearchResult,
      EntrySearchVariables
    >({
      query: gql`
        query WordSearchQuery($searchString: String!) {
          search(searchString: $searchString) {
            oxId
            homographC
            word
            relatedEntriesAdded
          }
        }
      `,
      errorPolicy: 'all'
    });

    // Probably better way of avoiding error on initial subscription than setting defaults which get sent to the server
    this.sensesSearchRef = this.apollo.watchQuery<
      SensesResult,
      SenseSearchVariables
    >({
      query: gql`
        query EntrySensesQuery($oxId: String! = "", $homographC: Float! = 0) {
          sensesForEntry(oxId: $oxId, homographC: $homographC) {
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

    this.entries$ = this.entriesSearchRef.valueChanges.pipe(
      map((res: ApolloQueryResult<EntrySearchResult>) => res.data.search)
    );

    this.homographGroups$ = this.entries$.pipe(
      map(entries => {
        return this._groupByHomographWord(entries);
      })
    );

    this.senses$ = this.sensesSearchRef.valueChanges.pipe(
      map(({ data }: any) => data.sensesForEntry),
      map(senses => this._sortSenses(senses)),
      map(senses => this._groupAndFilterByLexicalCategory(senses))
      //   _groupAndFilterByLexicalCategory
    );

    this.signs$ = this.signsSearchRef.valueChanges.pipe(
      map(({ data }: any) => {
        console.log(data);
        return data.signs;
      })
    );

    this.searchChars$.subscribe(input => {
      if (typeof input === 'string') {
        console.log('entrySearchRef.setVariables');
        this.entriesSearchRef.setVariables({
          searchString: input
        });
      } else if (typeof input === 'object') {
        //   Do nothing. Use `onGroupSelect` instead
      }
    });

    this.homographGroups$.subscribe(a => {
      console.log('homographGroups (plural)');
      console.log(a);
    });

    this.homographGroup$.subscribe(group => {
      console.log('homographGroup (singular)');
      console.log(group);
    });

    this.senses$.subscribe(senses => {
      console.log('senses:');
      console.log(senses);
    });

    this.signs$.subscribe(signs => {
      console.log('signs:');
      console.log(signs);
    });
  }

  onGroupSelect(group: HomographGroup) {
    this.homographGroup$.next(group);
    if (group.entries.length === 1) {
      this.onEntryClick(null, group.entries[0]);
    }
  }

  onEntryClick(event, entry: EntryDto) {
    console.log('onEntryClick', entry.oxId, entry.homographC);
    this.sensesSearchRef.setVariables({
      oxId: entry.oxId,
      homographC: entry.homographC
    });
  }

  onSenseClick(event, sense: SenseForEntryDto) {
    console.log(sense);
    this.signsSearchRef.setVariables({
      senseId: sense.senseId
    });
  }

  displayFn(res?: any): string | undefined {
    return res ? res.word : undefined;
  }

  _groupByHomographWord(entries: EntryDto[]): HomographGroup[] {
    const entryGroupsKeyedByWord = entries.reduce((acc, cur, idx, src) => {
      (acc[cur.word] = acc[cur.word] || []).push(cur);
      return acc;
    }, {});

    return Object.keys(entryGroupsKeyedByWord).map((key, idx) => ({
      word: key,
      entries: entryGroupsKeyedByWord[key]
    }));
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
