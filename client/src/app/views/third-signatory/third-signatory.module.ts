import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThirdSignDashboardComponent } from './dashboard/dashboard.component';
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

@NgModule({
  declarations: [ThirdSignDashboardComponent],
  imports: [
    CommonModule,
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
    AgGridModule.withComponents([]),
    ModalModule.forRoot(),
  ],
  exports:[ThirdSignDashboardComponent]
})
export class ThirdSignatoryModule { }
