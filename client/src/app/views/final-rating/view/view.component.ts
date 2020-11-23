import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TranslateService } from '@ngx-translate/core';

import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../../../services/notification.service';
import { PerfAppService } from '../../../services/perf-app.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {
  
  loginUser: any;
  public empKPIData: any[] = []
  kpiDetails: any={};
  currentKpiId: any;
  selIndex: number;
  weight: number;
  kpiForm: FormGroup;
  competencyList:any=[];
  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService,
    private fb: FormBuilder,) {
    this.loginUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.initKPIForm()
    this.getTabsData();
  }
  public columnDefs = [
    {
      headerName: 'Name', field: 'Name', width: 320, sortable: true, filter: true,
      cellRenderer: (data) => {
        return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
      }
    },
    { headerName: 'No.of  Performance Goals', field: 'KpiCount', sortable: true, filter: true },
    // { headerName: 'Score (self)', field: 'Score', width: 150, sortable: true, filter: true },
    // { headerName: 'Status', field: 'Status', width: 150, sortable: true, filter: true },
    // { headerName: 'Performance Goal Submited', field: 'IsSubmitedKPIs', width: 150, sortable: true, filter: true },
    {
      headerName: 'Action', field: '', width: 200, autoHeight: true, suppressSizeToFit: true,
      cellRenderer: (data) => {
        return `<i class="icon-plus font-1xl" style="cursor:pointer ;padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="addKPI" title="Add Performance Goal"></i>       
        `


      }
    }
  ];

  /**To GET ALL  tabs data */
  getTabsData() {
    forkJoin(
      this.getTSKPIs().pipe(catchError(error => of({ error: error, isError: true })))
    ).subscribe(([res1]) => {
        
        if (res1 && !res1.isError) {
          this.setWeighting(res1.filter(item => item.IsDraft === false).length);
          if (res1 && res1.length > 0) {
            this.empKPIData = res1;
            debugger
            this.kpiDetails = this.empKPIData[0];//.filter(e => e._id == this.currentKpiId)[0];
            this.selIndex = 0;//this.empKPIData.findIndex(e => e._id == this.currentKpiId);
            this.initKPIForm();
          }
        }
      });
  }

  getTSKPIs() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetKpisForTS",
      this.perfApp.requestBody = { TsId: this.loginUser._id }
    return this.perfApp.CallAPI()
  }
  getCompetencyQuestionsList() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetCompetencyValues",
      this.perfApp.requestBody = { EvaluationId: this.loginUser._id,employeeId:this.loginUser._id }
    return this.perfApp.CallAPI()
  }

  setWeighting(length: any) {
    this.weight = length == 0 ? 100 : Math.round(100 / length);
    this.kpiForm.patchValue({ Weighting: this.weight });
  }
  initKPIForm() {
    debugger;    
    this.kpiForm = this.fb.group({
      MeasurementCriteria: [this.kpiDetails.MeasurementCriteria? 
        (this.kpiDetails.MeasurementCriteria[0]? this.kpiDetails.MeasurementCriteria[0].measureId.Name : ''):'',       
      ],

      Kpi: [this.kpiDetails.Kpi ],
      TargetCompletionDate: [this.kpiDetails.TargetCompletionDate ? new Date(this.kpiDetails.TargetCompletionDate) : '', []],
      YearEndComments: [this.kpiDetails.YearEndComments ? this.kpiDetails.YearEndComments : ''],
      YECommManager: [this.kpiDetails.YECommManager ? this.kpiDetails.YECommManager : ''],
      Weighting: [this.kpiDetails.Weighting ? this.kpiDetails.Weighting : ""],
      Signoff: [this.loginUser.FirstName],
      CoachingReminder: [this.kpiDetails.CoachingReminder ? this.kpiDetails.CoachingReminder :this.loginUser.Organization.CoachingReminder],

      IsSubmit: ['false'],
      IsDraft: [''],
      Score: [this.kpiDetails.Score ? this.kpiDetails.Score : ''],
      ManagerScore: [this.kpiDetails.ManagerScore ? this.kpiDetails.ManagerScore : ''],
      IsActive: [this.kpiDetails.IsActive+'' ],
      ManagerFTSubmitedOn: [this.kpiDetails.ManagerFTSubmitedOn ],
      Status: [this.kpiDetails.Status ? this.kpiDetails.Status : ''],
    });


  }

  nextKpi(){
    this.selIndex=this.selIndex+1;
     this.kpiDetails=  this.empKPIData[this.selIndex];
     this.initKPIForm()
     this.currentKpiId=this.kpiDetails._id;
   }
 
   priKpi(){ 
     this.selIndex=this.selIndex-1;
     this.kpiDetails=  this.empKPIData[this.selIndex];
     this.initKPIForm()
     this.currentKpiId=this.kpiDetails._id;
   }
}
