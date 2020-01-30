import * as mongoose from 'mongoose';
import { DictionaryOrThesaurus, LexicalCategory } from '@edfu/api-interfaces';

export const SenseSchema = new mongoose.Schema({
  senseId: {
    type: String,
    required: true
  },
  entryOxId: {
    type: String,
    required: true
  },
  entryHomographC: Number,
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
  example: {
    type: String,
    required: true
  },
  dictionaryOrThesaurus: {
    type: String,
    enum: [DictionaryOrThesaurus.dictionary, DictionaryOrThesaurus.thesaurus],
    required: true
  },
  thesaurusSenseIds: [String],
  definition: String,
  synonyms: {
    type: [String]
  }
});

SenseSchema.index({ senseId: 1 }, { unique: true });
