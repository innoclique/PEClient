import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployessRoutingModule } from './employess-routing.module';
import { CreateEmployeeComponent } from './create-employee/create-employee.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AgGridModule } from 'ag-grid-angular';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { CountryStateCityComponent } from './country-state-city/country-state-city.component';
import { MatDatepickerModule } from '@angular/material/datepicker';



@NgModule({
  declarations: [CreateEmployeeComponent, EmployeeListComponent, CountryStateCityComponent],
  imports: [
    CommonModule,
    EmployessRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,    
    MatAutocompleteModule,
    MatDatepickerModule,
      MatInputModule,
      HttpClientModule,
            FormsModule,
    RouterModule,
    AgGridModule.withComponents([]),
    ModalModule.forRoot()
  ],
  exports: [
    ModalModule
]
})
export class EmployessModule { }
