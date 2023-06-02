import { state } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { User, user } from '@angular/fire/auth';
import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NgToastService } from 'ng-angular-popup';
import { Observable, catchError, concatAll, concatMap, map, of, startWith, switchMap, tap } from 'rxjs';
import { ProfileUser } from 'src/app/models/user-profile';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ImageUploadService } from 'src/app/services/image-upload.service';
import { UsersService } from 'src/app/services/users.service';

@UntilDestroy()
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user$ = this.userService.currentUserProfile$;

  options: string[] = ['RS', 'SC', 'SP'];
  filteredOptions: Observable<string[]> | undefined;


  savingProfile = false;

  profileForm = this.fb.group({
    uid: [''],
    displayName: [''],
    firstName: [''],
    lastName: [''],
    phone: [''],
    address: [''],
    addressComp: [''],
    state: [''],
    city: [''],
    zipCode: ['']
  });

  constructor(
    private authService: AuthenticationService,
    private imageUploadService: ImageUploadService,
    private toast: NgToastService,
    private router: Router,
    private userService: UsersService,
    private fb: NonNullableFormBuilder
  ) {}

  ngOnInit() {
    this.userService.currentUserProfile$
      .pipe(untilDestroyed(this), tap(console.log))
      .subscribe((user) => {
        this.profileForm.patchValue({ ...user });
      });
      debugger
      this.filteredOptions = this.profileForm.valueChanges.pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value.state),
        map(state => this._filter(state || ''))
      );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  uploadImage(event: any, user: ProfileUser) {
    debugger;
    this.imageUploadService
      .uploadImage(event.target.files[0], `images/profile/${user.uid}`)
      .pipe(
        tap(() => {
          this.toast.success({
            detail: 'Upload successful',
            summary: 'Image uploaded!',
            duration: 5000,
          });
        }),
        catchError((error: any) => {
          this.toast.error({
            detail: 'Upload failed',
            summary: 'Check your data',
            duration: 5000,
          });
          return of(null);
        }),

        switchMap((photoURL) =>
          this.userService.updateUser({
            uid: user.uid,
            photoURL: photoURL ?? undefined,
          })
        )
      )
      .subscribe();
  }

  saveProfile() {
    const { uid, ...data } = this.profileForm.value;

    if (!uid) {
      return;
    }

    this.savingProfile = true;

    this.userService
      .updateUser({ uid, ...data })
      .pipe(
        tap(() => {
          this.toast.success({
            detail: 'Data saved!',
            summary: 'User data updated/saved',
            duration: 4000,
          });
        }),
        catchError((error: any) => {
          this.toast.error({
            detail: 'Saving data failed!',
            summary: 'Check your data',
            duration: 4000,
          });
          return of(null);
        })
      )
      .subscribe({
        complete: () => {
          this.savingProfile = false; // Set savingProfile to false when the save operation is complete
        },
      });
  }

}
