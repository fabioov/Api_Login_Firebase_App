import { Injectable } from '@angular/core';
import {
  Auth,
  GithubAuthProvider,
  GoogleAuthProvider,
  UserCredential,
  UserInfo,
  authState,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import {
  Observable,
  concatMap,
  from,
  of,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  currentUser$ = authState(this.auth);

  constructor(
    private auth: Auth,
    private toast: NgToastService,
    private router: Router
  ) {}

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
    return from(sendPasswordResetEmail(this.auth, email));
  }

  logout() {
    this.toast.info({
      detail: 'You are logged out.',
      summary: 'Come back soon!',
      duration: 3000,
    });
    return from(this.auth.signOut());
  }

  googleSignIn(){
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider));
  }

  githubSignIn() {
    const provider = new GithubAuthProvider();
    return from(signInWithPopup(this.auth, provider));
  }
}
