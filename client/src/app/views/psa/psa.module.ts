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

export const projectRoutes: Routes = [
  
  {path: '',
  data: {
    title: 'Clients'
  },
  children: [
    {
      path: '',
      redirectTo: 'list'
    },
    { path: 'list', component: ClientSetupComponent,data: {
      title: 'View All'
    }},
    {
      path:'client-setup',
      component:CreateClientComponent,
      data:{title:'Create'}
    }
  
  ]
},
  
];

@NgModule({
  declarations: [ClientSetupComponent, CreateClientComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CustomMaterialModule,
    RouterModule.forChild(projectRoutes),
    AgGridModule.withComponents([]),
    ModalModule.forRoot(),
    EvalCommonModule
  ]
})
export class PSAModule {
  /**
   *
   */
  constructor() {
    console.log('came')

  }
 }
