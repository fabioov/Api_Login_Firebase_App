import { Injectable } from '@angular/core';
import {
  Auth,
  UserCredential,
  UserInfo,
  authState,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import {
  Observable,
  catchError,
  concatMap,
  finalize,
  firstValueFrom,
  from,
  of,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  currentUser$ = authState(this.auth);

  constructor(private auth: Auth, private toast: NgToastService, private router: Router) {}

  login(username: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, username, password));
  }

  signUp(email: string, password: string): Observable<UserCredential> {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  updateProfileData(profileData: Partial<UserInfo>): Observable<any> {
    const user = this.auth.currentUser;

    return of(user).pipe(
      concatMap((user) => {
        if (!user) throw new Error('Not authenticated');

        return updateProfile(user, profileData);
      })
    );
  }

  forgotPassword(email: string) {

    if (!email) {
      this.toast.warning({
        detail: 'Forgot something?!',
        summary: 'Please, enter your email.',
        duration: 3000,
      });
      return;
    }

    return from(
      sendPasswordResetEmail(this.auth, email).then(
        () => {
          this.toast.success({
            detail: 'Check your email.',
            summary: 'Email sent!',
            duration: 3000,
          });
          this.router.navigate(['/login']);
        },
        (err) => {
          this.toast.warning({
            detail: 'Invalid email.',
            summary: 'Try again?!',
            duration: 3000,
          });
        }
      )
    );
  }

  logout() {
    this.toast.info({
      detail: 'You are logged out.',
      summary: 'Come back soon!',
      duration: 3000,
    });
    return from(this.auth.signOut());
  }
}