
import { DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { AlertDialog } from '../../Models/AlertDialog';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';
import { ThemeService } from '../../services/theme.service';
import { AlertComponent } from '../../shared/alert/alert.component';
import { Constants } from '../../shared/AppConstants';
import * as moment from 'moment';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-kpi-setup',
  templateUrl: './kpi-setup.component.html',
  styleUrls: ['./kpi-setup.component.css']
})
export class KpiSetupComponent implements OnInit {



  kpiGuidance:any = environment.KPI_GUIDANCE_URL;
  loginUser: any;
  currentRowItem: any;
  public alert: AlertDialog;
  public kpiListData: any
  isKpiActivated=false;
  isSignOffDisabled=false;
  unSubmitedCount=0;
  submitedCount=0;
  scoreUnSubmitedCount=0;
  isEmployeePgSignoff:boolean = false;
  finalSignoffDate:Date;
  selectedEvaluationYr:any="";

  @ViewChild('kpiTrack', { static: true }) kpiTrackView: TemplateRef<any>;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,

  };
  trackViewRef: BsModalRef;
  empEvaluationsYears:any=[];
  employeeEvaluationYear:any="";

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public dialog: MatDialog,
    public themeService: ThemeService,
      public datePipe: DatePipe, 
    private snack: NotificationService,
    private perfApp: PerfAppService,
    private modalService: BsModalService,
    public translate: TranslateService) {
    this.loginUser = this.authService.getCurrentUser();
    this.getEmployeeEvaluationYears();
    // this.datePipe= new DatePipe('en-US');
    this.findPgSignoff();


  }
  showGuidance(){
    window.location.href=this.kpiGuidance;
  }
  ngOnInit(): void {
    this.getEmployeeCurrentEvaluation();
    //this.getAllKpis();
    this.alert = new AlertDialog();
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

  loadKpisByYear(evaluationYear){
    this.isKpiActivated=false;
    this.selectedEvaluationYr=evaluationYear;
    this.getAllKpis();
  }
  findPgSignoff(){
    let orgStartEnd = this.getOrganizationStartAndEndDates();
    if(orgStartEnd){
      let EvaluationYear = orgStartEnd.start.format("YYYY");
      let {Manager,Organization} = this.loginUser;
      let options = {
        EvaluationYear,
        Owner:this.loginUser._id,
        
      };
      console.log(options);
      this.perfApp.route = "app";
      this.perfApp.method = "Find/PG/Signoff";
      this.perfApp.requestBody = options;
      this.perfApp.CallAPI().subscribe(result => {
        if(!result){
          this.isEmployeePgSignoff = false;
          this.getClientConfiguation();
        }else{
          let {FinalSignoff,SignOff}  = result;
          if(SignOff.submited){
            let {FinalSignoffOn} = result;
            this.finalSignoffDate = FinalSignoffOn;
            this.isSignOffDisabled=true;
          }else{
            this.getClientConfiguation();
          }
          
        }
        
      })
    }
    
  }
  getOrganizationStartAndEndDates(){
    let {Organization} = this.loginUser;
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
      evaluationStartMoment = moment().startOf('month');
      evaluationEndMoment = moment().month(0).endOf('month').add(1, 'years');
    }
    if(evaluationStartMoment && evaluationStartMoment){
      return {
        start:evaluationStartMoment,
        end:evaluationEndMoment
      }
    }else{
      return null
    }
    
  }

  getClientConfiguation(){
    let {Organization} = this.loginUser;
    let orgStartEnd = this.getOrganizationStartAndEndDates();
    let evaluationStartMoment = orgStartEnd.start;
    let evaluationEndMoment = orgStartEnd.end;
    let currentMoment = moment();
    this.isSignOffDisabled=true;
    
    this.perfApp.route = "clientconfig";
    this.perfApp.method = "organization";
    this.perfApp.requestBody = {};
    this.perfApp.requestBody.Organization = Organization._id;
    this.perfApp.requestBody.ConfigKey = "PG-SIGNOFF";
    this.perfApp.CallAPI().subscribe(result => {
      if (result) {
        let {ActivateWithin,onBeforeAfter,TimeUnit} = result;
        if(onBeforeAfter === "After"){
          if(TimeUnit === "DAYS"){
            let duration = currentMoment.diff(evaluationStartMoment,'days');
            console.log(`duration: ${duration}`);
            if(duration>=ActivateWithin)
              this.isSignOffDisabled=false;
            else
              this.isSignOffDisabled=true;
          }
        }
      }else{
        this.isSignOffDisabled=true;
      }
    });
  }

  employeeSignoff(){
    this.isSignOffDisabled=true;
    let orgStartEnd = this.getOrganizationStartAndEndDates();
    let EvaluationYear = orgStartEnd.start.format("YYYY");
    let {Manager,Organization,} = this.loginUser;
    let options = {
      Owner:this.loginUser._id,
      EvaluationYear,
      Manager:Manager._id,
      submittedBy:"Employee"
    };
    console.log(options);

    this.perfApp.route = "app";
    this.perfApp.method = "/PG/Signoff";
    this.perfApp.requestBody = options;
    this.perfApp.CallAPI().subscribe(result => {
      console.log(result);
      if (result) {
        this.snack.success(this.translate.instant(`The performance goals have been submitted successfully and your sign-off registered.`));
      }
      if(this.unSubmitedCount!=0){
        this.submitAllKPIs(false)
      }
    });
  }


   
   openConfirmSignoffKpisDialog() {
    this.alert.Title = "Alert";
    this.alert.Content = "This will confirm your sign-off. Are you sure you want to continue?";
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
      
      this.employeeSignoff();
     } else {
       
     }
    })
  }


  singoffPG(){
    if(this.unSubmitedCount>0 || this.submitedCount>0){
      this.openConfirmSignoffKpisDialog()
      // this.employeeSignoff();
    }else{
      this.snack.error("Please add and submit performance Goals before sign-off.");
    }
  }

  public columnDefs = [
    {
      headerName: 'Performance Goal', field: 'Name', tooltipField: 'Name', suppressSizeToFit: true,  sortable: true, filter: true,
      cellRenderer: (data) => {
        return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
      }
    },
    { headerName: 'Target Completion', field: 'TargetCompletionDate', suppressSizeToFit: true,  sortable: true, filter: true },
    { headerName: 'Draft', field: 'IsDraft',  sortable: true, filter: true },
    { headerName: 'Status', field: 'Status',  sortable: true, filter: true },
    { headerName: 'Submitted', field: 'IsSubmitedKPIs',   sortable: true, filter: true },
    {
      headerName: 'Review/Modify', field: '',  autoHeight: true,  suppressSizeToFit: true,
      cellRenderer: (data) => {
 let actionlinks=''
       if (data.data.RowData.IsActive) {
         let rowData = data.data.RowData;
         let {ManagerSignOff,IsDraft,isFinalSignoff} = rowData;
         //finalSignoffDate,isSignOffDisabled
         if(IsDraft && this.isSignOffDisabled && isFinalSignoff && ManagerSignOff.submited){
          actionlinks= `
          <i class="cui-circle-check font-1xl" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="AllowPg" title="Allow" ></i>

          <i class="icon-ban" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="DenyPg" title="Deny"></i>

          <i class="icon-pencil" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="ESG" title="Edit Performance Goal" ></i>
          `
         }else{
          actionlinks= `<i class="icon-pencil" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="EF" title="Edit Performance Goal" ></i>    
          
          <i class="icon-ban" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="deActiveKPI" title="Deactivate Performance Goal"></i>
         
          <i class="cui-layers icons font-1xl" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="Track" title="Track Performance Goal" ></i>    
          
          `
         }
        
       } else {
        let rowData = data.data.RowData;
        let {isFinalSignoff} = rowData;
        if(isFinalSignoff ){
          actionlinks= `
          <i class="cui-layers icons font-1xl" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="Track" title="Track Performance Goal" ></i>   
          `
        }else{
          actionlinks= `<i class="cui-circle-check font-1xl" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="activeKPI" title="activate Performance Goal"></i>       
        
          <i class="cui-layers icons font-1xl" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="Track" title="Track Performance Goal" ></i>   
         
          `
        }
        
       }

      //  actionlinks=  actionlinks+`
      //  <i class="icon-pencil" style="cursor:pointer ;padding: 7px 20px 0 0;
      //  font-size: 17px;"   data-action-type="EF" title="Edit Performance Goal" ></i>    
      //  `
       return actionlinks
       ;
      }
    }
  ];

  onGridReady(params) {
    debugger
    params.api.sizeColumnsToFit();
    // params.api.setColumnDefs();
   
  }
  public getRowHeight = function (params) {
    return 34;
  };

  
  onGridSizeChanged(params) {
        params.api.sizeColumnsToFit();
  }


  public onKpiGridRowClick(e) {
    if (e.event.target !== undefined) {
      this.currentRowItem = e.data.RowData;;

      let actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "VF":
          this.viewKpiForm(this.currentRowItem);
          break;
        case "EF":
          this.editKpiForm(this.currentRowItem);
          break;
        case "ESG":
          this.editSignOffKpiForm(this.currentRowItem);
          break;
        case "deActiveKPI":
          this.confirmActiveDeActiveKPI(false);
          break;
        case "activeKPI":
          this.confirmActiveDeActiveKPI(true);
          break;
        case "Track":
          this.trackKpi();
          break;
        case "AllowPg":
          this.allowPg();
          break;
        case "DenyPg":
          this.denyPg();
          break;
        default:
      }
    }
  }

  allowPg(){
    this.perfApp.route = "app";
    this.perfApp.method = "SubmitKpisByEmployee";
    this.perfApp.requestBody = {};
    this.perfApp.requestBody.kpi = this.currentRowItem._id;
    this.perfApp.requestBody.empId = this.loginUser._id;
    this.perfApp.CallAPI().subscribe(c => {
      if (c) {
      this.getAllKpis();
      this.snack.success(this.translate.instant(`Performance Goal Allowed Successfully`));
      }
    })
  }
  
  

  denyPg(){
    let isActive=false;
    this.perfApp.route = "app";
    this.perfApp.method = "UpdateKpiDataById";
    this.perfApp.requestBody = {};
    this.perfApp.requestBody.kpiId = this.currentRowItem._id;
    this.perfApp.requestBody.IsActive = isActive;
    this.perfApp.requestBody.Action=isActive?'Active': 'DeActive' ;
    this.perfApp.requestBody.UpdatedBy = this.loginUser._id;
    this.perfApp.CallAPI().subscribe(c => {

      if (c) {

      this.getAllKpis();
      this.snack.success(this.translate.instant(`Performance Goal Denied`));
        
      }
    })
  }

  trackKpi() {

      this.trackViewRef = this.modalService.show(this.kpiTrackView, this.config);
  }



  
  confirmActiveDeActiveKPI(isActive){

    
    this.alert.Title = "Alert";
    this.alert.Content = isActive? "Are you sure you want to activate the performance goal?"
    :"Are you sure you want to deactivate the performance goal?"
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
      this.activedeActiveKPI(isActive);
     } else {
       
     }
    })


  }

  activedeActiveKPI(isActive) {
    this.perfApp.route = "app";
    this.perfApp.method = "UpdateKpiDataById";
    this.perfApp.requestBody = {};
    this.perfApp.requestBody.kpiId = this.currentRowItem._id;
    this.perfApp.requestBody.IsActive = isActive;
    this.perfApp.requestBody.Action=isActive?'Active': 'DeActive' ;
    this.perfApp.requestBody.UpdatedBy = this.loginUser._id;
    this.perfApp.CallAPI().subscribe(c => {

      if (c) {

      this.getAllKpis();
      this.snack.success(this.translate.instant(`Performance Goal ${isActive?'Activated':'Deactivated'} Successfully`));
        
      }
    })

  }

  



  editKpiForm(currentRowItem: any) {
   

      this.router.navigate(['employee/kpi-setting',{action:'edit',id:this.currentRowItem._id,isFinalSignoff:this.isSignOffDisabled}],{ skipLocationChange: true });
      
  }

  editSignOffKpiForm(currentRowItem: any) {
   

    this.router.navigate(['employee/kpi-setting',{action:'edit',id:this.currentRowItem._id,isFinalSignoff:this.isSignOffDisabled,showAllowSignoff:true}],{ skipLocationChange: true });
    
}

  

  viewKpiForm(currentRowItem: any) {
   

    this.router.navigate(['employee/kpi-setting',{action:'view',id:this.currentRowItem._id}],{ skipLocationChange: true });
    
}
  



  
   /**To alert user for submit kpis */
   conformSubmitKpis() {
    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to submit the KPI?";
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
      this.submitAllKPIs(true);
     } else {
       
     }
    })
  }


submitAllKPIs(showMsg) {

  this.perfApp.route = "app";
  this.perfApp.method = "SubmitKpisForEvaluation",
    this.perfApp.requestBody = { 'empId': this.loginUser._id,currentEvaluation:this.employeeEvaluationYear }
  this.perfApp.CallAPI().subscribe(c => {

   if (c) {
    if(showMsg)
    this.snack.success("The performance goals have been submitted successfully");
    this.getAllKpis();
   } else {
     
   }

  }
  
  , error => {

    this.snack.error(error.error.message);

  }
  
  )
}

  createKpi(){
    this.router.navigate(['employee/kpi-setting',{isFinalSignoff:this.isSignOffDisabled,currentEvaluation:this.selectedEvaluationYr}],{ skipLocationChange: true });
    
  }


  getAllKpis() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllKpis",
    this.perfApp.requestBody = {
       'empId': this.loginUser._id,
       'currentOnly': true,
    'orgId':this.authService.getOrganization()._id}
    if(this.selectedEvaluationYr!=""){
      this.perfApp.requestBody.evaluationYear=this.selectedEvaluationYr;
    }


    this.perfApp.CallAPI().subscribe(c => {

      if (c && c.length > 0) {
this.unSubmitedCount=c.filter(e=>e.IsSubmitedKPIs==false && e.IsDraft==false ).length;
this.submitedCount=c.filter(e=>e.IsSubmitedKPIs==true && e.IsDraft==false ).length;  
this.scoreUnSubmitedCount=c.filter(e=>e.Score=="" && e.IsDraft==false && e.IsActive==true ).length;
if(this.scoreUnSubmitedCount==0)
this.authService.setIsPGSubmitStatus("true");

      this.kpiListData = c.map(function (row) {


        return {
          Name: row.Kpi,
          TargetCompletionDate: new DatePipe('en-US').transform(row.TargetCompletionDate, 'MM-dd-yyyy'),
          IsDraft: row.IsDraft?'Yes':'No',
          YearEndComments: row.YearEndComments,
          IsSubmitedKPIs: row.IsSubmitedKPIs?'Yes':'No',
          Status: row.Status,

          RowData: row
        }
      }
      )


    }else{ this.kpiListData=[] }
    }, error => {
      debugger
      if (error.error.message == Constants.KpiNotActivated) {
        this.isKpiActivated=true;
        this.kpiListData=[];
        this.snack.error(error.error.message);
      } else {
        this.isKpiActivated=true;
        this.kpiListData=[];
      this.snack.error(error.error.message);

       }
    })
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
      this.loadKpisByYear(evaluationYear);
    })
  }



}
