import { Component, OnInit } from '@angular/core';
import { IssueServiceService } from '../issue-service.service';
import { ToastrService } from 'ngx-toastr';
import { UserManagementService } from 'src/app/user-management.service';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-issue',
  templateUrl: './edit-issue.component.html',
  styleUrls: ['./edit-issue.component.css']
})
export class EditIssueComponent implements OnInit {

  public authToken: any;
  public userInfo: any;
  public userId: any;
  public userName: any;
  public disconnectedSocket = true;
  currentIssueId;
  currentIssue;
  issueStatus = ['BackLog', 'In-test', 'In-progress', 'Done']
  title: string
  description: string
  status: string
  selectedFile = null;
  validImage = false;
  public imagePath;

  onImagePicked(event: Event) {
    //console.log(event)
    let file = (event.target as HTMLInputElement).files[0];
    this.selectedFile = file;
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

  constructor(public issueService: IssueServiceService, public toastrService: ToastrService, public _route: ActivatedRoute,
    public router: Router, public userManagementService: UserManagementService, public cookieService: CookieService) {
  }

  ngOnInit() {
    this.userName = this.cookieService.get('userName');
    this.authToken = this.cookieService.get('authToken');
    this.userId = this.cookieService.get('userId')
    this.userInfo = this.userManagementService.getUserInfoFromLocalStorage();
    this.checkStatus();
    this.currentIssueId = this._route.snapshot.paramMap.get('id');
    this.issueService.getSingleIssue(this.currentIssueId).subscribe((apiResponse) => {
      if (apiResponse.status === 200) {
        //console.log(apiResponse);
        this.currentIssue = apiResponse.data;
      }
      else {
        this.toastrService.error(apiResponse.message)
      }
    },
      (err) => {
        this.toastrService.error(err.message);
      }
    );
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


  updateIssue() {
    if (!this.currentIssue.title) {
      this.toastrService.warning("Enter title!")
    }
    else if (this.currentIssue.title.trim().length == 0) {
      this.toastrService.warning("Enter description!")
    }
    else if (!this.currentIssue.description) {
      this.toastrService.warning("Enter description!")
    }
    else if (!this.status) {
      this.toastrService.warning("Select a status!")
    }
    else if (this.selectedFile) {

      const issueData = new FormData();
      issueData.append("title", this.currentIssue.title);
      issueData.append("description", this.currentIssue.description);
      issueData.append("status", this.status);
      //console.log(issueData.getAll)
      //console.log()
      if (!this.validImage) {
        if (confirm("Your file is invalid. It will not get updated. Do you want to continue?")) {
          issueData.append("screenshot", this.currentIssue.screenshot);
          this.update(issueData);
        }
      }
      else {
        issueData.append("image", this.selectedFile, 'image');
        this.update(issueData)
      }
    }
    else {
      const issueData = new FormData();
      issueData.append("title", this.currentIssue.title);
      issueData.append("description", this.currentIssue.description);
      issueData.append("status", this.status);
      issueData.append("screenshot", this.currentIssue.screenshot);
      this.update(issueData);
    }
  }

  update = (issueData) => {
    this.issueService.updateIssue(this.currentIssueId, issueData).subscribe((apiResponse) => {
      if (apiResponse.status === 200) {
        this.toastrService.show("Issue updated.");
        this.viewAllIssues()
      }
      else {
        this.toastrService.error(apiResponse.message)
      }
    },
      err => {
        this.toastrService.error("Some Error Occured.")
      })
  }

  public viewAllIssues = () => {
    this.router.navigate(['viewAll'])
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
        this.toastrService.error(err.message);
      })
  }

}
