import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import "ag-grid-community";
import { GridApi, GridOptions } from 'ag-grid-community';
import RefData from "../../../../psa/reports/data/refData";
import ReportTemplates from '../../../../psa/reports/data/reports-templates';
import { AuthService } from './../../../../../services/auth.service';

@Component({
  selector: 'app-reports',
  templateUrl: './csaPaymentSummary.component.html'
})
export class CSAPaymentSummary {
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
    private activatedRoute: ActivatedRoute, ) {
    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();

    // we pass an empty gridOptions in, so we can grab the api out
    this.gridOptions = <GridOptions>{};
    this.gridOptions = {
      columnDefs: this.getCSAPaymentsSummaryColumnDefs(),
    }
    this.defaultColDef = ReportTemplates.defaultColDef;
    this.createRowData();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  headerHeightSetter(event) {
    var padding = 20;
    var height = ReportTemplates.headerHeightGetter() + padding;
    this.api.setHeaderHeight(height);
    this.api.resetRowHeights();
    this.api.sizeColumnsToFit();
  }
  getCSAPaymentsSummaryColumnDefs() {
    return [
      { headerName: 'Payment Date', field: 'purchasedOn' },
      { headerName: 'Evaluation Period', field: 'evaluationPeriod', },
      { headerName: 'Type of Evaluations', field: 'evaluationsType', },
      { headerName: '# of Evaluations', field: 'licPurchasesCount', type: 'rightAligned', },
      { headerName: 'Amount(CAD)', field: 'licPurchasesCount', type: 'rightAligned', valueFormatter: params => params.data.licPurchasesCount.toFixed(2) },
    ];
  }

  createRowData() {
    const rowData: any[] = [];
    // console.log('inside createHistoryData : ');
    var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    for (let i = 0; i < 20; i++) {
      rowData.push({
        evaluationPeriod: "Jan'20 To Dec'20",
        purchasedOn: new Date(2010, 0, 1).toLocaleDateString(undefined, options),
        evaluationsType: RefData.evaluationTypes[0],
        licPurchasesCount: Math.round(Math.random() * 1000),
      });
    }
    this.rowData = rowData;
  }

  gotoDashboard() {
    this.router.navigate(['/csa/dashboard'])
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
    this.gridOptions.rowHeight = 40;
  }

  onQuickFilterChanged($event: any) {
    this.api.setQuickFilter($event.target.value);
  }


}
