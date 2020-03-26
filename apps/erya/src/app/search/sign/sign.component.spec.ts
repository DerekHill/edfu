import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SignComponent, MediaType } from './sign.component';
import { ObjectId } from 'bson';
import { SignRecord, HydratedSense } from '@edfu/api-interfaces';
import { MatListModule } from '@angular/material/list';
import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/enums';
import { YouTubePlayerModule } from '@angular/youtube-player';
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
        YouTubePlayerModule,
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
    const senseData: HydratedSense = {
      oxId: 'food',
      homographC: null,
      associationType: DictionaryOrThesaurus.dictionary,
      similarity: 0.5,
      senseId: 'senseId',
      ownEntryOxId: 'food',
      ownEntryHomographC: null,
      lexicalCategory: LexicalCategory.noun,
      apiSenseIndex: 1,
      example: 'eat some food'
    };
    fixture = TestBed.createComponent(SignComponent);
    component = fixture.componentInstance;
    component.sign = signData;
    component.sense = senseData;
    fixture.detectChanges();
  });

  describe('_getMediaType', () => {
    it('gets media type', () => {
      expect(component._getMediaType('my.gif')).toBe(MediaType.gif);
      expect(component._getMediaType('my.mp4')).toBe(MediaType.htmlVideo);
      expect(component._getMediaType('https://youtu.be/6cxRS-XGIro')).toBe(
        MediaType.youtube
      );
      expect(
        component._getMediaType('https://www.youtube.com/watch?v=6cxRS-XGIro')
      ).toBe(MediaType.youtube);
      expect(component._getMediaType('https://vimeo.com/130196945')).toBe(
        MediaType.vimeo
      );
    });
  });

  describe('_getYouTubeVideoId', () => {
    it('works', () => {
      const videoId = '0zM3nApSvMg';

      const videos = [
        `http://www.youtube.com/embed/${videoId}?rel=0`,
        `http://www.youtube.com/user/IngridMichaelsonVEVO#p/a/u/1/${videoId}`,
        `http://www.youtube.com/user/Scobleizer#p/u/1/${videoId}?rel=0`,
        `http://www.youtube.com/user/Scobleizer#p/u/1/${videoId}`,
        `http://www.youtube.com/user/SilkRoadTheatre#p/a/u/2/${videoId}`,
        `http://www.youtube.com/v/${videoId}?fs=1&amp;hl=en_US&amp;rel=0`,
        `http://www.youtube.com/watch?feature=player_embedded&v=${videoId}#`,
        `http://www.youtube.com/watch?v=${videoId}`,
        `http://www.youtube.com/watch?v=${videoId}&feature=feedrec_grec_index`,
        `http://www.youtube.com/watch?v=${videoId}#t=0m10s`,
        `http://www.youtube.com/watch?v=${videoId}&feature=youtu.be`,
        `http://www.youtube.com/watch?v=${videoId}&feature=channel`,
        `http://www.youtube.com/watch?v=${videoId}&feature=youtube_gdata_player`,
        `http://www.youtube.com/watch?v=${videoId}&playnext_from=TL&videos=osPknwzXEas&feature=sub`,
        `http://www.youtube.com/ytscreeningroom?v=${videoId}`,
        `http://youtu.be/${videoId}`,
        `http://youtu.be/${videoId}?feature=youtube_gdata_player`,
        `http://youtube.com/?v=${videoId}&feature=youtube_gdata_player`,
        `http://youtube.com/?vi=${videoId}&feature=youtube_gdata_player`,
        `http://youtube.com/v/${videoId}?feature=youtube_gdata_player`,
        `http://youtube.com/vi/${videoId}?feature=youtube_gdata_player`,
        `http://youtube.com/watch?v=${videoId}&feature=youtube_gdata_player`,
        `http://youtube.com/watch?vi=${videoId}&feature=youtube_gdata_player`,
        `https://www.youtube.com/watch?feature=g-vrec&v=${videoId}`,
        `https://www.youtube.com/watch?v=${videoId}&feature=g-all-xit`
      ];

      for (const video of videos) {
        expect(component._getYouTubeVideoId(video)).toBe(videoId);
      }
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
