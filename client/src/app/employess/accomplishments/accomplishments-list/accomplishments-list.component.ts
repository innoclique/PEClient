

import { DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { AlertDialog } from '../../../Models/AlertDialog';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { PerfAppService } from '../../../services/perf-app.service';
import { ThemeService } from '../../../services/theme.service';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { Constants } from '../../../shared/AppConstants';


@Component({
  selector: 'app-accomplishments-list',
  templateUrl: './accomplishments-list.component.html',
  styleUrls: ['./accomplishments-list.component.css']
})
export class AccomplishmentsListComponent implements OnInit {




  loginUser: any;
  currentRowItem: any;
  public alert: AlertDialog;
  public kpiListData: any
  isKpiActivated=false;
  unSubmitedCount=0;
  scoreUnSubmitedCount=0;

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

    this.GetAllAccomplishmentsDetails();
    this.alert = new AlertDialog();
  }


  public columnDefs = [
    {
      headerName: 'Accomplishment', field: 'Accomplishment', tooltipField: 'Accomplishment', suppressSizeToFit: true,  sortable: true, filter: true,
      cellRenderer: (data) => {
        
        return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
      }
    },
    { headerName: 'Completion Date', field: 'CompletionDate', suppressSizeToFit: true,  sortable: true, filter: true },
    { headerName: 'Show to Manager', field: 'ShowToManager',  sortable: true, filter: true },
    { headerName: 'Draft', field: 'IsDraft',  sortable: true, filter: true },
   
    {
      headerName: 'Action', field: '',  autoHeight: true,  suppressSizeToFit: true,
      cellRenderer: (data) => {
 let actionlinks=''
       if (data.data.RowData.IsActive) {
        actionlinks= `<i class="icon-pencil" style="cursor:pointer ;padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="EF" title="EditPerformance Goal" ></i>    
        
       
        
        `
       }
     

     
       return actionlinks
       ;
      }
    }
  ];

  onGridReady(params) {
    
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

      this.GetAllAccomplishmentsDetails();
this.snack.success(this.translate.instant(`Performance Goal ${isActive?'Activated':'Deactivated'} Successfully`));
        
      }
    })

  }

  



  editKpiForm(currentRowItem: any) {
   

      this.router.navigate(['employee/accomplishments',{action:'edit',id:this.currentRowItem._id}],{ skipLocationChange: true });
      
  }

  

  viewKpiForm(currentRowItem: any) {
   

    this.router.navigate(['employee/accomplishments',{action:'view',id:this.currentRowItem._id}],{ skipLocationChange: true });
    
}
  






  createAccomplishment(){

    this.router.navigate(['employee/accomplishments']);
  }


  GetAllAccomplishmentsDetails() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllAccomplishments",
    this.perfApp.requestBody = {
       'empId': this.loginUser._id,
       'currentOnly': true,
    'orgId':this.authService.getOrganization()._id}


    this.perfApp.CallAPI().subscribe(c => {

      if (c && c.length > 0) {


      this.kpiListData = c.map(function (row) {


        return {
          Accomplishment: row.Accomplishment,
          CompletionDate: new DatePipe('en-US').transform(row.CompletionDate, 'MM-dd-yyyy'),
          IsDraft: row.IsDraft?'Yes':'No',
          Comments: row.Comments,
          ShowToManager: row.ShowToManager?'Yes':'No',
          
          RowData: row
        }
      }
      )


    }else{ this.kpiListData=[] }
    }, error => {
      
        this.kpiListData=[];
      this.snack.error(error.error.message);

       
    })
  }



}

