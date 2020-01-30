import { OxfordSearchRecord } from '../../../oxford-searches/interfaces/oxford-search.interface';
import { ObjectId } from 'bson';

export const createEntrySearchRecord = (
  word: string,
  found = true,
  homographC = 1
): OxfordSearchRecord => {
  return {
    _id: new ObjectId(),
    normalizedSearchTerm: 'bank',
    result: {
      id: word,
      language: 'en-gb',
      lexicalEntries: [
        {
          entries: [
            {
              senses: [
                {
                  definitions: [
                    'any nutritious substance that people or animals eat or drink'
                  ],
                  examples: [{ text: 'we need food and water' }],
                  id: `${word}-entry-sense_1_id`
                }
              ]
            }
          ],
          language: 'en-gb',
          lexicalCategory: { id: 'noun', text: 'Noun' },
          text: word
        }
      ],
      type: 'headword',
      word: word
    },
    homographC: homographC,
    found: found
  };
};

export const createThesaurusSearchRecord = (
  word: string,
  synonyms: string[],
  found = true
): OxfordSearchRecord => {
  return {
    _id: new ObjectId(),
    normalizedSearchTerm: word,
    result: {
      id: word,
      language: 'en-gb',
      lexicalEntries: [
        {
          entries: [
            {
              homographNumber: '100',
              senses: [
                {
                  examples: [
                    {
                      text: 'the banks of Lake Michigan'
                    }
                  ],
                  id: `${word}-thesaurus-sense_1_id`,
                  synonyms: synonyms.map(synonym => {
                    return {
                      id: synonym,
                      language: 'en',
                      text: synonym
                    };
                  })
                }
              ]
            }
          ],
          language: 'en-gb',
          lexicalCategory: {
            id: 'noun',
            text: 'Noun'
          },
          text: word
        }
      ],
      type: 'headword',
      word: word
    },
    homographC: 1,
    found: found
  };
};
