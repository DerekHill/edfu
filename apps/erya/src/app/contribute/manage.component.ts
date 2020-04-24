import { Component, OnInit } from '@angular/core';
import gql from 'graphql-tag';
import { Apollo, QueryRef } from 'apollo-angular';
import { SignDtoInterface } from '@edfu/api-interfaces';
import { ApolloQueryResult } from 'apollo-client';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { SEARCH_COMPONENT_PATH, CONTRIBUTE_COMPONENT_PATH } from '../constants';

interface SignsResult {
  signs: SignDtoInterface[];
}

const SignsQuery = gql`
  query SignsQuery {
    signs {
      _id
      senseSigns {
        senseId
        sense {
          ownEntryOxId
        }
      }
    }
  }
`;

const DeleteSignMutation = gql`
  mutation DeleteSignMutation($signId: ID!) {
    deleteSign(signId: $signId)
  }
`;

@Component({
  selector: 'edfu-manage',
  templateUrl: './manage.component.html'
})
export class ManageComponent implements OnInit {
  constructor(private apollo: Apollo) {}

  signs$: Observable<SignDtoInterface[]>;
  signsBs$: BehaviorSubject<SignDtoInterface[]>;

  signsSearchRef: QueryRef<SignsResult, any>;

  searchComponentPath = `/${SEARCH_COMPONENT_PATH}`;
  contributeComponentPath = `/${CONTRIBUTE_COMPONENT_PATH}`;

  ngOnInit() {
    this.signsBs$ = new BehaviorSubject([]);

    this.signsSearchRef = this.apollo.watchQuery<SignsResult, any>({
      query: SignsQuery
    });

    this.signs$ = this.signsSearchRef.valueChanges.pipe(
      map((res: ApolloQueryResult<SignsResult>) => res.data.signs)
    );

    this.signs$.subscribe(signs => this.signsBs$.next(signs));
  }

  onDeleteButtonClick(sign: SignDtoInterface) {
    this.deleteSignRemotely(sign._id);
    this.deleteSignLocally(sign._id);
  }

  private deleteSignLocally(signId: string) {
    const orig = this.signsBs$.value;
    this.signsBs$.next(orig.filter(sign => sign._id != signId));
  }

  private deleteSignRemotely(signId: string) {
    this.apollo
      .mutate({
        mutation: DeleteSignMutation,
        variables: {
          signId: signId
        }
      })
      .toPromise()
      .then(res => console.log(res));
  }
}
