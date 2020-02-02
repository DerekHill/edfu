import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Apollo, QueryRef } from 'apollo-angular';
import { HttpClient } from '@angular/common/http';
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
  entrySearchRef: QueryRef<EntrySearchQuery, EntrySearchVariables>;

  senses$: Observable<SenseDto[]>;
  sensesSearchRef: QueryRef<SensesQuery, SenseSearchVariables>;

  senseIds$: BehaviorSubject<string[]>;

  constructor(private http: HttpClient, private apollo: Apollo) {}

  ngOnInit() {
    this.entrySearchInput = this.entrySearchFormControl.valueChanges.pipe(
      startWith('')
    );

    this.senseIds$ = new BehaviorSubject([]);

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
      map((res: ApolloQueryResult<EntrySearchQuery>) => {
        console.log(res);
        return res.data.search;
      })
    );

    this.senses$ = this.sensesSearchRef.valueChanges.pipe(
      map(({ data }: any) => data.senses)
    );

    this.entrySearchInput.subscribe(input => {
      if (typeof input === 'string') {
        this.entrySearchRef.setVariables({
          search_string: input
        });
      } else if (typeof input === 'object') {
        //   Do nothing. Use `onOptionSelected` instead
      }
    });

    this.senseIds$.subscribe(senseIds => {
      this.sensesSearchRef.setVariables({
        senseIds: senseIds
      });
    });

    this.senses$.subscribe(senses => {
      console.log('senses');
      console.log(senses);
    });
  }

  onOptionSelected(input: EntryDto) {
    // this.senseIds$.next(..);
  }

  displayFn(res?: any): string | undefined {
    return res ? res.word : undefined;
  }

  onSenseClick(event, sense: SenseDto) {
    console.log(sense);
  }

  ngOnDestroy() {}
}
