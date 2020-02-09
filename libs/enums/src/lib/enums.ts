export enum DictionaryOrThesaurus {
  dictionary = 'dictionary',
  thesaurus = 'thesaurus'
}

export const DICTIONARY_OR_THESAURUS_ALL_VALUES = [
  DictionaryOrThesaurus.dictionary,
  DictionaryOrThesaurus.thesaurus
];

// Will also be other possible values, still to be identified
// https://developer.oxforddictionaries.com/documentation/glossary
export enum LexicalCategory {
  noun = 'noun',
  pronoun = 'pronoun',
  verb = 'verb',
  adjective = 'adjective',
  adverb = 'adverb',
  preposition = 'preposition',
  conjunction = 'conjunction',
  interjection = 'interjection',
  determiner = 'determiner'
}
