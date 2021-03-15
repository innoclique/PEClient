import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmpmanagerRoutingModule } from './empmanager-routing.module';
import { KpiReviewListComponent } from './kpi-review-list/kpi-review-list.component';
import { KpiReviewComponent } from './kpi-review/kpi-review.component';
import { ManagerDashboardComponent } from './manager-dashboard/manager-dashboard.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { EvalCommonModule } from '../common/common.module';
import { DateAgoPipe } from '../../pipes/DateAgoPipe';
import { SharedModule } from '../../shared/shared.module';
import { KpiAddComponent } from './kpi-add/kpi-add.component';
import { DevgoalReviewComponent } from './devgoal-review/devgoal-review.component';
import { StrengthReviewComponent } from './strength-review/strength-review.component';
import { RequestRatingComponent } from './request-rating/request-rating.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { RequestRatingListComponent } from './request-rating-list/request-rating-list.component';

@NgModule({
  declarations: [KpiReviewListComponent, KpiReviewComponent, ManagerDashboardComponent, KpiAddComponent, DevgoalReviewComponent, StrengthReviewComponent, RequestRatingComponent, RequestRatingListComponent],
  imports: [
    CommonModule,
    EmpmanagerRoutingModule,

    HttpClientModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatDatepickerModule,
    NgMultiSelectDropDownModule,
    TooltipModule.forRoot(),
    MatInputModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    EvalCommonModule,
    AgGridModule.withComponents([]),
    ModalModule.forRoot(),
    SharedModule
  ],
  exports: [ManagerDashboardComponent, KpiReviewComponent, DevgoalReviewComponent, StrengthReviewComponent, RequestRatingComponent, RequestRatingListComponent]
})
export class EmpmanagerModule { }
