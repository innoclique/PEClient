import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CSCComponent } from './csc/csc.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SetupEmployeeComponent } from './setup-employee/setup-employee.component';
import { AgGridModule } from 'ag-grid-angular';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CreateEmployeeComponent } from './create-employee/create-employee.component';
import { CustomMaterialModule } from '../../custom-material/custom-material.module';
import { PaymentHistoryComponent } from './payment-history/payment-history.component';
import { PriceListComponent } from './price-list/price-list.component';
import { PaymentComponent } from './payment/payment.component';
import { AdhocPaymentComponent } from './adhoc-payment/adhoc-payment.component';
import { PaymentGatewayComponent } from './payment-gateway/payment-gateway.component';



@NgModule({
  declarations: [ CSCComponent, SetupEmployeeComponent, CreateEmployeeComponent, 
    PaymentHistoryComponent, PriceListComponent,PaymentComponent, 
    AdhocPaymentComponent, PaymentGatewayComponent ],
  imports: [
    CommonModule,
    FormsModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    TooltipModule.forRoot(),
    MatInputModule,
    CustomMaterialModule,
    AgGridModule.withComponents([]),
    ModalModule.forRoot(),
    TabsModule
  ],
  exports:[CSCComponent]
})
export class EvalCommonModule { }
