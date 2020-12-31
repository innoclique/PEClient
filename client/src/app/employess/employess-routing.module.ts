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

import { EmployeeDashboardComponent } from './dashboard/dashboard.component';


import {KpiReviewComponent} from './kpi-review/kpi-review.component';
import {KpiReviewListComponent} from './kpi-review-list/kpi-review-list.component'
import { ViewComponent } from '../views/final-rating/view/view.component';
import { PeerReviewListComponent } from '../peer-review/peer-review-list/peer-review-list.component';
import { DoPeerReviewComponent } from '../peer-review/do-peer-review/do-peer-review.component';
import { ReviewEvaluationComponent } from './review-evaluation/review-evaluation.component';
import { ReviewEvaluationListComponent } from './review-evaluation-list/review-evaluation-list.component';
import { DrReviewListComponent } from '../drreview/dr-review-list/dr-review-list.component';
import { DoDrReviewComponent } from '../drreview/do-dr-review/do-dr-review.component';
import { ReviewPerfGoalsListComponent } from './review-perf-goals-list/review-perf-goals-list.component';
import { ReviewPerfGoalsComponent } from './review-perf-goals/review-perf-goals.component';
import { ReviewActionPlanListComponent } from './review-action-plan-list/review-action-plan-list.component';
import { ReviewActionPlanComponent } from './review-action-plan/review-action-plan.component';
import { AccomplishmentsListComponent } from './accomplishments/accomplishments-list/accomplishments-list.component';
import { ReviewAccompListComponent } from './review-accomp-list/review-accomp-list.component';
import { ReviewAccomplishmentsComponent } from './review-accomplishments/review-accomplishments.component';
import { PrivateNotesComponent } from './private-notes/private-notes.component';
import { PrivateNotesListComponent } from './private-notes-list/private-notes-list.component';
import { SnGuardService } from '../services/sn-guard.service';
import { CurrentEvaluationReportComponent } from './reports/current-evaluation/current-evaluation-report.component';



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
        canActivate: [SnGuardService] ,
        data: {
          title: 'KPI Setting'
        }
      },

      {
        path: 'kpi-setup',
        component: KpiSetupComponent,
        canActivate: [SnGuardService] ,
        data: {
          title: 'KPI Setup'
        }

      },
      {
        path:'dashboard',
        component:EmployeeDashboardComponent,
        data:{title:'Dashboard'}
      }, {
        path:'action-plan',
        component:ActionPlanComponent,
        canActivate: [SnGuardService] ,
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
        path:'accomplishments-list',
        component:AccomplishmentsListComponent,
        canActivate: [SnGuardService] ,
        data:{title:'Accomplishments'}
      },
      {
        path:'private-notes',
        component:PrivateNotesComponent,
        data:{title:'Private Notes'}
      },
      {
        path:'private-notes-list',
        component:PrivateNotesListComponent,
        data:{title:'Private Notes List'}
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
      }, 
       {
        path:'reports/current-evaluation',
        component:CurrentEvaluationReportComponent,
        data:{title:'Evaluation Report'}
      }, 
      {
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
        path: 'review-action-plan',
        component: ReviewActionPlanComponent,
        data: {
          title: 'KPI Review'
        }
      },
      {
        path: 'review-action-plan-list',
        component: ReviewActionPlanListComponent,
        data: {
          title: 'Action Plan Review'
        }
      },
      {
        path: 'review-perf-goals-list',
        component: ReviewPerfGoalsListComponent,
        data: {
          title: 'Performance Goals Review'
        }
      },

      {
        path: 'review-accomplishments',
        component: ReviewAccomplishmentsComponent,
        data: {
          title: 'Accomplishments Review'
        }
      },
      {
        path: 'review-accomplishments-list',
        component: ReviewAccompListComponent,
        data: {
          title: 'Accomplishments Review'
        }
      },

      
      {
        path: 'review-perf-goals',
        component: ReviewPerfGoalsComponent,
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
