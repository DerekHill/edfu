import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SignComponent, MediaType } from './sign.component';
import { ObjectId } from 'bson';
import { SignRecord } from '@edfu/api-interfaces';
import { MatListModule } from '@angular/material/list';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

describe('SignComponent', () => {
  let component: SignComponent;
  let fixture: ComponentFixture<SignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SignComponent],
      imports: [
        MatListModule,
        DeviceDetectorModule.forRoot(),
        FontAwesomeModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    const signData: SignRecord = {
      _id: new ObjectId(),
      userId: new ObjectId(),
      mnemonic: 'remember me',
      mediaUrl: 'www.my-picture-link.com',
      s3Key: '1234.mp4'
    };
    fixture = TestBed.createComponent(SignComponent);
    component = fixture.componentInstance;
    component.sign = signData;
    fixture.detectChanges();
  });

  describe('_getMediaType', () => {
    it('gets media type', () => {
      expect(component._getMediaType('my.gif')).toBe(MediaType.gif);
      expect(component._getMediaType('my.mp4')).toBe(MediaType.htmlVideo);
      expect(component._getMediaType('https://vimeo.com/130196945')).toBe(
        MediaType.vimeo
      );
    });
  });

  describe('_getVimeoVideoId', () => {
    it('works', () => {
      const videoId = '130196946';

      const videos = [
        `https://vimeo.com/${videoId}`,
        `http://vimeo.com/${videoId}`,
        `https://www.vimeo.com/${videoId}`,
        `http://www.vimeo.com/${videoId}`,
        `https://vimeo.com/channels/${videoId}`,
        `http://vimeo.com/channels/${videoId}`,
        `https://vimeo.com/groups/name/videos/${videoId}`,
        `http://vimeo.com/groups/name/videos/${videoId}`,
        `https://vimeo.com/album/2222222/video/${videoId}`,
        `http://vimeo.com/album/2222222/video/${videoId}`,
        `https://vimeo.com/${videoId}?param=test`,
        `http://vimeo.com/${videoId}?param=test`
      ];

      for (const video of videos) {
        expect(component._getVimeoVideoIdFromFullUrl(video)).toBe(videoId);
      }
    });
  });
});
