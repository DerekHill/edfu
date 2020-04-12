// https://github.com/SinghDigamber/angular-meanstack-authentication/blob/master/src/app/components/signup/signup.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { IResponse } from '@edfu/api-interfaces';
import { LOGIN_COMPONENT_PATH } from '../constants';

@Component({
  selector: 'edfu-signup',
  templateUrl: './signup.component.html'
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;

  constructor(
    public fb: FormBuilder,
    public authService: AuthService,
    public router: Router
  ) {
    this.signupForm = this.fb.group({
      username: [''],
      email: [''],
      password: ['']
    });
  }

  ngOnInit() {}

  registerUser() {
    console.log(this.signupForm.value);
    this.authService
      .signUp(this.signupForm.value)
      .subscribe((res: IResponse) => {
        if (res.success) {
          console.log(res);
          this.router.navigate([`/${LOGIN_COMPONENT_PATH}`]);
        } else {
          console.error(res);
          //   TODO: display reason to user. See Trello card discussing approach.
        }
        this.signupForm.reset();
      });
  }
}
