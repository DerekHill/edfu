import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SenseForEntryDtoInterface } from '@edfu/api-interfaces';
import { DictionaryOrThesaurus } from '@edfu/enums';

@Component({
  selector: 'edfu-sense',
  templateUrl: './sense.component.html'
})
export class SenseComponent {
  exampleOrDefinition: string;
  _sense: SenseForEntryDtoInterface;
  fromThesaurus: boolean;

  @Input()
  set sense(sense: SenseForEntryDtoInterface) {
    this._sense = sense;
    this.exampleOrDefinition = sense.example || sense.definition;
    this.fromThesaurus =
      sense.associationType === DictionaryOrThesaurus.thesaurus;
  }

  get sense(): SenseForEntryDtoInterface {
    return this._sense;
  }

  @Output() senseClicked = new EventEmitter<SenseForEntryDtoInterface>();

  onSenseClick(event, sense: SenseForEntryDtoInterface) {
    this.senseClicked.emit(sense);
  }
}
