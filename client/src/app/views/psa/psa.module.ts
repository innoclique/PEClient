import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {ClientSetupComponent} from './client-setup/client-setup.component'
import { CustomMaterialModule } from '../../custom-material/custom-material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CreateClientComponent } from './create-client/create-client.component';
import { EmployessModule } from '../../employess/employess.module';
import { EvalCommonModule } from '../common/common.module';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { CreateResellerComponent } from './create-reseller/create-reseller.component';
import {NumberDirective} from '../../directives/numbersonly';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReportsComponent } from './reports/reports.component';
import { ApplicationSettingsComponent } from './application-settings/application-settings.component';
import { EvaluationSettingsComponent } from './evaluation-settings/evaluation-settings.component';
import { PaymentSettingsComponent } from './payment-settings/payment-settings.component';
import { ProfileComponent } from './profile/profile.component';
import { ChartsModule } from "ng2-charts";
import { AppDirectiveModule } from '../../directives/app-directive.module';
import { DashboardChartsModule } from "../charts/charts.module";
import {  ClientSummaryComponent } from "../charts/client-summary/client-summary.component";
import { ResellerInfoComponent} from "./reports/info/reseller/resellerInfo.component";
import {ClientInfoComponent} from "./reports/info/client/clientInfo.component";
import {ResellerRevenueInfoComponent} from "./reports/revenue/reseller/resellerRevenueInfo.component";
import {ClientRevenueInfoComponent} from "./reports/revenue/client/clientRevenueInfo.component";
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
    
    { path: 'dashboard', component: DashboardComponent,data: {
      title: 'Dashboard'
    }},
    
    { path: 'list', component: ClientSetupComponent,data: {
      title: 'View All'
    }},
    {
      path:'setup-clients/:id',
      component:CreateClientComponent,
      data:{title:'Update'}
    },
    {
      path:'setup-clients',
      component:CreateClientComponent,
      data:{title:'Create'}
    },
    {
      path:'setup-reseller/:id',
      component:CreateResellerComponent,
      data:{title:'Update'}
    },
    {
      path:'setup-reseller',
      component:CreateResellerComponent,
      data:{title:'Create'}
    }
    ,
    {
      path:'reports',
      component:ReportsComponent,
      data:{title:'Reports'}
    },
    {
      path:'reports/info/client',
      component:ClientInfoComponent,
      data:{title:'ClientInfo'}
    },
    {
      path:'reports/info/reseller',
      component:ResellerInfoComponent,
      data:{title:'ResellerInfo'}
    },
    {
      path:'reports/revenue/client',
      component:ClientRevenueInfoComponent,
      data:{title:'ClientRevenueInfo'}
    },
    {
      path:'reports/revenue/reseller',
      component:ResellerRevenueInfoComponent,
      data:{title:'ResellerRevenueInfo'}
    },
    {
      path:'application-settings',
      component:ApplicationSettingsComponent,
      data:{title:'Application-Settings'}
    },
    
    {
      path:'setup-evaluations',
      component:EvaluationSettingsComponent,
      data:{title:'Evaluation-Settings'}
    },
    {
      path:'payment-settings',
      component:PaymentSettingsComponent,
      data:{title:'Payment-Settings'}
    },
    {
      path:'profile',
      component:ProfileComponent,
      data:{title:'Profile'}
    },
  ]
},
  
];

@NgModule({
  declarations: [ClientSetupComponent, CreateClientComponent, CreateResellerComponent,
    DashboardComponent,
    ReportsComponent,
    ApplicationSettingsComponent,
    EvaluationSettingsComponent,
    PaymentSettingsComponent,
    ProfileComponent,
    ResellerInfoComponent,
    ClientInfoComponent,
    ResellerRevenueInfoComponent,
    ClientRevenueInfoComponent,
  ],
  imports: [
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
    AppDirectiveModule,
    DashboardChartsModule
  ],
  exports:[ ClientSummaryComponent]
})
export class PSAModule {
  /**
   *
   */
  constructor() {
    console.log('came')

  }
 }
