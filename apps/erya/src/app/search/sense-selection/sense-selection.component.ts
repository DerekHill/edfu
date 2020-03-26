import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HydratedSense } from '@edfu/api-interfaces';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'edfu-sense-selection',
  templateUrl: './sense-selection.component.html'
})
export class SenseSelectionComponent {
  @Input() senses: HydratedSense[];
  @Output() senseEmitter = new EventEmitter<HydratedSense>();

  constructor(public library: FaIconLibrary) {
    library.addIcons(faEye);
  }

  onSenseClick(event, sense: HydratedSense) {
    this.senseEmitter.emit(sense);
  }
}
