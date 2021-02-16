import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import "ag-grid-community";
import * as moment from 'moment/moment';
import { GridApi, GridOptions } from 'ag-grid-community';
import RefData from "../../../../psa/reports/data/refData";
import ReportTemplates from '../../../../psa/reports/data/reports-templates';
import { AuthService } from './../../../../../services/auth.service';
import { ReportsService } from '../../../../../services/reports.service';
import { DatePipe } from '@angular/common';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { PerfAppService } from '../../../../../services/perf-app.service';

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
  paymentReleaseData:any;
  paymentReleaseId:any;
  checkoutActivationDate:any;
  paymentDate:any;
  paymentModel:any={
    Organization:"",
    isAnnualPayment:true,
    NoOfMonthsLable:"0 Months",
    NoOfMonths:0,
    UsageType:"",
    ActivationDate:moment().toDate(),
    Range:"",
    RangeId:"",
    NoOfEmployees:0,
    NoNeeded:0,
    Status:"",
    Paymentdate:moment().toDate()
  };
  paymentStructure:any={
    COST_PER_PA:0,
    COST_PER_MONTH:0,
    DISCOUNT_PA_PAYMENT:0,
    TOTAL_AMOUNT:0,
    COST_PER_MONTH_ANNUAL_DISCOUNT:0
  };
  paymentScale:any;
  paymentSummary:any={
    DUE_AMOUNT:0,
    TAX_AMOUNT:0,
    TOTAL_PAYABLE_AMOUNT:0
  };
  constructor(
    private perfApp: PerfAppService,
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

  findInitialPayments(selectedOrgnization){
    let _requestBody={
      _id:selectedOrgnization,
    }
    
    this.perfApp.route = "payments";
    this.perfApp.method = "release/organization";
    this.perfApp.requestBody = _requestBody;
    this.perfApp.CallAPI().subscribe(paymentRelease => {
      if(paymentRelease){
        this.paymentReleaseData = paymentRelease;
        this.orgnizationDetails();
      }
    });
  }
  orgnizationDetails(){
    this.paymentReleaseData;
    let {Organization,isAnnualPayment,NoOfMonthsLable,NoOfMonths,UsageType,ActivationDate,Range,NoOfEmployees,NoNeeded,Status,Paymentdate,DurationMonths} = this.paymentReleaseData;
    this.checkoutActivationDate = moment(ActivationDate).format("MM/DD/YYYY");
    if(Paymentdate){
      this.paymentDate = moment(Paymentdate).format("MM/DD/YYYY");
    }
    let {COST_PER_PA,COST_PER_MONTH,DISCOUNT_PA_PAYMENT,TOTAL_AMOUNT,COST_PER_MONTH_ANNUAL_DISCOUNT} = this.paymentReleaseData;
    
    COST_PER_PA = COST_PER_PA.$numberDecimal;
    COST_PER_MONTH = COST_PER_MONTH.$numberDecimal;
    DISCOUNT_PA_PAYMENT = DISCOUNT_PA_PAYMENT.$numberDecimal;
    TOTAL_AMOUNT = TOTAL_AMOUNT.$numberDecimal;
    COST_PER_MONTH_ANNUAL_DISCOUNT = COST_PER_MONTH_ANNUAL_DISCOUNT.$numberDecimal;

    let {DUE_AMOUNT,TAX_AMOUNT,TOTAL_PAYABLE_AMOUNT} = this.paymentReleaseData;
    
    DUE_AMOUNT = DUE_AMOUNT.$numberDecimal;
    TAX_AMOUNT = TAX_AMOUNT.$numberDecimal;
    TOTAL_PAYABLE_AMOUNT = TOTAL_PAYABLE_AMOUNT.$numberDecimal;

    this.paymentModel = {Organization,isAnnualPayment,NoOfMonthsLable,NoOfMonths,UsageType,ActivationDate,Range,NoOfEmployees,NoNeeded,Status,DurationMonths};
    this.paymentModel.paymentreleaseId = this.paymentReleaseData._id;
    this.paymentStructure = {COST_PER_PA,COST_PER_MONTH,DISCOUNT_PA_PAYMENT,TOTAL_AMOUNT,COST_PER_MONTH_ANNUAL_DISCOUNT};
    this.paymentSummary = {DUE_AMOUNT,TAX_AMOUNT,TOTAL_PAYABLE_AMOUNT};
    console.log(JSON.stringify(this.paymentSummary));
}
closeForm(){
  this.emoModal.hide();
}
  public onRowClicked(e) {
    if (e.event.target !== undefined) {
      console.log("on onRowClicked")
      let data = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "viewPayment":
          this.paymentReleaseId=data.paymentReleaseId;
          this.findInitialPayments(data.paymentReleaseId);
          this.emoModal.show();
      }
    }
  }
  @ViewChild("payment_Summary", { static: true }) emoModal: ModalDirective;
  getCSAPaymentsSummaryColumnDefs() {
    return [
      {
        headerName: 'Payment Date', field: 'purchasedOn', width: 300, tooltipField: 'clientName', sortable: true,  suppressSizeToFit: true, filter: true,  
        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="viewPayment">${data.value}</span>` }
      }, 
      // { headerName: 'Payment Date', field: 'purchasedOn' },
      { headerName: 'Evaluation Period', field: 'evaluationPeriod', },
      { headerName: 'Evaluations Type', field: 'evaluationsType', },
      { headerName: '# of Evaluations', field: 'licPurchasesCount', type: 'rightAligned', },
      { headerName: 'Amount(CAD)', field: 'amount', type: 'rightAligned', valueFormatter: params => params.data.amount.toFixed(2) },
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
    var totalExpenditure = 0;
    // console.log('inside createHistoryData : ');
    var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    for (let payment of apiResponse.clientInfo.paymentReleases) {
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
      rowData.push({
        evaluationPeriod: ReportTemplates.getEvaluationPeriod(apiResponse.clientInfo.Organization.StartMonth, apiResponse.clientInfo.Organization.EndMonth),
        purchasedOn: new DatePipe('en-US').transform(payment.Paymentdate, 'MM-dd-yyyy'),
        evaluationsType: payment.Type === 'Initial' || payment.Type === 'Renewal' ? 'Year - end' : payment.Type,
        licPurchasesCount: isLicenseCount?licencesCount:employeesCount,
        paymentReleaseId: payment._id,
        amount: Number(payment.TOTAL_PAYABLE_AMOUNT)?parseFloat(payment.TOTAL_PAYABLE_AMOUNT):parseFloat(payment.TOTAL_PAYABLE_AMOUNT.$numberDecimal),
      });
      console.log('totalExpenditure : ',totalExpenditure);
      totalExpenditure += totalExpenditure + Number(payment.TOTAL_PAYABLE_AMOUNT)?parseFloat(payment.TOTAL_PAYABLE_AMOUNT):parseFloat(payment.TOTAL_PAYABLE_AMOUNT.$numberDecimal);
    }
    this.rowData = rowData;
    this.clientRow.totalExpenditure = totalExpenditure;
    console.log('totalExpenditure : ',this.clientRow.totalExpenditure);
  }

  gotoDashboard() {
    this.router.navigate(['/csa/dashboard'])
  }

  onBtExport() {
    var params = {
      columnWidth: parseFloat('200'),
      fileName: 'Payment Summary',
      sheetName: 'Payment Summary',
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
  printPDFPage() {
    window.print();
  }


}
