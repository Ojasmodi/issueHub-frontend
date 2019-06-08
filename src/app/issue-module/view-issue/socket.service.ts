import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private url = 'http://issueback.myinfo.world';
  private socket;

  constructor() {
    this.socket = io(this.url);
  }

  // function to verify user
  public verifyUser = () => {
    return Observable.create((observer) => {
      this.socket.on('verifyUser', (data) => {
        observer.next(data);
      })
    })
  }

  // function to get new assignee when it is created
  public updatedAssigneeList = () => {
    return Observable.create((observer) => {
      this.socket.on('new-assignee', (data) => {
        observer.next(data);
      })
    })
  }

  // function to get deleted assignee
  public deletedAssignee = () => {
    return Observable.create((observer) => {
      this.socket.on('deleted-assignee', (data) => {
        observer.next(data);
      })
    })
  }

  // function to get new watcher when it is created
  public getWatcher = () => {
    return Observable.create((observer) => {
      this.socket.on('new-watcher', (data) => {
        observer.next(data);
      })
    })
  }

  // function to get new comment when it is created
  public updatedComments = () => {
    return Observable.create((observer) => {
      this.socket.on('new-comment', (data) => {
        observer.next(data);
      })
    })
  }

  // function to get deleted comment
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
      });
    });
  }

  // function to emit set user event
  public setUser = (authToken) => {
    this.socket.emit("set-user", authToken);
  }

  // function to emit add assignee event
  public addAssignee = (data) => {
    this.socket.emit('add-assignee', data);
  }

  // function to emit add watcher event
  public addToWatchers = (data) => {
    this.socket.emit('add-watcher', data);
  }

  // function to emit delete assignee event
  public deleteAssignee = (data) => {
    this.socket.emit('delete-assignee', data);
  }

  // function to emit add comment event
  public addComment = (data) => {
    this.socket.emit('add-comment', data);
  }

  // function to emit delete comment event
  public deleteComment = (data) => {
    this.socket.emit('delete-comment', data);
  }

  // function to exit socket connection
  public exitSocket = () => {
    this.socket.disconnect();
  }
}
