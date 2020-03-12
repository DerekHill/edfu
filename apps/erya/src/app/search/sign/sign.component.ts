import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { HydratedSense, SignRecord } from '@edfu/api-interfaces';
import { DeviceDetectorService } from 'ngx-device-detector';

export enum MediaType {
  htmlVideo = 'htmlVideo',
  gif = 'gif',
  youtube = 'youtube'
}

@Component({
  selector: 'edfu-sign',
  templateUrl: './sign.component.html'
})
export class SignComponent implements OnInit {
  @ViewChild('youtubeplayer') youTubePlayer: any;

  _sign: SignRecord;
  mediaType: MediaType;
  youtubeVideoId: string;

  constructor(private deviceService: DeviceDetectorService) {}

  @Input() sense: HydratedSense;
  @Input()
  set sign(sign: SignRecord) {
    const mediaUrl = sign.mediaUrl;
    this._sign = sign;
    this.mediaType = this._getMediaType(mediaUrl);
    if (this.mediaType === MediaType.youtube) {
      this.youtubeVideoId = this._getYouTubeVideoId(mediaUrl);
    }
  }

  get sign(): SignRecord {
    return this._sign;
  }

  ngOnInit() {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
  }

  youtubePlayAgain() {
    this.youTubePlayer.playVideo();
  }

  onYouTubePlayerReady() {
    this.youTubePlayer.mute();
    this._playIfNotMobile();
  }

  onYouTubePlayerStateChange(event) {
    if (event.data === 0) {
      this._playIfNotMobile();
    }
  }

  _playIfNotMobile() {
    if (!this.deviceService.isMobile()) {
      this.youTubePlayer.playVideo();
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
    } else {
      return MediaType.htmlVideo;
    }
  }
  _getYouTubeVideoId(url: string): string {
    const youtube_regex = /^.*(youtu\.be\/|vi?\/|u\/\w\/|embed\/|\?vi?=|\&vi?=)([^#\&\?]*).*/;
    return url.match(youtube_regex)[2];
  }
}
