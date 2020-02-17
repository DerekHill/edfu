import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SenseForEntryDtoInterface } from '@edfu/api-interfaces';

@Component({
  selector: 'edfu-sense',
  templateUrl: './sense.component.html'
})
export class SenseComponent {
  @Input() sense: SenseForEntryDtoInterface;
  @Output() senseClicked = new EventEmitter<SenseForEntryDtoInterface>();

  onSenseClick(event, sense: SenseForEntryDtoInterface) {
    this.senseClicked.emit(sense);
  }
}
