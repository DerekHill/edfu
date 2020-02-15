import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent, RemoveUnderscoresPipe } from './search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HotkeyModule } from 'angular2-hotkeys';

@NgModule({
  declarations: [SearchComponent, RemoveUnderscoresPipe],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    HotkeyModule
  ]
})
export class SearchModule {}
