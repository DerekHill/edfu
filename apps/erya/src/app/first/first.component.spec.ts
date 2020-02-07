import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FirstComponent } from './first.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GraphQLModule } from '../graphql.module';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EntryDto, SenseForEntryDto } from '@edfu/api-interfaces';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { LexicalCategory, DictionaryOrThesaurus } from '@edfu/enums';

describe('FirstComponent', () => {
  let component: FirstComponent;
  let fixture: ComponentFixture<FirstComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FirstComponent],
      imports: [
        CommonModule,
        HttpClientModule,
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        MatListModule,
        GraphQLModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('groupByHomographWord', () => {
    it('groups by homograph word', () => {
      const OXID = 'food';
      const WORD = OXID;
      const dtos: EntryDto[] = [
        {
          oxId: OXID,
          homographC: 1,
          word: WORD,
          relatedEntriesAdded: false
        },
        {
          oxId: OXID,
          homographC: 2,
          word: WORD,
          relatedEntriesAdded: false
        }
      ];
      const res = component._groupByHomographWord(dtos);
      expect(res[0].word).toEqual(WORD);
      expect(res.length).toBe(1);
    });

    it('works if inital length is zero', () => {
      const res = component._groupByHomographWord([]);
      expect(res.length).toBe(0);
    });
  });

  describe('_sortAndFilterSenses()', () => {
    it('sorts by associationType and similarity', () => {
      const FIRST = 'should_be_first_because_dictionary_with_good_similarity';
      const SECOND = 'should_be_second_because_dictionary_with_poor_similarity';
      const THIRD = 'should_be_last_because_thesaurus';
      const senses: SenseForEntryDto[] = [
        {
          oxId: 'oxId',
          homographC: 0,
          senseId: THIRD,
          lexicalCategory: LexicalCategory.noun,
          apiSenseIndex: 0,
          example: 'example',
          definition: 'definition',
          associationType: DictionaryOrThesaurus.thesaurus,
          similarity: 0.5
        },
        {
          oxId: 'oxId',
          homographC: 0,
          senseId: SECOND,
          lexicalCategory: LexicalCategory.noun,
          apiSenseIndex: 0,
          example: 'example',
          definition: 'definition',
          associationType: DictionaryOrThesaurus.dictionary,
          similarity: 0.5
        },
        {
          oxId: 'oxId',
          homographC: 0,
          senseId: FIRST,
          lexicalCategory: LexicalCategory.noun,
          apiSenseIndex: 0,
          example: 'example',
          definition: 'definition',
          associationType: DictionaryOrThesaurus.dictionary,
          similarity: 1
        }
      ];
      const res = component._sortAndFilterSenses(senses);
      expect(res.map(r => r.senseId)).toEqual([FIRST, SECOND, THIRD]);
    });
  });
});
