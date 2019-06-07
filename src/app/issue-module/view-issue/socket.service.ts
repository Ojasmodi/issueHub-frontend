import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private url = 'http://issueback.myinfo.world';
  private socket;

  constructor(public http: HttpClient, public cookieService: CookieService) {
    // connection is being created.
    // that handshake
    this.socket = io(this.url);
  }

  public verifyUser = () => {

    return Observable.create((observer) => {
      this.socket.on('verifyUser', (data) => {
        observer.next(data);
      })
    })
  }

  public updatedAssigneeList = () => {
    return Observable.create((observer) => {
      this.socket.on('new-assignee', (data) => {
        observer.next(data);
      })
    })
  }

  public deletedAssignee = () => {
    return Observable.create((observer) => {
      this.socket.on('deleted-assignee', (data) => {
        observer.next(data);
      })
    })
  }

  public getWatcher = () => {
    return Observable.create((observer) => {
      this.socket.on('new-watcher', (data) => {
        observer.next(data);
      })
    })
  }

  public updatedComments = () => {
    return Observable.create((observer) => {
      this.socket.on('new-comment', (data) => {
        observer.next(data);
      })
    })
  }

  public deletedComment = () => {
    return Observable.create((observer) => {
      this.socket.on('deleted-comment', (data) => {
        observer.next(data);
      })
    })
  }

  public disconnectedSocket = () => {

    return Observable.create((observer) => {

      this.socket.on("disconnect", () => {

        observer.next();

      }); // end Socket

    }); // end Observable
  }

  public setUser = (authToken) => {

    this.socket.emit("set-user", authToken);

  } // end setUser

  public addAssignee = (data) => {

    this.socket.emit('add-assignee', data);
  }

  public addToWatchers = (data) => {

    console.log("emit watcher")
    this.socket.emit('add-watcher', data);
  }

  public deleteAssignee = (data) => {

    this.socket.emit('delete-assignee', data);
  }

  public addComment = (data) => {

    this.socket.emit('add-comment', data);
  }

  public deleteComment = (data) => {

    this.socket.emit('delete-comment', data);
  }

  public exitSocket = () => {
    this.socket.disconnect();
  }// end exit socket

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
