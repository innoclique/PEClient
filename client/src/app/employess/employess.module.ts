import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

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

@NgModule({
  declarations: [KpiSettingsComponent,DateAgoPipe, KpiSetupComponent,ReportsComponent,ProfileComponent,
     AccomplishmentsComponent, CurrentEvaluationComponent, ActionPlanComponent,DashboardComponent],
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
    EvalCommonModule,
    AgGridModule.withComponents([]),
    ModalModule.forRoot()
  ],
  exports: [
    ModalModule
]
})
export class EmployessModule { }
