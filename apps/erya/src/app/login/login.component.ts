// https://github.com/cornflourblue/angular-8-jwt-authentication-example/blob/master/src/app/login/login.component.ts
// https://github.com/SinghDigamber/angular-meanstack-authentication/blob/master/src/app/components/signin/signin.component.ts

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { first } from 'rxjs/operators';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { SIGNUP_COMPONENT_PATH } from '../constants';

@Component({
  selector: 'edfu-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';

  signupComponentPath = `/${SIGNUP_COMPONENT_PATH}`;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    public library: FaIconLibrary
  ) {
    library.addIcons(faLock, faEnvelope);
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService
      .login(this.f.email.value, this.f.password.value)
      .pipe(first())
      .subscribe(
        data => {
          this.router.navigateByUrl(this.returnUrl);
        },
        error => {
          console.log(error); // need to handle errors
          this.error = error.statusText;
          this.loading = false;
        }
      );
  }
}
