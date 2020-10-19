import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RollevaluationComponent } from './rollevaluation/rollevaluation.component';
import { RouterModule, Routes } from '@angular/router';
import { EmployessModule } from '../../employess/employess.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomMaterialModule } from '../../custom-material/custom-material.module';

import { EadashboardComponent } from './eadashboard/eadashboard.component';
import { EvalCommonModule } from '../common/common.module';
import { AgGridModule } from 'ag-grid-angular';
import { ModalModule } from 'ngx-bootstrap/modal';
import { EvaluationslistComponent } from './evaluationslist/evaluationslist.component';
import { SetupEmployeeComponent } from '../common/setup-employee/setup-employee.component';
import { CreateEmployeeComponent } from '../common/create-employee/create-employee.component';
import {SetingsComponent} from '../evaluationadmin/setings/setings.component'
import{ReportsComponent} from '../evaluationadmin/reports/reports.component';
import { ProfileComponent } from './profile/profile.component'
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { SharedModule } from '../../shared/shared.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
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
        path: 'setup-employee',
        component: SetupEmployeeComponent,
        data: {
          title: 'Setup Employee'
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
      {
        path: 'rollout/:id',
        component: RollevaluationComponent,
        data: {
          title: 'Rollout'
        }
      },
      {
        path: 'evaluation-list',
        component: EvaluationslistComponent,
        data: {
          title: 'Evaluation'
        }
      },
      {
        path: 'settings',
        component: SetingsComponent,
        data: {
          title: 'Backend Settings'
        }
      },
      {
        path: 'reports',
        component: ReportsComponent,
        data: {
          title: 'Reports'
        }
      },
      {
        path: 'profile',
        component: ProfileComponent,
        data: {
          title: 'Profile'
        }
      },
    ]
}

]

@NgModule({
  declarations: [RollevaluationComponent,EadashboardComponent, EvaluationslistComponent,SetingsComponent,ReportsComponent, ProfileComponent],
  imports: [
    CommonModule,
    EvalCommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    CustomMaterialModule,
    AgGridModule.withComponents([]),
    ModalModule.forRoot(),
    TypeaheadModule.forRoot(),
    SharedModule,
    NgMultiSelectDropDownModule.forRoot()
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
