import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SignComponent } from './sign.component';
import { ObjectId } from 'bson';
import { SignRecord, Transcoding } from '@edfu/api-interfaces';
import { MatListModule } from '@angular/material/list';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { GraphQLModule } from '../../graphql.module';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../../shared/shared.module';

describe('SignComponent', () => {
  let component: SignComponent;
  let fixture: ComponentFixture<SignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SignComponent],
      imports: [
        MatListModule,
        DeviceDetectorModule.forRoot(),
        FontAwesomeModule,
        GraphQLModule,
        HttpClientModule,
        SharedModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    const signData: SignRecord = {
      _id: new ObjectId(),
      userId: new ObjectId(),
      mnemonic: 'remember me',
      s3KeyOrig: '1234.mp4'
    };
    fixture = TestBed.createComponent(SignComponent);
    component = fixture.componentInstance;
    component.sign = signData;
    fixture.detectChanges();
  });

  describe('_getDesktopTranscoding', () => {
    it('returns mp4 transcoding with highest bitrate if mp4 is available', () => {
      const higherBitRateS3Key = '1_480p.mp4';
      const transcodings: Transcoding[] = [
        {
          height: 1,
          width: 1,
          duration: 1,
          size: 1,
          bitrate: 750,
          rotation: 1,
          s3Key: '1_360p.mp4'
        },
        {
          height: 1,
          width: 1,
          duration: 1,
          size: 1,
          bitrate: 1000,
          rotation: 1,
          s3Key: higherBitRateS3Key
        },
        {
          height: 1,
          width: 1,
          duration: 1,
          size: 1,
          bitrate: 2500,
          rotation: 1,
          s3Key: '1_720p.mov'
        }
      ];
      const res: Transcoding = component._getDesktopTranscoding(transcodings);
      expect(res.s3Key).toBe(higherBitRateS3Key);
    });

    it('returns transcoding with highest bitrate if no mp4 is available', () => {
      const higherBitRateS3Key = '2.mov';
      const transcodings: Transcoding[] = [
        {
          height: 1,
          width: 1,
          duration: 1,
          size: 1,
          bitrate: 750,
          rotation: 1,
          s3Key: '1.mov'
        },
        {
          height: 1,
          width: 1,
          duration: 1,
          size: 1,
          bitrate: 2500,
          rotation: 1,
          s3Key: higherBitRateS3Key
        }
      ];
      const res: Transcoding = component._getDesktopTranscoding(transcodings);
      expect(res.s3Key).toBe(higherBitRateS3Key);
    });
  });
});
