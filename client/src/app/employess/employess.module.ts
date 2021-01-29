import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { EmployessRoutingModule } from './employess-routing.module';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AgGridModule } from 'ag-grid-angular';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { EvalCommonModule } from '../views/common/common.module';
import { KpiSettingsComponent } from './kpi-settings/kpi-settings.component';
import { DateAgoPipe } from '../pipes/DateAgoPipe';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';
import { KpiSetupComponent } from './kpi-setup/kpi-setup.component';
import { ReportsComponent } from './reports/reports.component';
import { ProfileComponent } from './profile/profile.component';
import { AccomplishmentsComponent } from './accomplishments/accomplishments.component';
import { CurrentEvaluationComponent } from './current-evaluation/current-evaluation.component';
import { ActionPlanComponent } from './action-plan/action-plan.component';

import{EmployeeDashboardComponent} from '../employess/dashboard/dashboard.component'
import { SharedModule } from '../shared/shared.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { CreateGoalsComponent } from './create-goals/create-goals.component';
import { GoalsComponent } from './goals/goals.component';
import { StrengthsComponent } from './strengths/strengths.component';

import {MatGridListModule} from '@angular/material/grid-list';
import {ProgressBarModule} from "angular-progress-bar";
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list';
 


import { KpiReviewComponent } from './kpi-review/kpi-review.component';
import { KpiReviewListComponent } from './kpi-review-list/kpi-review-list.component';
// RECOMMENDED
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { CompetencyFormModule } from '../views/competency-form/competency-form.module';
import { PeerReviewModule } from '../peer-review/peer-review.module';
import { ReviewEvaluationComponent } from './review-evaluation/review-evaluation.component';
import { ReviewEvaluationListComponent } from './review-evaluation-list/review-evaluation-list.component';
import { EmpmanagerModule } from '../views/empmanager/empmanager.module';
import { DRReviewModule } from '../drreview/drreview.module';
import { ReviewPerfGoalsListComponent } from './review-perf-goals-list/review-perf-goals-list.component';
import { ReviewPerfGoalsComponent } from './review-perf-goals/review-perf-goals.component';
import { ReviewActionPlanListComponent } from './review-action-plan-list/review-action-plan-list.component';
import { ReviewActionPlanComponent } from './review-action-plan/review-action-plan.component';
import { AccomplishmentsListComponent } from './accomplishments/accomplishments-list/accomplishments-list.component';
import { ReviewAccompListComponent } from './review-accomp-list/review-accomp-list.component';
import { ReviewAccomplishmentsComponent } from './review-accomplishments/review-accomplishments.component';
import { PrivateNotesComponent } from './private-notes/private-notes.component';
import { PrivateNotesListComponent } from './private-notes-list/private-notes-list.component';
import { CurrentEvaluationReportComponent} from './reports/current-evaluation/current-evaluation-report.component';
import { CurrentEvaluationReportPdfComponent} from './reports/current-evaluation-report/current-evaluation-report-pdf.component';
import {CopiesToComponent} from './copiesTo/copies-to.component';

@NgModule({
  declarations: [KpiSettingsComponent, KpiSetupComponent,ReportsComponent,ProfileComponent,
     AccomplishmentsComponent, CurrentEvaluationComponent, 
     ActionPlanComponent,EmployeeDashboardComponent, CreateGoalsComponent, GoalsComponent, 
     StrengthsComponent,
     KpiReviewComponent,
     KpiReviewListComponent,
     ReviewEvaluationComponent,
     ReviewEvaluationListComponent,
     ReviewPerfGoalsListComponent,
     ReviewPerfGoalsComponent,
     ReviewActionPlanListComponent,
     ReviewActionPlanComponent,
     AccomplishmentsListComponent,
     ReviewAccompListComponent,
     ReviewAccomplishmentsComponent,
     PrivateNotesComponent,
     PrivateNotesListComponent,
     CurrentEvaluationReportComponent,
     CurrentEvaluationReportPdfComponent,
     CopiesToComponent
    ],
  imports: [
    CommonModule,
    EmployessRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatDatepickerModule,
    TooltipModule.forRoot(),
    MatInputModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    TabsModule,
    EvalCommonModule,
    AgGridModule.withComponents([]),
    ModalModule.forRoot(),
    SharedModule,
    EmpmanagerModule,

    MatGridListModule,
    ProgressBarModule,
    MatCardModule,
    MatListModule,

    AccordionModule.forRoot(),
    CompetencyFormModule,
    PeerReviewModule,
DRReviewModule
  ],
  exports: [
    ModalModule,
    EmployeeDashboardComponent
    
],
providers:[DatePipe]
})
export class EmployessModule { }
