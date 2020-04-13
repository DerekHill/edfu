// https://github.com/SinghDigamber/angular-meanstack-authentication/blob/master/src/app/components/signup/signup.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { IResponse } from '@edfu/api-interfaces';
import { LOGIN_COMPONENT_PATH } from '../constants';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'edfu-signup',
  templateUrl: './signup.component.html'
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    public fb: FormBuilder,
    public authService: AuthService,
    public router: Router,
    public library: FaIconLibrary
  ) {
    library.addIcons(faLock, faEnvelope, faUser);
    this.signupForm = this.fb.group({
      username: [''],
      email: [''],
      password: ['']
    });
  }

  ngOnInit() {}

  registerUser() {
    this.submitted = true;
    this.loading = true;
    this.authService
      .signUp(this.signupForm.value)
      .subscribe((res: IResponse) => {
        if (res.success) {
          this.router.navigate([`/${LOGIN_COMPONENT_PATH}`]);
        } else {
          console.error(res);
          //   TODO: display reason to user. See Trello card discussing approach.
          this.loading = false;
        }
        this.signupForm.reset();
      });
  }
}
