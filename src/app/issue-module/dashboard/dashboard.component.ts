import { Component, OnInit, ViewChild } from '@angular/core';
import { IssueServiceService } from '../issue-service.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { UserManagementService } from 'src/app/user-management.service';
import { CookieService } from 'ngx-cookie-service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { NgxSpinnerService } from 'ngx-spinner';
declare var $: any

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {

  public authToken: any;
  public userInfo: any;
  public userId: any;
  public userName: any;
  displayedColumns: string[] = ['Status', 'Title', 'ReportedBy', 'CreatedOn', 'view', 'Edit', 'Delete'];
  allUsers = [];
  issueTypes = ['BackLog', 'In-test', 'In-progress', 'Done']
  issuesAssignedToLoginUser: MatTableDataSource<any>;
  searchKey: string;
  title: string;
  description: string;
  status: string;
  selectedFile = null;
  disconnectedSocket = true;
  validImage = false;
  public imagePath;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(public issueService: IssueServiceService, public toastrService: ToastrService,
    public router: Router, private spinner: NgxSpinnerService,
    public userManagementService: UserManagementService, public cookieService: CookieService) {
  }

  ngOnInit() {
    this.authToken = this.cookieService.get('authToken');
    this.userId = this.cookieService.get('userId');
    this.userName = this.cookieService.get('userName');
    this.userInfo = this.userManagementService.getUserInfoFromLocalStorage();
    this.checkStatus();
    this.spinner.show();
    this.issuesAssignedToUser();
  }

  // function to check whether user is logged in or not
  public checkStatus = () => {
    if (this.cookieService.get('authToken') === undefined || this.cookieService.get('authToken') === '' ||
      this.cookieService.get('authToken') === null) {
      this.toastrService.error("Please login first.");
      this.router.navigate(['/']);
      return false;
    } else {
      return true;
    }
  }

  // function to get issue image when photo is selected by user
  onImagePicked = (event: Event) => {
    //console.log(event)
    let file = (event.target as HTMLInputElement).files[0];
    if (file.size > (5 * 1024 * 1024)) {
      this.toastrService.warning("Please select a file less than 5 MB")
      this.validImage = false;
    }
    else if (file.name.indexOf(".jpeg") < 0 && file.name.indexOf(".png") < 0 && file.name.indexOf(".jpg") < 0) {
      this.toastrService.warning("Please select only jpeg or jpg or png image.")
      this.validImage = false;
    }
    else {
      this.selectedFile = file;
      this.validImage = true;
    }
  }

  // function to get all issues by userId or assignee
  issuesAssignedToUser = () => {
    this.issueService.getAllIssuesByUserId(this.userId).subscribe((data) => {
      //console.log(data)
      this.spinner.hide();
      if (data['status'] === 200) {
        this.issuesAssignedToLoginUser = new MatTableDataSource(data['data']);
        this.issuesAssignedToLoginUser.sort = this.sort;
        this.issuesAssignedToLoginUser.paginator = this.paginator;
      }
    },
      err => {
        this.spinner.hide();
        this.toastrService.error("Some error occured.")
      }
    );
  };

  // function to create issue
  createIssue = () => {
    if (!this.title || this.title.trim().length == 0) {
      this.toastrService.warning("Enter title!")
    }
    else if (!this.status) {
      this.toastrService.warning("Select a status!")
    }
    else if (!this.description || this.title.trim().length == 0) {
      this.toastrService.warning("Enter description!")
    }

    else if (!this.validImage) {
      this.toastrService.warning("Select a valid image.")
    }
    else {
      $('#exampleModal1').modal('toggle');
      this.spinner.show();
      const issueData = new FormData();
      issueData.append("title", this.title);
      issueData.append("description", this.description);
      issueData.append("status", this.status);
      issueData.append("reportedBy", this.userName)
      issueData.append("reportedByUserId", this.userId)
      issueData.append("image", this.selectedFile, 'image');
      // console.log(issueData.getAll)
      this.issueService.createIssue(issueData).subscribe((apiResponse) => {
        this.spinner.hide();
        if (apiResponse.status === 200) {
          this.toastrService.show("Issue submitted");
          this.viewAllIssues()
        }
        else {
          this.toastrService.error("Some error occured.")
        }
      }, (err) => {
        this.spinner.hide();
        this.toastrService.error("Some error occured.")
      })
    }
  }

  // function to clear filter rows result
  onSearchClear = () => {
    this.searchKey = '';
    this.applyFilter();
  }

  // function to filter rows
  applyFilter = () => {
    this.issuesAssignedToLoginUser.filter = this.searchKey.trim().toLowerCase();
  }

  // function for navigating to view issue component
  public viewIssue = (id) => {
    this.router.navigate(['view', id])
  }

  // function for navigating to edit issue component
  public editIssue = (id) => {
    this.router.navigate(['edit', id])
  }

  // function to delete issue
  public deleteIssue = (id) => {
    this.spinner.show();
    this.issueService.deleteIssue(id).subscribe((apiResponse) => {
      this.spinner.hide();
      if (apiResponse['status'] === 200) {
        this.toastrService.info(`Issue Deleted successfully.`)
        this.issuesAssignedToUser();
      }
      else {
        this.toastrService.error(apiResponse['message'])
      }
    },
      err => {
        this.spinner.hide();
        this.toastrService.error(err)
      }
    );
  }

  // function to navigate to allIssues page
  public viewAllIssues = () => {
    this.router.navigate(['viewAll'])
  }

  // function to logout user
  public logout = () => {
    this.spinner.show();
    this.userManagementService.logout().subscribe((apiResponse) => {
      this.spinner.hide();
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
        this.spinner.hide();
        this.toastrService.error("Some error occured.");
      })
  }
}
