import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'edfu-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  isMenuOpen = false;

  constructor(private router: Router) {}

  toggleNavbar() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateTo(route) {
    this.router.navigate([route]).then(() => (this.isMenuOpen = false));
  }
}
