import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasicComponent } from './basic.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatFormFieldModule,
  MatInputModule
} from '@angular/material';

@NgModule({
  declarations: [BasicComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class BasicModule {}
