import { Component, Input, ViewChild, AfterViewInit } from '@angular/core';
import { SignRecord } from '@edfu/api-interfaces';
import { DeviceDetectorService } from 'ngx-device-detector';
import * as Player from '@vimeo/player/dist/player.js';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { CDN_URI } from '../../constants';

export enum MediaType {
  htmlVideo = 'htmlVideo',
  gif = 'gif',
  vimeo = 'vimeo'
}

@Component({
  selector: 'edfu-sign',
  templateUrl: './sign.component.html'
})
export class SignComponent implements AfterViewInit {
  @ViewChild('vimeo_player_container') vimeoContainer: any;

  public mediaType: MediaType;
  public platformVideoId: string;
  private vimeoPlayer: Player;

  private _sign: SignRecord;

  constructor(
    public deviceService: DeviceDetectorService,
    public library: FaIconLibrary
  ) {
    library.addIcons(faPlay);
  }

  @Input()
  set sign(sign: SignRecord) {
    this.configureComponent(sign);
  }

  get sign(): SignRecord {
    return this._sign;
  }

  ngAfterViewInit() {
    this.initializeVimeoPlayer();
  }

  vimeoPlay() {
    this.vimeoPlayer.play();
  }

  onHtmlVideoError(event: { target: HTMLInputElement }) {
    throw new Error(
      `htmlVideo error for video: ${this.platformVideoId}, mediaUrl: ${event.target.src}`
    );
  }

  _getMediaType(filename: string): MediaType {
    if (/.gif$/.test(filename)) {
      return MediaType.gif;
    } else if (/.mp4$/.test(filename)) {
      return MediaType.htmlVideo;
    } else if (/vimeo\.com\//.test(filename)) {
      return MediaType.vimeo;
    } else {
      return MediaType.htmlVideo;
    }
  }

  _getVimeoVideoIdFromFullUrl(url: string): string {
    const vimeo_regex = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
    return url.match(vimeo_regex)[3];
  }

  private configureComponent(sign: SignRecord) {
    const mediaUrl = sign.mediaUrl;
    this._sign = sign;
    this.mediaType = this._getMediaType(mediaUrl);
    this.setPlatformVideoId(mediaUrl);
  }

  private useFallbackMediaUrl() {
    const fallbackMediaUrl = `${CDN_URI}/${this._sign.s3KeyOrig}`;
    const updatedSign = { ...this.sign, ...{ mediaUrl: fallbackMediaUrl } };
    this.configureComponent(updatedSign);
  }

  private initializeVimeoPlayer() {
    if (this.mediaType === MediaType.vimeo) {
      this.vimeoPlayer = new Player(this.vimeoContainer.nativeElement, {
        id: this.platformVideoId,
        background: true,
        controls: false, // remove once have no more 3rd party (non Pro) Vimeo videos
        autoplay: true, // remove once have no more 3rd party (non Pro) Vimeo videos
        title: false,
        muted: true,
        playsinline: true
      });

      this.vimeoPlayer
        .loadVideo(this.platformVideoId)
        .then((id: string) => {})
        .catch((error: Error) => {
          this.useFallbackMediaUrl();
          if (!error.message.match(/was not found/)) {
            throw new Error(
              'Unknown Vimeo error' + this.platformVideoId + error
            );
          }
        });
    }
  }

  private setPlatformVideoId(mediaUrl: string) {
    if (this.mediaType === MediaType.vimeo) {
      this.platformVideoId = this._getVimeoVideoIdFromFullUrl(mediaUrl);
    }
  }
}
