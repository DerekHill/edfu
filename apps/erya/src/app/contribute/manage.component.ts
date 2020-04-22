import { Component, OnInit } from '@angular/core';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';

const SignsQuery = gql`
  query SignsQuery {
    signs {
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
  ngOnInit() {
    this.apollo
      .query({
        query: SignsQuery
      })
      .toPromise()
      .then(res => {
        console.log('res:');
        console.log(res);
      });
  }
}
