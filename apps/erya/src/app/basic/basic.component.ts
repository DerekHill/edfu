// https://stackblitz.com/edit/basic-apollo-angular-app
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Message } from '@edfu/api-interfaces';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Subscription } from 'rxjs';
import { untilDestroyed } from 'ngx-take-until-destroy';
import { FormControl } from '@angular/forms';

const Hello = gql`
  query {
    hello
  }
`;

const GetById = gql`
  query {
    entry(id: "5df37add4b2f1813eff96309") {
      _id
      oxId
      homographC
      word
      topLevel
    }
  }
`;

@Component({
  selector: 'edfu-basic',
  templateUrl: './basic.component.html'
})
export class BasicComponent implements OnInit, OnDestroy {
  myControl = new FormControl();
  options: string[] = ['One', 'Two', 'Three'];

  hello$ = this.http.get<Message>('/api/hello');
  words: any;
  loading = true;
  error: any;
  hello: any;
  hello2: any;
  byId: any;

  private querySubscription: Subscription;

  constructor(private http: HttpClient, private apollo: Apollo) {}

  ngOnInit() {
    this.apollo
      .watchQuery({
        query: gql`
          {
            entriesAll {
              _id
              oxId
              homographC
              word
              topLevel
            }
          }
        `
      })
      .valueChanges.pipe(untilDestroyed(this))
      .subscribe((result: any) => {
        this.words = result.data.entriesAll;
        this.loading = result.loading;
        this.error = result.errors;
      });

    this.querySubscription = this.apollo
      .watchQuery<any>({
        query: Hello
      })
      .valueChanges.subscribe(({ data, loading }) => {
        this.loading = loading;
        this.hello = data;
      });

    this.apollo
      .query<any>({
        query: Hello
      })
      .subscribe(({ data, loading }) => {
        this.hello2 = data;
      });

    this.apollo
      .query<any>({
        query: GetById
      })
      .subscribe(({ data, loading }) => {
        this.byId = data;
      });
  }

  ngOnDestroy() {}
}
