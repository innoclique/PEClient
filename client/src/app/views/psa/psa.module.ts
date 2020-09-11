import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {ClientSetupComponent} from './client-setup/client-setup.component'
import { CustomMaterialModule } from '../../custom-material/custom-material.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
export const projectRoutes: Routes = [

  
  {path:'',redirectTo:'clientsetup'},
  { path: 'clientsetup', component: ClientSetupComponent }
  
  
];

@NgModule({
  declarations: [ClientSetupComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CustomMaterialModule,
    RouterModule.forChild(projectRoutes),
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
