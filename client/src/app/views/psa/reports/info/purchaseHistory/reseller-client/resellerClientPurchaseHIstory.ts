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
  templateUrl: './resellerClientPurchaseHistory.html'
})
export class ResellerClientPurchaseHistory {
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

    // we pass an empty gridOptions in, so we can grab the api out
    this.gridOptions = <GridOptions>{};
    this.gridOptions = {
      columnDefs: this.getClientPurchaseHistoryColumnDefs(),
    }
    this.defaultColDef = ReportTemplates.defaultColDef;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.subscription.add(this.activatedRoute.params.subscribe(params => {
      if (params['clientId']) {
        this.getPurchaseHistoryInfo(params['clientId']);
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

  getClientPurchaseHistoryColumnDefs() {
    return [
      { headerName: 'Date of Purchase', field: 'purchasedOn' },
      { headerName: 'Evaluations Type', field: 'evaluationsType' },
      { headerName: '#s Purchased (# of Employees)', field: 'licPurchasesCount', type: 'rightAligned' },
      { headerName: '#s Purchased (License)', field: 'licPurchasesCount', type: 'rightAligned' },
    ];
  }

  createRowData(history: any) {
    const rowData: any[] = [];
    var options = { year: 'numeric', month: '2-digit', day: '2-digit' };

    this.resellerInfo = history.resellerInfo;
    this.resellerRow = {
      'Name': this.resellerInfo.Name,
      'year': new Date(this.resellerInfo.CreatedOn).toLocaleDateString(undefined, options),
      'active': this.resellerInfo.IsActive ? 'Yes' : 'No',
    };

    this.clientInfo = history.clientInfo.Organization;
    this.clientRow = {
      'Name': this.clientInfo.Name,
      'year': new Date(this.clientInfo.CreatedOn).toLocaleDateString(undefined, options),
      'active': this.clientInfo.IsActive ? 'Yes' : 'No',
      'usageType': this.clientInfo.UsageType,
      'evaluationsType': 'Year - end',
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
        evaluationPeriod: "JAN'20-DEC'20",
        purchasedOn: new Date(2010, 0, 1).toLocaleDateString(undefined, options),
        evaluationsType: 'Year - end',
        licPurchasesCount: Math.round(Math.random() * 10),
      });
    }
    this.rowData = rowData;
  }


  gotoClients() {
    this.router.navigate(['/psa/reports/info/reseller/clients/' + this.resellerInfo._id]);
    return;
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
    this.gridOptions.rowHeight = 39;
  }

  onQuickFilterChanged($event: any) {
    this.api.setQuickFilter($event.target.value);
  }

}
