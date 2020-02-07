export enum DictionaryOrThesaurus {
  dictionary = 'dictionary',
  thesaurus = 'thesaurus'
}

export const DICTIONARY_OR_THESAURUS_ALL_VALUES = [
  DictionaryOrThesaurus.dictionary,
  DictionaryOrThesaurus.thesaurus
];

export enum LexicalCategory {
  noun = 'noun',
  pronoun = 'pronoun',
  verb = 'verb',
  adjective = 'adjective',
  adverb = 'adverb',
  preposition = 'preposition',
  conjunction = 'conjunction',
  interjection = 'interjection'
}

export const LEXICAL_CATEGORY_ALL_VALUES = [
  LexicalCategory.adjective,
  LexicalCategory.adverb,
  LexicalCategory.conjunction,
  LexicalCategory.interjection,
  LexicalCategory.noun,
  LexicalCategory.preposition,
  LexicalCategory.pronoun,
  LexicalCategory.verb
];
