import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';

type Countries = {
  country: any[];
};

@Injectable({
  providedIn: 'root'
})
export class GetDataService {
  private apiUrl = 'https://countriesnow.space/api/v0.1/countries/state/cities';
  errorCatch: any;

  constructor(private http: HttpClient) { }

  getDataByZipCode(zipcode: string): Observable<any> {

    return this.http.get<any>(`https://viacep.com.br/ws/${zipcode}/json/`);
  }

}
