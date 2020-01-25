import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Apollo, QueryRef } from 'apollo-angular';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { HttpClient } from '@angular/common/http';
import { HeadwordDto } from '@edfu/api-interfaces';
import { MatOption } from '@angular/material';

interface SearchQuery {
  search: HeadwordDto[];
}

interface SearchVariables {
  search_string?: string;
}

@Component({
  selector: 'edfu-second',
  templateUrl: './second.component.html'
})
export class SecondComponent implements OnInit, OnDestroy {
  searchFormControl = new FormControl();
  searchInput: Observable<string>;
  searchResults$: Observable<HeadwordDto[]>;
  searchRef: QueryRef<SearchQuery, SearchVariables>;

  constructor(private http: HttpClient, private apollo: Apollo) {}

  ngOnInit() {
    this.searchInput = this.searchFormControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        // console.log(value);
        return value;
      })
    );

    this.searchRef = this.apollo.watchQuery<SearchQuery, SearchVariables>({
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

    this.searchResults$ = this.searchRef.valueChanges.pipe(
      map(({ data }: any) => data.search)
    );

    this.searchInput.subscribe(input => {
      console.log('input is:');
      if (typeof input === 'string') {
        console.log(input);
        this.searchRef.setVariables({
          search_string: input
        });
      } else if (typeof input === 'object') {
        console.log(input);
      }
    });
  }

  onOptionSelected(input) {
    console.log('onOptionSelected:');
    console.log(input);
  }

  displayFn(res?: any): string | undefined {
    return res ? res.word : undefined;
  }

  ngOnDestroy() {}
}
