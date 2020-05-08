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

export enum HttpSuccsessMessages {
  REGISTRATION__USER_REGISTERED_SUCCESSFULLY= 'Registered successfully'
}
export enum HttpErrorMessages {
  REGISTRATION__USER_ALREADY_REGISTERED = 'User already exist',
  REGISTRATION__USER_NOT_REGISTERED = 'Something goes wrong. User not registered',
  REGISTRATION__MISSING_MANDATORY_PARAMETERS = 'Please fill out all fields',
  REGISTRATION__MAIL_NOT_SENT = 'Something goes wrong. Email was not sent.',
  REGISTRATION__GENERIC_ERROR = 'Something goes wrong',
  RESET_PASSWORD__EMAIL_SENT_RECENTLY = 'Emails with instructions is sent',
  LOGIN__USER_NOT_FOUND = 'Email not found',
  LOGIN__EMAIL_NOT_VERIFIED = 'Your email is not verified. Please check your inbox for instructions',
  LOGIN__GENERIC_ERROR = 'Something goes wrong',
  LOGIN__WRONG_PASSWORD = 'Password is wrong',
  LOGIN__EMAIL_SENT_RECENTLY = 'Email already registered and confirmation email sent recently',
  SIGNS__NO_FILE_ATTACHED = 'Sign video not attached',
  EDFU__GENERIC_ERROR = 'Something goes wrong'
}

export enum HeadwordOrPhrase {
  headword = 'headword',
  phrase = 'phrase'
}
