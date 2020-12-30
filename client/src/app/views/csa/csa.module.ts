import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CustomMaterialModule } from '../../custom-material/custom-material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { ModalModule } from 'ngx-bootstrap/modal';
import { EvalCommonModule } from '../common/common.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import {NumberDirective} from '../../directives/numbersonly';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChartsModule } from "ng2-charts";
import { FlashMessagesModule } from 'angular2-flash-messages';
import { AppDirectiveModule } from '../../directives/app-directive.module';
import { DashboardChartsModule } from "../charts/charts.module";
import {  ClientSummaryComponent } from "../charts/client-summary/client-summary.component";
import { CSAPaymentSummary } from "./reports/summary/payment/csaPaymentSummary.component";
import { CSAEvaluationsSummary } from "./reports/summary/evaluations/csaEvaluationSummary.component";
import { PaymentComponent } from './payment/payment.component';
import { AdhocPaymentComponent } from './adhoc-payment/adhoc-payment.component';
import { PaymentGatewayComponent } from './payment-gateway/payment-gateway.component';
import { PaymentHistoryComponent } from "../common/payment-history/payment-history.component";
import { PriceListComponent } from "../common/price-list/price-list.component";
export const projectRoutes: Routes = [
  
  {path: '',
  data: {
    title: 'Clients'
  },
  children: [
    
    {
      path: '',
      redirectTo: 'dashboard'
    },
     {
      path: 'reports/paymentSummary',
      component: CSAPaymentSummary,
      data: { title: 'Payment Summary' }
    },
    {
      path: 'price-list',
      component: PriceListComponent,
      data: { title: 'Price List' }
    },
    {
      path: 'payments',
      component: PaymentComponent,
      data: { title: 'Payment' }
    },
    {
      path: 'adhoc-payment',
      component: AdhocPaymentComponent,
      data: { title: 'Payment' }
    },
    {
      path: 'payment-history',
      component: PaymentHistoryComponent,
      data: { title: 'Payment history' }
    },
    {
      path: 'reports/evaluationsSummary',
      component: CSAEvaluationsSummary,
      data: { title: 'Evaluation Summary' }
    },
    {
      path: 'dopayment',
      component: PaymentGatewayComponent,
      data: { title: 'Payment Gateway' }
    },
    { path: 'dashboard', component: DashboardComponent,data: {
      title: 'Dashboard'
    }},
    
  ]
},
  
];

@NgModule({
  declarations: [
   
    DashboardComponent,
     CSAPaymentSummary,
    CSAEvaluationsSummary,
    PaymentComponent,
    AdhocPaymentComponent,
    PaymentGatewayComponent
    
  ],
  imports: [
    DashboardChartsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CustomMaterialModule,
    RouterModule.forChild(projectRoutes),
    AgGridModule.withComponents([]),
    ModalModule.forRoot(),
    EvalCommonModule,
    TabsModule,
    ChartsModule,
    FlashMessagesModule.forRoot(),
    AppDirectiveModule
  ],
  exports:[ClientSummaryComponent]
})
export class CSAModule {
  /**
   *
   */
  constructor() {
    console.log('came')

  }
 }
