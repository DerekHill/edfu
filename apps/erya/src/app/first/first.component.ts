import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Apollo, QueryRef } from 'apollo-angular';
import { EntryDto, SenseForEntryDto } from '@edfu/api-interfaces';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { ApolloQueryResult } from 'apollo-client';

interface EntrySearchQuery {
  search: EntryDto[];
}

interface EntrySearchVariables {
  search_string?: string;
}

interface SensesQuery {
  senses: SenseForEntryDto[];
}

interface SenseSearchVariables {
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

  senses$: Observable<SenseForEntryDto[]>;
  sensesSearchRef: QueryRef<SensesQuery, SenseSearchVariables>;

  homographGroup$: BehaviorSubject<HomographGroup>;

  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.searchChars$ = this.searchFormControl.valueChanges.pipe(startWith(''));

    this.homographGroup$ = new BehaviorSubject(null);

    this.entriesSearchRef = this.apollo.watchQuery<
      EntrySearchQuery,
      EntrySearchVariables
    >({
      query: gql`
        query WordSearchQuery($search_string: String!) {
          search(search_string: $search_string) {
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
      SensesQuery,
      SenseSearchVariables
    >({
      query: gql`
        query EntrySensesQuery($oxId: String! = "", $homographC: Float! = 0) {
          sensesForEntry(oxId: $oxId, homographC: $homographC) {
            example
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

    // this.entrySenses$ = this.entrySensesSearchRef.valueChanges.pipe(
    //   // Deal with this being null
    //   map(x => {
    //     console.log(x);
    //     return x.data.entrySenses;
    //   })
    // );

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
    if (group.entries.length === 1) {
      this.onEntryClick(null, group.entries[0]);
    }
    // this.senseIds$.next(..);
  }

  displayFn(res?: any): string | undefined {
    return res ? res.word : undefined;
  }

  onEntryClick(event, entry: EntryDto) {
    console.log('onEntryClick', entry.oxId, entry.homographC);
    this.sensesSearchRef.setVariables({
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
