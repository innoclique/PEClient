import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import "ag-grid-community";
import { GridApi, GridOptions } from 'ag-grid-community';
import { AuthService } from './../../../../../services/auth.service';
import RefData from "../../../../psa/reports/data/refData";
import ReportTemplates from '../../../../psa/reports/data/reports-templates';
import { ReportsService } from '../../../../../services/reports.service';
import { PerfAppService } from '../../../../../services/perf-app.service';

@Component({
  selector: 'app-reports',
  templateUrl: './csaEvaluationSummary.component.html'
})
export class CSAEvaluationsSummary {
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
  rangeList: any[] = [];
  public rangeValue: any;
  constructor(
    public authService: AuthService,
    public reportService: ReportsService,
    public router: Router,
    private perfApp: PerfAppService,
    private activatedRoute: ActivatedRoute, ) {
    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
    this.gridOptions = <GridOptions>{};
    this.gridOptions = {
      columnDefs: this.getCSAEvaluationsSummaryColumnDefs(),
    }
    this.defaultColDef = ReportTemplates.defaultColDef;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    let rangeOptions = {
      UsageType: this.currentOrganization.UsageType ? this.currentOrganization.UsageType : "License",
      "Type": "Range"
    }

    this.getRangeList(rangeOptions);
    this.getEvaluationsSummary();

   
  }

  public headerHeightSetter(event) {
    var padding = 20;
    var height = ReportTemplates.headerHeightGetter() + padding;
    this.api.setHeaderHeight(height);
    this.api.resetRowHeights();
    this.api.sizeColumnsToFit();
  }
  getEvaluationsSummary() {
    let { Organization, _id } = this.currentUser;
    let orgId = Organization._id;

    let reqBody: any = {
      orgId: orgId,
      reportType: 'CLIENT_PURCHASE_HISTORY'
    };
    this.reportService.getReport(reqBody).subscribe(apiResponse => {
      console.log('EVALUATIONS_SUMMARY : ', apiResponse);
      this.createRowData(apiResponse);
    });

    // console.log('clientId : ', clientId)
    // let reqBody: any = {
    //   orgId: clientId,
    //   reportType: 'CLIENT_PURCHASE_HISTORY'
    // };
    // this.reportService.getReport(reqBody).subscribe(apiResponse => {
    //   console.log('CLIENT_PURCHASE_HISTORY : ', apiResponse);
    //   this.createRowData(apiResponse);
    // });

  }
  

  getCSAEvaluationsSummaryColumnDefs() {
    return [
      { headerName: 'Evaluation Period', field: 'evaluationPeriod' },
      { headerName: 'Evaluations Type', field: 'evaluationsType' },
      { headerName: '# of Evaluations', field: 'evaluationsCount',
        cellRenderer: (data) => {
          console.log(' data ::: ',data);
          return `<span title= Range:${data.data.range}>${data.value}</span>`
        }
},
    ];
  }

  createRowData(evaluationSummary: any) {
    const rowData: any[] = [];
    var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
   
    this.rangeValue = this.rangeList.find(rangObj => rangObj._id == this.currentOrganization.Range);
    for (let payment of evaluationSummary.clientInfo.paymentReleases) {
      var employeesCount = 0;
      var licencesCount = 0;
      var isLicenseCount:boolean = false;
      if (payment.UsageType === 'License') {
        if (payment.Type != 'Adhoc') {
          licencesCount = payment.Range.substring(payment.Range.indexOf('-')+1,payment.Range.length);
          isLicenseCount = true;
        } else {
          employeesCount = employeesCount + payment.NoOfEmployees;
        }
      } else {
        employeesCount = employeesCount + payment.NoOfEmployees;
      }
      // rowData.push({
      //   evaluationPeriod: ReportTemplates.getEvaluationPeriod(apiResponse.clientInfo.Organization.StartMonth, apiResponse.clientInfo.Organization.EndMonth),
      //   purchasedOn: new DatePipe('en-US').transform(payment.Paymentdate, 'MM-dd-yyyy'),
      //   evaluationsType: payment.Type === 'Initial' || payment.Type === 'Renewal' ? 'Year - end' : payment.Type,
      //   licPurchasesCount: isLicenseCount?licencesCount:employeesCount,
      //   paymentReleaseId: payment._id,
      //   amount: Number(payment.TOTAL_PAYABLE_AMOUNT)?parseFloat(payment.TOTAL_PAYABLE_AMOUNT):parseFloat(payment.TOTAL_PAYABLE_AMOUNT.$numberDecimal),
      // });
      rowData.push({
        evaluationPeriod: ReportTemplates.getEvaluationPeriod(this.currentOrganization.StartMonth,this.currentOrganization.EndMonth),
        evaluationsType: payment.Type === 'Initial' || payment.Type === 'Renewal' ? 'Year - end' : payment.Purpose,
        evaluationsCount: isLicenseCount?licencesCount:employeesCount,
        range:payment.Range
      });
    }
    console.log(' rowData : ',rowData);
    this.rowData = rowData;
  }

  gotoDashboard() {
    this.router.navigate(['/csa/dashboard'])
  }

  onBtExport() {
    var params = {
      columnWidth: parseFloat('200'),
      sheetName: 'Evaluations Summary',
      fileName: 'Evaluations Summary',
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

  getRangeList(options) {
    let ClientType = this.currentOrganization.ClientType ;
    options['ClientType'] = ClientType;

    this.perfApp.route = "payments";
    this.perfApp.method = "range/list";
    this.perfApp.requestBody = options;
    this.perfApp.CallAPI().subscribe(_rangeList => {
      this.rangeList = _rangeList;
    });
  }

}
