import { Component, Input, OnInit } from '@angular/core';
import {
  SignDtoInterface,
  Transcoding,
  SenseHydratedDtoInterface
} from '@edfu/api-interfaces';
import { DeviceDetectorService } from 'ngx-device-detector';
import { CDN_URI } from '../../constants';
import { Meta, Title } from '@angular/platform-browser';
import { OxIdThesaurusPipe } from '../../shared/pipes/ox-id-thesaurus.pipe';
import { RemoveUnderscoresPipe } from '../../shared/pipes/remove-underscores.pipe';

@Component({
  selector: 'edfu-sign',
  templateUrl: './sign.component.html',
  providers: [OxIdThesaurusPipe, RemoveUnderscoresPipe]
})
export class SignComponent implements OnInit {
  public mediaUrl: string;
  public _sign: SignDtoInterface;

  @Input() sense: SenseHydratedDtoInterface;
  @Input() selectedSense: SenseHydratedDtoInterface;

  constructor(
    private deviceService: DeviceDetectorService,
    private titleService: Title,
    private metaTagService: Meta,
    private oxIdThesaurus: OxIdThesaurusPipe,
    private removeUnderscores: RemoveUnderscoresPipe
  ) {}

  ngOnInit() {
    const signWord = this.removeUnderscores.transform(
      this.oxIdThesaurus.transform(this.selectedSense)
    );

    this.titleService.setTitle(
      `${signWord} | Sign for ${signWord}`
    );
    this.metaTagService.updateTag({
      name: 'description',
      content: `Makaton Sign for ${signWord} - ${this.selectedSense.definition}`
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
