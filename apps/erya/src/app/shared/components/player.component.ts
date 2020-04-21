import {
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
  OnInit
} from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'edfu-player',
  templateUrl: './player.component.html'
})
export class PlayerComponent implements OnInit {
  @ViewChild('videoSource') videoSource: ElementRef;

  paddingTop: number;

  @Input() mediaUrl: SafeResourceUrl;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.setRatio();
  }

  constructor(
  ) {
  }

  ngOnInit() {
  }


  onHtmlVideoError(event: { target: HTMLInputElement }) {
    throw new Error(
      `htmlVideo error for video: ${this.mediaUrl}, mediaUrl: ${event.target.src}`
    );
  }

  setRatio() {
    const isVideoVertical =
      this.videoSource.nativeElement.videoHeight >
      this.videoSource.nativeElement.videoWidth;
    const isWindowHighest = window.innerHeight / window.innerWidth > 1;

    if (isVideoVertical) {
      const headerAndFooterHeight = 300;
      const optimalPadding = 70;

      if (isWindowHighest) {
        this.paddingTop =
          ((window.innerHeight - headerAndFooterHeight) / window.innerWidth) *
          100;
      } else {
        this.paddingTop = optimalPadding;
      }
    }
  }
}
