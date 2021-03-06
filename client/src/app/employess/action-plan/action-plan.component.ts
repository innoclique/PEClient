import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { GridOptions } from 'ag-grid-community';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { AlertDialog } from '../../Models/AlertDialog';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';
import { ThemeService } from '../../services/theme.service';
import { AlertComponent } from '../../shared/alert/alert.component';
import * as moment from 'moment';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-action-plan',
  templateUrl: './action-plan.component.html',
  styleUrls: ['./action-plan.component.css']
})
export class ActionPlanComponent implements OnInit {
  actionPlanGuidance:any = environment.ACTION_PLANNING_GUIDANCE_URL
  loginUser: any;
  devGoalRecords: any;
  strengthRecords: any;
  activeTabIndex:any=0;
  @ViewChild('staticTabs', { static: false }) staticTabs: TabsetComponent;
 
  
  public goalsItemColumns: GridOptions = {
    columnDefs: this.getColDef()      
  }
  public strengthItemColumns: GridOptions = {
    columnDefs: this.getStrengthColDef()      
  }

  
  currentRowItem: any;
  alert = new AlertDialog();
  unSubmitedCount=0;
  addedGoalCount=0;
  unSubmitedStrenthCount=0;
  addedStrenthCount=0;
  empEvaluationsYears:any=[];
  evaluationStartMonth;
  evaluationEndMonth;
  employeeEvaluationYear:any="";
  currentEvaluationYear:any="";
  allowActionPlan:any=false;
  currEvalId:string;
  


  constructor(private formBuilder: FormBuilder,
    private authService: AuthService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    public themeService: ThemeService,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService) {
      
      this.activatedRoute.params.subscribe(params => {
        if (params['activeTab']) {
         this.activeTabIndex = params['activeTab'];
        }
       });
    this.loginUser = this.authService.getCurrentUser();
    this.getEmployeeCurrentEvaluation();
    let evaluationStartEndMoment = this.getOrganizationStartAndEndDates();
    this.evaluationStartMonth = evaluationStartEndMoment.start.format("MMM");
    this.evaluationEndMonth = evaluationStartEndMoment.end.format("MM DD,YYYY");
    this.getEmployeeEvaluationYears();
    
    
     
    }

  ngOnInit(): void {
    
  }
  showGuidance(){
    window.location.href=this.actionPlanGuidance;
  }
  getEmployeeCurrentEvaluation() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetEmployeeCurrentEvaluation",
    this.perfApp.requestBody = {
      'empId': this.loginUser._id,
      'orgId':this.authService.getOrganization()._id
    }
    this.perfApp.CallAPI().subscribe(evaluationYear => {
      console.log("=====GetEmployeeCurrentEvaluation====");
      console.log(evaluationYear);
      this.employeeEvaluationYear=evaluationYear;
      this.currentEvaluationYear = evaluationYear;
      this.getAllDevGoalsDetails();
      this.getAllStrengthDetails();
      this.findEvaluationPgRollout();
    })
  }

  loadKpisByYear(evaluationYear){
    this.getAllDevGoalsDetails();
    this.getAllStrengthDetails();
    this.findEvaluationPgRollout();
  }

  getOrganizationStartAndEndDates(){
    let Organization = this.authService.getOrganization();
    let {StartMonth,EndMonth,EvaluationPeriod} = Organization;
    StartMonth = parseInt(StartMonth);
    let currentMoment = moment();
    let evaluationStartMoment;
    let evaluationEndMoment;
    if(EvaluationPeriod === "FiscalYear"){
      var currentMonth = parseInt(currentMoment.format('M'));
      console.log(`${currentMonth} <= ${StartMonth}`)
      if(currentMonth <= StartMonth){
        evaluationStartMoment = moment().month(StartMonth-1).startOf('month').subtract(1, 'years');
        evaluationEndMoment = moment().month(StartMonth-2).endOf('month');
        console.log(`${evaluationStartMoment.format("MM DD,YYYY")} = ${evaluationEndMoment.format("MM DD,YYYY")}`);
      }else{
        evaluationStartMoment = moment().month(StartMonth-1).startOf('month');
        evaluationEndMoment = moment().month(StartMonth-2).endOf('month').add(1, 'years');
        console.log(`${evaluationStartMoment.format("MM DD,YYYY")} = ${evaluationEndMoment.format("MM DD,YYYY")}`);
      }
    }else if(EvaluationPeriod === "CalendarYear"){
      evaluationStartMoment = moment().month(0).startOf('month');
      evaluationEndMoment = moment().month(11).endOf('month');
    }
    return {
      start:evaluationStartMoment,
      end:evaluationEndMoment
    }
  }

  getEmployeeEvaluationYears() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetEmployeeEvaluationYears",
    this.perfApp.requestBody = { 'empId': this.loginUser._id}
    this.perfApp.CallAPI().subscribe(evaluationYears => {
      this.empEvaluationsYears = evaluationYears;
    }, error => {
      this.snack.error(error.error.message);
    });
  }
  
  selectTab(tabId: number) {
    this.staticTabs.tabs[tabId].active = true;
  }

  
  getColDef(){
    return [
       { headerName: 'Developmental Goals',suppressSizeToFit: true,  field: 'DevGoal' , tooltipField: 'DevGoal',
       cellRenderer: (data) => {
        return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
       }
      } ,
      { headerName: 'Evaluation Type', field: 'Kpi.EvaluationId.EvaluationType' , tooltipField: 'Type of the Evaluation', minWidth:200},
       { headerName: 'Desired Outcomes', field: 'DesiredOutcomes' , tooltipField: 'DesiredOutcomes'},
       { headerName: '# of Action Steps', field: 'GoalActionItems' , tooltipField: 'GoalActionItems',
       cellRenderer: (data) => {
        return data.data.GoalActionItems?data.data.GoalActionItems.length:0
       }
      },
      { headerName: 'Draft', field: 'IsDraft',  sortable: true, filter: true ,
      cellRenderer: (data) => {
        return data.data.IsDraft?'Yes':'No'
       }
      },
       { headerName: 'Submitted', field: 'IsGoalSubmited',  sortable: true, filter: true ,
       cellRenderer: (data) => {
         return data.data.IsGoalSubmited?'Yes':'No'
        }
      },
       {
         headerName: "Review/Modify",
         suppressMenu: true,
         Sorting: false,
         
       cellRenderer: (data) => {
           if(this.currEvalId==data.data.Kpi.EvaluationId._id){
              return `<i class="icon-pencil" style="cursor:pointer ;padding: 7px 20px 0 0;
           font-size: 17px;"   data-action-type="EDG" title="Edit Goal" ></i>     
           `
           }else{
            return '';
          }
         }
       }
   
   
     ];
   }

   getStrengthColDef(){
    return [
       { headerName: 'Strength', field: 'Strength' , tooltipField: 'Strength',
       cellRenderer: (data) => {
        return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
       }
      } ,
       { headerName: 'Leverage', field: 'Leverage' , tooltipField: 'Leverage' },
       { headerName: 'Team Benefit', field: 'TeamBenifit', tooltipField: 'TeamBenifit' },
       { headerName: 'Self Benefit', field: 'SelfBenifit', tooltipField: 'SelfBenifit' },
       
      { headerName: 'Draft', field: 'IsDraft',  sortable: true, filter: true ,
      cellRenderer: (data) => {
        return data.data.IsDraft?'Yes':'No'
       }
      },
      { headerName: 'Submitted', field: 'IsStrengthSubmited',  sortable: true, filter: true ,
      cellRenderer: (data) => {
        return data.data.IsStrengthSubmited?'Yes':'No'
       }
     },
       
       {
         headerName: "Review/Modify",
         suppressMenu: true,
         Sorting: false,
         
         template: `
         
         <i class="icon-pencil" style="cursor:pointer ;padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="EDG" title="Edit Goal" ></i>     
        
                
        `
   
       }
   
   
     ];
   }

   openStrengthsForm(){
    this.router.navigate(['employee/strengths',{currentEvaluation:this.currentEvaluationYear}]);

   }

   openDevGoalForm(){
    this.router.navigate(['employee/dev-goal',{currentEvaluation:this.currentEvaluationYear}]);
   }

   
onGridReady(params) {
  params.api.sizeColumnsToFit();
 this.goalsItemColumns.api = params.api; // To access the grids API
      this.goalsItemColumns.rowHeight = 34;
}

onStrengthsGridReady(params) {
  params.api.sizeColumnsToFit();
 this.strengthItemColumns.api = params.api; // To access the grids API
      this.strengthItemColumns.rowHeight = 34;
}


onGridSizeChanged(params) {
  params.api.sizeColumnsToFit();
}

public getRowHeight = function (params) {
return 34;
};

   
getAllDevGoalsDetails() {
  this.perfApp.route = "app";
  this.perfApp.method = "GetAllDevGoals",
    this.perfApp.requestBody = { 'empId': this.loginUser._id,
    'currentOnly':true,'fetchAll':true,
    'orgId':this.authService.getOrganization()._id,
    'CreatedYear':this.employeeEvaluationYear
  }
  this.perfApp.CallAPI().subscribe(c => {

    this.unSubmitedCount=c.filter(e=>e.IsGoalSubmited==false && e.IsDraft==false ).length;
    this.addedGoalCount= c.filter(e=>e.IsDraft==false ).length;
      this.devGoalRecords=c;
    if(c && c.length > 0){
  this.currEvalId = c[0].Kpi.EvaluationId._id;
}

  }
  
  , error => {
   

    this.snack.error(error.error.message);

  }
  
  )
}



getAllStrengthDetails() {
  this.perfApp.route = "app";
  this.perfApp.method = "GetAllStrengths",
    this.perfApp.requestBody = { 'empId': this.loginUser._id,
    'currentOnly':true,'fetchAll':true,
    'orgId':this.authService.getOrganization()._id,
    'CreatedYear':this.employeeEvaluationYear
  }
  this.perfApp.CallAPI().subscribe(c => {

    this.unSubmitedStrenthCount=c.filter(e=>e.IsStrengthSubmited==false && e.IsDraft==false ).length;
    this.addedStrenthCount=c.filter(e=>e.IsDraft==false ).length;
    this.strengthRecords=c;
      this.selectTab(this.activeTabIndex);

  }
  
  , error => {
   

    this.snack.error(error.error.message);

  }
  
  )
}



public onDevGoalGridRowClick(e) {
  if (e.event.target !== undefined) {
    this.currentRowItem = e.data;

    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {

      case "VF":
        this.viewKpiForm(this.currentRowItem);
        break;
      case "EDG":
          this.editKpiForm(this.currentRowItem);
        break;

       

          case "Track":
            this.trackKpi();
        break;



      default:
    }
  }
}
trackKpi() {

   // this.trackViewRef = this.modalService.show(this.kpiTrackView, this.config);
}





editKpiForm(currentRowItem: any) {
  this.router.navigate(['employee/dev-goal',{action:'edit',id:this.currentRowItem._id,currentEvaluation:this.currentEvaluationYear}],{ skipLocationChange: true });
 }



viewKpiForm(currentRowItem: any) {
  this.router.navigate(['employee/dev-goal',{action:'view',id:this.currentRowItem._id}],{ skipLocationChange: true });
}


viewStrengthForm(currentRowItem: any) {
  this.router.navigate(['employee/strengths',{action:'view',id:this.currentRowItem._id}],{ skipLocationChange: true });
}

public onStrengthGridRowClick(e) {
  if (e.event.target !== undefined) {
    this.currentRowItem = e.data;

    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {

      case "VF":
        this.viewStrengthForm(this.currentRowItem);
        break;
      case "EDG":
          this.editStrengthForm(this.currentRowItem);
        break;

       

          case "Track":
            //this.trackKpi();
        break;



      default:
    }
  }
}




   /**To alert user for submit */
   openConfirmSubmitDialog() {

    if(this.addedGoalCount==0 || this.addedStrenthCount==0){
      this.snack.error("At least one goal, one strength must be added before submission");
      return
    }


    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to submit the action plan?";
    this.alert.ShowCancelButton = true;
    this.alert.ShowConfirmButton = true;
    this.alert.CancelButtonText = "Cancel";
    this.alert.ConfirmButtonText = "Continue";
  
  
    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = this.alert;
    dialogConfig.height = "300px";
    dialogConfig.maxWidth = '40%';
    dialogConfig.minWidth = '40%';
  
  
    var dialogRef = this.dialog.open(AlertComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(resp => {
     if (resp=='yes') {
      this.perfApp.requestBody.IgnoreEvalAdminCreated=true;
      this.submitActionPlan();
     } else {
      
     }
    })
  }

submitActionPlan() {

  this.perfApp.route = "app";
  this.perfApp.method = "SubmitActionPlanByEmp",
    this.perfApp.requestBody = { 'empId': this.loginUser._id,
    currentEvaluationYear:this.currentEvaluationYear
   }
  this.perfApp.CallAPI().subscribe(c => {

   if (c) {
    this.snack.success(c.message);
    this.getAllDevGoalsDetails();
    this.getAllStrengthDetails();
   } else {
     
   }

  }
  
  , error => {

    this.snack.error(error.error.message);

  }
  
  )
}

editStrengthForm(currentRowItem: any) {
  this.router.navigate(['employee/strengths',{action:'edit',id:this.currentRowItem._id}],{ skipLocationChange: true });
}

findEvaluationPgRollout() {
  this.perfApp.route = "app";
  this.perfApp.method = "FindEvaluationPgRollout",
  this.perfApp.requestBody = { 'empId': this.loginUser._id,'orgId':this.authService.getOrganization()._id,evaluationYear:this.employeeEvaluationYear}
  this.perfApp.CallAPI().subscribe(c => {
    if(c){
      this.allowActionPlan = true;
    }
  },error => {
    this.allowActionPlan = false;
    this.snack.error(error.error.message);
  });

}

}
