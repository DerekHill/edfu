import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  OnInit
} from '@angular/core';
import {
  SignRecord,
  Transcoding,
  HydratedSense,
  LikeRecordWithoutId
} from '@edfu/api-interfaces';
import { DeviceDetectorService } from 'ngx-device-detector';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { CDN_URI } from '../../constants';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { ApolloQueryResult } from 'apollo-client';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

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
  likes: LikeRecordWithoutId[];
}

interface CreateLikesResult {
  createLikes: LikeRecordWithoutId[];
}

interface RemoveLikesResult {
  removeLikes: LikeRecordWithoutId[];
}

@Component({
  selector: 'edfu-sign',
  templateUrl: './sign.component.html'
})
export class SignComponent implements OnInit {
  @ViewChild('videoSource') videoSource: ElementRef;

  public mediaUrl: string;
  private _sign: SignRecord;
  private likesBs$: BehaviorSubject<LikeRecordWithoutId[]>;
  public likeCountBs$: BehaviorSubject<number>;

  @Input() sense: HydratedSense;


  constructor(
    private deviceService: DeviceDetectorService,
    private library: FaIconLibrary,
    private authService: AuthService,
    private apollo: Apollo
  ) {
    library.addIcons(faPlay);
  }

  ngOnInit() {
    this.likesBs$ = new BehaviorSubject([]);
    this.likeCountBs$ = new BehaviorSubject(null);
    this.getLikes();

    this.likesBs$.subscribe(likes => {
      this.setLikeCount(likes);
    });
  }

  @Input()
  set sign(sign: SignRecord) {
    let s3Key: string;
    if (sign && sign.transcodings && sign.transcodings.length) {
      const transcodings = sign.transcodings;
      if (this.deviceService.isMobile()) {
        s3Key = this._getMobileTranscoding(transcodings).s3Key;
      } else {
        s3Key = this._getDesktopTranscoding(transcodings).s3Key;
      }
    } else {
      s3Key = sign.s3KeyOrig;
    }
    this.mediaUrl = this.generateMediaUrl(s3Key);
    this._sign = sign;
  }

  get sign(): SignRecord {
    return this._sign;
  }

  getLikes() {
    this.apollo
      .query({
        query: GetLikesQuery,
        context: { method: 'GET' },
        variables: {
          signId: this._sign._id
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
        signId: this._sign._id,
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
      // prompt user that they need to sign in to like
    }
  }

  removeLike() {
    if (this.authService.currentUserValue) {
      const variables = {
        signId: this._sign._id,
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
      // prompt user that they need to sign in to like
    }
  }

  onLikeClick() {
    this.createLike();
  }

  onUnlikeClick() {
    this.removeLike();
  }

  onHtmlVideoError(event: { target: HTMLInputElement }) {
    throw new Error(
      `htmlVideo error for video: ${this.mediaUrl}, mediaUrl: ${event.target.src}`
    );
  }

  _getMobileTranscoding(transcodings: Transcoding[]): Transcoding {
    return transcodings.sort(this.sortByBitrate)[0];
  }

  _getDesktopTranscoding(transcodings: Transcoding[]): Transcoding {
    const mp4Transcodings = transcodings.filter(transcoding =>
      transcoding.s3Key.match(/\.mp4$/)
    );

    const biggestMp4Transcoding = mp4Transcodings
      .sort(this.sortByBitrate)
      .slice(-1)[0];

    const biggestTranscoding = transcodings
      .sort(this.sortByBitrate)
      .slice(-1)[0];

    return biggestMp4Transcoding || biggestTranscoding;
  }

  private setLikeCount(likes: LikeRecordWithoutId[]): void {
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

  private generateMediaUrl(key: string) {
    return `${CDN_URI}/${key}`;
  }

  private sortByBitrate(a: Transcoding, b: Transcoding) {
    if (a.bitrate < b.bitrate) {
      return -1;
    } else {
      return 1;
    }
  }
}
