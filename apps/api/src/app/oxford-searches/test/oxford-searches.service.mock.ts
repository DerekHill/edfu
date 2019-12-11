import { OxfordSearchRecord } from "../interfaces/oxford-search.interface";
import { ObjectId } from "bson";

const BASIC_OXFORD_SEARCH_RECORD: OxfordSearchRecord = {
  _id: new ObjectId(),
  normalizedSearchTerm: "foo",
  result: {
    id: "id",
    language: "en-gb",
    lexicalEntries: [
      {
        entries: [
          {
            senses: [
              {
                id: "id"
              }
            ]
          }
        ],
        language: "en-gb",
        lexicalCategory: { id: "noun", text: "Noun" },
        text: "food"
      }
    ],
    type: "headword",
    word: "foo"
  },
  homographC: 1,
  found: true
};

export class OxfordSearchesServiceMock {
  findOrFetch(): Promise<OxfordSearchRecord[]> {
    return Promise.resolve([BASIC_OXFORD_SEARCH_RECORD]);
  }
}
