import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import "ag-grid-community";
import { GridApi, GridOptions } from 'ag-grid-community';
import RefData from "../../../../psa/reports/data/refData";
import ReportTemplates from '../../../../psa/reports/data/reports-templates';
import { AuthService } from './../../../../../services/auth.service';
import { ReportsService } from '../../../../../services/reports.service';
import { DatePipe } from '@angular/common';

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
  clientRow: any;
  constructor(
    public authService: AuthService,
    public reportService: ReportsService,
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
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    let { Organization, _id } = this.currentUser;
        let orgId = Organization._id;
    this.getPurchaseHistoryInfo(orgId);
  }

  headerHeightSetter(event) {
    var padding = 20;
    var height = ReportTemplates.headerHeightGetter() + padding;
    this.api.setHeaderHeight(height);
    this.api.resetRowHeights();
    this.api.sizeColumnsToFit();
  }

  getPurchaseHistoryInfo(clientId) {
    console.log('clientId : ', clientId)
    let reqBody: any = {
      orgId: clientId,
      reportType: 'CLIENT_PURCHASE_HISTORY'
    };
    this.reportService.getReport(reqBody).subscribe(apiResponse => {
      console.log('CLIENT_PURCHASE_HISTORY : ', apiResponse);
      this.createRowData(apiResponse);
    });
  }
  getCSAPaymentsSummaryColumnDefs() {
    return [
      { headerName: 'Payment Date', field: 'purchasedOn' },
      { headerName: 'Evaluation Period', field: 'evaluationPeriod', },
      { headerName: 'Evaluations Type', field: 'evaluationsType', },
      { headerName: '# of Evaluations', field: 'licPurchasesCount', type: 'rightAligned', },
      { headerName: 'Amount(CAD)', field: 'licPurchasesCount', type: 'rightAligned', valueFormatter: params => params.data.licPurchasesCount.toFixed(2) },
    ];
  }

  createRowData(apiResponse:any) {
    const rowData: any[] = [];
    this.clientRow = {
      'Name': apiResponse.clientInfo.Organization.Name,
      'year': new Date(apiResponse.clientInfo.Organization.CreatedOn).toLocaleDateString(undefined, options),
      'active': apiResponse.clientInfo.Organization.IsActive ? 'Yes' : 'No',
      'usageType': apiResponse.clientInfo.Organization.UsageType,
      'evaluationsType': apiResponse.clientInfo.Organization.EvaluationPeriod,
    };
    var totalExpenditure = 0.00;
    // console.log('inside createHistoryData : ');
    var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    for (let payment of apiResponse.clientInfo.paymentReleases) {
      var employeesCount = 0;
      var licencesCount = 0;
      if (payment.UserType === 'License') {
        if (payment.Type != 'Adhoc') {
          licencesCount++;
        } else {
          employeesCount = employeesCount + payment.NoOfEmployees;
        }
      } else {
        employeesCount = employeesCount + payment.NoOfEmployees;
      }
      var licPurchasesCount = Math.round(Math.random() * 1000);
      rowData.push({
        evaluationPeriod: ReportTemplates.getEvaluationPeriod(apiResponse.clientInfo.Organization.StartMonth, apiResponse.clientInfo.Organization.EndMonth),
        purchasedOn: new DatePipe('en-US').transform(payment.Paymentdate, 'MM-dd-yyyy'),
        evaluationsType: payment.Type === 'Initial' || payment.Type === 'Renewal' ? 'Year - end' : payment.Type,
        licPurchasesCount: Number(payment.TOTAL_PAYABLE_AMOUNT)?parseFloat(payment.TOTAL_PAYABLE_AMOUNT):parseFloat(payment.TOTAL_PAYABLE_AMOUNT.$numberDecimal),
      });
      totalExpenditure = totalExpenditure + licPurchasesCount;
    }
    this.rowData = rowData;
    this.clientRow.totalExpenditure =totalExpenditure;
    console.log('totalExpenditure : ',this.clientRow.totalExpenditure);
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
