import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchComponent } from './search.component';
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

const createSenseWithDefaults = (params: any): SenseForEntryDto => {
  const defaults = {
    senseId: 'senseId',
    lexicalCategory: LexicalCategory.noun,
    apiSenseIndex: 0,
    associationType: DictionaryOrThesaurus.dictionary,
    similarity: 1
  };

  const merged = { ...defaults, ...params };

  return createSense(
    merged.senseId,
    merged.lexicalCategory,
    merged.apiSenseIndex,
    merged.associationType,
    merged.similarity
  );
};

const createSense = (
  senseId: string,
  lexicalCategory: LexicalCategory,
  apiSenseIndex: number,
  associationType: DictionaryOrThesaurus,
  similarity: number
): SenseForEntryDto => {
  return {
    oxId: 'oxId',
    homographC: 0,
    senseId: senseId,
    lexicalCategory: lexicalCategory,
    apiSenseIndex: apiSenseIndex,
    example: 'example',
    definition: 'definition',
    associationType: associationType,
    similarity: similarity
  };
};

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SearchComponent],
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
    fixture = TestBed.createComponent(SearchComponent);
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

  describe('_sortSenses()', () => {
    it('sorts first by associationType, then index for dictionary and similarity for thesaurus', () => {
      const FIRST = 'should_be_first_because_dictionary_with_low_index';
      const SECOND = 'should_be_second_because_dictionary_with_high_index';
      const THIRD = 'should_be_third_because_thesaurus_with_high_similarity';
      const FOURTH = 'should_be_fourth_because_thesaurus_with_low_similarity';
      const lowSimilarity = 0.3;
      const highSimilarity = 0.8;
      const lowApiSenseIndex = 0;
      const highApiSenseIndex = 1;
      const senses: SenseForEntryDto[] = [
        createSense(
          FOURTH,
          LexicalCategory.noun,
          lowApiSenseIndex,
          DictionaryOrThesaurus.thesaurus,
          lowSimilarity
        ),
        createSense(
          THIRD,
          LexicalCategory.noun,
          lowApiSenseIndex,
          DictionaryOrThesaurus.thesaurus,
          highSimilarity
        ),
        createSense(
          SECOND,
          LexicalCategory.noun,
          highApiSenseIndex,
          DictionaryOrThesaurus.dictionary,
          highSimilarity
        ),
        createSense(
          FIRST,
          LexicalCategory.noun,
          lowApiSenseIndex,
          DictionaryOrThesaurus.dictionary,
          highSimilarity
        )
      ];
      const res = component._sortSenses(senses);
      expect(res.map(r => r.senseId)).toEqual([FIRST, SECOND, THIRD, FOURTH]);
    });
  });

  describe('_groupAndFilterByLexicalCategory()', () => {
    it.only('works', () => {
      const NOUN1 = 'noun1';
      const VERB = 'verb';
      const NOUN2 = 'noun2';
      const senses: SenseForEntryDto[] = [
        createSenseWithDefaults({
          senseId: NOUN1,
          lexicalCategory: LexicalCategory.noun
        }),
        createSenseWithDefaults({
          senseId: VERB,
          lexicalCategory: LexicalCategory.verb
        }),
        createSenseWithDefaults({
          senseId: NOUN2,
          lexicalCategory: LexicalCategory.noun
        })
      ];
      const res = component._groupAndFilterByLexicalCategory(senses);
      expect(res.map(r => r.senseId)).toEqual([NOUN1, NOUN2, VERB]);

      //   console.log(createSenseWithDefaults({}));
      //   console.log('ho');
    });
  });
});
