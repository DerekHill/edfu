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
import { RemoveUnderscoresPipe } from '../shared/pipes/remove-underscores.pipe';
import { MatButtonModule } from '@angular/material/button';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    SearchComponent,
    SenseComponent,
    SignComponent,
    SensesModalComponent
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
    MatButtonModule,
    HotkeyModule,
    YouTubePlayerModule,
    SharedModule
  ],
  entryComponents: [SensesModalComponent],
  providers: [SenseArrangerService, RemoveUnderscoresPipe]
})
export class SearchModule {}
