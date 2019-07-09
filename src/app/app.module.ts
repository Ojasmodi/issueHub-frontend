import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { LoginComponent } from './user-module/login/login.component';
import { CookieService } from 'ngx-cookie-service';
import { UserModuleModule } from './user-module/user-module.module';
import { IssueModuleModule } from './issue-module/issue-module.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,NgxSpinnerModule,
    HttpClientModule, UserModuleModule,IssueModuleModule,
    RouterModule.forRoot([
      { path: 'login', component: LoginComponent, pathMatch: 'full' },
      { path: '*', component: LoginComponent },
      { path: '**', component: LoginComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ]),
    BrowserAnimationsModule
  ],
  providers: [ CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { 
  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        (<any>window).ga('set', 'page', event.urlAfterRedirects);
        (<any>window).ga('send', 'pageview');
      }
    })
  }
}
