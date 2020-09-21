import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {ClientSetupComponent} from './client-setup/client-setup.component'
import { CustomMaterialModule } from '../../custom-material/custom-material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { ModalModule } from 'ngx-bootstrap/modal';

export const projectRoutes: Routes = [
  
  {path: '',
  data: {
    title: 'Clients'
  },
  children: [
    {
      path: '',
      redirectTo: 'clientsetup'
    },
    { path: 'clientsetup', component: ClientSetupComponent,data: {
      title: 'View All'
    }
  }
  ]
},
  
];

@NgModule({
  declarations: [ClientSetupComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CustomMaterialModule,
    RouterModule.forChild(projectRoutes),
    AgGridModule.withComponents([]),
    ModalModule.forRoot()
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
