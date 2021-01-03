import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SetupclientComponent } from './setupclient/setupclient.component';
import { AppsettingsComponent } from './appsettings/appsettings.component';
import { EvaluationsettingsComponent } from './evaluationsettings/evaluationsettings.component';
import { RouterModule, Routes } from '@angular/router';
import { ReportsComponent } from './reports/reports.component';
import { SetupModelComponent } from './setup-model/setup-model.component';
import { QuestionsModule } from '../questions/questions.module';
import { ChartsModule } from "ng2-charts";
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { CustomMaterialModule } from '../../custom-material/custom-material.module';
import { EvalCommonModule } from '../common/common.module';
import { projectRoutes } from '../psa/psa.module';
import { ClientListComponent } from './client-list/client-list.component';
import { DashboardChartsModule } from "../charts/charts.module";
import {  ClientSummaryComponent } from "../charts/client-summary/client-summary.component";
import { ClientPurchaseHistory } from './reports/purchaseHistory/client/clientPurchaseHIstory';

import { CSAModule } from "../csa/csa.module";
import { PaymentComponent } from "../csa/payment/payment.component";
import { AdhocPaymentComponent } from "../csa/adhoc-payment/adhoc-payment.component";
import { PaymentHistoryComponent } from "../common/payment-history/payment-history.component";
import { PaymentGatewayComponent } from "../csa/payment-gateway/payment-gateway.component";

export const rsaRoutes: Routes = [

  {
    path: '',
    data: {
      title: 'Dashboard'
    },
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path:'setup-clients/:id',
        component:SetupclientComponent,
        data:{title:'Update'}
      },
      {
        path: 'client-list', component: ClientListComponent,
        data: {
          title: 'View All'
        }
      },
      { path: 'list', component: ClientListComponent,data: {
        title: 'View All'
      }},  
      {
        path: 'setup-clients',
        component: SetupclientComponent,
        data: { title: 'Create' }
      },
      {
        path: 'app-settings',
        component: AppsettingsComponent,
        data: { title: 'Create' }
      },
      {
        path: 'evaluation-settings',
        component: EvaluationsettingsComponent,
        data: { title: 'Create' }
      },
      {
        path: 'reports',
        component: ReportsComponent,
        data: { title: 'Reports' }
      },
       {
        path: 'reports/client-purchase-history/:clientId',
        component: ClientPurchaseHistory,
        data: { title: 'RSA Client Purchase History' }
      },
      {
        path: 'setup-model',
        component: SetupModelComponent,
        data: { title: 'Model' }
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
        path: 'dopayment',
        component: PaymentGatewayComponent,
        data: { title: 'Payment Gateway' }
      },

    ]
  },

];

@NgModule({
  declarations: [
    DashboardComponent, SetupclientComponent, AppsettingsComponent, 
    EvaluationsettingsComponent, ReportsComponent, SetupModelComponent, 
    ClientPurchaseHistory, ClientListComponent,],
  imports: [
    CommonModule,
    CSAModule,
    RouterModule.forChild(rsaRoutes),
    ChartsModule,
    MatCardModule,
    MatGridListModule,
    FormsModule,
    ReactiveFormsModule,
    CustomMaterialModule,

    AgGridModule.withComponents([]),
    ModalModule.forRoot(),
    EvalCommonModule,
    TabsModule,
    DashboardChartsModule
  ],
  exports:[ClientSummaryComponent,]
})
export class RsaModule { }
