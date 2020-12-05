import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule,FormsModule } from '@angular/forms';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { HttpClientModule } from '@angular/common/http';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ClientSummaryComponent } from './client-summary/client-summary.component';
import { ChartsModule } from "ng2-charts";

@NgModule({
  declarations: [ClientSummaryComponent],
  imports: [
    CommonModule,
    FormsModule,
    BsDropdownModule,
    ButtonsModule.forRoot(),
    HttpClientModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatDatepickerModule,
MatInputModule,
RouterModule,
AgGridModule,
ModalModule,
TooltipModule,
ChartsModule
  ],
  exports:[ClientSummaryComponent]
})
export class DashboardChartsModule { }
