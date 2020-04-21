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

@Component({
  selector: 'edfu-sign',
  templateUrl: './sign.component.html'
})
export class SignComponent implements OnInit {
  public mediaUrl: string;
  public _sign: SignRecord;

  @Input() sense: HydratedSense;


  constructor(
    private deviceService: DeviceDetectorService,
    private authService: AuthService,
    private apollo: Apollo
  ) {
  }

  ngOnInit() {

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
