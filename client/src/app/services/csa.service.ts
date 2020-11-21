import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { logging } from 'protractor';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
// import { environment } from 'src/environments/environment';
import { map, retry, catchError, tap, mapTo } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CsaService {

  

  constructor(private Http: HttpClient) { }

  psaDashboard(payload:any):Observable<any> {
    return this.Http.post<any>(environment.ApiPath + 'csa/dashboard',payload)
      .pipe(retry(1), catchError(this.errorHandle));
  }

  errorHandle(error) {
    let errormgs = {};
    if (error.error instanceof ErrorEvent) {
      // get client side error
      errormgs = error.error.message;
    }
    else {
      // get server-side error
      errormgs = { ErrorCode: error.status, Message: error.message, Response: error.error.Mgs };
    }
    console.log(errormgs);
    return throwError(errormgs);
  }
}
