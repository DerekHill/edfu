import { Pipe, PipeTransform } from '@angular/core';
import { SenseHydratedDtoInterface } from '@edfu/api-interfaces';
import { DictionaryOrThesaurus } from '@edfu/api-interfaces';

@Pipe({ name: 'oxIdThesaurus' })
export class OxIdThesaurusPipe implements PipeTransform {
  transform(sense: SenseHydratedDtoInterface): string {
    if (sense.associationType === DictionaryOrThesaurus.dictionary) {
      return `${sense.ownEntryOxId}`;
    } else {
      return `${sense.ownEntryOxId} (${sense.oxId})`;
    }
  }
}
