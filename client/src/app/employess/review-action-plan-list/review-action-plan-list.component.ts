

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

@Component({
  selector: 'app-review-action-plan-list',
  templateUrl: './review-action-plan-list.component.html',
  styleUrls: ['./review-action-plan-list.component.css']
})
export class ReviewActionPlanListComponent implements OnInit {


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
    }



  ngOnInit(): void {

  this.callApis();
  }

 async callApis(){
   await this.GetReporteeKpiRelesedDetails();
   await this.GetTSReporteeKpiRelesedDetails();


  }



  
  public columnDefs = [
    {headerName: 'Employee', field: 'Name', sortable: true, filter: true,
    // cellRenderer: (data) => {
    //   return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
    // }
  },
    {headerName: 'No.of Dev Goals',  field: 'NoOfKpis', sortable: true, filter: true },
    {headerName: 'No.of Strengths',  field: 'NoOfStrengths', sortable: true, filter: true },
    // {headerName: 'No.of  Reviewed', field: 'NoOfSignOff', sortable: true, filter: true },
    // {headerName: 'No.of DevGoals', field: 'NoOfDevGoals', sortable: true, filter: true },
    // {headerName: 'Final Rating Status', field: 'FRStatus',  width: 200, sortable: true, filter: true },
    {
      headerName: 'Review/Modify', field: '', autoHeight: true, suppressSizeToFit: true,
      cellRenderer: (data) => {

        var returnString = '';
        returnString += `
        
       
        
        <i class="cui-pie-chart" style="cursor:pointer; padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="reviewGoals" title="Review Goals"></i>

        <i class="cui-shield " style="cursor:pointer; padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="reviewStrengths" title="Review Strengths"></i>

        `;
        return returnString;
      }
    }
];


  
public tsColumnDefs = [
  {headerName: 'Employee', field: 'Name', width: 250, sortable: true, filter: true,
  // cellRenderer: (data) => {
  //   return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
  // }
},
  {headerName: 'No.of Dev Goals', width:300, field: 'NoOfKpis', sortable: true, filter: true },
    {headerName: 'No.of Strengths', width:300, field: 'NoOfStrengths', sortable: true, filter: true },
    // {headerName: 'No.of  Reviewed', field: 'NoOfSignOff', sortable: true, filter: true },
   
  // {headerName: 'Final Rating Status', field: 'FRStatus',  width: 200, sortable: true, filter: true },
  {
    headerName: 'Review/Modify', field: '', width: 200, autoHeight: true, suppressSizeToFit: true,
    cellRenderer: (data) => {

      var returnString = '';
      returnString += `
      
      
      <i class="cui-pie-chart"  style="cursor:pointer; padding: 7px 20px 0 0;
      font-size: 17px;"   data-action-type="reviewGoals" title="Review Goals"></i>

      <i class="cui-shield " style="cursor:pointer; padding: 7px 20px 0 0;
      font-size: 17px;"   data-action-type="reviewStrengths" title="Review Strengths"></i>

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

            case "reviewStrengths":
              this.reviewEvalForm('reviewStrengths','Manager');
              break;
            
            case "reviewEval":
              this.reviewEvalForm('reviewEval','Manager');
              break;

              case "addKPI":
                this.addKpiForm();
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
            case "reviewStrengths":
              this.reviewEvalForm('reviewStrengths','TS');
              break;
            case "reviewEval":
              this.reviewEvalForm('reviewEval','TS');
              break;
          
     
      default:
    }
  }
}

  reviewEvalForm(action,actor) {
    debugger
      this.router.navigate(['employee/review-action-plan',
       { action: action, empId: this.currentRowItem._id,actor:actor,empManagerId:this.currentRowItem.Manager ,empName: this.currentRowItem.Name}
    ], { skipLocationChange: true });
  }

  viewEmpForm(action,actor) {
     this.router.navigate(['employee/review-action-plan',
       { action: action, empId: this.currentRowItem._id,actor:actor,empName: this.currentRowItem.Name }
    ], { skipLocationChange: true });
  }


  

  addKpiForm() {


    this.router.navigate(['em/add-kpi', { action: 'add', ownerId: this.currentRowItem._id }], { skipLocationChange: true });

  }

  onGridReady(params) {
    debugger
    params.api.sizeColumnsToFit();
  }

  onGridSizeChanged(params) {
    debugger
    params.api.sizeColumnsToFit();
  }
  public getRowHeight = function (params) {
    return 34;
  };
  


GetReporteeKpiRelesedDetails(){
  this.perfApp.route="app";
  this.perfApp.method="GetReporteeReleasedKpiForm",
 this.perfApp.requestBody = { id: this.loginUser._id }
  this.perfApp.CallAPI().subscribe(c=>{
    
    
    this.managerReporteesKpiRelData=c.map(row=> {
    //  let flatarray=row.Evaluation.flat()
//let evaluation=flatarray.find(x=>x.Status==='Active')

let unSubmitedCount=row.GoalList.filter(e=>e.ManagerSignOff && e.ManagerSignOff.submited ==false).length;
row.Name= row.FirstName+' '+row.LastName;
return  {
         Name:row.Name,
         NoOfKpis: row.GoalList.length,
         NoOfSignOff:row.GoalList.length-unSubmitedCount,
         NoOfStrengths: row.StrengthList.length,
        // FRStatus: evaluation ?evaluation.FinalRating.Status:'',
       
        RowData:row
      }
    }

    )

   // this.managerReporteesDataRecords.push(this.managerReporteesKpiRelData);
  })
}








GetTSReporteeKpiRelesedDetails(){
  this.perfApp.route="app";
  this.perfApp.method="GetTSReleasedKpiForm",
 this.perfApp.requestBody = { id: this.loginUser._id }
  this.perfApp.CallAPI().subscribe(c=>{
    
    
    this.tSReporteesData=c.map(row=> {
      

//       let flatarray=row.Evaluation.flat()
// let evaluation=flatarray.find(x=>x.Status==='Active')
let unSubmitedCount=row.GoalList.filter(e=>e.ManagerSignOff && e.ManagerSignOff.submited ==false).length;
row.Name= row.FirstName+' '+row.LastName;    
return  {
         Name:row.Name,
         NoOfKpis: row.GoalList.length,
         NoOfSignOff:row.GoalList.length-unSubmitedCount,
         NoOfStrengths: row.StrengthList.length,
        //  FRStatus: evaluation?evaluation.FinalRating.Status:'',
       
        RowData:row
      }
    }
    )
  })
}





}



