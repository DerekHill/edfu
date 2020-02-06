import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FirstComponent } from './first.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatFormFieldModule,
  MatInputModule,
  MatListModule
} from '@angular/material';
import { CommonModule } from '@angular/common';
import { GraphQLModule } from '../graphql.module';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  EntryDto,
  SenseForEntryDto,
  LexicalCategory,
  DictionaryOrThesaurus
} from '@edfu/api-interfaces';
import { ComponentFactoryResolver } from '@angular/core';

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
    it('works', () => {
      console.log('foo');
      //   const senses: SenseForEntryDto[] = [
      const senses = [
        {
          oxId: 'oxId',
          homographC: 0,
          senseId: 'senseId',
          lexicalCategory: LexicalCategory.noun,
          example: 'example',
          definition: 'definition',
          //   associationType: DictionaryOrThesaurus.dictionary,
          similarity: 0.5
        }
      ];
      // const res = component._sortAndFilterSenses(senses);
      // console.log(res);
    });
  });
});
