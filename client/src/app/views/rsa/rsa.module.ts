import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SetupclientComponent } from './setupclient/setupclient.component';
import { AppsettingsComponent } from './appsettings/appsettings.component';
import { EvaluationsettingsComponent } from './evaluationsettings/evaluationsettings.component';
import { RouterModule, Routes } from '@angular/router';
import { ReportsComponent } from './reports/reports.component';
import { SetupModelComponent } from './setup-model/setup-model.component';
import { QuestionsModule } from '../questions/questions.module';


export const rsaRoutes: Routes = [
  
  {path: '',
  data: {
    title: 'Dashboard'
  },
  children: [
    {
      path: 'dashboard',
      component:DashboardComponent
    },
    // { path: 'list', component: cli,data: {
    //   title: 'View All'
    // }},
    {
      path:'setup-clients',
      component:SetupclientComponent,
      data:{title:'Create'}
    },
    {
      path:'app-settings',
      component:AppsettingsComponent,
      data:{title:'Create'}
    },
    {
      path:'evaluation-settings',
      component:EvaluationsettingsComponent,
      data:{title:'Create'}
    },
    {
      path:'reports',
      component:ReportsComponent,
      data:{title:'Reports'}
    },
  {path:'setup-model',
component:SetupModelComponent,
data:{title:'Model'}
}
  
  ]
},
  
];

@NgModule({
  declarations: [DashboardComponent, SetupclientComponent, AppsettingsComponent, EvaluationsettingsComponent, ReportsComponent, SetupModelComponent],
  imports: [
    CommonModule,
    QuestionsModule,
    RouterModule.forChild(rsaRoutes)
  ]
})
export class RsaModule { }
