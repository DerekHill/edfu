import { LoginComponent } from './login.component';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  declarations: [LoginComponent]
})
export class LoginModule {}
