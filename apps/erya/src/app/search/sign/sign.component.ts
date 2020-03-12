import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { HydratedSense, SignRecord } from '@edfu/api-interfaces';

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

  onYouTubePlayerReady() {
    console.log('YouTube player is ready');
    this.youTubePlayer.mute();
    this.youTubePlayer.playVideo();
    console.log('player muted');
  }

  onYouTubePlayerStateChange(event) {
    console.log(event);
    if (event.data === 0) {
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
