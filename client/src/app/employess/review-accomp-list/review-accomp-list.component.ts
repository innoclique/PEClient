

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
  selector: 'app-review-accomp-list',
  templateUrl: './review-accomp-list.component.html',
  styleUrls: ['./review-accomp-list.component.css']
})
export class ReviewAccompListComponent implements OnInit {


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
   await this.GetReporteeAccompRelesedDetails();
  

    this.GetTSReporteeAccompRelesedDetails();
  }



  
  public columnDefs = [
    {headerName: 'Employee', field: 'Name', sortable: true, filter: true,
    // cellRenderer: (data) => {
    //   return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
    // }
  },
    {headerName: 'No.of  Accomplishments',  field: 'NoOfAccomps', sortable: true, filter: true },
     {
      headerName: 'Review/Modify', field: '', autoHeight: true, suppressSizeToFit: true,
      cellRenderer: (data) => {

        var returnString = '';
        returnString += `
        
      
        
        <i class="cui-tags" style="cursor:pointer; padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="reviewKPI" title="Review Accomplishments"></i>
       

        `;
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
  {headerName: 'No.of  Accomplishments', field: 'NoOfAccomps', sortable: true, filter: true },
  // {headerName: 'No.of DevGoals', field: 'NoOfDevGoals', sortable: true, filter: true },
  // {headerName: 'Final Rating Status', field: 'FRStatus',  , sortable: true, filter: true },
  {
    headerName: 'Review/Modify', field: '',  autoHeight: true, suppressSizeToFit: true,
    cellRenderer: (data) => {

      var returnString = '';
      returnString += `
      <i class="cui-tags" style="cursor:pointer; padding: 7px 20px 0 0;
      font-size: 17px;"   data-action-type="reviewKPI" title="Review Accomplishments"></i>
     

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
    
    
        case "reviewKPI":
          this.reviewEvalForm('view','Manager');
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
    
   
        case "reviewKPI":
          this.reviewEvalForm('view','TS');
          break;
         
          
     
      default:
    }
  }
}

  reviewEvalForm(action,actor) {
      this.router.navigate(['employee/review-accomplishments',
       { action: action, empId: this.currentRowItem._id,actor:actor,
        empManagerId:this.currentRowItem.Manager ,empName: this.currentRowItem.Name }
    ], { skipLocationChange: true });
  }

  viewEmpForm(action,actor) {
     this.router.navigate(['employee/review-accomplishments',
       { action: action, empId: this.currentRowItem._id,actor:actor ,empName: this.currentRowItem.Name }
    ], { skipLocationChange: true });
  }


  

  addKpiForm() {


    this.router.navigate(['em/add-kpi', { action: 'add', ownerId: this.currentRowItem._id }], { skipLocationChange: true });

  }

  
  onGridSizeChanged(params) {
    params.api.sizeColumnsToFit();
}
public getRowHeight = function (params) {
return 34;
};


GetReporteeAccompRelesedDetails(){
  this.perfApp.route="app";
  this.perfApp.method="GetReporteeAccomplishments",
 this.perfApp.requestBody = { id: this.loginUser._id }
  this.perfApp.CallAPI().subscribe(c=>{
    
    
    this.managerReporteesKpiRelData=c.map(row=> {
      row.Name= row.FirstName+' '+row.LastName;
     return  {
         Name:row.Name,
         NoOfAccomps: row.AccompList.length,
              
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



GetTSReporteeAccompRelesedDetails(){
  this.perfApp.route="app";
  this.perfApp.method="GetTSReleasedAccomplishments",
 this.perfApp.requestBody = { id: this.loginUser._id }
  this.perfApp.CallAPI().subscribe(c=>{
    
    
    this.tSReporteesData=c.map(row=> {
      
      row.Name= row.FirstName+' '+row.LastName;
        return  {
          Name:row.Name,
          NoOfAccomps: row.AccompList.length,
         

        RowData:row
        }
    }
    )
  })
}





}



