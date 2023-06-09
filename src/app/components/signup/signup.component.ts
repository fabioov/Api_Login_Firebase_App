import { Component, OnInit } from '@angular/core';
import { UserCredential } from '@angular/fire/auth';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import {
  catchError,
  concatMap,
  finalize,
  map,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { UsersService } from 'src/app/services/users.service';

export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return {
        passwordsDontMatch: true,
      };
    }
    return null;
  };
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  signUpForm = new FormGroup(
    {
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: passwordMatchValidator() }
  );

  signUpInProgress = false;
  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private toast: NgToastService,
    private userService: UsersService
  ) {}

  ngOnInit(): void {}

  get name() {
    return this.signUpForm.get('name');
  }

  get email() {
    return this.signUpForm.get('email');
  }

  get password() {
    return this.signUpForm.get('password');
  }

  get confirmPassword() {
    return this.signUpForm.get('confirmPassword');
  }

  submit() {
    const { name, email, password } = this.signUpForm.value;
    if (!this.signUpForm.valid || !name || !email || !password) {
      return;
    }
    this.signUpInProgress = true;
debugger;
    this.authService
      .signUp(email, password)
      .pipe(
        
        switchMap(({ user: { uid } }) =>
          this.userService.addUser({ uid, email, displayName: name })
        ),
        tap(() => {
          this.toast.success({
            detail: 'Signup successful',
            summary: 'You are signed up!',
            duration: 5000,
          });
          this.router.navigate(['/home']);
        }),
        catchError((error: any) => {
          this.toast.error({
            detail: 'Signup failed',
            summary: error,
            duration: 5000,
          });
          return of(null); 
        }),
        finalize(() => {
          this.signUpInProgress = false; 
        })
      )
      .subscribe();
  }
}
