import { LoginComponent } from './login.component';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SignupComponent } from './signup.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    FontAwesomeModule,
    RouterModule
  ],
  declarations: [LoginComponent, SignupComponent]
})
export class LoginModule {}
