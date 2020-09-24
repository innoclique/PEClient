import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RollevaluationComponent } from './rollevaluation/rollevaluation.component';
import { RouterModule, Routes } from '@angular/router';
import { EmployessModule } from '../../employess/employess.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomMaterialModule } from '../../custom-material/custom-material.module';
import { CreateEmployeeComponent } from '../common/create-employee/create-employee.component';
import { EadashboardComponent } from './eadashboard/eadashboard.component';
import { EvalCommonModule } from '../common/common.module';
import { AgGridModule } from 'ag-grid-angular';
import { ModalModule } from 'ngx-bootstrap/modal';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Evaluation'
    },
    children: [
      {
        path: '',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        component: EadashboardComponent,
        data: {
          title: 'Dashboard'
        }
      },
      {
        path: 'create-employee',
        component: CreateEmployeeComponent,
        data: {
          title: 'Create Employee'
        }
      },
      {
        path: 'rollout',
        component: RollevaluationComponent,
        data: {
          title: 'Rollout'
        }
      },
    ]
}

]

@NgModule({
  declarations: [RollevaluationComponent,EadashboardComponent],
  imports: [
    CommonModule,
    EvalCommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    CustomMaterialModule,
    AgGridModule.withComponents([]),
    ModalModule.forRoot()
  ]
})
export class EvaluationadminModule { 
  /**
   *
   */
  constructor() {
    console.log('came into eval module')
    
  }
}
