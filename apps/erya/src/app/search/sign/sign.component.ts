import {
  Component,
  Input,
  OnInit,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { HydratedSense, SignRecord } from '@edfu/api-interfaces';
import { DeviceDetectorService } from 'ngx-device-detector';
import * as Player from '@vimeo/player/dist/player.js';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { CDN_URI } from '../../constants';

export enum MediaType {
  htmlVideo = 'htmlVideo',
  gif = 'gif',
  youtube = 'youtube',
  vimeo = 'vimeo'
}

@Component({
  selector: 'edfu-sign',
  templateUrl: './sign.component.html'
})
export class SignComponent implements OnInit, AfterViewInit {
  @ViewChild('vimeo_player_container') vimeoContainer: any;
  @ViewChild('youtube_player_container') youtubeContainer: any;
  @ViewChild('ytContainer') ytContainer: any;

  public mediaType: MediaType;
  public platformVideoId: string;

  private _sign: SignRecord;

  constructor(
    public deviceService: DeviceDetectorService,
    public library: FaIconLibrary
  ) {
    library.addIcons(faPlay);
  }

  @Input() sense: HydratedSense;
  @Input()
  set sign(sign: SignRecord) {
    this.configureComponent(sign);
  }

  get sign(): SignRecord {
    return this._sign;
  }

  ngOnInit() {
    this.setupYouTubePlayer();
  }

  ngAfterViewInit() {
    this.initializeVimeoPlayer();
  }

  youtubePlayAgain() {
    this.youtubeContainer.playVideo();
  }

  onYouTubePlayerReady() {
    this.youtubeContainer.mute();
    this.playIfNotMobile();
  }

  onYouTubePlayerStateChange(event: YT.OnStateChangeEvent) {
    if (event.data === 0) {
      this.playIfNotMobile();
    }
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
    } else if (
      /youtu\.be\//.test(filename) ||
      /youtube\.com\//.test(filename)
    ) {
      return MediaType.youtube;
    } else if (/vimeo\.com\//.test(filename)) {
      return MediaType.vimeo;
    } else {
      return MediaType.htmlVideo;
    }
  }
  _getYouTubeVideoId(url: string): string {
    const youtube_regex = /^.*(youtu\.be\/|vi?\/|u\/\w\/|embed\/|\?vi?=|\&vi?=)([^#\&\?]*).*/;
    return url.match(youtube_regex)[2];
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
    const fallbackMediaUrl = `${CDN_URI}/${this._sign.s3Key}`;
    const updatedSign = { ...this.sign, ...{ mediaUrl: fallbackMediaUrl } };
    this.configureComponent(updatedSign);
  }

  private initializeVimeoPlayer() {
    if (this.mediaType === MediaType.vimeo) {
      let vimeoPlayer: Player;

      vimeoPlayer = new Player(this.vimeoContainer.nativeElement, {
        id: this.platformVideoId,
        background: true,
        muted: true,
        playsinline: true
      });

      vimeoPlayer
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

  private playIfNotMobile() {
    if (!this.deviceService.isMobile()) {
      this.youtubeContainer.playVideo();
    }
  }

  private setPlatformVideoId(mediaUrl: string) {
    if (this.mediaType === MediaType.youtube) {
      this.platformVideoId = this._getYouTubeVideoId(mediaUrl);
    } else if (this.mediaType === MediaType.vimeo) {
      this.platformVideoId = this._getVimeoVideoIdFromFullUrl(mediaUrl);
    }
  }

  private setupYouTubePlayer() {
    if (this.mediaType === MediaType.youtube) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
  }
}
