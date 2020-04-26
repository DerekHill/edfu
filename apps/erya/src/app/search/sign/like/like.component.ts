import { Component, Input, OnInit } from '@angular/core';
import {
  LikeDtoInterface,
  SenseHydratedDtoInterface
} from '@edfu/api-interfaces';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faHeart as farHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as fasHeart } from '@fortawesome/free-regular-svg-icons';
import {
  LOGIN_COMPONENT_PATH,
  SIGNUP_COMPONENT_PATH
} from '../../../constants';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ApolloQueryResult } from 'apollo-client';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { pulseAnimation } from '../../../animations/pulse.animation';
import { query, transition, trigger, useAnimation } from '@angular/animations';
import { ModalService } from '../../../shared/components/modal/modal.service';

const GetLikesQuery = gql`
  query GetLikesQuery($signId: ID!) {
    likes(signId: $signId) {
      userId
      senseId
    }
  }
`;

const CreateLikesMutation = gql`
  mutation CreateLikesMutation($signId: ID!, $senseId: ID) {
    createLikes(signId: $signId, senseId: $senseId) {
      userId
      senseId
    }
  }
`;

const RemoveLikesMutation = gql`
  mutation RemoveLikesMutation($signId: ID!, $senseId: ID) {
    removeLikes(signId: $signId, senseId: $senseId) {
      userId
      senseId
    }
  }
`;

interface LikesResult {
  likes: LikeDtoInterface[];
}

interface CreateLikesResult {
  createLikes: LikeDtoInterface[];
}

interface RemoveLikesResult {
  removeLikes: LikeDtoInterface[];
}

@Component({
  selector: 'edfu-like',
  templateUrl: './like.component.html',
  animations: [
    trigger('pulseAnimation', [
      transition(
        'void => *',
        query(
          'svg',
          useAnimation(pulseAnimation, {
            params: {
              timings: '300ms ease-in',
              startScale: 1,
              middleScale: 1.3,
              endScale: 1,
              rotate: '0deg'
            }
          })
        )
      )
    ])
  ]
})
export class LikeComponent implements OnInit {
  public likesBs$: BehaviorSubject<LikeDtoInterface[]>;
  public likeCountBs$: BehaviorSubject<number>;
  public currentUserHasLikedBs$: BehaviorSubject<boolean>;

  @Input() signId: string;
  @Input() sense: SenseHydratedDtoInterface;
  signupComponentPath = `/${SIGNUP_COMPONENT_PATH}`;
  loginComponentPath = `/${LOGIN_COMPONENT_PATH}`;

  constructor(
    private library: FaIconLibrary,
    private authService: AuthService,
    private apollo: Apollo,
    private modalService: ModalService
  ) {
    library.addIcons(farHeart, fasHeart);
  }

  ngOnInit() {
    this.likesBs$ = new BehaviorSubject([]);
    this.likeCountBs$ = new BehaviorSubject(null);
    this.currentUserHasLikedBs$ = new BehaviorSubject(false);
    this.getLikes();

    this.likesBs$.subscribe(likes => {
      this.setLikeCount(likes);
      this.setCurrentUserHasLiked(likes);
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

  createLike() {
    if (this.authService.currentUserValue) {
      const variables = {
        signId: this.signId,
        senseId: this.sense && this.sense.senseId
      };
      this.apollo
        .mutate({
          mutation: CreateLikesMutation,
          variables: variables
        })
        .toPromise()
        .then((res: ApolloQueryResult<CreateLikesResult>) => {
          this.likesBs$.next(res.data.createLikes);
        });
    } else {
      this.openModal('modal-sign-in');
    }
  }

  removeLike() {
    if (this.authService.currentUserValue) {
      const variables = {
        signId: this.signId,
        senseId: this.sense && this.sense.senseId
      };
      this.apollo
        .mutate({
          mutation: RemoveLikesMutation,
          variables: variables
        })
        .toPromise()
        .then((res: ApolloQueryResult<RemoveLikesResult>) => {
          this.likesBs$.next(res.data.removeLikes);
        });
    } else {
      this.openModal('modal-sign-in');
    }
  }

  onLikeClick() {
    this.createLike();
  }

  onUnlikeClick() {
    this.removeLike();
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

  private setCurrentUserHasLiked(likes: LikeDtoInterface[]): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      const currentUserLikes = likes.filter(like => {
        if (this.sense) {
          return (
            like.userId === currentUser._id &&
            like.senseId === this.sense.senseId
          );
        } else {
          return like.userId === currentUser._id;
        }
      });
      this.currentUserHasLikedBs$.next(!!currentUserLikes.length);
    } else {
      this.currentUserHasLikedBs$.next(false);
    }
  }

  private groupBy(xs: any[], key: string) {
    return xs.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }

  openModal(id: string) {
    this.modalService.open(id);
  }
}
