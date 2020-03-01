import { Component, Inject } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { HydratedSense } from '@edfu/api-interfaces';
// import { SearchComponent } from '../search.component';

@Component({
  selector: 'edfu-senses-modal',
  templateUrl: './senses-modal.component.html'
})
export class SensesModalComponent {
  constructor(
    public dialogRef: MatDialogRef<SensesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HydratedSense[]
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
