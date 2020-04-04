import { Component, Input } from '@angular/core';
import { SignRecord } from '@edfu/api-interfaces';
import { DeviceDetectorService } from 'ngx-device-detector';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { CDN_URI } from '../../constants';

@Component({
  selector: 'edfu-sign',
  templateUrl: './sign.component.html'
})
export class SignComponent {
  public mediaUrl: string;
  private _sign: SignRecord;

  constructor(
    public deviceService: DeviceDetectorService,
    public library: FaIconLibrary
  ) {
    library.addIcons(faPlay);
  }

  @Input()
  set sign(sign: SignRecord) {
    this.mediaUrl = `${CDN_URI}/${sign.s3KeyOrig}`;
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
}
