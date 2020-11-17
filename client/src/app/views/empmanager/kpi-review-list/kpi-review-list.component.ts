

import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AlertDialog } from '../../../Models/AlertDialog';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { PerfAppService } from '../../../services/perf-app.service';
import { ThemeService } from '../../../services/theme.service';
import { Constants } from '../../../shared/AppConstants';

@Component({
  selector: 'app-kpi-review-list',
  templateUrl: './kpi-review-list.component.html',
  styleUrls: ['./kpi-review-list.component.css']
})
export class KpiReviewListComponent implements OnInit {




  loginUser: any;
  currentRowItem: any;
  public alert: AlertDialog;
  public kpiListData: any
  isKpiActivated=false;

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    public dialog: MatDialog,
    public themeService: ThemeService,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService) {
    this.loginUser = this.authService.getCurrentUser();




  }

  ngOnInit(): void {

    this.getAllKpis();
  }


  public columnDefs = [
    {
      headerName: 'Name', field: 'Name', width: 320, sortable: true, filter: true,
      cellRenderer: (data) => {
        return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
      }
    },
    { headerName: 'No.of Kpis', field: 'KpiCount', sortable: true, filter: true },
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

          case "addKPI":
            this.addKpiForm();
          break;



        default:
      }
    }
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
   

      this.router.navigate(['employee/kpi-setting',{action:'edit',id:this.currentRowItem._id}],{ skipLocationChange: true });
      
  }

  
  addKpiForm() {
   

    this.router.navigate(['em/add-kpi',{action:'add',ownerId:this.currentRowItem[0].Owner._id}],{ skipLocationChange: true });
    
}

  

  viewKpiForm(currentRowItem: any) {
   

    this.router.navigate(['em/kpi-review',
       {action:'view',id:this.currentRowItem[0]._id,empId:this.currentRowItem[0].Owner._id}
        ],{ skipLocationChange: true });
    
}
  


  createKpi(){

    this.router.navigate(['employee/kpi-setting']);
  }


  getAllKpis() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetKpisByManager",
      this.perfApp.requestBody = { 'managerId': this.loginUser._id }


    this.perfApp.CallAPI().subscribe(c => {

      if(c){ 
 const kpiGroup=  c.reduce((acc, obj) => {
  const key = obj.Owner.FirstName;
  if (!acc[key]) {
     acc[key] = [];
  }
  // Add object to list for given key's value
  acc[key].push(obj);
  return acc;
}, {});

      this.kpiListData=[];
      if (kpiGroup) {
        for(var i in kpiGroup) 
        this.kpiListData.push({

          Name:i,
          KpiCount: kpiGroup[i].length,
          RowData: kpiGroup[i]
        }); 
      }

    }
     
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

