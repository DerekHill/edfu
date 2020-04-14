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
  determiner = 'determiner',
  residual = 'residual',
  other = 'other'
}

export enum HttpErrorMessages {
  REGISTRATION__USER_ALREADY_REGISTERED = 'REGISTRATION__USER_ALREADY_REGISTERED',
  REGISTRATION__USER_NOT_REGISTERED = 'REGISTRATION__USER_NOT_REGISTERED',
  REGISTRATION__MISSING_MANDATORY_PARAMETERS = 'REGISTRATION__MISSING_MANDATORY_PARAMETERS',
  REGISTRATION__MAIL_NOT_SENT = 'REGISTRATION__MAIL_NOT_SENT',
  REGISTRATION__GENERIC_ERROR = 'REGISTRATION__GENERIC_ERROR',
  RESET_PASSWORD__EMAIL_SENT_RECENTLY = 'RESET_PASSWORD__EMAIL_SENT_RECENTLY',
  LOGIN__USER_NOT_FOUND = 'LOGIN__USER_NOT_FOUND',
  LOGIN__EMAIL_NOT_VERIFIED = 'LOGIN__EMAIL_NOT_VERIFIED',
  LOGIN__GENERIC_ERROR = 'LOGIN__GENERIC_ERROR',
  LOGIN__EMAIL_SENT_RECENTLY = 'LOGIN__EMAIL_SENT_RECENTLY',
  SIGNS__NO_FILE_ATTACHED = 'LOGIN__EMAIL_SENT_RECENTLY',
  EDFU__GENERIC_ERROR = 'EDFU__GENERIC_ERROR'
}
