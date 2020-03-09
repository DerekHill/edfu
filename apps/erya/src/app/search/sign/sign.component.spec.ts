import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SignComponent } from './sign.component';
import { ObjectId } from 'bson';
import { SignRecord, HydratedSense } from '@edfu/api-interfaces';
import { MatListModule } from '@angular/material/list';
import { SenseComponent } from '../sense/sense.component';
import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/enums';

describe('SignComponent', () => {
  let component: SignComponent;
  let fixture: ComponentFixture<SignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SignComponent, SenseComponent],
      imports: [MatListModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    const signData: SignRecord = {
      _id: new ObjectId(),
      mnemonic: 'remember me',
      mediaUrl: 'www.my-picture-link.com'
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

  describe('_isVideo()', () => {
    it('identifies videos', () => {
      expect(component._isVideo('my.mp4')).toBeTruthy();
    });
  });
});
