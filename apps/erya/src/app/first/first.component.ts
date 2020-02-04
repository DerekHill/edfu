import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Apollo, QueryRef } from 'apollo-angular';
import { EntryDto, SenseDto, EntrySenseDto } from '@edfu/api-interfaces';
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

interface EntrySensesQuery {
  entrySenses: EntrySenseDto[];
}

interface EntrySenseSearchVariables {
  oxId: string;
  homographC: number;
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
  searchFormControl = new FormControl();

  searchChars$: Observable<string>;
  entries$: Observable<EntryDto[]>;
  homographGroups$: Observable<HomographGroup[]>;
  entriesSearchRef: QueryRef<EntrySearchQuery, EntrySearchVariables>;

  senses$: Observable<SenseDto[]>;
  senseIds$: BehaviorSubject<string[]>;
  sensesSearchRef: QueryRef<SensesQuery, SenseSearchVariables>;

  homographGroup$: BehaviorSubject<HomographGroup>;

  entrySenses$: Observable<EntrySenseDto[]>;
  entrySensesSearchRef: QueryRef<EntrySensesQuery, EntrySenseSearchVariables>;

  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.searchChars$ = this.searchFormControl.valueChanges.pipe(startWith(''));

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

    this.entriesSearchRef = this.apollo.watchQuery<
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

    // Probably better way of avoiding error on initial subscription than setting defaults which get sent to the server

    this.entrySensesSearchRef = this.apollo.watchQuery<
      EntrySensesQuery,
      EntrySenseSearchVariables
    >({
      query: gql`
        query EntrySensesQuery($oxId: String! = "", $homographC: Float! = 0) {
          entrySenses(oxId: $oxId, homographC: $homographC) {
            senseId
          }
        }
      `
    });

    this.entries$ = this.entriesSearchRef.valueChanges.pipe(
      map((res: ApolloQueryResult<EntrySearchQuery>) => res.data.search)
    );

    this.homographGroups$ = this.entries$.pipe(
      map(entries => {
        return this.groupByHomographWord(entries);
      })
    );

    this.senses$ = this.sensesSearchRef.valueChanges.pipe(
      map(({ data }: any) => data.senses)
    );

    this.entrySenses$ = this.entrySensesSearchRef.valueChanges.pipe(
      map(x => x.data.entrySenses)
    );

    this.searchChars$.subscribe(input => {
      if (typeof input === 'string') {
        console.log('entrySearchRef.setVariables');
        this.entriesSearchRef.setVariables({
          search_string: input
        });
      } else if (typeof input === 'object') {
        //   Do nothing. Use `onOptionSelected` instead
      }
    });

    this.homographGroups$.subscribe(a => {
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
      console.log('senses:');
      console.log(senses);
    });

    // this.entrySenses$.subscribe(entrySenses => {
    //   console.log('entrySenses');
    //   console.log(entrySenses);
    // });
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
    console.log('entry');
    // console.log(entry);
    console.log(entry.oxId, entry.homographC);
    this.entrySensesSearchRef.setVariables({
      oxId: entry.oxId,
      homographC: entry.homographC
    });
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
