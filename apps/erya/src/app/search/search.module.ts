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
import { SenseArrangerService } from './sense-arranger/sense-arranger.service';
import { RemoveUnderscoresPipe } from '../shared/pipes/remove-underscores.pipe';
import { MatButtonModule } from '@angular/material/button';
import { SharedModule } from '../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SenseSelectionComponent } from './sense-selection/sense-selection.component';
import { LikeComponent } from './sign/like/like.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [SearchComponent, SignComponent, SenseSelectionComponent, LikeComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    HotkeyModule,
    SharedModule,
    FontAwesomeModule
  ],
  providers: [SenseArrangerService, RemoveUnderscoresPipe]
})
export class SearchModule {}
