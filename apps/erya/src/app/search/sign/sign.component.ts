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

  private vimeoPlayer: Player;

  _sign: SignRecord;
  mediaType: MediaType;
  platformVideoId: string;

  constructor(
    public deviceService: DeviceDetectorService,
    public library: FaIconLibrary
  ) {
    library.addIcons(faPlay);
  }

  @Input() sense: HydratedSense;
  @Input()
  set sign(sign: SignRecord) {
    const mediaUrl = sign.mediaUrl;
    this._sign = sign;
    this.mediaType = this._getMediaType(mediaUrl);
    this.setPlatformVideoId(mediaUrl);
  }

  get sign(): SignRecord {
    return this._sign;
  }

  ngOnInit() {
    if (this.mediaType === MediaType.youtube) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
  }

  ngAfterViewInit() {
    if (this.mediaType === MediaType.vimeo) {
      this.vimeoPlayer = new Player(this.vimeoContainer.nativeElement, {
        id: this.platformVideoId,
        loop: true,
        autoplay: true,
        muted: true,
        playsinline: true,
        portrait: false,
        title: false
      });
    }
  }

  youtubePlayAgain() {
    this.youtubeContainer.playVideo();
  }

  onYouTubePlayerReady() {
    this.youtubeContainer.mute();
    this._playIfNotMobile();
  }

  onYouTubePlayerStateChange(event) {
    if (event.data === 0) {
      this._playIfNotMobile();
    }
  }

  _playIfNotMobile() {
    if (!this.deviceService.isMobile()) {
      this.youtubeContainer.playVideo();
    }
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

  _getVimeoVideoIdFromFullUrlDeprecated(url: string): string {
    const vimeo_regex = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
    return url.match(vimeo_regex)[3];
  }

  private setPlatformVideoId(mediaUrl: string) {
    if (this.mediaType === MediaType.youtube) {
      this.platformVideoId = this._getYouTubeVideoId(mediaUrl);
    } else if (this.mediaType === MediaType.vimeo) {
      this.platformVideoId = this._getVimeoVideoIdFromFullUrlDeprecated(
        mediaUrl
      );
    }
  }
}
