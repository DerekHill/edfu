// https://stackblitz.com/edit/basic-apollo-angular-app
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Message } from '@edfu/api-interfaces';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { environment } from '../../environments/environment';

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

    const jwtInterceptorTest = this.http.get<any>(
      `${environment.apiUri}/api/auth/profile`
    );

    jwtInterceptorTest.subscribe(r => console.log(r));
  }

  ngOnDestroy() {}
}
