import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { KpiSettingsComponent } from './kpi-settings/kpi-settings.component';
import { KpiSetupComponent } from './kpi-setup/kpi-setup.component';



const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Employee'
    },
    children: [
      {
        path: '',
        redirectTo: 'kpi-setup'
      },
     
      {
        path: 'kpi-setting',
        component: KpiSettingsComponent,
        data: {
          title: 'KPI Setting'
        }
      },

      {
        path: 'kpi-setup',
        component: KpiSetupComponent,
        data: {
          title: 'KPI Setup'
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
