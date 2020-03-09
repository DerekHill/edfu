import { Component, Input } from '@angular/core';
import { HydratedSense, SignRecord } from '@edfu/api-interfaces';

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

  @Input() sense: HydratedSense;
  @Input()
  set sign(sign: SignRecord) {
    this._sign = sign;
    this.isVideo = this._isVideo(sign.mediaUrl);
  }

  get sign(): SignRecord {
    return this._sign;
  }

  _isVideo(filename: string): boolean {
    if (/.gif$/.test(filename)) {
      return false;
    } else if (/.mp4$/.test(filename)) {
      return true;
    } else {
      console.log(`File of unknown media type: ${filename}`);
      return true;
    }
  }
}
