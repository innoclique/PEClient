
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import "ag-grid-community";
import { GridApi, GridOptions } from 'ag-grid-community';
import { AuthService } from '../../../services/auth.service';
import RefData from "../../psa/reports/data/refData";
import ReportTemplates from '../../psa/reports/data/reports-templates';
import { ReportsService } from '../../../services/reports.service';
import { PerfAppService } from '../../../services/perf-app.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html'
})
export class ReportsComponent {
  public gridOptions: GridOptions;
  public showGrid: boolean;
  public rowData: any[];
  private api: GridApi;
  detailCellRendererParams: any;
  defaultColDef: any;
  currentUser: any;
  cscData: any = undefined;
  currentOrganization: any;
  detailCellRenderer: any;
  frameworkComponents: any;
  employeesList$: any = [];
  selectedEmployeesList: any = [];
  selectedEmployeeList: any = [];
  constructor(
    public authService: AuthService,
    public router: Router,
    public reportService: ReportsService,
    private perfApp: PerfAppService,
    private activatedRoute: ActivatedRoute, ) {
    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
    this.gridOptions = <GridOptions>{};
    this.gridOptions = {
      columnDefs: this.getCSAPaymentsSummaryColumnDefs(),
    }
    this.defaultColDef = ReportTemplates.defaultColDef;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
    this.getEvaluationsSummary();
  }

  getEvaluationsSummary() {
    this.getEvaluationList();

  }

  headerHeightSetter(event) {
    var padding = 20;
    var height = ReportTemplates.headerHeightGetter() + padding;
    this.api.setHeaderHeight(height);
    this.api.resetRowHeights();
  }

  getCSAPaymentsSummaryColumnDefs() {
    return [
      {
        headerName: 'Employee', field: 'emp',
      },
      { headerName: 'Employee Manager', field: 'mgr', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
      { headerName: 'Department', field: 'dept', minWidth: 50, width: 128, resizable: true, sortable: true, filter: true },
      { headerName: 'Title', field: 'title', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
      { headerName: 'Length of Service', field: 'servicePeriod' },
      { headerName: 'Length of Service in Current Role', field: 'currentRoleServicePeriod' },
      { headerName: 'Evaluation Status', field: 'status' },
    ];
  }
  getLengthOfService(joiningDate) {
    console.log(joiningDate);
    return new DateAgoPipe().transform(joiningDate);
  }
  createRowData(eaEvaluations: any) {
    const rowData: any[] = [];
    for (let i = 0; i < eaEvaluations.length; i++) {
      this.getLengthOfService(eaEvaluations[i].Employee.JoiningDate);
      rowData.push({
        emp: eaEvaluations[i].Employee.FirstName + "-" + eaEvaluations[i].Employee.LastName,
        mgr: eaEvaluations[i].Employee.Manager.FirstName + "-" + eaEvaluations[i].Employee.Manager.LastName,
        dept: eaEvaluations[i].Employee.Department,
        title: eaEvaluations[i].Employee.Title,
        servicePeriod: this.getLengthOfService(eaEvaluations[i].Employee.JoiningDate),
        currentRoleServicePeriod: this.getLengthOfService(eaEvaluations[i].Employee.RoleEffFrom),
        status: eaEvaluations[i].EvaluationRow.status,

      });
    }
    this.rowData = rowData;
  }

  gotoDashboard() {
    this.router.navigate(['/ea/dashboard'])
  }

  onBtExport() {
    var params = {
      columnWidth: parseFloat('200'),
      sheetName: 'Client-Info',
      exportMode: undefined,
      suppressTextAsCDATA: false,
      rowHeight: undefined,
      headerRowHeight: undefined,
    };
    this.api.exportDataAsExcel(params);
  }

  onReady(params: any) {
    this.api = params.api;
    console.log('onReady');
    this.api.sizeColumnsToFit();
    this.gridOptions.rowHeight = 34;
    this.gridOptions.groupMultiAutoColumn = true;
    this.gridOptions.columnApi.setColumnVisible('isPastData', false);
  }

  onQuickFilterChanged($event: any) {
    this.api.setQuickFilter($event.target.value);
  }


  getEvaluationList() {
    this.selectedEmployeesList = [];
    this.perfApp.route = "evaluation";
    this.perfApp.method = "GetEvaluations",
      this.perfApp.requestBody = { clientId: this.authService.getOrganization()._id }
    this.perfApp.CallAPI().subscribe(c => {
      console.log('evaluationList data', c);
      if (c) {
        // this.selectedEmployeesList = [];
        c.map(row => {
          if (row.Type === 'K') {
            this.selectedEmployeesList.push({
              Type: row.Type,
              EmployeeRow: row.Employee[0],
              EvaluationRow: row,
              Peers: [],
              DirectReportees: [],
              Model: '',
              Employee: row.Employee[0],
              PeersCompetencyMessage: '',
              DirectReporteeComptencyMessage: '',
              PeersCompetencyList: [],
              DirectReporteeCompetencyList: []
            });

          } else {
            var _f = Object.assign({}, row);
            row.Employees.map(x => {
              var _e = Object.assign({}, x);
              this.selectedEmployeesList.push({
                EmployeeRow: _e,
                EvaluationRow: _f,
                Peers: x.Peers,
                DirectReportees: x.DirectReportees,
                Model: x.Model,
                Employee: x._id,
                PeersCompetencyMessage: x.PeersCompetencyMessage,
                DirectReporteeComptencyMessage: x.DirectReporteeComptencyMessage,
                PeersCompetencyList: x.PeersCompetencyList,
                DirectReporteeCompetencyList: x.DirectReporteeCompetencyList
              });
            })

          }
        })

      }
      this.createRowData(this.selectedEmployeesList);
      // this.getEmployees(this.selectedEmployeesList);
    })

  }


}

