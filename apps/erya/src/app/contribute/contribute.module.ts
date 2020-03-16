import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContributeComponent } from './contribute.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from '../shared/shared.module';
import { UploadComponent } from './upload/upload.component';
import { UploadService } from './upload/upload.service';

@NgModule({
  declarations: [ContributeComponent, UploadComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    SharedModule
  ],
  providers: [UploadService]
})
export class ContributeModule {}
