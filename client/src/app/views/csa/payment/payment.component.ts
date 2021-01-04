import { Component, OnInit, ViewChild } from '@angular/core';
import { Router ,ActivatedRoute} from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { PerfAppService } from '../../../services/perf-app.service';
import { PaymentCaluculationService } from '../../../services/payment-caluculation.service';
import * as moment from 'moment/moment';
import { ModalDirective, BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NotificationService } from '../../../services/notification.service';
@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  stateTax:any;
  paymentOption:any;
  currentUser:any;
  currentOrganization:any;
  paymentDate:any = moment().format("MM/DD/YYYY")
  checkoutActivationDate:any = moment().format("MM/DD/YYYY")
  paymentModel:any={
    Organization:"",
    isAnnualPayment:true,
    NoOfMonthsLable:"0 Months",
    NoOfMonths:0,
    UserType:"",
    ActivationDate:moment().toDate(),
    Range:"",
    RangeId:"",
    NoOfEmployees:0,
    NoNeeded:0,
    Status:""
  };
  useageTypeEmployee:Boolean=false;
  isReseller:Boolean=false;
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
  selectedOrganizationObj:any;
  isActiveDateDisabled:Boolean=false;
  isPaymentFrequencyDisabled:Boolean=false;
  paymentReleaseData:any;
  isinitialPaymentDone:Boolean=false;
  isAdhocpayment:Boolean=false;
  

  @ViewChild("payment_Summary", { static: true }) emoModal: ModalDirective;

  constructor(
    public router: Router,
    public authService: AuthService,
    private perfApp: PerfAppService,
    private paymentCaluculationService:PaymentCaluculationService,
    private notification: NotificationService,
    ) {
    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
   }

  ngOnInit(): void {
    //console.log(this.currentOrganization._id)
    this.currentUser=this.authService.getCurrentUser();
    this.getTaxInfo(this.currentOrganization.State);
    //this.paymentModel.Organization = this.currentOrganization.Name;
    this.findInitialPayments(this.currentOrganization._id);
  }
  
  loadPayment(paymentOption){

    this.paymentOption = paymentOption;
    this.useageTypeEmployee=false;
    this.paymentModel.NoOfEmployees=0;
    this.isReseller = false;
    this.paymentModel.NoNeeded=0;
    this.paymentStructure=null;
    this.paymentScale=null;
    this.paymentSummary=null;
    this.isAdhocpayment=false;
    
    if(paymentOption!=""){

      this.isActiveDateDisabled=false;
      this.isPaymentFrequencyDisabled=false;
      switch (paymentOption) {
        case 'initial_pay':
          if(this.paymentReleaseData){
            this.orgnizationDetails();
            this.isActiveDateDisabled=true;
            this.isPaymentFrequencyDisabled=true;
          }else{
            this.notification.error("Initial payment was not found.")
          }
          break;
        case 'renewal_pay':
          if(this.isinitialPaymentDone){
            
          }else{
            this.notification.error('Renewal will be available after initial payment done.')
          }
          break;
        case 'adhoc_pay':
          if(this.isinitialPaymentDone){
            this.isAdhocpayment=true;
            this.findAdhocPayments(this.currentOrganization._id);
          }else{
            this.notification.error('Adhoc will be available after initial payment done.');
          }
          break;
        default:
          break;
      }
    }
  }
  getTaxInfo(State){
    console.log("getTaxInfo")
    let options={
      State
    };
    this.perfApp.route = "payments";
    this.perfApp.method = "tax";
    this.perfApp.requestBody = options;
    this.perfApp.CallAPI().subscribe(taxInfo => {
      console.log(taxInfo);
      this.stateTax = taxInfo.tax;
    })
}
  findInitialPayments(selectedOrgnization){
    let _requestBody={
      Organization:selectedOrgnization,
      Type:"Initial"
    }
    this.perfApp.route = "payments";
    this.perfApp.method = "release/organization";
    this.perfApp.requestBody = _requestBody;
    this.perfApp.CallAPI().subscribe(paymentRelease => {
      if(paymentRelease){
        this.paymentReleaseData = paymentRelease;
        if(paymentRelease.Status === "Complete"){
          this.isinitialPaymentDone = true;
        }
      }
    });
  }

  findAdhocPayments(selectedOrgnization){
    let _requestBody={
      Organization:selectedOrgnization,
      Type:"Adhoc",
      Status:{"$ne":"Complete"}
    }
    this.perfApp.route = "payments";
    this.perfApp.method = "adhoc/latest";
    this.perfApp.requestBody = _requestBody;
    this.perfApp.CallAPI().subscribe(AdhocPay => {
      if(AdhocPay){
        let {Status} = AdhocPay;
        if(Status === "Approved"){
          this.paymentReleaseData = AdhocPay;
          this.orgnizationDetails();
        }else if(Status === "Pending"){
          this.notification.error(`Adhoc payment Not Approved/Disapproved.`);
        }else if(Status === "Disapproved"){
          this.notification.error(`Adhoc payment Disapproved.`);
        }
        
      }else{
        this.notification.error(`Adhoc payment was not found.`);
      }
    });
  }


  orgnizationDetails(){
      let {Organization,isAnnualPayment,NoOfMonthsLable,NoOfMonths,UserType,ActivationDate,Range,NoOfEmployees,NoNeeded,Status} = this.paymentReleaseData;
      this.checkoutActivationDate = moment(ActivationDate).format("MM/DD/YYYY");
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

      this.paymentModel = {Organization,isAnnualPayment,NoOfMonthsLable,NoOfMonths,UserType,ActivationDate,Range,NoOfEmployees,NoNeeded,Status};
      this.paymentModel.paymentreleaseId = this.paymentReleaseData._id;
      this.paymentStructure = {COST_PER_PA,COST_PER_MONTH,DISCOUNT_PA_PAYMENT,TOTAL_AMOUNT,COST_PER_MONTH_ANNUAL_DISCOUNT};
      this.paymentSummary = {DUE_AMOUNT,TAX_AMOUNT,TOTAL_PAYABLE_AMOUNT};
      
  }

  loadOrganizationDefaultData(){
    this.selectedOrganizationObj = this.currentOrganization;
    this.caluculateNoOfMonths();
    this.paymentModel.UserType = this.selectedOrganizationObj.UsageType;
    if(this.selectedOrganizationObj.UsageType === "Employees"){
      this.useageTypeEmployee=true;
      this.paymentModel.NoOfEmployees=this.selectedOrganizationObj.UsageCount;
    }
    if(this.selectedOrganizationObj.ClientType === "Reseller"){
      this.isReseller=true;
    }
    this.getPaymentReleaseCost();
  }

  caluculateNoOfMonths(){
    console.log("==caluculateNoOfMonths==");
    console.log(this.selectedOrganizationObj)
    let activaDateMoment = moment(this.paymentModel.ActivationDate).startOf('month');
    //let activaDateMoment = moment("11/01/2020").startOf('month');
    let {EvaluationPeriod,EndMonth} = this.selectedOrganizationObj;
    let noOfMonths = 0;
    if(EvaluationPeriod === 'CalendarYear'){
      let momentEvlEndDate = moment(this.paymentModel.ActivationDate).endOf('year');
      noOfMonths = momentEvlEndDate.diff(activaDateMoment,'months')+1;
    }
    else if(EvaluationPeriod === 'FiscalYear'){
      let endMonthVal = Number(moment().month(EndMonth).format("M"));
      let currentMonth = Number(moment().format("M"));
      console.log(`${currentMonth} >= ${endMonthVal}`)
      if(currentMonth>=endMonthVal){
        let nextYear = moment(this.paymentModel.ActivationDate).add(1, 'years').month(parseInt(""+endMonthVal)-1).endOf('month');
        noOfMonths = nextYear.diff(activaDateMoment,'months')+1;
      }else{
        let nextYear = moment(this.paymentModel.ActivationDate).month(parseInt(""+endMonthVal)-1).endOf('month');
        noOfMonths = nextYear.diff(activaDateMoment,'months')+1;
      }
    }else if(this.selectedOrganizationObj.ClientType === "Reseller"){
      noOfMonths = 12;
    }

    this.paymentModel.NoOfMonthsLable = `${noOfMonths} Months`;
    this.paymentModel.NoOfMonths = noOfMonths;

    console.log("==End:caluculateNoOfMonths==");
  }

  getPaymentReleaseCost(){
    let paymentReleaseOptions:any={};
    paymentReleaseOptions.Organization=this.selectedOrganizationObj._id;
    paymentReleaseOptions.ClientType=this.selectedOrganizationObj.ClientType;
    paymentReleaseOptions.UsageType=this.selectedOrganizationObj.UsageType;
    paymentReleaseOptions.UsageCount=this.selectedOrganizationObj.UsageCount;
    paymentReleaseOptions.Type="Default"
    if(this.selectedOrganizationObj.Range){
      paymentReleaseOptions.Type="Range";
    };
    paymentReleaseOptions.State = this.selectedOrganizationObj.State;
    this.perfApp.route = "payments";
    this.perfApp.method = "Scale",
    this.perfApp.requestBody = paymentReleaseOptions;
    this.perfApp.CallAPI().subscribe(paymentScale => {
      if(paymentScale){
        this.paymentScale=paymentScale;
        this.paymentModel.Range = this.paymentScale.Range;
        this.paymentStructure = this.paymentCaluculationService.GetLicenceBreakdownPayment(this.paymentScale);
        /*if(this.selectedOrganizationObj.UsageType === "License"){
          this.paymentStructure = this.paymentCaluculationService.GetLicenceBreakdownPayment(this.paymentScale);
        }
        if(this.selectedOrganizationObj.UsageType === "Employees"){
          this.paymentScale.orgnization_noOfEmp = this.paymentModel.NoOfEmployees;
          this.paymentStructure = this.paymentCaluculationService.GetEmployeeBreakdownPayment(this.paymentScale);
        }*/
        if(this.paymentStructure){
          this.getPaymentSummary();
        }
        
      }else{
        this.paymentStructure=null;
        this.paymentScale=null;
      }
      
    });
  }

  getPaymentSummary(){
    let noOfMonths=1;
    let {NoNeeded,NoOfEmployees} = this.paymentModel;
    if(this.paymentModel.isAnnualPayment && this.paymentScale.ClientType!="Reseller"){
      noOfMonths=this.paymentModel.NoOfMonths;
    }else if(this.paymentModel.isAnnualPayment && this.paymentScale.ClientType=="Reseller"){
      noOfMonths=12;
    }else if(!this.paymentModel.isAnnualPayment && this.paymentScale.ClientType=="Reseller"){
      noOfMonths=1;
    }
    let options={noOfMonths,isAnnualPayment:this.paymentModel.isAnnualPayment,NoNeeded,NoOfEmployees};
    this.paymentSummary = this.paymentCaluculationService.CaluculatePaymentSummary(this.paymentStructure,options,this.paymentScale);
  }

  onChangeFrequency(){
    if(this.paymentScale){
      this.getPaymentSummary();
    }
  }

  refreshForm(){
    this.paymentModel={
      Organization:"",
      isAnnualPayment:true,
      NoOfMonths:"0",
      UserType:"",
      ActivationDate:new Date(),
      Range:"",
      NoOfEmployees:0,
      NoNeeded:0
    };
  }
  public onActivationDate(event): void {
    if(this.paymentModel.Organization!=""){
      this.orgnizationDetails();
    }
  }
  checkout(){
    if(this.paymentOption && this.paymentOption!="" && this.paymentReleaseData){
      this.emoModal.show();
    }else{
      this.notification.error("No Payment Available.");
    }
  }
  printPDFPage() {
    window.print();
  }
  
  proceedToPay(){
    this.router.navigate(['csa/dopayment',{totalAmount:this.paymentSummary.TOTAL_PAYABLE_AMOUNT,paymentreleaseId:this.paymentModel.paymentreleaseId}],{ skipLocationChange: true });
    /*let requestBody:any={
      Status:'Complete',
      paymentreleaseId:this.paymentModel.paymentreleaseId
    }
    this.perfApp.route = "payments";
     this.perfApp.method = "/release/save",
     this.perfApp.requestBody = requestBody
     this.perfApp.CallAPI().subscribe(c => {
      this.notification.success(`Payment Success.`);
      this.emoModal.hide();
      window.location.reload();
     })*/
  }
  closeForm(){
    this.emoModal.hide();
  }
  loadPaymentHistory(){
    this.router.navigate(['csa/payment-history',{Organization:this.currentOrganization._id}],{ skipLocationChange: true });
  }

  loadPriceListPage(){
    this.router.navigate(['psa/price-list'],{ skipLocationChange: true });
  }
}