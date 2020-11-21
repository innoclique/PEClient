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
    
  ]
},
  
];

@NgModule({
  declarations: [
    NumberDirective,
    DashboardComponent,
    
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
    FlashMessagesModule.forRoot()
  ]
})
export class CSAModule {
  /**
   *
   */
  constructor() {
    console.log('came')

  }
 }
