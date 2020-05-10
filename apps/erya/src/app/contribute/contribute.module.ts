import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContributeComponent } from './contribute.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from '../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ManageComponent } from './manage.component';
import { RouterModule } from '@angular/router';
import { LikesCounterComponent } from './likes-counter/likes-counter.component';

@NgModule({
  declarations: [ContributeComponent, ManageComponent, LikesCounterComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    SharedModule,
    FontAwesomeModule,
    RouterModule
  ],
  providers: []
})
export class ContributeModule {}
