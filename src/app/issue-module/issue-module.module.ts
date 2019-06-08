import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ViewIssueComponent } from './view-issue/view-issue.component';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { ViewAllIssuesComponent } from './view-all-issues/view-all-issues.component';
import { QuillModule } from 'ngx-quill';
import { ImageUploaderModule } from 'ngx-image-uploader';
import { EditIssueComponent } from './edit-issue/edit-issue.component';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [DashboardComponent, ViewIssueComponent, ViewAllIssuesComponent, EditIssueComponent],
  imports: [
    CommonModule, FormsModule, BrowserAnimationsModule,
    MaterialModule, QuillModule, ImageUploaderModule, NgxSpinnerModule,
    ToastrModule.forRoot(),
    RouterModule.forChild([
      { path: 'dashboard', component: DashboardComponent },
      { path: 'view/:id', component: ViewIssueComponent },
      { path: 'edit/:id', component: EditIssueComponent },
      { path: 'viewAll', component: ViewAllIssuesComponent },
    ])
  ]
})
export class IssueModuleModule { }
