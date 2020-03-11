import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { HotkeyModule } from 'angular2-hotkeys';
import { SenseComponent } from './sense/sense.component';
import { SignComponent } from './sign/sign.component';
import { MatDialogModule } from '@angular/material/dialog';
import { SenseArrangerService } from './sense-grouping/sense-arranger.service';
import { SensesModalComponent } from './senses-modal/senses-modal.component';
import { RemoveUnderscoresPipe } from './pipes';

@NgModule({
  declarations: [
    SearchComponent,
    SenseComponent,
    SignComponent,
    SensesModalComponent,
    RemoveUnderscoresPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    HotkeyModule
  ],
  entryComponents: [SensesModalComponent],
  providers: [SenseArrangerService]
})
export class SearchModule {}
