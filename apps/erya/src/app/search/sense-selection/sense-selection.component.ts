import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SenseHydratedDtoInterface } from '@edfu/api-interfaces';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'edfu-sense-selection',
  templateUrl: './sense-selection.component.html'
})
export class SenseSelectionComponent {
  @Input() senses: SenseHydratedDtoInterface[];
  @Output() senseEmitter = new EventEmitter<SenseHydratedDtoInterface>();

  constructor(public library: FaIconLibrary) {
    library.addIcons(faEye);
  }

  onSenseClick(event, sense: SenseHydratedDtoInterface) {
    this.senseEmitter.emit(sense);
  }
}
