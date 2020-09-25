import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CSCComponent } from './csc/csc.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CreateEmployeeComponent } from './create-employee/create-employee.component';



@NgModule({
  declarations: [CreateEmployeeComponent, CSCComponent ],
  imports: [
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
  ],
  exports:[CSCComponent]
})
export class EvalCommonModule { }
