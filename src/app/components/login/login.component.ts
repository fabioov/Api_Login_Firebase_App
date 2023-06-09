import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  catchError,
  filter,
  finalize,
  map,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { NgToastService } from 'ng-angular-popup';
import { UserCredential, UserProfile, user } from '@angular/fire/auth';
import { UsersService } from 'src/app/services/users.service';
import { ProfileUser } from 'src/app/models/user-profile';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginInProgress = false;
  hideLoginForm = false; 
  loading = false;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private toast: NgToastService,
    private userService: UsersService
  ) {}

  ngOnInit(): void {}

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  submit() {
    const { email, password } = this.loginForm.value;
    if (!this.loginForm.valid || !email || !password) {
      return;
    }

    this.authService.currentUser$
      .pipe(
        take(1),
        filter((user) => !!user)
      )
      .subscribe(() => {
        // User is already authenticated, skip the login logic
        this.router.navigate(['/home']);
      });
    this.loginInProgress = true;
    debugger;
    this.authService
      .login(email, password)
      .pipe(
        tap(() => {
          const successMessage = `Welcome back!`;
          this.toast.success({
            detail: successMessage,
            summary: `You are logged in!`,
            duration: 5000,
          });
          this.router.navigate(['/home']);
        }),
        catchError((error: any) => {
          this.toast.error({
            detail: 'Login failed',
            summary: 'User or password incorrect!',
            duration: 5000,
          });
          return of(null); // Return an observable with a value of null to continue the stream
        }),
        finalize(() => {
          this.loginInProgress = false;
        })
      )
      .subscribe();
  }

  signInWithGoogle() {
    this.loading = true;
    this.hideLoginForm = true;
    this.authService
      .googleSignIn()
      .pipe(
        tap(() => {
          const successMessage = `Google sign-in successful!`;
          this.toast.success({
            detail: successMessage,
            summary: `You are logged in with Google!`,
            duration: 5000,
          });
          this.router.navigate(['/home']);
        }),
        catchError((error: any) => {
          this.hideLoginForm = false;
          this.loading = false;
          this.toast.error({
            detail: 'Google sign-in failed',
            summary: 'An error occurred during Google sign-in!',
            duration: 5000,
          });
          return of(null); // Return an observable with a value of null to continue the stream
        })
      )
      .subscribe();
  }

  signInWithGithub() {
    this.loading = true;
    this.hideLoginForm = true;
    this.authService
      .githubSignIn()
      .pipe(
        tap(() => {
          const successMessage = `GitHub sign-in successful!`;
          this.toast.success({
            detail: successMessage,
            summary: `You are logged in with GitHub!`,
            duration: 5000,
          });
          this.router.navigate(['/home']);
        }),
        catchError((error: any) => {
          this.hideLoginForm = false;
          this.loading = false;
          console.error('GitHub sign-in error:', error); 
          this.toast.error({
            detail: 'GitHub sign-in failed',
            summary: 'An error occurred during GitHub sign-in!',
            duration: 5000,
            
          });
          return of(null); // Return an observable with a value of null to continue the stream
          
        })
      )
      .subscribe();
  }


  
}
