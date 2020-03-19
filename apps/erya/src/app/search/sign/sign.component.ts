import {
  Component,
  Input,
  OnInit,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { HydratedSense, SignRecord, IResponse } from '@edfu/api-interfaces';
import { DeviceDetectorService } from 'ngx-device-detector';
import * as Player from '@vimeo/player/dist/player.js';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { UploadService } from '../../contribute/upload/upload.service';
import { VimeoVideoStatus } from '@edfu/api-interfaces';

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
  public vimeoVideoStatus = VimeoVideoStatus.available;

  private _sign: SignRecord;

  constructor(
    public deviceService: DeviceDetectorService,
    public library: FaIconLibrary,
    private uploadService: UploadService
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
    this.initializeVimeoPlayer();
  }

  youtubePlayAgain() {
    this.youtubeContainer.playVideo();
  }

  onYouTubePlayerReady() {
    this.youtubeContainer.mute();
    this.playIfNotMobile();
  }

  onYouTubePlayerStateChange(event) {
    if (event.data === 0) {
      this.playIfNotMobile();
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

  _getVimeoVideoIdFromFullUrl(url: string): string {
    const vimeo_regex = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
    return url.match(vimeo_regex)[3];
  }

  _notifySignNotFound(videoId: string, status: VimeoVideoStatus) {
    if (
      [
        VimeoVideoStatus.uploading_error,
        VimeoVideoStatus.transcoding_error,
        VimeoVideoStatus.not_found
      ].includes(status)
    ) {
      throw new Error(`videoId: ${videoId} got error: ${status}`);
    }
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
        .then(id => {})
        .catch(error => {
          if (error.message.match(/was not found/)) {
            this.updateVimeoVideoStatus(this.platformVideoId);
          } else {
            throw error;
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

  private async updateVimeoVideoStatus(videoId: string) {
    const res: IResponse = await this.uploadService.getStatus(videoId);

    if (res.success) {
      const status: VimeoVideoStatus = res.data.status;
      this.vimeoVideoStatus = status;
      this._notifySignNotFound(videoId, status);
    }
  }
}
