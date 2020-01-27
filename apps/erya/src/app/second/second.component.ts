import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Apollo, QueryRef } from 'apollo-angular';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { HttpClient } from '@angular/common/http';
import { HeadwordDto, SenseDto } from '@edfu/api-interfaces';
import { MatOption } from '@angular/material';

interface WordSearchQuery {
  search: HeadwordDto[];
}

interface WordSearchVariables {
  search_string?: string;
}

interface SenseByIdQuery {
  search: SenseDto[];
}

interface SenseSearchVariables {
  senseId: string;
}

@Component({
  selector: 'edfu-second',
  templateUrl: './second.component.html'
})
export class SecondComponent implements OnInit, OnDestroy {
  wordSearchFormControl = new FormControl();
  wordSearchInput: Observable<string>;
  wordSearchResults$: Observable<HeadwordDto[]>;
  wordSearchRef: QueryRef<WordSearchQuery, WordSearchVariables>;

  senseSearchResults$: Observable<SenseDto[]>;
  senseSearchRef: QueryRef<SenseByIdQuery, SenseSearchVariables>;

  tempObservable$: Observable<any>;

  constructor(private http: HttpClient, private apollo: Apollo) {}

  ngOnInit() {
    this.wordSearchInput = this.wordSearchFormControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        // console.log(value);
        return value;
      })
    );

    this.tempObservable$ = of('m_en_gbus0378040.005');

    this.senseSearchRef = this.apollo.watchQuery<
      SenseByIdQuery,
      SenseSearchVariables
    >({
      query: gql`
        query Foo($senseId: String!) {
          sense(senseId: $senseId) {
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
        query Foo($search_string: String!) {
          search(search_string: $search_string) {
            _id
            oxId
            homographC
            word
            topLevel
          }
        }
      `,
      errorPolicy: 'all'
    });

    this.wordSearchResults$ = this.wordSearchRef.valueChanges.pipe(
      map(({ data }: any) => data.search)
    );

    this.senseSearchResults$ = this.senseSearchRef.valueChanges.pipe(
      map(({ data }: any) => {
        console.log('senseSearchResults:');
        console.log(data);
        return data.search;
      })
    );

    this.wordSearchInput.subscribe(input => {
      console.log('input is:');
      if (typeof input === 'string') {
        console.log(input);
        this.wordSearchRef.setVariables({
          search_string: input
        });
      } else if (typeof input === 'object') {
        console.log(input);
      }
    });

    this.tempObservable$.subscribe(x => {
      this.senseSearchRef.setVariables({
        // senseId: input
        senseId: x
      });
      console.log('x');
      console.log(x);
    });

    this.senseSearchResults$.subscribe(foo => console.log(foo));
  }

  onOptionSelected(input) {
    console.log('onOptionSelected:');
    console.log(input);
    this.senseSearchRef.setVariables({
      // senseId: input
      senseId: 'm_en_gbus0378040.005'
    });
  }

  displayFn(res?: any): string | undefined {
    return res ? res.word : undefined;
  }

  ngOnDestroy() {}
}
