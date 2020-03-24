import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HydratedSense } from '@edfu/api-interfaces';
import {
  UniqueEntryWithSenseGroups,
  SenseArrangerService
} from '../sense-grouping/sense-arranger.service';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faEye, faPlay } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'edfu-senses',
  templateUrl: './senses.component.html'
})
export class SensesComponent implements OnInit {
  @Input() senses: HydratedSense[];
  senseGroups: UniqueEntryWithSenseGroups[];
  @Output() senseEmitter = new EventEmitter<HydratedSense>();

  constructor(
    private senseArranger: SenseArrangerService,
    public library: FaIconLibrary
  ) {
    library.addIcons(faEye);
  }

  ngOnInit() {
    this.senseGroups = this.senseArranger.groupSenses(this.senses);
  }


  onSenseClick(event, sense: HydratedSense) {
    this.senseEmitter.emit(sense);
  }


}
