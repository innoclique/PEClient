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

import{DashboardComponent} from '../employess/dashboard/dashboard.component'
import { SharedModule } from '../shared/shared.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { CreateGoalsComponent } from './create-goals/create-goals.component';
import { GoalsComponent } from './goals/goals.component';
import { StrengthsComponent } from './strengths/strengths.component';

@NgModule({
  declarations: [KpiSettingsComponent, KpiSetupComponent,ReportsComponent,ProfileComponent,
     AccomplishmentsComponent, CurrentEvaluationComponent, ActionPlanComponent,DashboardComponent, CreateGoalsComponent, GoalsComponent, StrengthsComponent],
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
    SharedModule
  ],
  exports: [
    ModalModule
],
providers:[DatePipe]
})
export class EmployessModule { }
