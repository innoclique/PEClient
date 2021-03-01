import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import "ag-grid-community";
import { GridApi, GridOptions } from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../../../services/auth.service';
import { ReportsService } from '../../../../../../services/reports.service';
import ReportTemplates from '../../../data/reports-templates';
import RefData from '../../../data/refData';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-reports',
  templateUrl: './resellerRevenueDetails.html'
})
export class ResellerRevenueDetails {
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
      columnDefs: this.getResellerRevenueDetailsColumnDefs(),
    }
    this.defaultColDef = ReportTemplates.defaultColDef;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.subscription.add(this.activatedRoute.params.subscribe(params => {
      if (params['resellerId']) {
        this.getResellerRevenueDetails(params['resellerId']);
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

  getResellerRevenueDetails(resellerId) {
    console.log('resellerId : ', resellerId)
    let reqBody: any = {
      orgId: resellerId,
      reportType: 'RESELLER_REVENUE_DETAILS'
    };
    this.reportService.getReport(reqBody).subscribe(apiResponse => {
      console.log('RESELLER_REVENUE_DETAILS : ', apiResponse);
      this.createRowData(apiResponse);
    });
  }

  getResellerRevenueDetailsColumnDefs() {
    debugger;
    return [
      { headerName: 'Date of Purchase', field: 'purchasedOn' },
      // { headerName: 'Usage Type', field: 'usageType' },
      { headerName: 'Revenue(Licenses)(CAD)', field: 'licPurchasesCount', type: 'leftAligned', valueFormatter: params => params.data.licPurchasesCount.toFixed(2) },
      { headerName: 'Revenue(Employees)(CAD)', field: 'empPurchasesCount', type: 'leftAligned', valueFormatter: params => params.data.empPurchasesCount.toFixed(2) },
    ];
  }

  createRowData(history: any) {
    const rowData: any[] = [];
    var options = { year: 'numeric', month: '2-digit', day: '2-digit' };

    this.resellerInfo = history.resellerInfo.Organization;
    this.resellerRow = {
      'Name': this.resellerInfo.Name,
      'year': new Date(this.resellerInfo.CreatedOn).toLocaleDateString(undefined, options),
      'active': this.resellerInfo.IsActive ? 'Yes' : 'No',
    };

    // for (let i = 0; i < 20; i++) {
      for (let payment of history.resellerInfo.paymentReleases) {
        var employeesCount = 0;
        var licencesCount = 0;
        var isLicenseCount:boolean = false;
        if (payment.UserType === 'License') {
          if (payment.Type != 'Adhoc') {
            licencesCount = payment.Range.substring(payment.Range.indexOf('-')+1,payment.Range.length);
            isLicenseCount = true;
          } else {
            employeesCount = employeesCount + payment.NoOfEmployees;
          }
        } else {
          employeesCount = employeesCount + payment.NoOfEmployees;
        }
      rowData.push({
        usageType: payment.UserType,
        purchasedOn: new DatePipe('en-US').transform(payment.Paymentdate, 'MM-dd-yyyy'),
        evaluationsType: payment.Type === 'Initial' || payment.Type === 'Renewal' ? 'Year - end' : payment.Type,
        licPurchasesCount: isLicenseCount?Number(payment.TOTAL_PAYABLE_AMOUNT)?parseFloat(payment.TOTAL_PAYABLE_AMOUNT):parseFloat(payment.TOTAL_PAYABLE_AMOUNT.$numberDecimal):0,
        empPurchasesCount: isLicenseCount?0:Number(payment.TOTAL_PAYABLE_AMOUNT)?parseFloat(payment.TOTAL_PAYABLE_AMOUNT):parseFloat(payment.TOTAL_PAYABLE_AMOUNT.$numberDecimal),
        amount: Number(payment.TOTAL_PAYABLE_AMOUNT)?parseFloat(payment.TOTAL_PAYABLE_AMOUNT):parseFloat(payment.TOTAL_PAYABLE_AMOUNT.$numberDecimal),
      
      });
    }
    this.rowData = rowData;
  }

  gotoResellers() {
    this.router.navigate(['/psa/reports/revenue/reseller'])
  }

  onBtExport() {
    var params = {
      columnWidth: parseFloat('200'),
      sheetName: 'Reseller Revenue Details',
      fileName: 'Reseller Revenue Details',
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
    this.gridOptions.rowHeight = 40;
  }

  onQuickFilterChanged($event: any) {
    this.api.setQuickFilter($event.target.value);
  }

}
