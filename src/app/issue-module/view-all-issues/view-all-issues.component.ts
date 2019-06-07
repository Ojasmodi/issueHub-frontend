import { Component, OnInit, ViewChild } from '@angular/core';
import { IssueServiceService } from '../issue-service.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { UserManagementService } from 'src/app/user-management.service';
import { CookieService } from 'ngx-cookie-service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-view-all-issues',
  templateUrl: './view-all-issues.component.html',
  styleUrls: ['./view-all-issues.component.css']
})
export class ViewAllIssuesComponent implements OnInit {
  displayedColumns: string[] = ['Status', 'Title', 'ReportedBy', 'CreatedOn', 'Actions'];
  allIssues: MatTableDataSource<any>;
  issueTypes = ['BackLog', 'In-test', 'In-progress', 'Done']
  userName;
  authToken;
  userId;
  searchKey: string;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public issueService: IssueServiceService, public toastrService: ToastrService,
    public router: Router, public userManagementService: UserManagementService, public cookieService: CookieService) { }

  ngOnInit() {
    this.authToken = this.cookieService.get('authToken')
    this.userName = this.cookieService.get('userName')
    this.userId = this.cookieService.get('userId');
    this.checkStatus();
    this.issuesAssignedToUser();
  }

  public checkStatus = () => {

    if (this.cookieService.get('authToken') === undefined || this.cookieService.get('authToken') === '' ||
      this.cookieService.get('authToken') === null) {
      this.toastrService.error("Please login first.");
      this.router.navigate(['/']);
      return false;
    } else {
      return true
    }

  } // end checkStatus


  issuesAssignedToUser() {
    this.issueService.getAllIssues().subscribe((data) => {
      if (data.status === 200) {
        this.allIssues = new MatTableDataSource(data.data);
        this.allIssues.sort = this.sort;
        this.allIssues.paginator = this.paginator;
        //console.log(this.allIssues)
      }
    },
      err => {
        this.toastrService.error("Some error occured.")
      });
  }

  onSearchClear() {
    this.searchKey = '';
    this.applyFilter();
  }

  applyFilter() {
    this.allIssues.filter = this.searchKey.trim().toLowerCase();
  }

  public viewIssue = (id) => {
    this.router.navigate(['view', id])
  }

  public editIssue = (id) => {
    this.router.navigate(['edit', id])
  }
  public logout() {

    this.userManagementService.logout().subscribe((apiResponse) => {
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
        this.toastrService.error("Some Error Occured.");
      })
  }

  public deleteIssue = (id) => {
    this.issueService.deleteIssue(id).subscribe((apiResponse) => {
      if (apiResponse['status'] === 200) {
        this.toastrService.info(`Issue Deleted successfully.`)
        this.issuesAssignedToUser();
      }
      else {
        this.toastrService.error(apiResponse['message'])
      }
    },
      err => {
        this.toastrService.error(err)
      }
    );
  }

}