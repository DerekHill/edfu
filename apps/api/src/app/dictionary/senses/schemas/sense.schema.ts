import * as mongoose from 'mongoose';
import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/api-interfaces';

export const SenseSchema = new mongoose.Schema({
  senseId: {
    type: String,
    required: true
  },
  headwordOxId: {
    type: String,
    required: true
  },
  headwordHomographC: Number,
  dictionaryOrThesaurus: {
    type: String,
    enum: [DictionaryOrThesaurus.dictionary, DictionaryOrThesaurus.thesaurus],
    required: true
  },
  lexicalCategory: {
    type: String,
    enum: [
      LexicalCategory.adjective,
      LexicalCategory.adverb,
      LexicalCategory.conjunction,
      LexicalCategory.interjection,
      LexicalCategory.noun,
      LexicalCategory.preposition,
      LexicalCategory.pronoun,
      LexicalCategory.verb
    ]
  },
  thesaurusLinks: [{}],
  example: String,
  definition: String,
  synonyms: {
    type: [String],
    required: true
  }
});

SenseSchema.index({ senseId: 1 }, { unique: true });
