import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  private url = 'http://issueback.myinfo.world';
  constructor(public http: HttpClient, private cookieService: CookieService) {
  }

  // function for signup
  public signupFunction(data): any {
    return this.http.post(`${this.url}/api/v1/users/signup`, data);
  }

  // function for sign in with google
  public signinWithGoogle(data): any {
    return this.http.post(`${this.url}/api/v1/users/signGoogle`, data);
  }

  // function to get logged in user data from local storage
  public getUserInfoFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem('userInfo'));
  }

  // function to save logged in user data into local storage 
  public setUserInfoInLocalStorage = (data) => {
    localStorage.setItem('userInfo', JSON.stringify(data));
  }

  // function for signin with email and password 
  public signinFunction(data): any {
    return this.http.post(`${this.url}/api/v1/users/login`, data);
  }

  // function to get all users from backend of issuehub
  public getAllUsers(): any {
    return this.http.get(`${this.url}/api/v1/users/view/all?authToken=${this.cookieService.get('authToken')}`);
  }

  // function to logout user
  public logout(): Observable<any> {
    const params = new HttpParams()
      .set('authToken', this.cookieService.get('authToken'))
    return this.http.post(`${this.url}/api/v1/users/logout`, params);
  } // end logout function

  // function to reset password of user
  public resetPassword = (data) => {
    return this.http.post(`${this.url}/api/v1/users/resetpass`, data);
  }

  // function to handle errors during http call
  private handleError(err: HttpErrorResponse) {
    let errorMessage = '';
    if (err.error instanceof Error) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    } // end condition *if
    // console.error(errorMessage);
    return Observable.throw(errorMessage);
  }  // END handleError
}


