import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Message, BasicUser } from '@edfu/api-interfaces';
import { environment } from '../environments/environment';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'edfu-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  hello$ = this.http.get<Message>('/api/hello');
  currentUser: BasicUser;

  constructor(private http: HttpClient, private authService: AuthService) {
    this.authService.currentUser$.subscribe(x => (this.currentUser = x));
  }

  ngOnInit() {
    if (environment.production) {
      if (location.protocol === 'http:') {
        window.location.href = location.href.replace('http', 'https');
      }
    }
  }

  logout() {
    this.authService.logout();
  }
}
