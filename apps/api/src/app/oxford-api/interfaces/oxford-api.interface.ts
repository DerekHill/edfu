import { LexicalCategory } from '@edfu/enums';

interface OxSynonym {
  readonly id?: string;
  readonly language: string;
  readonly text: string;
}

interface OxRegister {
  readonly id: string;
  readonly text: string;
}

export interface OxSubsense {
  readonly id: string;
  readonly registers?: OxRegister[];
  readonly synonyms?: OxSynonym[];
  readonly definitions?: string[];
  readonly shortDefinitions?: string[];
  readonly examples?: any[];
  readonly notes?: any[];
}

interface OxExample {
  readonly text: string;
}

export interface OxThesaurusLink {
  readonly entry_id: string;
  readonly sense_id: string;
}

export interface OxSense {
  readonly id: string;
  readonly definitions?: string[];
  readonly shortDefinitions?: string[];
  readonly examples?: OxExample[];
  readonly registers?: OxRegister[];
  readonly subsenses?: OxSubsense[];
  readonly synonyms?: OxSynonym[];
  readonly thesaurusLinks?: OxThesaurusLink[];
}

interface OxLexicalEntry {
  readonly homographNumber?: string;
  readonly senses: OxSense[];
}

interface OxlexicalCategory {
  readonly id: LexicalCategory | string;
  readonly text: string;
}

interface OxLexicalEntriesForCategory {
  readonly entries: OxLexicalEntry[];
  readonly language: string;
  readonly lexicalCategory: OxlexicalCategory;
  readonly text: string;
  readonly pronunciations?: any[];
}

export interface OxResult {
  readonly id: string;
  readonly language: string;
  readonly lexicalEntries: OxLexicalEntriesForCategory[];
  readonly type: string;
  readonly word: string;
}
