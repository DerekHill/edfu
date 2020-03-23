import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { BasicUser } from '@edfu/api-interfaces';
import { Observable } from 'rxjs';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { SEARCH_COMPONENT_PATH } from '../constants';

@Component({
  selector: 'edfu-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  isMenuOpen = false;
  searchComponentPath = `/${SEARCH_COMPONENT_PATH}`;

  currentUser$: Observable<BasicUser> = this.authService.currentUser$;

  constructor(
    private router: Router,
    private authService: AuthService,
    public library: FaIconLibrary
  ) {
    library.addIcons(faSignInAlt, faSignOutAlt);
  }

  toggleNavbar() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateTo(route) {
    this.router.navigate([route]).then(() => (this.isMenuOpen = false));
  }

  logout() {
    this.authService.logout();
  }
}
