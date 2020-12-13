
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import "ag-grid-community";
import { GridApi, GridOptions } from 'ag-grid-community';
import { AuthService } from '../../../services/auth.service';
import RefData from "../../psa/reports/data/refData";
import ReportTemplates from '../../psa/reports/data/reports-templates';
import { ReportsService } from '../../../services/reports.service';

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
  constructor(
    public authService: AuthService,
    public router: Router,
    public reportService: ReportsService,
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
    this.getEvaluationsSummary();
  }

  getEvaluationsSummary() {
    console.log(this.currentUser);
    let {  _id } = this.currentUser;
    let orgId = _id;

    let reqBody: any = {
      orgId: orgId,
      reportType: 'EA_EVALUATIONS'
    };
    this.reportService.getReport(reqBody).subscribe(apiResponse => {
      console.log('EA_EVALUATIONS : ', apiResponse);
      this.createRowData(apiResponse);
    });

  }

  public headerHeightSetter() {
    var padding = 20;
    var height = ReportTemplates.headerHeightGetter() + padding;
    this.api.setHeaderHeight(height);
    this.api.resetRowHeights();
  }

  getCSAPaymentsSummaryColumnDefs() {
    return  [
      { headerName: 'Employee', field: 'emp' },
      { headerName: 'Employee Manager', field: 'mgr', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
      { headerName: 'Department', field: 'dept', minWidth: 50, width: 128, resizable: true, sortable: true, filter: true },
      { headerName: 'Title', field: 'title', sortable: true, minWidth: 50, width: 128, resizable: true, filter: true },
      { headerName: 'Length of Service', field: 'servicePeriod' },
      { headerName: 'Length of Service in Current Role', field: 'currentRoleServicePeriod' },
      { headerName: 'Evaluation Status', field: 'status' },
  ];
  }

  createRowData(eaEvaluations:any) {
    const rowData: any[] = [];
    var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    for (let i = 0; i < 20; i++) {
      rowData.push({
        evaluationPeriod: "JAN'20-DEC'20",
        purchasedOn: new Date(2010, 0, 1).toLocaleDateString(undefined, options),
        evaluationsType: RefData.evaluationTypes[0],
        licPurchasesCount: Math.round(Math.random() * 10),
        emp:'David Fletcher',
        mgr:'Andrew Sandieago',
        dept:'Dev',
        title:'SSE',
        servicePeriod:'3 Months',
        currentRoleServicePeriod:'1 Month',
        status:'in Progress',

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

}

