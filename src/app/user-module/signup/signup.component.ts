import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserManagementService } from 'src/app/user-management.service';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  public firstName: string;
  public lastName: string;
  public mobile: any;
  public email: string;
  public password: string;

  constructor(
    public appService: UserManagementService,
    public router: Router,
    private toastr: ToastrService,
    public cookieService: CookieService,
    private spinner: NgxSpinnerService) {
  }

  ngOnInit() {
  }

  logIn = () => {
    this.router.navigate(['/login']);
  }

  public goToSignIn: any = () => {
    this.router.navigate(['/']);
  } // end goToSignIn

  public signupFunction: any = () => {

    if (!this.firstName || this.firstName.trim().length == 0) {
      this.toastr.warning('Enter first name.')
    } else if (!this.lastName || this.lastName.trim().length == 0) {
      this.toastr.warning('Enter last name.')
    } else if (!this.mobile) {
      this.toastr.warning('Enter valid mobile.')
    } else if (!this.email || this.email.trim().length == 0) {
      this.toastr.warning('Enter email.')
    }
    else if (!this.verifyEmail(this.email)) {
      this.toastr.warning('Enter valid email.')
    }
    else if (!this.password || this.password.trim().length == 0) {
      this.toastr.warning('Enter password.')
    }
    else {
      this.spinner.show()
      const data = {
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        mobile: this.mobile,
        email: this.email.trim(),
        password: this.password.trim(),
      };
      //console.log(data);

      this.appService.signupFunction(data)
        .subscribe((apiResponse) => {

          this.spinner.hide()

          if (apiResponse.status === 200) {

            this.toastr.success('Signup successful!')

            this.goToSignIn();


          } else {

            this.toastr.error(apiResponse.message);

          }

        }, (err) => {
          this.spinner.hide()
          this.toastr.error('Some error occured.');

        });

    } // end condition

  } // end signupFunction


  public verifyEmail = (email) => {
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    if (email.match(emailRegex)) {
      return true
    } else {
      return false
    }
  }
}

