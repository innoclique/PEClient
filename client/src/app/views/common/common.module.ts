import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CSCComponent } from './csc/csc.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SetupEmployeeComponent } from './setup-employee/setup-employee.component';
import { AgGridModule } from 'ag-grid-angular';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CreateEmployeeComponent } from './create-employee/create-employee.component';



@NgModule({
  declarations: [ CSCComponent, SetupEmployeeComponent, CreateEmployeeComponent ],
  imports: [
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    TooltipModule.forRoot(),
    MatInputModule,
    AgGridModule.withComponents([]),
    ModalModule.forRoot()
  ],
  exports:[CSCComponent]
})
export class EvalCommonModule { }