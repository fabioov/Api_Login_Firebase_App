import { Component, OnInit, Inject } from '@angular/core';
import { Observable, Observer } from 'rxjs';
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
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class HomeComponent implements OnInit {
  asyncTabs: Observable<ExampleTab[]> | undefined;
  form!: FormGroup;
  days!: FormArray;
  timeControl: FormControl;

  errorStateMatcher: ErrorStateMatcher | undefined;
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private _adapter: DateAdapter<any>,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    private toast: NgToastService
  ) {
    this.timeControl = new FormControl();
    this.asyncTabs = new Observable((observer: Observer<ExampleTab[]>) => {
      setTimeout(() => {
        observer.next([
          { label: 'Torneios', content: 'Lista' },
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
    this.form = new FormGroup({
      // Other form controls
      torneioName: new FormControl(''),
      dateRange: new FormGroup({
        start: new FormControl(''),
        end: new FormControl(''),
      }),
      days: new FormArray([]),
    });

    this.setupDateValidators();
  }

  private setupDateValidators(): void {
    const dataFimControl = this.form.get('dataFim');

    if (dataFimControl) {
      dataFimControl.valueChanges.subscribe(() => {
        this.validateDateRange();
      });
    }
  }

  private validateDateRange(): void {
    debugger;
    const dataInicio = this.form.get('dataInicio')?.value;
    const horarioInicio = this.form.get('horarioInicio')?.value;
    const dataFim = this.form.get('dataFim')?.value;
    const horarioFim = this.form.get('horarioFim')?.value;

    if (dataInicio >= dataFim) {
      this.form.get('dataFim')?.setErrors({ invalidDate: true });
    } else {
      this.form.get('dataFim')?.setErrors(null);
    }
  }
}
