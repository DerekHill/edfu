import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { HotkeyModule } from 'angular2-hotkeys';
import { SignComponent } from './sign/sign.component';
import { MatDialogModule } from '@angular/material/dialog';
import { SenseArrangerService } from './sense-grouping/sense-arranger.service';
import { RemoveUnderscoresPipe } from '../shared/pipes/remove-underscores.pipe';
import { MatButtonModule } from '@angular/material/button';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { SharedModule } from '../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SensesComponent } from './senses/senses.component';

@NgModule({
  declarations: [SearchComponent, SignComponent, SensesComponent],
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
    SharedModule,
    FontAwesomeModule
  ],
  providers: [SenseArrangerService, RemoveUnderscoresPipe]
})
export class SearchModule {}
