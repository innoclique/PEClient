
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

@Component({
  selector: 'app-kpi-setup',
  templateUrl: './kpi-setup.component.html',
  styleUrls: ['./kpi-setup.component.css']
})
export class KpiSetupComponent implements OnInit {




  loginUser: any;
  currentRowItem: any;
  public alert: AlertDialog;
  public kpiListData: any
  isKpiActivated=false;
  unSubmitedCount=0;

  @ViewChild('kpiTrack', { static: true }) kpiTrackView: TemplateRef<any>;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,

  };
  trackViewRef: BsModalRef;

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
    // this.datePipe= new DatePipe('en-US');



  }

  ngOnInit(): void {

    this.getAllKpis();
    this.alert = new AlertDialog();
  }


  public columnDefs = [
    {
      headerName: 'Performance Goal Name', field: 'Name', width: 250, sortable: true, filter: true,
      cellRenderer: (data) => {
        return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
      }
    },
    { headerName: 'Target Completion', field: 'TargetCompletionDate', sortable: true, filter: true },
    { headerName: 'Is Draft', field: 'IsDraft', width: 110, sortable: true, filter: true },
    { headerName: 'Status', field: 'Status', width: 150, sortable: true, filter: true },
    { headerName: 'Is Submited', field: 'IsSubmitedKPIs', width: 150, sortable: true, filter: true },
    {
      headerName: 'Action', field: '', width: 170, autoHeight: true, suppressSizeToFit: true,
      cellRenderer: (data) => {
 let actionlinks=''
       if (data.data.RowData.IsActive) {
        actionlinks= `<i class="icon-ban" style="cursor:pointer ;padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="deActiveKPI" title="DeactivatePerformance Goal"></i>
       
        <i class="icon-pencil" style="cursor:pointer ;padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="EF" title="EditPerformance Goal" ></i>    

        <i class="cui-layers icons font-1xl" style="cursor:pointer ;padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="Track" title="TrackPerformance Goal" ></i>    
        
        `
       } else {
        actionlinks= `<i class="cui-circle-check font-1xl" style="cursor:pointer ;padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="activeKPI" title="activatePerformance Goal"></i>       
      
        <i class="cui-layers icons font-1xl" style="cursor:pointer ;padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="Track" title="TrackPerformance Goal" ></i>   
       
        `
       }

      //  actionlinks=  actionlinks+`
      //  <i class="icon-pencil" style="cursor:pointer ;padding: 7px 20px 0 0;
      //  font-size: 17px;"   data-action-type="EF" title="EditPerformance Goal" ></i>    
      //  `
       return actionlinks
       ;
      }
    }
  ];



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

          case "deActiveKPI":
            this.activedeActiveKPI(false);
          break;
          case "activeKPI":
            this.activedeActiveKPI(true);
            break;

            case "Track":
              this.trackKpi();
          break;



        default:
      }
    }
  }
  trackKpi() {

      this.trackViewRef = this.modalService.show(this.kpiTrackView, this.config);
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
this.snack.success(this.translate.instant(`Kpi ${isActive?'Activated':'Deactived'} Succeesfully`));
        
      }
    })

  }

  



  editKpiForm(currentRowItem: any) {
   

      this.router.navigate(['employee/kpi-setting',{action:'edit',id:this.currentRowItem._id}],{ skipLocationChange: true });
      
  }

  

  viewKpiForm(currentRowItem: any) {
   

    this.router.navigate(['employee/kpi-setting',{action:'view',id:this.currentRowItem._id}],{ skipLocationChange: true });
    
}
  



  
   /**To alert user for submit kpis */
   conformSubmitKpis() {
    this.alert.Title = "Secure Alert";
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
      this.perfApp.requestBody.IgnoreEvalAdminCreated=true;
      this.submitAllKPIs();
     } else {
       
     }
    })
  }


submitAllKPIs() {

  this.perfApp.route = "app";
  this.perfApp.method = "SubmitKpisForEvaluation",
    this.perfApp.requestBody = { 'empId': this.loginUser._id }
  this.perfApp.CallAPI().subscribe(c => {

   if (c) {
    this.snack.success(c.message);
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

    this.router.navigate(['employee/kpi-setting']);
  }


  getAllKpis() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllKpis",
    this.perfApp.requestBody = {
       'empId': this.loginUser._id,
       'currentOnly': true,
    'orgId':this.authService.getOrganization()._id}


    this.perfApp.CallAPI().subscribe(c => {

      if (c && c.length > 0) {
this.unSubmitedCount=c.filter(e=>e.IsSubmitedKPIs==false && e.IsDraft==false ).length;

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
      if (error.error.message === Constants.KpiNotActivated) {
        this.isKpiActivated=true;
        this.kpiListData=[];
        this.snack.error(error.error.message);
      } else {

      this.snack.error(error.error.message);

       }
    })
  }



}
