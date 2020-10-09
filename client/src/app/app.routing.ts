import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// Import Containers
import { DefaultLayoutComponent } from './containers';
import { P404Component } from './views/error/404.component';
import { P500Component } from './views/error/500.component';
// import { LoginComponent } from './views/login/login.component';
import { RegisterComponent } from './views/register/register.component';
import { ForgotPasswordComponent } from './shared/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './shared/reset-password/reset-password.component';
import { LoginComponent } from './shared/login/login.component';
import {LogoutComponent} from './shared/logout/logout.component'
import { AuthGuardService } from './services/auth-guard.service';

export const routes: Routes = [
  // { path: '', component: AppComponent, data: { title: 'First Component' } },
  // { path: 'login', component: LoginComponent, data: { title: 'Second Component' }},
  { path: 'forgotPassword', component: ForgotPasswordComponent, data: { title: '' }},
  { path: 'resetPassword', component: ResetPasswordComponent, data: { title: '' }},
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '404',
    component: P404Component,
    data: {
      title: 'Page 404'
    }
  },
  {
    path: '500',
    component: P500Component,
    data: {
      title: 'Page 500'
    }
  },
  {
    path: 'login',
    component: LoginComponent,
    data: {
      title: 'Login Page'
    }
  },
  {
    path: 'logout',
    component: LogoutComponent,
    data: {
      title: 'Logout Page'
    }
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: {
      title: 'Register Page'
    }
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivate: [AuthGuardService] ,
    data: {
      title: 'Home'
    },
    children: [
      // {
      //   path: 'base',
      //   loadChildren: () => import('./views/base/base.module').then(m => m.BaseModule)
      // },
      // {
      //   path: 'buttons',
      //   loadChildren: () => import('./views/buttons/buttons.module').then(m => m.ButtonsModule)
      // },
      // {
      //   path: 'charts',
      //   loadChildren: () => import('./views/chartjs/chartjs.module').then(m => m.ChartJSModule)
      // },
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'employee',
        loadChildren: () => import('./employess/employess.module').then(m => m.EmployessModule)
      },

      {
        path: 'em',
        loadChildren: () => import('./views/empmanager/empmanager.module').then(m => m.EmpmanagerModule)
      },
      {
        path: 'ea',
        loadChildren: () => import('./views/evaluationadmin/evaluationadmin.module').then(m => m.EvaluationadminModule)
      },
      {
        path: 'psa',
        data: {
          title: 'Clients'
        },
        loadChildren:()=>import('./views/psa/psa.module').then(m=>m.PSAModule),
        
      },
      {
        path: 'rsa',
        data: {
          title: 'Clients'
        },
        loadChildren:()=>import('./views/rsa/rsa.module').then(m=>m.RsaModule),
        
      }
    ]
  },
  // { path: '**', component: P404Component }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
