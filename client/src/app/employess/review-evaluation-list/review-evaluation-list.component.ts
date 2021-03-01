
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ModalDirective, BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AlertDialog } from '../../Models/AlertDialog';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';
import { ThemeService } from '../../services/theme.service';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-review-evaluation-list',
  templateUrl: './review-evaluation-list.component.html',
  styleUrls: ['./review-evaluation-list.component.css']
})
export class ReviewEvaluationListComponent implements OnInit {


  public empForm: FormGroup;
  departments = [];
  jobRoles = [];
  copiesToList = [];
  appRoles: any;
  jobLevels: any;
  loginUser: any;
  empSelected: any;
  viewSelected: string = 'evalutionView';
  copiesToView: boolean = false;
  isPdfView: boolean = false;
  

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
  empDetails: any = {}
  currentAction = 'create';
  cscData: any = undefined;

  public alert: AlertDialog;
  public currentOrganization: any = {};
  managerReporteesData: any;
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
    private employeeService: EmployeeService,
    public translate: TranslateService) {

    this.loginUser = this.authService.getCurrentUser();
  }



  ngOnInit(): void {
    this.getCopiesToList();
    this.GetReporteeEvaluationsDetails();
    this.GetTSReporteeEvDetails();
  }

  onGridReady(params) {
    params.api.sizeColumnsToFit();
  }
  onTsGridReady(params) {
    params.api.sizeColumnsToFit();
  }
  onCopiesToGridReady(params) {
    params.api.sizeColumnsToFit();
  }

  getCopiesToList() {
    let { _id } = this.loginUser;
    let requestBody: any = { userId: _id }
    this.employeeService.getCopiesTO(requestBody).subscribe(response => {
      console.log(response);
      this.copiesToList = response.map(row => {
        row.Name = row.FirstName + ' ' + row.LastName;
        return {
          Name: row.Name,
          RowData: row
        }
      }
      )

    })
  }

  public onOptionsSelected(event) {
    const value = event.target.value;
    console.log('event:::',event,value);
    this.viewSelected = value;
    this.viewSelected === 'copiesToView' ? this.copiesToView = true : this.copiesToView = false;
    console.log('this.copiesToView :::', this.copiesToView);
  }

  public columnDefs = [
    {
      headerName: 'Employee', field: 'Name', sortable: true, filter: true,
      // cellRenderer: (data) => {
      //   return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
      // }
    },
    { headerName: 'No.of  Performance Goals', field: 'NoOfKpis', sortable: true, filter: true },
    { headerName: 'No.of Dev Goals', field: 'NoOfDevGoals', sortable: true, filter: true },
    { headerName: 'Evaluation Status', field: 'FRStatus', tooltipField: "FRStatus", sortable: true, filter: true },
    {
      headerName: 'Review/Modify', field: '', autoHeight: true, suppressSizeToFit: true,
      cellRenderer: (data) => {

        var returnString = '';
        returnString += `
        
        
        <i class="cui-wrench" style="cursor:pointer; padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="reviewKPI" title="Review Performance Goal"></i>
        
        <i class="cui-pie-chart" style="cursor:pointer; padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="reviewGoals" title="Review Goals"></i>

        <i class="cui-map" style="cursor:pointer; padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="reviewEval" title="Review final rating"></i>

        <i class="cui-map" style="cursor:pointer; padding: 7px 20px 0 0;
        font-size: 17px;  ${data.data.FRStatus!='Evaluation Complete'?'opacity: 0.65;':''}  "   data-action-type="viewReport" title="  ${data.data.FRStatus!='Evaluation Complete'? 'Evaluation Not Yet Completed': 'View Evaluation Report' } "></i>
        `;
        return returnString;
      }
    }
  ];



  public tsColumnDefs = [
    {
      headerName: 'Employee', field: 'Name', sortable: true, filter: true,
      // cellRenderer: (data) => {
      //   return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
      // }
    },
    { headerName: 'No.of  Performance Goals', field: 'NoOfKpis', sortable: true, filter: true },
    { headerName: 'No.of Dev Goals', field: 'NoOfDevGoals', sortable: true, filter: true },
    { headerName: 'Evaluation Status', field: 'FRStatus', tooltipField: "FRStatus", sortable: true, filter: true },
    {
      headerName: 'Review/Modify', field: '', autoHeight: true, suppressSizeToFit: true,
      cellRenderer: (data) => {

        var returnString = '';
        returnString += `<i class="cui-wrench" style="cursor:pointer; padding: 7px 20px 0 0;
      font-size: 17px;"   data-action-type="reviewKPI" title="ReviewPerformance Goal"></i>
      
      <i class="cui-pie-chart" style="cursor:pointer; padding: 7px 20px 0 0;
      font-size: 17px;"   data-action-type="reviewGoals" title="Review Goals"></i>

      <i class="cui-map" style="cursor:pointer; padding: 7px 20px 0 0;
      font-size: 17px;"   data-action-type="reviewEval" title="Review final rating"></i>

      <i class="cui-map" style="cursor:pointer; padding: 7px 20px 0 0;
      font-size: 17px;  ${data.data.FRStatus!='Evaluation Complete'?'opacity: 0.65;':''}  "   data-action-type="viewReport" title="  ${data.data.FRStatus!='Evaluation Complete'? 'Evaluation Not Yet Completed': 'View Evaluation Report' } "  > </i>
      `;
        return returnString;
      }
    }
  ];

  public copiesToColumnDefs = [
    { headerName: 'Employee', field: 'Name', sortable: true, filter: true, },
    {
      headerName: 'Review/Modify', field: '', autoHeight: true, suppressSizeToFit: true,
      cellRenderer: (data) => {
        var returnString = '';
        returnString += `<i class="cui-map" style="cursor:pointer; padding: 7px 20px 0 0;
      font-size: 17px;"   data-action-type="viewReport" title="View Evaluation Report"></i>`;
        return returnString;
      }
    }
  ];

  onGridSizeChanged(params) {
    params.api.sizeColumnsToFit();
  }
  public getRowHeight = function (params) {
    return 34;
  };



  public onEmpGridRowClick(e) {
    console.log('event fired');
    if (e.event.target !== undefined) {
      this.currentRowItem = e.data.RowData;;

      let actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {

        case "VF":
          this.viewEmpForm('reviewEval', 'Manager');
          break;
        case "reviewKPI":
          this.reviewEvalForm('reviewKPI', 'Manager');
          break;
        case "reviewGoals":
          this.reviewEvalForm('reviewGoals', 'Manager');
          break;
        case "reviewEval":
          this.reviewEvalForm('reviewEval', 'Manager');
          break;

        case "addKPI":
          this.addKpiForm();
          break;
        case "viewReport":
          console.log('inside switch case');
          this.pdfView();
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
          this.viewEmpForm('reviewEval', 'TS');
          break;
        case "reviewKPI":
          this.reviewEvalForm('reviewKPI', 'TS');
          break;
        case "reviewGoals":
          this.reviewEvalForm('reviewGoals', 'TS');
          break;
        case "reviewEval":
          this.reviewEvalForm('reviewEval', 'TS');
          break;
        case "viewReport":
          console.log('inside switch case');
          this.pdfView();
          break;



        default:
      }
    }
  }

  reviewEvalForm(action, actor) {
    this.router.navigate(['employee/review-evaluation',
      {
        action: action, empId: this.currentRowItem._id,
        actor: actor, empManagerId: this.currentRowItem.Manager
        , empName: this.currentRowItem.Name
      }
    ], { skipLocationChange: true });
  }

  viewEmpForm(action, actor) {
    this.router.navigate(['employee/review-evaluation',
      {
        action: action, empId: this.currentRowItem._id, actor: actor
        , empName: this.currentRowItem.Name
      }
    ], { skipLocationChange: true });
  }

  // viewReport(action, actor) {
  //   console.log('inside view report', this.currentRowItem._id);
  //   this.router.navigate(['employee/reports/current-evaluation',
  //     {
  //       action: action,
  //       _id: this.currentRowItem._id,
  //     }
  //   ], { skipLocationChange: true });
  // }


  addKpiForm() {


    this.router.navigate(['em/add-kpi', { action: 'add', ownerId: this.currentRowItem._id }], { skipLocationChange: true });

  }


  GetReporteeEvaluationsDetails() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetReporteeEvaluations",
      this.perfApp.requestBody = { id: this.loginUser._id }
    this.perfApp.CallAPI().subscribe(c => {
      debugger

      this.managerReporteesData = c.map(row => {
        let flatarray = row.Evaluation.flat()
        let evaluation = flatarray.find(x => x.Status === 'Active')
        row.Name = row.FirstName + ' ' + row.LastName;
        return {
          Name: row.Name,
          NoOfKpis: row.KpiList.length,
          NoOfDevGoals: row.GoalList.length,
          FRStatus: row.FRStatus,

          RowData: row
        }
      }
      )
    })
  }

  exitReportView(){
    this.isPdfView = false;
  }

 async pdfView(){
    
  if (this.currentRowItem.FRStatus=='Evaluation Complete') {
  this.empSelected = await this.authService.FindUserById(this.currentRowItem._id).subscribe(c => {
      if(c){
        console.log('user by id pdf view:::',c);
        this.empSelected = c;
        this.currentOrganization = this.authService.getOrganization();
        this.isPdfView = true;
      }
    }
      , error => {
        this.snack.error(error.error.message);
      }
    );
  }
    
  }




  GetTSReporteeEvDetails() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetTSReporteeEvaluations",
      this.perfApp.requestBody = { id: this.loginUser._id }
    this.perfApp.CallAPI().subscribe(c => {


      this.tSReporteesData = c.map(row => {
        debugger

        let flatarray = row.Evaluation.flat()
        let evaluation = flatarray.find(x => x.Status === 'Active')
        row.Name = row.FirstName + ' ' + row.LastName;
        return {
          Name: row.Name,
          NoOfKpis: row.KpiList.length,
          NoOfDevGoals: row.GoalList.length,
          FRStatus: row.FRStatus,

          RowData: row
        }
      }
      )
    })
  }





}

