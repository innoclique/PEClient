import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployessRoutingModule } from './employess-routing.module';
import { CreateEmployeeComponent } from './create-employee/create-employee.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AgGridModule } from 'ag-grid-angular';


@NgModule({
  declarations: [CreateEmployeeComponent, EmployeeListComponent],
  imports: [
    CommonModule,
    EmployessRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,    
    RouterModule,
    AgGridModule.withComponents([]),
    ModalModule.forRoot()
  ],
  exports: [
    ModalModule
]
})
export class EmployessModule { }
