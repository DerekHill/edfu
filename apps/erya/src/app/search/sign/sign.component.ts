import { Component, Input } from '@angular/core';
import { SignRecord } from '@edfu/api-interfaces';

export enum MediaTypes {
  gif = 'gif',
  mp4 = 'mp4'
}

@Component({
  selector: 'edfu-sign',
  templateUrl: './sign.component.html'
})
export class SignComponent {
  _sign: SignRecord;
  isVideo: boolean;

  @Input()
  set sign(sign: SignRecord) {
    this._sign = sign;
    this.isVideo = this._getMediaType(sign.mediaUrl) === MediaTypes.mp4;
  }

  get sign(): SignRecord {
    return this._sign;
  }

  _getMediaType(filename: string): MediaTypes {
    if (/.gif$/.test(filename)) {
      return MediaTypes.gif;
    } else if (/.mp4$/.test(filename)) {
      return MediaTypes.mp4;
    } else {
      throw new Error(`File of unknown media type: ${filename}`);
    }
  }
}
