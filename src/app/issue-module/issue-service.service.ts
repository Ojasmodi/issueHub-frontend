import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class IssueServiceService {

  private url = 'http://localhost:3000';

  constructor(public http: HttpClient, public cookieService: CookieService) {
  }

  public getAllIssues(): any {
    return this.http.get(`${this.url}/api/v1/issue/all?authToken=${this.cookieService.get('authToken')}`);
  }

  public getallAssignees = (issueId) => {
    return this.http.get(`${this.url}/api/v1/issue/getAllAssignees/${issueId}?authToken=${this.cookieService.get('authToken')}`);
  }

  public deleteIssue = (issueId) => {
    return this.http.post(`${this.url}/api/v1/issue/delete/${issueId}?authToken=${this.cookieService.get('authToken')}`, null);
  }

  public getallComments = (id) => {
    return this.http.get(`${this.url}/api/v1/issue/getAllComments/${id}?authToken=${this.cookieService.get('authToken')}`);
  }

  public getallWatchers = (id) => {
    return this.http.get(`${this.url}/api/v1/issue/getAllWatchers/${id}?authToken=${this.cookieService.get('authToken')}`);
  }

  public getAllIssuesByUserId = (id) => {
    return this.http.get(`${this.url}/api/v1/issue/issuesByUserId/${id}?authToken=${this.cookieService.get('authToken')}`);
  }


  public createIssue: any = (data: FormData) => {
    return this.http.post(`${this.url}/api/v1/issue/add?authToken=${this.cookieService.get('authToken')}`, data);
  }

  public updateIssue: any = (issueId, data: FormData) => {
    return this.http.put(`${this.url}/api/v1/issue/edit/${issueId}?authToken=${this.cookieService.get('authToken')}`, data);
  }

  public getSingleIssue(id): any {
    return this.http.get(`${this.url}/api/v1/issue/getIssue/${id}?authToken=${this.cookieService.get('authToken')}`);
  }


}
