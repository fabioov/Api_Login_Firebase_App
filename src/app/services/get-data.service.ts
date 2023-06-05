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

  getCountries(): Observable<any> {
    const url = 'https://countriesnow.space/api/v0.1/countries/states';
    return this.http.get(url);
  }

  getCities(country: string, state: string): Observable<any> {
    
    const requestBody = {
      country: country,
      state: state
    };

    return this.http.post<any>(this.apiUrl, requestBody);
  }

}
