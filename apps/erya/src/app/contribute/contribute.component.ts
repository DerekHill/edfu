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

@Component({
  selector: 'edfu-contibute',
  templateUrl: './contribute.component.html'
})
export class ContributeComponent implements OnInit, OnDestroy {
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
  }

  ngOnDestroy() {}
}