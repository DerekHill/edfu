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
    if (
      sign &&
      sign.transcodings &&
      sign.transcodings.length &&
      this.deviceService.isMobile()
    ) {
      const smallestTranscoding = sign.transcodings.sort(this.sortBySize)[0];
      this.mediaUrl = this.generateMediaUrl(smallestTranscoding.s3Key);
    } else {
      this.mediaUrl = this.generateMediaUrl(sign.s3KeyOrig);
    }
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

  private generateMediaUrl(key: string) {
    return `${CDN_URI}/${key}`;
  }

  private sortBySize(a: Transcoding, b: Transcoding) {
    if (a.size < b.size) {
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
