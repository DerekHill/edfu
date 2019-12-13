import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecondComponent } from './second.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatFormFieldModule,
  MatInputModule
} from '@angular/material';

@NgModule({
  declarations: [SecondComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class SecondModule {}
