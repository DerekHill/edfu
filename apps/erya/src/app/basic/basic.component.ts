import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Message } from '@edfu/api-interfaces';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Subscription } from 'rxjs';
import { untilDestroyed } from 'ngx-take-until-destroy';
// import { UntilDestroy } from '@ngneat/until-destroy';

const Hello = gql`
  query {
    hello
  }
`;

// @UntilDestroy({ checkProperties: true })
// @UntilDestroy()
@Component({
  selector: 'edfu-basic',
  templateUrl: './basic.component.html'
})
export class BasicComponent implements OnInit, OnDestroy {
  hello$ = this.http.get<Message>('/api/hello');
  words: any;
  loading = true;
  error: any;
  hello: any;

  private querySubscription: Subscription;

  constructor(private http: HttpClient, private apollo: Apollo) {}

  ngOnInit() {
    this.apollo

      .watchQuery({
        query: gql`
          {
            headwordsAll {
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
        this.words = result.data.headwordsAll;
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
  }

  ngOnDestroy() {
    //   this.querySubscription.unsubscribe();
  }
}
