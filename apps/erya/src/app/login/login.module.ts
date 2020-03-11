import { LoginComponent } from './login.component';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [FormsModule, ReactiveFormsModule, CommonModule, FontAwesomeModule],
  declarations: [LoginComponent]
})
export class LoginModule {}
