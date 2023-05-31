import { Component, OnInit } from '@angular/core';
import { UserCredential } from '@angular/fire/auth';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { take, filter, switchMap, tap, catchError, of } from 'rxjs';
import { ProfileUser } from 'src/app/models/user-profile';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private toast: NgToastService,
    private userService: UsersService
  ) {}

  ngOnInit(): void {}

  get email() {
    return this.forgotPasswordForm.get('email');
  }

  submit() {
    const email = this.forgotPasswordForm.value.email || '';
    this.authService.forgotPassword(email);
  }
}
