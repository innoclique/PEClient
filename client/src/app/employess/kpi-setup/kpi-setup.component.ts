import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AlertDialog } from '../../Models/AlertDialog';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';
import { ThemeService } from '../../services/theme.service';

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
      headerName: 'KPI Name', field: 'Name', width: 320, sortable: true, filter: true,
      cellRenderer: (data) => {
        return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
      }
    },
    { headerName: 'Target Completion', field: 'TargetCompletionDate', sortable: true, filter: true },
    { headerName: 'Score (self)', field: 'Score', width: 150, sortable: true, filter: true },
    { headerName: 'Status', field: 'Status', width: 150, sortable: true, filter: true },
    {
      headerName: 'Action', field: '', width: 200, autoHeight: true, suppressSizeToFit: true,
      cellRenderer: (data) => {

        var returnString = '';
        returnString += `<i class="fa fa-edit" style="cursor:pointer; padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="EF" title="Edit"></i>`;
        return returnString;
      }
    }
  ];



  public onKpiGridRowClick(e) {
    if (e.event.target !== undefined) {
      this.currentRowItem = e.data.RowData;;

      let actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {

        case "VF":
          // this.viewEmpForm(this.currentRowItem);
          break;
        case "EF":
          //  this.editEmpForm(this.currentRowItem);
          break;

        default:
      }
    }
  }


  createKpi(){

    this.router.navigate(['employee/kpi-setting']);
  }


  getAllKpis() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllKpis",
      this.perfApp.requestBody = { 'empId': this.loginUser._id }


    this.perfApp.CallAPI().subscribe(c => {

      if (c && c.length > 0) {
      this.kpiListData = c.map(function (row) {


        return {
          Name: row.Kpi,
          TargetCompletionDate: row.TargetCompletionDate,
          Score: row.Score,
          YearEndComments: row.YearEndComments,
          Status: row.Status,

          RowData: row
        }
      }
      )


    }
    })
  }



}
