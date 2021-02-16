import { DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import "ag-grid-community";
import { GridApi, GridOptions } from 'ag-grid-community';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../../../services/auth.service';
import { PerfAppService } from '../../../../../../services/perf-app.service';
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
  subscription: Subscription = new Subscription();
  constructor(
    private perfApp: PerfAppService,
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
  getClientRevenueDetailsColumnDefs() {
    
    return [
      { headerName: 'Evaluation Period', field: 'evaluationPeriod' },
      // { headerName: 'Date of Purchase', field: 'purchasedOn' },
      {
        headerName: 'Payment Date', field: 'purchasedOn', width: 300, tooltipField: 'clientName', sortable: true,  suppressSizeToFit: true, filter: true,  
        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="viewPayment">${data.value}</span>` }
      }, 
      { headerName: 'Evaluations Type', field: 'evaluationsType' },
      { headerName: '#s Purchased', field: 'licPurchasesCount', type: 'leftAligned' } ,
      { headerName: 'Amount (CAD)', field: 'amount', type: 'leftAligned', valueFormatter: params => params.data.amount.toFixed(2) },
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
        purchasedOn: new DatePipe('en-US').transform(payment.Paymentdate, 'MM-dd-yyyy'),
        evaluationsType: payment.Type === 'Initial' || payment.Type === 'Renewal' ? 'Year - end' : payment.Type,
        licPurchasesCount: isLicenseCount?licencesCount:employeesCount,
        paymentReleaseId: payment._id,
        evaluationPeriod: ReportTemplates.getEvaluationPeriod(this.clientInfo.StartMonth,this.clientInfo.EndMonth),
        amount: Number(payment.TOTAL_PAYABLE_AMOUNT)?parseFloat(payment.TOTAL_PAYABLE_AMOUNT):parseFloat(payment.TOTAL_PAYABLE_AMOUNT.$numberDecimal),
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
      sheetName: 'Client Revenue Details',
      fileName: 'Client Revenue Details',
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
