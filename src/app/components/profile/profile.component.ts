import { state } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { User, user } from '@angular/fire/auth';
import { FormControl, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NgToastService } from 'ng-angular-popup';
import {
  Observable,
  Subject,
  catchError,
  concatAll,
  concatMap,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { ProfileUser } from 'src/app/models/user-profile';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { GetDataService } from 'src/app/services/get-data.service';
import { ImageUploadService } from 'src/app/services/image-upload.service';
import { UsersService } from 'src/app/services/users.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@UntilDestroy()
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user$ = this.userService.currentUserProfile$;

  savingProfile = false;

  profileForm = this.fb.group({
    uid: [''],
    displayName: [''],
    firstName: [''],
    lastName: [''],
    phone: [''],
    address: [''],
    neighborhood: [''],
    addressNumber: [''],
    addressComp: [''],
    state: [''],
    city: [''],
    zipCode: [''],
  });

  constructor(
    private authService: AuthenticationService,
    private imageUploadService: ImageUploadService,
    private toast: NgToastService,
    private router: Router,
    private userService: UsersService,
    private fb: NonNullableFormBuilder,
    private getData: GetDataService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.userService.currentUserProfile$
      .pipe(untilDestroyed(this), tap(console.log))
      .subscribe((user) => {
        this.profileForm.patchValue({ ...user });
      });
  }

  private _filter(value: string, states: any[]): string[] {
    const filterValue = value.toLowerCase();

    return states
      .filter((state) => state.name.toLowerCase().includes(filterValue))
      .map((state) => state.name);
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

  onSearchZipCode() {
    const zipcode = this.profileForm.get('zipCode')?.value;

  if (zipcode) {
    this.getData.getDataByZipCode(zipcode).subscribe({
      next: (data: any) => {
        console.log(data);
        debugger
        // Set the retrieved data to the corresponding form fields
        if (data.erro !== true) {
          this.profileForm.patchValue({
            address: data.logradouro,
            city: data.localidade,
            neighborhood: data.bairro,
            state: data.uf,
            addressNumber: '',
            addressComp: '',
          });
        } else {
          this.toast.error({
            detail: 'Data failed!',
            summary: `Zip Code ${ zipcode } not found!`,
            duration: 5000,
          });
        }
      },
      error: (error: any) => {
        debugger
        console.error('Error fetching ZIP code data:', error);
      }
    });
  }
  }
}
