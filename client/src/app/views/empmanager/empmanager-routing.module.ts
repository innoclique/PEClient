import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { KpiAddComponent } from './kpi-add/kpi-add.component';
import { KpiReviewListComponent } from './kpi-review-list/kpi-review-list.component';
import { KpiReviewComponent } from './kpi-review/kpi-review.component';
import { ManagerDashboardComponent } from './manager-dashboard/manager-dashboard.component';
import { RequestRatingComponent } from './request-rating/request-rating.component';

const routes: Routes = [
  {
    path: '',
    data: {
      title: 'Manager'
    },
    children: [
      {
        path: '',
        redirectTo: 'dashboard'
      },

      {
        path:'dashboard',
        component:ManagerDashboardComponent,
        data:{title:'Dashboard'}
      },
     
      {
        path: 'review-kpi-list',
        component: KpiReviewListComponent,
        data: {
          title: 'KPI Review'
        }
      },
      {
        path: 'add-kpi',
        component: KpiAddComponent,
        data: {
          title: 'Add KPI'
        }
      },

      {
        path: 'kpi-review',
        component: KpiReviewComponent,
        data: {
          title: 'Review'
        }
      },
      {
        path: 'request-rating',
        component: RequestRatingComponent,
        data: { title: 'Request Rating' }
      }
    

     

     
    ]
}

]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmpmanagerRoutingModule { }
