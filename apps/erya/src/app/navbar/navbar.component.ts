import { Component } from '@angular/core';

@Component({
  selector: 'edfu-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {

  isMenuOpen = false;

  toggleNavbar() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
