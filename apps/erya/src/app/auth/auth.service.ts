// https://github.com/cornflourblue/angular-8-jwt-authentication-example/blob/master/src/app/_services/authentication.service.ts
// https://github.com/SinghDigamber/angular-meanstack-authentication/blob/master/src/app/shared/auth.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BasicUser } from '@edfu/api-interfaces';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const CURRENT_USER_KEY = 'currentUser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserBs$: BehaviorSubject<BasicUser>;
  public currentUser$: Observable<BasicUser>;
  constructor(private http: HttpClient) {
    this.currentUserBs$ = new BehaviorSubject<BasicUser>(
      JSON.parse(localStorage.getItem(CURRENT_USER_KEY))
    );
    this.currentUser$ = this.currentUserBs$.asObservable();
  }
  public get currentUserValue(): BasicUser {
    return this.currentUserBs$.value;
  }

  login(email: string, password: string) {
    return this.http
      .post<any>(`${environment.apiUri}/api/auth/login`, {
        email,
        password
      })
      .pipe(
        map(user => {
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
          this.currentUserBs$.next(user);
          return user;
        })
      );
  }

  logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    this.currentUserBs$.next(null);
  }
}