import { Component, OnInit } from '@angular/core';
import gql from 'graphql-tag';
import { Apollo, QueryRef } from 'apollo-angular';
import { SignDtoInterface } from '@edfu/api-interfaces';
import { ApolloQueryResult } from 'apollo-client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface SignsResult {
  signs: SignDtoInterface[];
}

const SignsQuery = gql`
  query SignsQuery {
    signs {
      _id
      s3KeyOrig
      senseSigns {
        senseId
        sense {
          ownEntryOxId
        }
      }
    }
  }
`;

@Component({
  selector: 'edfu-manage',
  templateUrl: './manage.component.html'
})
export class ManageComponent implements OnInit {
  constructor(private apollo: Apollo) {}

  signs$: Observable<SignDtoInterface[]>;

  signsSearchRef: QueryRef<SignsResult, any>;

  ngOnInit() {
    this.signsSearchRef = this.apollo.watchQuery<SignsResult, any>({
      query: SignsQuery
    });

    this.signs$ = this.signsSearchRef.valueChanges.pipe(
      map((res: ApolloQueryResult<SignsResult>) => res.data.signs)
    );

    this.signs$.subscribe(i => console.log(i));

    this.apollo
      .query({
        query: SignsQuery
      })
      .toPromise()
      .then((res: ApolloQueryResult<SignsResult>) => {
        console.log('res:');
        console.log(res.data.signs);
      });
  }
}
