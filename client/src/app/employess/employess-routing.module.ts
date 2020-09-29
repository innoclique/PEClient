import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { KpiSettingsComponent } from './kpi-settings/kpi-settings.component';



const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Employee'
    },
    children: [
      {
        path: '',
        redirectTo: 'kpi-setting'
      },
     
      {
        path: 'kpi-setting',
        component: KpiSettingsComponent,
        data: {
          title: 'KPI Setting'
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
