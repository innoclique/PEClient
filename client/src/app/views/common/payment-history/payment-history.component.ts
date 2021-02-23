import { Component, OnInit ,ViewChild} from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { PerfAppService } from '../../../services/perf-app.service';
import * as moment from 'moment/moment';
import { ModalDirective, BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NotificationService } from '../../../services/notification.service';
import { Router ,ActivatedRoute} from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.css']
})
export class PaymentHistoryComponent implements OnInit {
  paymentReleaseId:any;
  paymentHistoryList:any=[];
  OrganizationName:any="";
  currentOrganization:any;
  paymentReleaseData:any;
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
  popupHeading:any="";
  currentUser:any;

  @ViewChild("payment_Summary", { static: true }) emoModal: ModalDirective;
  public PaymentGridOptions: GridOptions = {
    columnDefs: this.getColDef()      
  }
  constructor(
    private perfApp: PerfAppService,
    private activatedRoute: ActivatedRoute,
    private notification: NotificationService,
    public authService: AuthService,) {
      this.currentUser = this.authService.getCurrentUser();
      this.currentOrganization = this.authService.getOrganization();
     }

  ngOnInit(): void {
    this.onloadParams();
  }

  onloadParams(){
    this.activatedRoute.params.subscribe(params => {
      if (params['Organization']) {
        this.getPaymentHistoryList(params['Organization'])
      }
      
     });  
  }


  getColDef(){
    return  [
      {
        headerName: 'Payment Date', field: 'paymentDate', width: 300, tooltipField: 'clientName', sortable: true,  suppressSizeToFit: true, filter: true,  
        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="viewPayment">${data.value}</span>` }
      }, 
      //{ headerName: 'Client', field: 'clientName', sortable: true, filter: true },     
      { headerName: 'Amount', field: 'amount', width: 320, sortable: true, filter: true },
      { headerName: 'Status', field: 'status', width: 350,sortable: true, filter: true }
      
    ];
  
  }

  getPaymentHistoryList(Organization) {
    this.perfApp.route = "transactions";
    this.perfApp.method = "list",
    this.perfApp.requestBody = { 
      Organization
     }
    this.perfApp.CallAPI().subscribe(_paymentList => {
      //this.paymentHistoryList = _paymentList;
      _paymentList.map(row=>{
        let paymentObj=row;
        this.OrganizationName=paymentObj.Organization.Name;
        this.paymentHistoryList.push({
          paymentDate:moment(paymentObj.CreatedOn).format("MM/DD/YYYY"),
          amount:paymentObj.Amount,
          status:paymentObj.Status,
          paymentReleaseId:paymentObj.PaymentReleaseId,
        });
      });
      this.PaymentGridOptions.api.setRowData(this.paymentHistoryList);
    })
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
  sendEmail(){
    let requestBody:any = {};
    requestBody.currentUser = this.currentUser;
    requestBody.paymentModel = this.paymentModel;
    requestBody.paymentStructure = this.paymentStructure;
    requestBody.organization = this.currentOrganization;
    requestBody.paymentSummary = this.paymentSummary;
    console.log(requestBody);
    this.perfApp.route = "payments";
    this.perfApp.method = "info/email";
    this.perfApp.requestBody = requestBody;
    this.perfApp.CallAPI().subscribe(paymentRelease => {
      if(paymentRelease){
        this.notification.success(`Email sent to ${this.currentUser.Email}`);
      }
    });
  }

  findInitialPayments(paymentReleaseId){
    /*let _requestBody={
      Organization:selectedOrgnization,
      Type:"Adhoc",
      Status:"Pending"
    };*/
    let _requestBody={
      _id:paymentReleaseId,
    }
    
    this.perfApp.route = "payments";
    this.perfApp.method = "release/organization";
    this.perfApp.requestBody = _requestBody;
    this.perfApp.CallAPI().subscribe(paymentRelease => {
      if(paymentRelease){
        this.paymentReleaseData = paymentRelease;
        this.orgnizationDetails();
      }else{
        this.notification.error("No Payment Info Available.");
        this.emoModal.hide();
      }
    });
  }

  orgnizationDetails(){
      this.popupHeading="Payment Details";
      let {ClientType,EvaluationPeriod,Organization,isAnnualPayment,NoOfMonthsLable,NoOfMonths,UsageType,ActivationDate,Range,NoOfEmployees,NoNeeded,Status,Paymentdate,DurationMonths} = this.paymentReleaseData;
      this.checkoutActivationDate = moment(ActivationDate).format("MM/DD/YYYY");
      if(ClientType && ClientType!="Reseller"){
        if(EvaluationPeriod){
          this.popupHeading+=" - "+EvaluationPeriod;
        }
      }
      if(Paymentdate){
        this.paymentDate = moment(Paymentdate).format("MM/DD/YYYY");
        this.popupHeading+=" - "+this.paymentDate
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

  printPDFPage() {
    window.print();
  }
  
}
