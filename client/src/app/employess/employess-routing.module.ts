import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccomplishmentsComponent } from './accomplishments/accomplishments.component';
import { ActionPlanComponent } from './action-plan/action-plan.component';
import { CreateGoalsComponent } from './create-goals/create-goals.component';
import { CurrentEvaluationComponent } from './current-evaluation/current-evaluation.component';
import { GoalsComponent } from './goals/goals.component';
import { KpiSettingsComponent } from './kpi-settings/kpi-settings.component';
import { KpiSetupComponent } from './kpi-setup/kpi-setup.component';
import { ProfileComponent } from './profile/profile.component';
import { ReportsComponent } from './reports/reports.component';
import { StrengthsComponent } from './strengths/strengths.component';

import { DashboardComponent } from './dashboard/dashboard.component';


import {KpiReviewComponent} from './kpi-review/kpi-review.component';
import {KpiReviewListComponent} from './kpi-review-list/kpi-review-list.component'
import { ViewComponent } from '../views/final-rating/view/view.component';
import { PeerReviewListComponent } from '../peer-review/peer-review-list/peer-review-list.component';
import { DoPeerReviewComponent } from '../peer-review/do-peer-review/do-peer-review.component';
import { ReviewEvaluationComponent } from './review-evaluation/review-evaluation.component';
import { ReviewEvaluationListComponent } from './review-evaluation-list/review-evaluation-list.component';
import { DrReviewListComponent } from '../drreview/dr-review-list/dr-review-list.component';
import { DoDrReviewComponent } from '../drreview/do-dr-review/do-dr-review.component';



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
      {
        path:'dashboard',
        component:DashboardComponent,
        data:{title:'Dashboard'}
      }, {
        path:'action-plan',
        component:ActionPlanComponent,
        data:{title:'Action-Plan'}
      },
      {
        path:'dev-goal',
        //  component:GoalsComponent,
        component:CreateGoalsComponent,
        data:{title:'Goals'}
      },

      {
        path:'strengths',
        component:StrengthsComponent,
        data:{title:'Strengths'}
      },
      
      {
        path:'current-evaluation',
        component:CurrentEvaluationComponent,
        data:{title:'Current-Evaluation'}
      },
      {
        path:'accomplishments',
        component:AccomplishmentsComponent,
        data:{title:'Accomplishments'}
      },
      {
        path:'peerreview',
        component:PeerReviewListComponent,
        data:{title:'Accomplishments'}
      },
      {
        path:'drreview',
        component:DrReviewListComponent,
        data:{title:'DirectReport Review'}
      },
      {
        path:'submitpeerreview',
        component:DoPeerReviewComponent,
        data:{title:'Accomplishments'}
      },
      {
        path:'submitdrreview',
        component:DoDrReviewComponent,
        data:{title:'Accomplishments'}
      },
      
      {
        path:'reports',
        component:ReportsComponent,
        data:{title:'Reports'}
      }, {
        path:'profile',
        component:ProfileComponent,
        data:{title:'Profile'}
      },
      {
        path: 'kpi-review',
        component: KpiReviewComponent,
        data: {
          title: 'Review'
        }
      },
      {
        path: 'review-kpi-list',
        component: KpiReviewListComponent,
        data: {
          title: 'KPI Review'
        }
      },
      {
        path: 'review-evaluation',
        component: ReviewEvaluationComponent,
        data: {
          title: 'KPI Review'
        }
      },
      {
        path: 'review-evaluation-list',
        component: ReviewEvaluationListComponent,
        data: {
          title: 'KPI Review'
        }
      }
      

     
    ]
}

]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployessRoutingModule {


}
