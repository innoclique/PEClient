import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { Observable } from 'rxjs';
import { CompetencyBase } from '../../Models/CompetencyFormModel';
import { AuthService } from '../../services/auth.service';
import { CompetencyFormService } from '../../services/CompetencyFormService';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';

@Component({
  selector: 'app-review-action-plan',
  templateUrl: './review-action-plan.component.html',
  styleUrls: ['./review-action-plan.component.css']
})
export class ReviewActionPlanComponent implements OnInit,AfterViewInit {




  seletedTabRole:any;

  loginUser: any;
  selectedUser: any;
  
  @ViewChild('evTabset') tabset: TabsetComponent;
  currentEmpId: any;
  currentAction: any;


  constructor(private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    public translate: TranslateService  ) {


    this.activatedRoute.params.subscribe(  params => {
      
      if (params['action']) {
       this.currentEmpId = params['empId'];
       this.currentAction = params['action'];
       this.seletedTabRole = params['actor'];
  
      // this.GetEmployeeDetailsById();
       

      }
      })

      this.loginUser = this.authService.getCurrentUser();



   }

  ngOnInit(): void {
  }

  ngAfterViewInit(){
    this.goto(this.currentAction)
}


  goto(selTab){

   if (selTab=='reviewGoals') {
      this.tabset.tabs[0].active = true;
    }
    else  if (selTab=='reviewStrengths') {
      this.tabset.tabs[1].active = true;
    }
  
    
  }

}
