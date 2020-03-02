import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HydratedSense } from '@edfu/api-interfaces';
import {
  UniqueEntryWithSenseGroups,
  SenseArrangerService
} from '../sense-grouping/sense-arranger.service';

@Component({
  selector: 'edfu-senses-modal',
  templateUrl: './senses-modal.component.html'
})
export class SensesModalComponent implements OnInit {
  senseGroups: UniqueEntryWithSenseGroups[];

  constructor(
    public dialogRef: MatDialogRef<SensesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HydratedSense[],
    private senseArranger: SenseArrangerService
  ) {}

  ngOnInit() {
    this.senseGroups = this.senseArranger.groupSenses(this.data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  closeDialog(sense: HydratedSense) {
    this.dialogRef.close(sense);
  }
}
