import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  LikeDtoInterface,
  SenseHydratedDtoInterface
} from '@edfu/api-interfaces';
import { ApolloQueryResult } from 'apollo-client';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
const GetLikesQuery = gql`
  query GetLikesQuery($signId: ID!) {
    likes(signId: $signId) {
      userId
      senseId
    }
  }
`;

interface LikesResult {
  likes: LikeDtoInterface[];
}

@Component({
  selector: 'edfu-likes-counter',
  templateUrl: './likes-counter.component.html'
})
export class LikesCounterComponent implements OnInit {
  public likeCountBs$: BehaviorSubject<number>;
  public likesBs$: BehaviorSubject<LikeDtoInterface[]>;

  @Input() signId: string;
  @Input() sense: SenseHydratedDtoInterface;
  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.likesBs$ = new BehaviorSubject([]);
    this.likeCountBs$ = new BehaviorSubject(null);
    this.getLikes();

    this.likesBs$.subscribe(likes => {
      this.setLikeCount(likes);
    });
  }

  getLikes() {
    this.apollo
      .query({
        query: GetLikesQuery,
        context: { method: 'GET' },
        variables: {
          signId: this.signId
        }
      })
      .toPromise()
      .then((res: ApolloQueryResult<LikesResult>) => {
        this.likesBs$.next(res.data.likes);
      });
  }

  private setLikeCount(likes: LikeDtoInterface[]): void {
    if (this.sense) {
      this.likeCountBs$.next(
        likes.filter(like => like.senseId === this.sense.senseId).length
      );
    } else {
      const grouped = this.groupBy(likes, 'senseId');
      const arrays: number[][] = Object.values(grouped);
      const maxLikes = arrays.reduce((acc: number, curr: number[]) => {
        return Math.max(acc, curr.length);
      }, 0);
      this.likeCountBs$.next(maxLikes);
    }
  }

  private groupBy(xs: any[], key: string) {
    return xs.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }
}
