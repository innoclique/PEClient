import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
//import { ChartsModule } from 'ng2-charts/valor-software-ng2-charts';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { MainDashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { EmployessModule } from '../../employess/employess.module';
import {EmployeeDashboardComponent} from '../../employess/dashboard/dashboard.component'
import { CommonModule } from "@angular/common";
import { EvaluationadminModule } from "../evaluationadmin/evaluationadmin.module";
import { EadashboardComponent } from "../evaluationadmin/eadashboard/eadashboard.component";
import { EmpmanagerModule } from "../empmanager/empmanager.module";
import { ManagerDashboardComponent } from "../empmanager/manager-dashboard/manager-dashboard.component";
import { ThirdSignatoryModule } from "../third-signatory/third-signatory.module";
import { ThirdSignDashboardComponent } from "../third-signatory/dashboard/dashboard.component";
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DashboardRoutingModule,
    //ChartsModule,
    BsDropdownModule,
    ButtonsModule.forRoot(),
    EmployessModule,
    EvaluationadminModule,
    EmpmanagerModule,
    ThirdSignatoryModule
  ],
  declarations: [ MainDashboardComponent ],
  exports:[ThirdSignDashboardComponent,EmployeeDashboardComponent,EadashboardComponent,ManagerDashboardComponent]
})
export class DashboardModule { }
