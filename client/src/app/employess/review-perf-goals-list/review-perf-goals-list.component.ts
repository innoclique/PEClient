

import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AutoWidthCalculator } from 'ag-grid-community';
import { ModalDirective, BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AlertDialog } from '../../Models/AlertDialog';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';
import { ThemeService } from '../../services/theme.service';
import * as moment from 'moment';

@Component({
  selector: 'app-review-perf-goals-list',
  templateUrl: './review-perf-goals-list.component.html',
  styleUrls: ['./review-perf-goals-list.component.css']
})
export class ReviewPerfGoalsListComponent implements OnInit {


  public empForm: FormGroup;
  departments=[];
  jobRoles=[];
  appRoles: any;
  jobLevels: any;
  loginUser: any;

  filteredOptions: Observable<any[]>;
  filteredOptionsTS: Observable<any[]>;
  filteredOptionsDR: Observable<any[]>;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'gray modal-lg'
  };
  currentRowItem: any;
  // @ViewChild('addEmployee', { static: true }) addEmployeeView: TemplateRef<any>;
  @ViewChild("addEmployee", { static: true }) emoModal: ModalDirective;
  viewEmpFormRef: BsModalRef;
  countyFormReset: boolean;
  isRoleChanged: boolean;
  empDetails: any={}
  currentAction='create';
  cscData:any=undefined;

  public alert: AlertDialog;
  public currentOrganization:any={};
  managerReporteesData: any;
  managerReporteesKpiRelData: any;

  managerReporteesDataRecords:any;
  tSReporteesData: any;
  evaluationsYears:any=[];
  currentEvaluationYear:any="";

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    public themeService: ThemeService,
    private modalService: BsModalService,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService) { 


      this.loginUser=this.authService.getCurrentUser();
      this.getEmployeeEvaluationYears();
      this.currentOrganization = this.loginUser.Organization;
      let orgStartEnd = this.getOrganizationStartAndEndDates();
      this.currentEvaluationYear = orgStartEnd.start.format("YYYY");
    }
    getEmployeeEvaluationYears() {
      this.perfApp.route = "app";
      this.perfApp.method = "GetEmployeeEvaluationYears",
        this.perfApp.requestBody = { 'empId': this.loginUser._id}
      this.perfApp.CallAPI().subscribe(evaluationYears => {
        this.evaluationsYears = evaluationYears;
      }, error => {
        this.snack.error(error.error.message);
      });
    }

    getOrganizationStartAndEndDates(){
      let Organization = this.currentOrganization;
      let {StartMonth,EndMonth,EvaluationPeriod} = Organization;
      StartMonth = parseInt(StartMonth);
      let currentMoment = moment();
      let evaluationStartMoment;
      let evaluationEndMoment
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
        evaluationStartMoment = moment().startOf('month');
        evaluationEndMoment = moment().month(0).endOf('month').add(1, 'years');
      }
      return {
        start:evaluationStartMoment,
        end:evaluationStartMoment
      }
    }

  ngOnInit(): void {

  this.callApis();
  }

 async callApis(){
   await this.GetReporteeKpiRelesedDetails();
  

  //  this.managerReporteesDataRecords=[...this.managerReporteesData,...this.managerReporteesKpiRelData]
    this.GetTSReporteeKpiRelesedDetails();
  }



  
  public columnDefs = [
    {headerName: 'Employee', field: 'Name', sortable: true, filter: true,
    // cellRenderer: (data) => {
    //   return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
    // }
  },
    {headerName: 'No.of  Performance Goals',  field: 'NoOfKpis', sortable: true, filter: true },
    {headerName: 'No.of  Reviewed Goals', field: 'NoOfSignOff', sortable: true, filter: true },
    {headerName: 'Draft', field: 'pgDraftGoals', sortable: true, filter: true },
    // {headerName: 'No.of DevGoals', field: 'NoOfDevGoals', sortable: true, filter: true },
    // {headerName: 'Final Rating Status', field: 'FRStatus',  , sortable: true, filter: true },
    {
      headerName: 'Review/Modify', field: '', autoHeight: true, suppressSizeToFit: true,
      cellRenderer: (data) => {

        var returnString = '';
        returnString += `
        
        <i class="icon-plus font-1xl" style="cursor:pointer ;padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="addKPI" title="Add Performance Goal"></i> 
        
        <i class="cui-wrench" style="cursor:pointer; padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="reviewKPI" title="Review Performance Goal"></i>
        
        <i class="cui-layers " hidden style="cursor:pointer; padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="reviewGoals" title="Review Goals"></i>

        `;
        if(data && data.data && data.data.RowData){
          let {RowData} = data.data;
          let {pgDraftGoals} = RowData;
          if(pgDraftGoals && pgDraftGoals.length>0){
            returnString += `
            <i class="icon-pencil" style="cursor:pointer; padding: 7px 20px 0 0;
            font-size: 17px;"   data-action-type="draftGoal" title="Draft Goals"></i>
            `;
          }
        }

        return returnString;
      }
    }
];


  
public tsColumnDefs = [
  {headerName: 'Employee', field: 'Name',  sortable: true, filter: true,
  // cellRenderer: (data) => {
  //   return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
  // }
},
  {headerName: 'No.of  Performance Goals', field: 'NoOfKpis', sortable: true, filter: true },
  // {headerName: 'No.of DevGoals', field: 'NoOfDevGoals', sortable: true, filter: true },
  // {headerName: 'Final Rating Status', field: 'FRStatus',  , sortable: true, filter: true },
  {
    headerName: 'Review/Modify', field: '',  autoHeight: true, suppressSizeToFit: true,
    cellRenderer: (data) => {

      var returnString = '';
      returnString += `<i class="cui-wrench" style="cursor:pointer; padding: 7px 20px 0 0;
      font-size: 17px;"   data-action-type="reviewKPI" title="ReviewPerformance Goal"></i>
      
      <i class="cui-layers " hidden style="cursor:pointer; padding: 7px 20px 0 0;
      font-size: 17px;"   data-action-type="reviewGoals" title="Review Goals"></i>

      `;
      return returnString;
    }
  }
];



public onEmpGridRowClick(e) {
  if (e.event.target !== undefined) {
    this.currentRowItem = e.data.RowData;;
  
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
    
      case "VF":
        this.viewEmpForm('reviewEval','Manager');
        break;
        case "reviewKPI":
          this.reviewEvalForm('reviewKPI','Manager');
          break;
        case "reviewGoals":
          this.reviewEvalForm('reviewGoals','Manager');
          break;
        case "reviewEval":
          this.reviewEvalForm('reviewEval','Manager');
          break;
        case "addKPI":
          this.addKpiForm();
          break;
        case "draftGoal":
          this.reviewEvalDraftForm('reviewEval','Manager');
          break;
      
     
      default:
    }
  }
}



public onAsTSGridRowClick(e) {
  if (e.event.target !== undefined) {
    this.currentRowItem = e.data.RowData;;
  
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
    
      case "VF":
        this.viewEmpForm('reviewEval','TS');
        break;
        case "reviewKPI":
          this.reviewEvalForm('reviewKPI','TS');
          break;
          case "reviewGoals":
            this.reviewEvalForm('reviewGoals','TS');
            break;
            case "reviewEval":
              this.reviewEvalForm('reviewEval','TS');
              break;
          
     
      default:
    }
  }
}

  reviewEvalForm(action,actor) {
      this.router.navigate(['employee/review-perf-goals',
       { action: action, empId: this.currentRowItem._id,actor:actor,empManagerId:this.currentRowItem.Manager,currentEvaluationYear:this.currentEvaluationYear }
    ], { skipLocationChange: true });
  }

  reviewEvalDraftForm(action,actor) {
    this.router.navigate(['employee/review-perf-goals',
     { action: action, empId: this.currentRowItem._id,actor:actor,empManagerId:this.currentRowItem.Manager,draftGoals:true }
  ], { skipLocationChange: true });
}

  viewEmpForm(action,actor) {
     this.router.navigate(['employee/review-perf-goals',
       { action: action, empId: this.currentRowItem._id,actor:actor }
    ], { skipLocationChange: true });
  }


  

  addKpiForm() {


    this.router.navigate(['em/add-kpi', { action: 'add', ownerId: this.currentRowItem._id,currentEvaluationYear:this.currentEvaluationYear  }], { skipLocationChange: true });

  }

  
  onGridSizeChanged(params) {
    params.api.sizeColumnsToFit();
}
public getRowHeight = function (params) {
return 34;
};
loadKpisByYear(selectedYear){
  this.currentEvaluationYear = selectedYear;
this.GetReporteeKpiRelesedDetails();
}


GetReporteeKpiRelesedDetails(){
  this.perfApp.route="app";
  this.perfApp.method="GetReporteeReleasedKpiForm",
 this.perfApp.requestBody = { id: this.loginUser._id ,currentEvaluation:this.currentEvaluationYear}
  this.perfApp.CallAPI().subscribe(c=>{
    
    
    this.managerReporteesKpiRelData=c.map(row=> {
    //  let flatarray=row.Evaluation.flat()
//let evaluation=flatarray.find(x=>x.Status==='Active')

let unSubmitedCount=row.KpiList.filter(e=>e.ManagerSignOff.submited ==false).length;
     return  {
         Name:row.FirstName+' '+row.LastName,
         NoOfKpis: row.KpiList.length,
         NoOfSignOff:row.KpiList.length-unSubmitedCount,
         NoOfDevGoals: row.GoalList.length,
         pgDraftGoals: row.pgDraftGoals?row.pgDraftGoals.length:0,
        // FRStatus: evaluation ?evaluation.FinalRating.Status:'',
       
        RowData:row
      }
    }

    )

   // this.managerReporteesDataRecords.push(this.managerReporteesKpiRelData);
  })
}



onGridReady(params) {
  params.api.sizeColumnsToFit();
//  this.clientGridOptions.api = params.api; // To access the grids API
//       this.clientGridOptions.rowHeight = 34;
}
onTsGridReady(params) {
  params.api.sizeColumnsToFit();
//  this.clientGridOptions.api = params.api; // To access the grids API
//       this.clientGridOptions.rowHeight = 34;
}



GetTSReporteeKpiRelesedDetails(){
  this.perfApp.route="app";
  this.perfApp.method="GetTSReleasedKpiForm",
 this.perfApp.requestBody = { id: this.loginUser._id }
  this.perfApp.CallAPI().subscribe(c=>{
    
    
    this.tSReporteesData=c.map(row=> {
      

    //  let flatarray=row.Evaluation.flat()
// let evaluation=flatarray.find(x=>x.Status==='Active')
let unSubmitedCount=row.KpiList.filter(e=>e.ManagerSignOff && e.ManagerSignOff.submited ==false).length;
        return  {
          Name:row.FirstName+' '+row.LastName,
          NoOfKpis: row.KpiList.length,
          NoOfSignOff:row.KpiList.length-unSubmitedCount,
          NoOfDevGoals: row.GoalList.length,
        // FRStatus: evaluation ?evaluation.FinalRating.Status:'',

        RowData:row
        }
    }
    )
  })
}





}


