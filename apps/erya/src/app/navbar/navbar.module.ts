import { NgModule } from '@angular/core';
import { NavbarComponent } from './navbar.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@NgModule({
  declarations: [
    NavbarComponent
  ],
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  exports: [NavbarComponent]
})
export class NavbarModule {}
