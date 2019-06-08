import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IssueServiceService {

  private url = 'http://issueback.myinfo.world';

  constructor(public http: HttpClient, public cookieService: CookieService) {
  }

  // function to get all issues
  public getAllIssues(): any {
    return this.http.get(`${this.url}/api/v1/issue/all?authToken=${this.cookieService.get('authToken')}`);
  }

  // function to create issue
  public createIssue: any = (data: FormData) => {
    return this.http.post(`${this.url}/api/v1/issue/add?authToken=${this.cookieService.get('authToken')}`, data);
  }

  // function to update issue
  public updateIssue: any = (issueId, data: FormData) => {
    return this.http.put(`${this.url}/api/v1/issue/edit/${issueId}?authToken=${this.cookieService.get('authToken')}`, data);
  }

  // function to get issue by issueId
  public getSingleIssue(id): any {
    return this.http.get(`${this.url}/api/v1/issue/getIssue/${id}?authToken=${this.cookieService.get('authToken')}`);
  }

  // function to get all issues by userId or assignee
  public getAllIssuesByUserId = (id) => {
    return this.http.get(`${this.url}/api/v1/issue/issuesByUserId/${id}?authToken=${this.cookieService.get('authToken')}`);
  }

  // function to delete issue
  public deleteIssue = (issueId) => {
    return this.http.post(`${this.url}/api/v1/issue/delete/${issueId}?authToken=${this.cookieService.get('authToken')}`, null);
  }

  // function to get all comments
  public getallComments = (id) => {
    return this.http.get(`${this.url}/api/v1/issue/getAllComments/${id}?authToken=${this.cookieService.get('authToken')}`);
  }

  // function to get all assignees
  public getallAssignees = (issueId) => {
    return this.http.get(`${this.url}/api/v1/issue/getAllAssignees/${issueId}?authToken=${this.cookieService.get('authToken')}`);
  }

  // function to get all watchers
  public getallWatchers = (id) => {
    return this.http.get(`${this.url}/api/v1/issue/getAllWatchers/${id}?authToken=${this.cookieService.get('authToken')}`);
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
