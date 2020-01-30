import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Apollo, QueryRef } from 'apollo-angular';
import { HttpClient } from '@angular/common/http';
import { EntryDto, SenseDto } from '@edfu/api-interfaces';
import { untilDestroyed } from 'ngx-take-until-destroy';

interface WordSearchQuery {
  search: EntryDto[];
}

interface WordSearchVariables {
  search_string?: string;
}

interface SensesQuery {
  senses: SenseDto[];
}

interface SenseSearchVariables {
  senseIds: string[];
}

@Component({
  selector: 'edfu-second',
  templateUrl: './second.component.html'
})
export class SecondComponent implements OnInit, OnDestroy {
  wordSearchFormControl = new FormControl();
  wordSearchInput: Observable<string>;
  wordSearchResults$: Observable<EntryDto[]>;
  wordSearchRef: QueryRef<WordSearchQuery, WordSearchVariables>;

  senses$: Observable<SenseDto[]>;
  sensesSearchRef: QueryRef<SensesQuery, SenseSearchVariables>;

  senseIds$: BehaviorSubject<string[]>;

  constructor(private http: HttpClient, private apollo: Apollo) {}

  ngOnInit() {
    this.wordSearchInput = this.wordSearchFormControl.valueChanges.pipe(
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

    this.wordSearchRef = this.apollo.watchQuery<
      WordSearchQuery,
      WordSearchVariables
    >({
      query: gql`
        query WordSearchQuery($search_string: String!) {
          search(search_string: $search_string) {
            _id
            oxId
            homographC
            word
            topLevel
            ownSenseIds
          }
        }
      `,
      errorPolicy: 'all'
    });

    this.wordSearchResults$ = this.wordSearchRef.valueChanges.pipe(
      map(({ data }: any) => data.search)
    );

    this.senses$ = this.sensesSearchRef.valueChanges.pipe(
      map(({ data }: any) => data.senses)
    );

    this.wordSearchInput.subscribe(input => {
      if (typeof input === 'string') {
        this.wordSearchRef.setVariables({
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
    this.senseIds$.next(input.ownSenseIds);
  }

  displayFn(res?: any): string | undefined {
    return res ? res.word : undefined;
  }

  onSenseClick(event, sense: SenseDto) {
    console.log(sense);
  }

  ngOnDestroy() {}
}
