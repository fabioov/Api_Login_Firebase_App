import { Component, OnInit, Inject, Provider, forwardRef } from '@angular/core';
import { Observable, Observer, Subscription, from, switchMap, tap, timer } from 'rxjs';
import { DatePipe, formatDate } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  NgForm,
  FormArray,
  FormGroupDirective,
} from '@angular/forms';
import {
  DateAdapter,
  ErrorStateMatcher,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import 'moment/locale/br';
import {
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import { NgToastService } from 'ng-angular-popup';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { TournamentsService } from 'src/app/services/tournaments.service';
import { Tournament } from 'src/app/models/tournament';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import { deleteDoc, doc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';


export interface ExampleTab {
  label: string;
  content: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS }
  ],
})
export class HomeComponent implements OnInit {
  asyncTabs: Observable<ExampleTab[]> | undefined;
  form!: FormGroup;
  days!: FormArray;
  timeControl: FormControl;
  time = new Date();
  tournaments: Tournament[] = [];
  tournamentsSubscription: Subscription | undefined;
  activeTab:  string = 'Torneios';

  tournamentForm = this.fb.group({
    uid: [''],
    userID: [''],
    tournamentName: [''],
    startDate: [''],
    endDate: [''],
    startTime: [''],
    clubName: [''],
    city: [''],
    state: [''],
    address: [''],
    addressNumber: [''],
    addressComp: [''],
    zipCode: [''],
  });

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    private toast: NgToastService,
    private tournService: TournamentsService,
    private authService: AuthenticationService,
    private firestore: Firestore
  ) {
    this.timeControl = new FormControl();
    this.asyncTabs = new Observable((observer: Observer<ExampleTab[]>) => {
      setTimeout(() => {
        observer.next([
          { label: 'Torneios', content: 'Lista de Torneios' },
          { label: 'Torneio', content: 'Cadastro' },
          { label: 'Categorias', content: 'Cadastro' },
          { label: 'Quadras', content: 'Cadstro' },
          { label: 'Inscrições', content: 'Cadastro' },
          { label: 'Impedimentos', content: 'Cadastro' },
        ]);
      }, 1000);
    });
  }

  ngOnInit(): void {
    this.tournService.getTournaments().subscribe((data) => {
      this.tournaments = data;
    })
    this.form = new FormGroup({
      // Other form controls
      torneioName: new FormControl(''),
      dateRange: new FormGroup({
        start: new FormControl(''),
        end: new FormControl(''),
      }),
      days: this.fb.array([]), // Initialize the days FormArray using the FormBuilder
    });
  }
  onTimeChange(event: any): void {
    const selectedTime = event;
    debugger
    // Perform any necessary actions with the selected time
    console.log('Selected time:', selectedTime);
  }
  

  saveTournament() {
    const { uid, startDate, endDate, userID, ...data } =
      this.tournamentForm.value;

    if (this.form.valid) {
      this.authService.currentUser$
        .pipe(
          switchMap((user) => {
            const newUid = uuidv4();
            const formattedStartDate = moment(startDate).format('DD-MM-YYYY');
            const formattedEndDate = moment(endDate).format('DD-MM-YYYY');

            if (user) {
              return this.tournService.addTournament({
                uid: newUid,
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                userID: user?.uid,
                ...data,
              });
            } else {
              throw new Error('Failed to retrieve current user');
            }
          })
        )
        .subscribe({
          next: () => {
            this.toast.success({
              detail: 'Evento criado!',
              summary: `Torneio criado com sucesso!`,
              duration: 4000,
            });
          },
          error: (error) => {
            this.toast.error({
              detail: 'Evento não criado!',
              summary: `Torneio não criado!`,
              duration: 4000,
            });
          },
        });
    }
  }

  deleteTournament(tournament: Tournament) {
    this.tournService.deleteTournament(tournament).subscribe({
      next: () => {
        this.toast.success({
          detail: 'Evento deletado!',
          summary: `Torneio ${ tournament.tournamentName } deletado com sucesso!`,
          duration: 4000,
        });
        setTimeout(() => {
          window.location.reload(); // Refresh the page after a delay
        }, 2000); // Adjust the delay time as needed
      },
      error: (error) => {
        this.toast.error({
          detail: 'Evento não deletado!',
          summary: `Torneio ${ tournament.tournamentName } não deletado!`,
          duration: 4000,
        });
      }
    });
  }
  
  openTorneioTab() {
    this.activeTab = 'Torneio';
  }
 
  
}
