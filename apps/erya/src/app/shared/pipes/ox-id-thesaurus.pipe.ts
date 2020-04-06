import { Pipe, PipeTransform } from '@angular/core';
import { HydratedSense } from '@edfu/api-interfaces';
import { DictionaryOrThesaurus } from '@edfu/enums';

@Pipe({ name: 'oxIdThesaurus' })
export class OxIdThesaurusPipe implements PipeTransform {
  transform(sense: HydratedSense): string {
    if (sense.associationType === DictionaryOrThesaurus.dictionary) {
      return `${sense.ownEntryOxId}`;
    } else {
      return `${sense.ownEntryOxId} (${sense.oxId})`;
    }
  }
}
