import {
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild
} from '@angular/core';
import { SignRecord, Transcoding } from '@edfu/api-interfaces';
import { DeviceDetectorService } from 'ngx-device-detector';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { CDN_URI } from '../../constants';

@Component({
  selector: 'edfu-sign',
  templateUrl: './sign.component.html'
})
export class SignComponent {
  @ViewChild('videoSource') videoSource: ElementRef;

  public mediaUrl: string;
  private _sign: SignRecord;

  paddingTop: number;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.setRatio();
  }

  constructor(
    private deviceService: DeviceDetectorService,
    private library: FaIconLibrary
  ) {
    library.addIcons(faPlay);
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

  setRatio() {
    const isVideoVertical =
      this.videoSource.nativeElement.videoHeight >
      this.videoSource.nativeElement.videoWidth;
    const isWindowHighest = window.innerHeight / window.innerWidth > 1;

    if (isVideoVertical) {
      const headerAndFooterHeight = 300;
      const optimalPadding = 70;

      if (isWindowHighest) {
        this.paddingTop =
          ((window.innerHeight - headerAndFooterHeight) / window.innerWidth) *
          100;
      } else {
        this.paddingTop = optimalPadding;
      }
    }
  }
}
