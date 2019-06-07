import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  private url = 'http://localhost:3000';
  constructor(public http: HttpClient, private cookieService: CookieService) { 
  }

  public signupFunction(data): any {
    return this.http.post(`${this.url}/api/v1/users/signup`, data);
  }

  public signinWithGoogle(data): any {
    return this.http.post(`${this.url}/api/v1/users/signGoogle`, data);
  }

  public getUserInfoFromLocalStorage=()=>{
    return JSON.parse(localStorage.getItem('userInfo'));
  }

  public setUserInfoInLocalStorage=(data)=>{
    localStorage.setItem('userInfo',JSON.stringify(data));
  }

  public signinFunction(data): any {
    return this.http.post(`${this.url}/api/v1/users/login`, data);
  }

  public getAllUsers(): any {
    return this.http.get(`${this.url}/api/v1/users/view/all?authToken=${this.cookieService.get('authToken')}`);
  }

  public logout(): Observable<any> {

    const params = new HttpParams()
      .set('authToken', this.cookieService.get('authToken'))

    return this.http.post(`${this.url}/api/v1/users/logout`, params);
  } // end logout function

  public resetPassword=(data)=>{
    return this.http.post(`${this.url}/api/v1/users/resetpass`, data);
  }

  private handleError(err: HttpErrorResponse) {

    let errorMessage = '';

    if (err.error instanceof Error) {

      errorMessage = `An error occurred: ${err.error.message}`;

    } else {

      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;

    } // end condition *if

    console.error(errorMessage);

    return Observable.throw(errorMessage);

  }  // END handleError
}


