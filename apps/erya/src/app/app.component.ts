import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Message } from '@edfu/api-interfaces';
import { environment } from '../environments/environment';

@Component({
  selector: 'edfu-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  hello$ = this.http.get<Message>('/api/hello');

  constructor(private http: HttpClient) {}

  //   https://stackoverflow.com/a/49250794/1450420
  ngOnInit() {
    if (environment.production) {
      if (location.protocol === 'http:') {
        window.location.href = location.href.replace('http', 'https');
      }
    }
  }
}
