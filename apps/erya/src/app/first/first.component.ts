import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Apollo, QueryRef } from 'apollo-angular';
import { EntryDto, SenseDto } from '@edfu/api-interfaces';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { ApolloQueryResult } from 'apollo-client';

interface EntrySearchQuery {
  search: EntryDto[];
}

interface EntrySearchVariables {
  search_string?: string;
}

interface SensesQuery {
  senses: SenseDto[];
}

interface SenseSearchVariables {
  senseIds: string[];
}

interface HomographGroup {
  word: string;
  entries: EntryDto[];
}

@Component({
  selector: 'edfu-first',
  templateUrl: './first.component.html'
})
export class FirstComponent implements OnInit, OnDestroy {
  entrySearchFormControl = new FormControl();
  entrySearchInput: Observable<string>;
  entrySearchResults$: Observable<EntryDto[]>;
  homographGroupSearchResults$: Observable<HomographGroup[]>;
  entrySearchRef: QueryRef<EntrySearchQuery, EntrySearchVariables>;

  senses$: Observable<SenseDto[]>;
  sensesSearchRef: QueryRef<SensesQuery, SenseSearchVariables>;

  senseIds$: BehaviorSubject<string[]>;
  homographGroup$: BehaviorSubject<HomographGroup>;

  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.entrySearchInput = this.entrySearchFormControl.valueChanges.pipe(
      startWith('')
    );

    this.senseIds$ = new BehaviorSubject([]);
    this.homographGroup$ = new BehaviorSubject(null);

    this.sensesSearchRef = this.apollo.watchQuery<
      SensesQuery,
      SenseSearchVariables
    >({
      query: gql`
        query SensesQuery($senseIds: [String!]!) {
          senses(senseIds: $senseIds) {
            _id
            example
          }
        }
      `
    });

    this.entrySearchRef = this.apollo.watchQuery<
      EntrySearchQuery,
      EntrySearchVariables
    >({
      query: gql`
        query WordSearchQuery($search_string: String!) {
          search(search_string: $search_string) {
            _id
            oxId
            homographC
            word
            relatedEntriesAdded
          }
        }
      `,
      errorPolicy: 'all'
    });

    this.entrySearchResults$ = this.entrySearchRef.valueChanges.pipe(
      map((res: ApolloQueryResult<EntrySearchQuery>) => res.data.search)
    );

    this.homographGroupSearchResults$ = this.entrySearchResults$.pipe(
      map(entries => {
        return this.groupByHomographWord(entries);
      })
    );

    this.senses$ = this.sensesSearchRef.valueChanges.pipe(
      map(({ data }: any) => data.senses)
    );

    this.entrySearchInput.subscribe(input => {
      if (typeof input === 'string') {
        console.log('entrySearchRef.setVariables');
        this.entrySearchRef.setVariables({
          search_string: input
        });
      } else if (typeof input === 'object') {
        //   Do nothing. Use `onOptionSelected` instead
      }
    });

    this.homographGroupSearchResults$.subscribe(a => {
      console.log('homographGroupSearchResults');
      console.log(a);
    });

    this.senseIds$.subscribe(senseIds => {
      console.log('via subscribe to senseIds', senseIds);
      this.sensesSearchRef.setVariables({
        senseIds: senseIds
      });
    });

    this.homographGroup$.subscribe(group => {
      console.log('group');
      console.log(group);
    });

    this.senses$.subscribe(senses => {
      console.log('senses');
      console.log(senses);
    });
  }

  onOptionSelected(group: HomographGroup) {
    console.log(group);
    this.homographGroup$.next(group);
    // this.senseIds$.next(..);
  }

  displayFn(res?: any): string | undefined {
    return res ? res.word : undefined;
  }

  onEntryClick(event, entry: EntryDto) {
    console.log(entry);
  }

  groupByHomographWord(entries: EntryDto[]): HomographGroup[] {
    const entryGroupsKeyedByWord = entries.reduce((acc, cur, idx, src) => {
      (acc[cur.word] = acc[cur.word] || []).push(cur);
      return acc;
    }, {});

    return Object.keys(entryGroupsKeyedByWord).map((key, idx) => ({
      word: key,
      entries: entryGroupsKeyedByWord[key]
    }));
  }

  ngOnDestroy() {}
}
