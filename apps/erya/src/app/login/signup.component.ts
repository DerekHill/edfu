// https://github.com/SinghDigamber/angular-meanstack-authentication/blob/master/src/app/components/signup/signup.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { IResponse } from '@edfu/api-interfaces';
import { LOGIN_COMPONENT_PATH } from '../constants';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { AlertType } from '../alerts/alerts.typings';
import { AlertChannelService } from '../alerts/alert-channel.service';

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
    public library: FaIconLibrary,
    private alerts: AlertChannelService
  ) {
    library.addIcons(faLock, faEnvelope, faUser);

  }

  ngOnInit() {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  registerUser() {
    this.submitted = true;
    this.loading = true;
    this.authService
      .signUp(this.signupForm.value)
      .subscribe((res: IResponse) => {
        if (res.success) {
          this.router.navigate([`/${LOGIN_COMPONENT_PATH}`]);
          this.alerts.push({
            type: AlertType.success,
            text: `${
              res.message
            }`,
            dismissible: true
          });
        } else {
          this.alerts.push({
            type: AlertType.danger,
            text: `${
              res.message
            }`,
            dismissible: true
          });

          this.loading = false;
        }
        this.signupForm.reset();
      },
        error => {
          console.log(error);
          this.alerts.push({
            type: AlertType.danger,
            text: `${
              error.error.message
            }`,
            dismissible: true
          })
          this.loading = false;
        });
  }
}
