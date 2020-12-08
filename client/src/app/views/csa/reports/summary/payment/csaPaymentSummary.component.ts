import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import "ag-grid-community";
import { GridApi, GridOptions } from 'ag-grid-community';
import { AuthService } from './../../../../../services/auth.service';
import RefData from "../../../../psa/reports/data/refData";
import ReportTemplates from '../../../../psa/reports/data/reports-templates';

@Component({
  selector: 'app-reports',
  templateUrl: './csaPaymentSummary.component.html'
})
export class CSAPaymentSummary {
  public gridOptions: GridOptions;
  public showGrid: boolean;
  private rowData: any[];
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
    private activatedRoute: ActivatedRoute, ) {
    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();

    // we pass an empty gridOptions in, so we can grab the api out
    this.gridOptions = <GridOptions>{};
    this.gridOptions = {
      columnDefs: this.getCSAPaymentsSummaryColumnDefs(),
    }
    this.createRowData();
  }
  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }
  getCSAPaymentsSummaryColumnDefs() {
    return ReportTemplates.csaPaymentsSummaryColumnDefs.columnDefs;
  }
  private createRowData() {
    const rowData: any[] = [];
    // console.log('inside createHistoryData : ');
    var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    for (let i = 0; i < 20; i++) {
      rowData.push({
        evaluationPeriod: "JAN'20-DEC'20",
        purchasedOn: new Date(2010, 0, 1).toLocaleDateString(undefined, options),
        evaluationsType: RefData.evaluationTypes[0],
        licPurchasesCount: Math.round(Math.random() * 10),
      });
    }
    this.rowData=rowData;
  }

  gotoDashboard() {
    this.router.navigate(['/psa/dashboard'])
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

}
