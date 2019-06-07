import { Component, OnInit, ViewChild } from '@angular/core';
import { IssueServiceService } from '../issue-service.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { UserManagementService } from 'src/app/user-management.service';
import { CookieService } from 'ngx-cookie-service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { FormGroup } from '@angular/forms';
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
  displayedColumns: string[] = ['Status', 'Title', 'ReportedBy', 'CreatedOn', 'Actions'];

  allUsers = [];
  issueTypes = ['BackLog', 'In-test', 'In-progress', 'Done']
  haveIssue: boolean = false;
  issuesAssignedToLoginUser: MatTableDataSource<any>;
  searchKey: string;
  title: string
  description: string
  status: string
  form: FormGroup;
  imagePreview: string;
  selectedFile = null;
  disconnectedSocket = true
  validImage = false;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  public imagePath;

  onImagePicked(event: Event) {
    //console.log(event)
    let file = (event.target as HTMLInputElement).files[0];
    //console.log(file.name)
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


  constructor(public issueService: IssueServiceService, public toastrService: ToastrService,
    public router: Router, public userManagementService: UserManagementService, public cookieService: CookieService) {
  }

  ngOnInit() {
    this.authToken = this.cookieService.get('authToken');
    this.userId = this.cookieService.get('userId');
    this.userName = this.cookieService.get('userName');
    this.userInfo = this.userManagementService.getUserInfoFromLocalStorage();
    this.checkStatus();
    this.issuesAssignedToUser();
  }

  issuesAssignedToUser = () => {
    this.issueService.getAllIssuesByUserId(this.userId).subscribe((data) => {
      //console.log(data)
      if (data['status'] === 200) {
        this.issuesAssignedToLoginUser = new MatTableDataSource(data['data']);
        this.issuesAssignedToLoginUser.sort = this.sort;
        this.issuesAssignedToLoginUser.paginator = this.paginator;
      }
    },
      err => {
        this.toastrService.error("Some error occured.")
      }
    );
  };

  public checkStatus = () => {

    if (this.cookieService.get('authToken') === undefined || this.cookieService.get('authToken') === '' ||
      this.cookieService.get('authToken') === null) {
      this.toastrService.error("Please login first.");
      this.router.navigate(['/']);
      return false;
    } else {
      return true;
    }
  } // end checkStatus



  public logout() {

    this.userManagementService.logout().subscribe((apiResponse) => {
      if (apiResponse.status === 200) {
        this.cookieService.delete('authToken');
        this.cookieService.delete('userId');
        this.cookieService.delete('userName');
        this.toastrService.success("Logged out successfully.")
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000)
      }
      else {
        this.toastrService.error(apiResponse.message);
      }
    },
      (err) => {
        this.toastrService.error(err.message);
      })
  }


  createIssue() {
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
      const issueData = new FormData();
      issueData.append("title", this.title);
      issueData.append("description", this.description);
      issueData.append("status", this.status);
      issueData.append("reportedBy", this.userName)
      issueData.append("reportedByUserId", this.userId)
      issueData.append("image", this.selectedFile, 'image');
      console.log(issueData.getAll)
      this.issueService.createIssue(issueData).subscribe((apiResponse) => {
        if (apiResponse.status === 200) {
          this.toastrService.show("Issue submitted");
          this.viewAllIssues()
        }
        else {
          this.toastrService.error("Some error occured.")
        }
      })
    }
  }

  onSearchClear() {
    this.searchKey = '';
    this.applyFilter();
  }

  applyFilter() {
    this.issuesAssignedToLoginUser.filter = this.searchKey.trim().toLowerCase();
  }

  public haveAnIssue = () => {
    this.haveIssue = !this.haveIssue;
  }

  public viewIssue = (id) => {
    this.router.navigate(['view', id])
  }

  public editIssue = (id) => {
    this.router.navigate(['edit', id])
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

  public viewAllIssues = () => {
    this.router.navigate(['viewAll'])
  }


}
