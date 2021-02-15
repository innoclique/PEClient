
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';
import ReportTemplates from '../../views/psa/reports/data/reports-templates';

@Component({
  selector: 'app-copies-to',
  templateUrl: './copies-to.component.html'
  
})
export class CopiesToComponent implements OnInit {
  copiesToList = [];
  loginUser: any;
  empSelected: any;
  copiesToView: boolean = true;
  isPdfView: boolean = false;
  currentRowItem: any;

  public currentOrganization: any = {};
  evStatus: any;

  constructor(
    private authService: AuthService,
    private snack: NotificationService,
    private employeeService: EmployeeService,
    private perfApp: PerfAppService,
  ) {
    this.loginUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
  }

  ngOnInit(): void {
    this.getCopiesToWithEV();
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
    let requestBody: any = { id: _id }
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

  
  getCopiesToWithEV() {
    this.perfApp.route = "app";
    this.perfApp.method = "getCopiesToWithEV",
      this.perfApp.requestBody = { id: this.loginUser._id }
    this.perfApp.CallAPI().subscribe(res => {
      debugger
      if (res && !res.isError) {
        this.copiesToList = res.map(row => {
          row.Name = row.FirstName + ' ' + row.LastName;
          return {
            Name: row.Name,
            Department: row.Department,
            Title: row.Title,
            evType: row.Evaluation =='NA' ?row.Evaluation : row.Evaluation .EvalutionType,
            evStatus: row.EvStatus =='NA' ?row.EvStatus : row.EvStatus .Status,
            evPeriod: this.getEVPeriod(),
            RowData: row
          }
        }
        )
      }
    }
      , error => {
        this.snack.error('something went wrong')
      }
    )
  }

  public copiesToColumnDefs = [
    { headerName: 'Employee', field: 'Name', sortable: true, filter: true, },
    { headerName: 'Title', field: 'Title', sortable: true, filter: true, },
    { headerName: 'Department', field: 'Department', sortable: true, filter: true, },
    { headerName: 'Evaluation Period', field: 'evPeriod', sortable: true, filter: true, },
    { headerName: 'Evaluation Type', field: 'evType', sortable: true, filter: true, },
    {
      headerName: 'Review/Modify', field: '', autoHeight: true, suppressSizeToFit: true,
      cellRenderer: (data) => {
        var returnString = '';
        if(data.data.evStatus=='Evaluation Complete'){
        returnString += `<i class="cui-map" style="cursor:pointer; padding: 7px 20px 0 0;
      font-size: 17px;"   data-action-type="viewReport" title="View Evaluation Report"></i>`;
        return returnString;
        }else{

          returnString += `<i class="cui-map" style="cursor:pointer; padding: 7px 20px 0 0;
          font-size: 17px;   opacity: 0.65; "    data-action-type="viewReport" title="Evaluation Not Yet Completed"></i>`;
            return returnString;
        }
      }
    }
  ];

  onGridSizeChanged(params) {
    params.api.sizeColumnsToFit();
  }
  public getRowHeight = function (params) {
    return 34;
  };

  exitReportView() {
    this.isPdfView = false;
  }

  
  getEVPeriod() {
    return ReportTemplates.getEvaluationPeriod(this.currentOrganization.StartMonth, this.currentOrganization.EndMonth);
  }

  async pdfView(e) {
    if (e.event.target !== undefined && e.data.RowData.evStatus=='Evaluation Complete') {
      this.currentRowItem = e.data.RowData;
      this.empSelected = await this.authService.FindUserById(this.currentRowItem._id).subscribe(c => {
        if (c) {
          console.log('user by id pdf view:::', c);
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
}

