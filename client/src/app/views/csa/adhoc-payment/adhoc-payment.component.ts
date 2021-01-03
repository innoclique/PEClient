import { Component, OnInit, ViewChild } from '@angular/core';
import { Router ,ActivatedRoute} from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { PerfAppService } from '../../../services/perf-app.service';
import { PaymentCaluculationService } from '../../../services/payment-caluculation.service';
import * as moment from 'moment/moment';
import { ModalDirective, BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NotificationService } from '../../../services/notification.service';
@Component({
  selector: 'app-adhoc-payment',
  templateUrl: './adhoc-payment.component.html',
  styleUrls: ['./adhoc-payment.component.css']
})
export class AdhocPaymentComponent implements OnInit {
  isAdhocPaymentAllowed:Boolean=true;
  stateTax:any;
  otherTextValue:any;
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
    Status:"",
    DurationMonths:"1",
    Purpose:""
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
  isCheckout:Boolean=false;
  isOtherText:Boolean=false;


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
    //this.paymentModel.Organization = this.currentOrganization.Name;
    this.getTaxInfo(this.currentOrganization.State);
    this.findInitialPayments(this.currentOrganization._id);
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
          this.loadOrganizationDefaultData(selectedOrgnization);
        }else{
          this.notification.error(`Adhoc payment not allowed.`);
          this.isAdhocPaymentAllowed=false;
        }
        
      }else{
        this.notification.error(`Adhoc payment not allowed.`);
        this.isAdhocPaymentAllowed=false;
      }
    });
  }
  
  orgnizationDetails(){
    this.paymentReleaseData;
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
      console.log(JSON.stringify(this.paymentSummary));
  }

  loadOrganizationDefaultData(selectedOrgnization){
    this.selectedOrganizationObj = this.currentOrganization;
    this.caluculateNoOfMonths();
    this.paymentModel.UserType = this.selectedOrganizationObj.UsageType;
  }
  onSearchChange(searchValue: string): void {
    if(searchValue && searchValue!="" && searchValue!="0"){
      console.log(searchValue);
      this.getPaymentReleaseCost();
    }else{
      this.refreshForm();
    }
  }
  loadDuration(){
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
    paymentReleaseOptions.noOfEmployess=Number(this.paymentModel.NoOfEmployees)
    paymentReleaseOptions.State = this.selectedOrganizationObj.State;
    this.perfApp.route = "payments";
    this.perfApp.method = "employee/scale",
    this.perfApp.requestBody = paymentReleaseOptions;
    this.perfApp.CallAPI().subscribe(paymentScale => {
      if(paymentScale){
        this.paymentScale=paymentScale;
        this.paymentScale.Tax = this.stateTax;
        this.paymentModel.Range = this.paymentScale.Range;
        this.paymentStructure = this.paymentCaluculationService.GetLicenceBreakdownPayment(this.paymentScale);
        if(this.paymentStructure){
          this.getPaymentSummary();
        }
        
      }else{
        this.notification.error("Range not found")
        this.paymentStructure=null;
        this.paymentScale=null;
        this.refreshForm();
      }
      
    });
  }

  getPaymentSummary(){
    let noOfMonths=1;
    if(this.paymentModel.isAnnualPayment){
      noOfMonths=this.paymentModel.NoOfMonths;
    }
    if(this.paymentModel.DurationMonths && this.paymentModel.DurationMonths !== "0"){
      noOfMonths = Number(this.paymentModel.DurationMonths);
    }
    let options={noOfMonths,isAnnualPayment:this.paymentModel.isAnnualPayment};
    this.paymentSummary = this.paymentCaluculationService.CaluculatePaymentSummary(this.paymentStructure,options,this.paymentScale);
  }

  onChangeFrequency(){
    if(this.paymentScale){
      this.getPaymentSummary();
    }
  }

  refreshForm(){
    
    this.paymentStructure={
      COST_PER_PA:0,
      COST_PER_MONTH:0,
      DISCOUNT_PA_PAYMENT:0,
      TOTAL_AMOUNT:0,
      COST_PER_MONTH_ANNUAL_DISCOUNT:0
    };
    this.paymentSummary={
      DUE_AMOUNT:0,
      TAX_AMOUNT:0,
      TOTAL_PAYABLE_AMOUNT:0
    };

  }
  public onActivationDate(event): void {
    if(this.paymentModel.Organization!=""){
      this.orgnizationDetails();
    }
  }
  
  printPDFPage() {
    window.print();
  }
  
  sendAdhocRequest(){
    if(this.isOtherText){
      this.paymentModel.Purpose = this.otherTextValue
    }
    this.paymentModel.Organization=this.currentOrganization._id;
    this.paymentModel.Status="Pending";
    let requestBody:any={...this.paymentModel,...this.paymentStructure,...this.paymentSummary};
    requestBody.RangeId=this.paymentScale?this.paymentScale._id:this.paymentModel.RangeId;
    requestBody.Range=this.paymentScale?this.paymentScale.Range:this.paymentModel.Range;
    requestBody.Type="Adhoc"
    console.log(requestBody);
     this.perfApp.route = "payments";
     this.perfApp.method = "/release/save",
     this.perfApp.requestBody = requestBody
     this.perfApp.CallAPI().subscribe(c => {
     if(c){
      this.notification.success(`Request Sent To Admin.`);
     }else{
       this.notification.error("Record not saved.")
     }
     window.location.reload();
     });
  };

  onchangePurpose(optionVal){
    if(optionVal === "Others"){
      this.isOtherText=true;
    }else{
      this.isOtherText=false;
    }
    
  }
  loadPaymentHistory(){
    this.router.navigate(['csa/payment-history',{Organization:this.currentOrganization._id}],{ skipLocationChange: true });
  }

}
