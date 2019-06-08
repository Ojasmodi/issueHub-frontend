import { Component, OnInit } from '@angular/core';
import { IssueServiceService } from '../issue-service.service';
import { ToastrService } from 'ngx-toastr';
import { UserManagementService } from 'src/app/user-management.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Subscription } from 'rxjs';
import { SocketService } from './socket.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-view-issue',
  templateUrl: './view-issue.component.html',
  styleUrls: ['./view-issue.component.css'],
  providers: [SocketService]
})

export class ViewIssueComponent implements OnInit {

  public authToken: any;
  public userInfo: any;
  public userId: any;
  public userName: any;
  public disconnectedSocket = true;
  currentIssueId;
  currentIssue;
  comment;
  allUsers = []
  allComments = []
  allWatchers = []
  userSubs: Subscription
  getWatcherSubs: Subscription
  updatedCommentsSubs: Subscription
  deletedCommentsSubs: Subscription
  updatedAssigneeSubs: Subscription
  deletedAssigneeSubs: Subscription
  currentAssignee;
  issueNotFound: boolean = false;
  allAssignees = []
  watcherPresent = false;
  canAssignIssueToOtherUsers = false;
  liveConSubs: Subscription

  constructor(public issueService: IssueServiceService, public toastrService: ToastrService, public _route: ActivatedRoute,
              public router: Router, private spinner: NgxSpinnerService,
              public userManagementService: UserManagementService, public socketService: SocketService, public cookieService: CookieService) {

  }

  ngOnInit() {
    this.userName = this.cookieService.get('userName');
    this.authToken = this.cookieService.get('authToken');
    this.userId = this.cookieService.get('userId')
    this.userInfo = this.userManagementService.getUserInfoFromLocalStorage();
    this.spinner.show()
    this.checkStatus();
    this.verifyUserConfirmation()
    this.updatedAssigneeList();
    this.updatedComments();
    this.deletedAssignee();
    this.deletedComment();
    this.getWatcher();
    this.callDisconnectedSocket();
    this.currentIssueId = this._route.snapshot.paramMap.get('id');
    this.issueService.getSingleIssue(this.currentIssueId).subscribe((apiResponse) => {
      this.spinner.hide()
      if (apiResponse.status === 200) {
        this.currentIssue = apiResponse.data;
      }
      else if (apiResponse.status == 404) {
        this.toastrService.error("Issue not exists anymore.")
        this.issueNotFound = true;
      }
    },
      (err) => {
        this.spinner.hide()
        this.toastrService.error("Some error occured.");
      }
    );
    this.issueService.getallAssignees(this.currentIssueId).subscribe((apiResponse) => {
      this.spinner.hide()
      if (apiResponse['status'] === 200) {
        //console.log(apiResponse);
        this.allAssignees = apiResponse['data'];
        this.checkIfAssigneePresent(this.allAssignees);
      }
    }
    );
    this.issueService.getallWatchers(this.currentIssueId).subscribe((apiResponse) => {
      this.spinner.hide()
      if (apiResponse['status'] === 200) {
        //console.log(apiResponse);
        this.allWatchers = apiResponse['data']['watchersList'];
        this.checkIfWatcherPresent(this.allWatchers);
      }
    }
    );
    this.userManagementService.getAllUsers().subscribe((apiResponse) => {
      if (apiResponse['status'] === 200) {
        this.allUsers = apiResponse.data;
      }
    }
    );
    this.issueService.getallComments(this.currentIssueId).subscribe((apiResponse) => {
      this.spinner.hide()
      if (apiResponse['status'] === 200) {
        console.log(apiResponse);
        this.allComments = apiResponse['data'];
      }
    }
    );
  }

  // function to  verify user confirmation
  public verifyUserConfirmation: any = () => {
    this.userSubs = this.socketService.verifyUser()
      .subscribe((data) => {
        this.disconnectedSocket = false;
        this.toastrService.success("Connection is live.")
        this.socketService.setUser(this.authToken);
      });
  }

  // function to check watcher is present or not for enabling/disabling add to watcher button
  checkIfWatcherPresent = (watchersList) => {
    for (let watcher of watchersList) {
      if (watcher.userId == this.userId) {
        this.watcherPresent = true;
        break;
      }
    }
  }

  // function to check if assignee is present or not so that to check he is able to assign issue to other users or not
  checkIfAssigneePresent = (assignees) => {
    for (let assignee of assignees) {
      if (assignee.assignedToId == this.userId) {
        this.canAssignIssueToOtherUsers = true;
        break;
      }
      else {
        this.canAssignIssueToOtherUsers = false;
      }
    }
  };

  // function to check whether user is logged in or not
  public checkStatus = () => {
    if (this.cookieService.get('authToken') === undefined || this.cookieService.get('authToken') === '' ||
      this.cookieService.get('authToken') === null) {
      this.toastrService.error("Please login first.");
      this.router.navigate(['/']);
      return false;
    } else {
      return true
    }
  }

  // function to add assignee
  addAssignee = () => {
    if (!this.currentAssignee) {
      this.toastrService.warning("Select a assignee!")
    }
    if (this.disconnectedSocket == true) {
      this.toastrService.error("Network problem.")
    }
    else {
      let assigneeData = {
        assignedToId: this.currentAssignee.userId,
        assignedToName: this.currentAssignee.firstName + " " + this.currentAssignee.lastName,
        assignedById: this.userId,
        issueId: this.currentIssueId
      };
      //console.log(assigneeData)
      this.socketService.addAssignee(assigneeData);
    }
  }

  // function to get new assignee when it is created
  updatedAssigneeList = () => {
    this.updatedAssigneeSubs = this.socketService.updatedAssigneeList().subscribe((apiResponse) => {
      //console.log(apiResponse)
      if (apiResponse.status == 200) {
        if (apiResponse.data.issueId === this.currentIssueId) {
          this.toastrService.info(`${apiResponse.data.assignedToName} is assigned to this issue.`)
          this.allAssignees.push(apiResponse.data);
          this.checkIfAssigneePresent(this.allAssignees)
        }
      }
      else if (apiResponse.status == 404) {
        this.toastrService.error("Issue no longer exist.")
        this.issueNotFound = true;
      }
      else {
        if (apiResponse.assignedById === this.userId) {
          this.toastrService.error(apiResponse.message);
        }
      }
    },
      (err) => {
        this.toastrService.error(err.message);
      });
  }

  // function to emit delete assignee event
  deleteAssignee = (assignee) => {
    if (this.disconnectedSocket == true) {
      this.toastrService.error("Network problem.")
    }
    else {
      this.socketService.deleteAssignee(assignee.assigneeId);
    }
  }

  // function to get deleted assignee
  deletedAssignee = () => {
    this.deletedAssigneeSubs = this.socketService.deletedAssignee().subscribe((apiResponse) => {
      //console.log(apiResponse)
      if (apiResponse.status == 200) {
        if (apiResponse.data.issueId === this.currentIssueId) {
          this.toastrService.info(`${apiResponse.data.assignedToName} is removed from assignee list.`)
          for (let d of this.allAssignees) {
            if (d.assigneeId === apiResponse.data.assigneeId) {
              var removeIndex = this.allAssignees.map(function (assignee) { return assignee.assigneeId; }).indexOf(d.assigneeId);
              this.allAssignees.splice(removeIndex, 1)
            }
          }
          this.checkIfAssigneePresent(this.allAssignees);
        }
      }
      else if (apiResponse.status == 404) {
        this.toastrService.error("Issue no longer exist.")
        this.issueNotFound = true;
      }
      else {
        if (apiResponse.data.issueId === this.currentIssueId) {
          this.toastrService.error(apiResponse.message)
        }
      }
    },
      (err) => {
        this.toastrService.error(err.message);
      });
  }

  // function to emit add comment event
  addComment = () => {
    if (!this.comment) {
      this.toastrService.warning("Comment field is blank!")
    }
    else if (this.disconnectedSocket == true) {
      this.toastrService.error("Network problem.")
    }
    else {
      let commentData = {
        issueId: this.currentIssueId,
        userId: this.userId,
        fullName: this.userName,
        comment: this.comment
      }
      this.socketService.addComment(commentData);
      this.comment = "";
    }
  }

  // function to emit delete comment event
  deleteComment = (comment) => {
    if (this.disconnectedSocket == true) {
      this.toastrService.error("Network problem.")
    }
    else {
      this.socketService.deleteComment(comment);
    }
  }

  // function to get deleted comment
  deletedComment = () => {
    this.deletedCommentsSubs = this.socketService.deletedComment().subscribe((apiResponse) => {
      if (apiResponse.status == 200) {
        if (apiResponse.data.issueId === this.currentIssueId) {
          this.toastrService.info(`${apiResponse.data.creatorName} has removed his comment.`)
          for (let d of this.allComments) {
            if (d.commentId === apiResponse.data.commentId) {
              var removeIndex = this.allComments.map(function (comment) { return comment.commentId; }).indexOf(d.commentId);
              this.allComments.splice(removeIndex, 1)
            }
          }
        }
      }
      else if (apiResponse.status == 404) {
        this.toastrService.error("Issue not exists anymore.")
        this.issueNotFound = true;
      }
      else {
        if (apiResponse.data.issueId === this.currentIssueId) {
          this.toastrService.error(apiResponse.message)
        }
      }
    },
      (err) => {
        this.toastrService.error(err.message);
      });
  }

  // function to get new comment when it is created
  updatedComments = () => {
    this.updatedCommentsSubs = this.socketService.updatedComments().subscribe((apiResponse) => {
      //console.log(apiResponse)
      if (apiResponse.status == 200) {
        if (apiResponse.data.issueId === this.currentIssueId) {
          this.toastrService.info(`${apiResponse.data.creatorName} has commented on this issue.`)
          this.allComments.push(apiResponse.data);
        }
      }
      else if (apiResponse.status == 404) {
        this.toastrService.error("Issue no longer exist.")
        this.issueNotFound = true;
      }
      else {
        if (apiResponse.data.issueId === this.currentIssueId) {
          this.toastrService.error(apiResponse.message)
        }
      }
    },
      (err) => {
        this.toastrService.error(err.message);
      });
  }

  // function to add watcher
  addToWatchers = () => {
    if (this.disconnectedSocket == true) {
      this.toastrService.error("Network problem.")
    } else {
      let data = {
        userId: this.userId,
        userName: this.userName,
        issueId: this.currentIssueId
      }
      this.socketService.addToWatchers(data);
    }
  }

  // function to logout user
  public logout = () => {
    this.spinner.show()
    this.userManagementService.logout().subscribe((apiResponse) => {
      this.spinner.hide()
      if (apiResponse.status === 200) {
        this.cookieService.delete('authToken');
        this.cookieService.delete('userId');
        this.cookieService.delete('userName');
        this.toastrService.success("Logged out successfully.")
        this.router.navigate(['/']);
      }
      else {
        this.toastrService.error(apiResponse.message);
      }
    },
      (err) => {
        this.spinner.hide()
        this.toastrService.error("Some error occured.");
      })
  }

  // function to get new watcher when it is created
  getWatcher = () => {
    this.getWatcherSubs = this.socketService.getWatcher().subscribe((apiResponse) => {
      // console.log(apiResponse)
      if (apiResponse.status == 200) {
        if (apiResponse.data.issueId === this.currentIssueId) {
          this.toastrService.show(`A new watcher is added to the list.`)
          this.allWatchers.push(apiResponse.data);
          this.checkIfWatcherPresent(this.allWatchers);
        }
      }
      else if (apiResponse.status == 304) {
        this.toastrService.error("Issue no longer exist.")
        this.issueNotFound = true;
      }
      else {
        this.toastrService.error(apiResponse.message)
      }
    },
      (err) => {
        this.toastrService.error(err.message);
      });
  }

  // function to check whether connection is established or not
  callDisconnectedSocket = () => {
    this.liveConSubs = this.socketService.disconnectedSocket().subscribe(() => {
      this.disconnectedSocket = true;
      this.toastrService.error("Connection-lost", 'Check network-connection');
    })
  }

  ngOnDestroy() {
    this.updatedCommentsSubs.unsubscribe();
    this.deletedCommentsSubs.unsubscribe();
    this.getWatcherSubs.unsubscribe()
    this.updatedAssigneeSubs.unsubscribe()
    this.deletedAssigneeSubs.unsubscribe();
    this.userSubs.unsubscribe();
    this.liveConSubs.unsubscribe();
  }


}
