import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import "ag-grid-community";
import { GridApi, GridOptions } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../../../services/auth.service';
import { ReportsService } from '../../../../../../services/reports.service';
import ReportTemplates from '../../../data/reports-templates';

@Component({
  selector: 'app-reports',
  templateUrl: './clientRevenueDetails.html'
})
export class ClientRevenueDetails {
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
  resellerInfo: any;
  resellerRow: any;
  clientInfo: any;
  clientRow: any;
  subscription: Subscription = new Subscription();
  constructor(
    public authService: AuthService,
    public reportService: ReportsService,
    public router: Router,
    private activatedRoute: ActivatedRoute, ) {
    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
    this.gridOptions = <GridOptions>{};
    this.gridOptions = {
      columnDefs: this.getClientRevenueDetailsColumnDefs(),
    }
    this.defaultColDef = ReportTemplates.defaultColDef;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.subscription.add(this.activatedRoute.params.subscribe(params => {
      if (params['clientId']) {
        this.getClientRevenueDetails(params['clientId']);
      }
    }));
  }

  headerHeightSetter(event) {
    var padding = 20;
    var height = ReportTemplates.headerHeightGetter() + padding;
    this.api.setHeaderHeight(height);
    this.api.resetRowHeights();
    this.api.sizeColumnsToFit();
  }

  getClientRevenueDetails(clientId) {
    console.log('clientId : ', clientId)
    let reqBody: any = {
      orgId: clientId,
      reportType: 'CLIENT_REVENUE_DETAILS'
    };
    this.reportService.getReport(reqBody).subscribe(apiResponse => {
      console.log('CLIENT_REVENUE_DETAILS : ', apiResponse);
      this.createRowData(apiResponse);
    });
  }

  getClientRevenueDetailsColumnDefs() {
    return [
      { headerName: 'Evaluation Period', field: 'evaluationPeriod' },
      { headerName: 'Date of Purchase', field: 'purchasedOn' },
      { headerName: 'Evaluations Type', field: 'evaluationsType' },
      { headerName: '#s Purchased', field: 'licPurchasesCount', type: 'rightAligned' },
      { headerName: 'Amount (CAD)', field: 'amount', type: 'rightAligned', valueFormatter: params => params.data.amount.toFixed(2) },
    ];
  }

  createRowData(history: any) {
    const rowData: any[] = [];
    var options = { year: 'numeric', month: '2-digit', day: '2-digit' };

    this.clientInfo = history.clientInfo.Organization;
    this.clientRow = {
      'Name': this.clientInfo.Name,
      'year': new Date(this.clientInfo.CreatedOn).toLocaleDateString(undefined, options),
      'active': this.clientInfo.IsActive ? 'Yes' : 'No',
      'usageType': this.clientInfo.UsageType,
      'evaluationsType': this.clientInfo.EvaluationPeriod,
      'evaluationPeriod': ReportTemplates.getEvaluationPeriod(this.clientInfo.StartMonth,this.clientInfo.EndMonth),
    };

    for (let payment of history.clientInfo.paymentReleases) {
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
      rowData.push({
        purchasedOn: new DatePipe('en-US').transform(payment.Paymentdate, 'MM-dd-yyyy'),
        evaluationsType: payment.Type === 'Initial' || payment.Type === 'Renewal' ? 'Year - end' : payment.Type,
        licPurchasesCount: licencesCount,
        empPurchasesCount: employeesCount,
        evaluationPeriod: ReportTemplates.getEvaluationPeriod(this.clientInfo.StartMonth,this.clientInfo.EndMonth),
        amount:payment.TOTAL_PAYABLE_AMOUNT,
      });
    }
    this.rowData = rowData;
  }

  gotoClients() {
    this.router.navigate(['/psa/reports/revenue/client'])
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
