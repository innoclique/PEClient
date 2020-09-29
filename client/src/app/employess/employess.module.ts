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



@NgModule({
  declarations: [KpiSettingsComponent],
  imports: [
    CommonModule,
    EmployessRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
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
