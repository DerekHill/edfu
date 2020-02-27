import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SignComponent, MediaTypes } from './sign.component';
import { ObjectId } from 'bson';
import { SignRecord } from '@edfu/api-interfaces';
import { MatListModule } from '@angular/material/list';

describe('SignComponent', () => {
  let component: SignComponent;
  let fixture: ComponentFixture<SignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SignComponent],
      imports: [MatListModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    const signData: SignRecord = {
      _id: new ObjectId(),
      mnemonic: 'remember me',
      mediaUrl: 'www.my-picture-link.com'
    };
    fixture = TestBed.createComponent(SignComponent);
    component = fixture.componentInstance;
    component.sign = signData;
    fixture.detectChanges();
  });

  describe('_isVideo()', () => {
    it('identifies videos', () => {
      expect(component._isVideo('my.mp4')).toBeTruthy();
    });
  });
});