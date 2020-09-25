import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateEmployeeComponent } from '../views/common/create-employee/create-employee.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';



const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Employees'
    },
    children: [
      {
        path: '',
        redirectTo: 'setup'
      },
      {
        path: 'setup',
        component: EmployeeListComponent,
        data: {
          title: 'Setup'
        }
      },

      {
        path: 'create',
        component: CreateEmployeeComponent,
        data: {
          title: 'Create'
        }
      },
    ]
}

]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployessRoutingModule {


}
