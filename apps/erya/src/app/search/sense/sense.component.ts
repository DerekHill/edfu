import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HydratedSense } from '@edfu/api-interfaces';
import { DictionaryOrThesaurus } from '@edfu/enums';

@Component({
  selector: 'edfu-sense',
  templateUrl: './sense.component.html'
})
export class SenseComponent {
  exampleOrDefinition: string;
  _sense: HydratedSense;
  fromThesaurus: boolean;

  @Input()
  set sense(sense: HydratedSense) {
    this._sense = sense;
    this.exampleOrDefinition = sense.example || sense.definition;
    this.fromThesaurus =
      sense.associationType === DictionaryOrThesaurus.thesaurus;
  }

  get sense(): HydratedSense {
    return this._sense;
  }

  @Output() senseEmitter = new EventEmitter<HydratedSense>();

  onSenseClick(event, sense: HydratedSense) {
    this.senseEmitter.emit(sense);
  }
}
