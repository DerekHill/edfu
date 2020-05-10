import { Component, Input, OnInit } from '@angular/core';
import {
  SignDtoInterface,
  Transcoding,
  SenseHydratedDtoInterface
} from '@edfu/api-interfaces';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CDN_URI } from '../../constants';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'edfu-sign',
  templateUrl: './sign.component.html'
})
export class SignComponent implements OnInit {
  public mediaUrl: string;
  public _sign: SignDtoInterface;

  @Input() sense: SenseHydratedDtoInterface;
  @Input() selectedSense: string;

  constructor(
    private deviceService: DeviceDetectorService,
    private titleService: Title,
    private metaTagService: Meta
  ) {}

  ngOnInit() {
    this.titleService.setTitle(
      `${this.selectedSense} | Sign for ${this.selectedSense}`
    );
    this.metaTagService.updateTag({
      name: 'description',
      content: `Makaton Sign for ${this.selectedSense}`
    });
  }

  @Input()
  set sign(sign: SignDtoInterface) {
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

  get sign(): SignDtoInterface {
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
