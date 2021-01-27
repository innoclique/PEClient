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
    Status:"",
    ClientId:""
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
  isRenewalPayment:Boolean=false;
  isInitialPayment:Boolean=false;
  rangeList:Array<any>;
  selectedRangeId:any="";
  isNoNeededReadOnly:Boolean = false;
  isNoNeededVisible:Boolean = false;
  public clientData: any=[]
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
    console.log("====this.currentOrganization==");
    console.log(this.currentOrganization)
   }

  ngOnInit(): void {
    //console.log(this.currentOrganization._id)
    this.currentUser=this.authService.getCurrentUser();
    this.getTaxInfo(this.currentOrganization.State);
    //this.paymentModel.Organization = this.currentOrganization.Name;
    this.findInitialPayments(this.currentOrganization._id);
    if(this.currentUser.Organization.ClientType === "Reseller"){
      this.isReseller = true;
      this.isNoNeededVisible = true;
      //this.getClients();
      let rangeOptions={
            ClientType:this.currentOrganization.ClientType,
            UsageType:this.currentOrganization.UsageType ,
            "Type" : "Range"
          };
      this.getRangeList(rangeOptions);
    }
  }

  getClients() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllOrganizationsForReseller",
    this.perfApp.requestBody = { 'companyId': this.currentOrganization._id }
    this.perfApp.CallAPI().subscribe(c => {
      console.log('lients data', c);
      if (c && c.length > 0) {
        c.map(row=>{
          
          if(row.ClientType==='Client'){
            
            this.clientData.push(row)
          }
                  
        });
      }
      
    })
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
    this.isRenewalPayment=false;
    this.isInitialPayment=false;
    this.isNoNeededVisible=false;
    
    if(paymentOption!=""){

      this.isActiveDateDisabled=false;
      this.isPaymentFrequencyDisabled=false;
      switch (paymentOption) {
        case 'initial_pay':
          if(this.paymentReleaseData){
            this.isInitialPayment=true;
            this.orgnizationDetails();
            this.isActiveDateDisabled=true;
            this.isPaymentFrequencyDisabled=true;
            if(this.currentUser.Organization.ClientType === "Reseller"){
              this.isReseller = true;
              this.isNoNeededReadOnly = true;
              this.isNoNeededVisible = true;
            }
          }else{
            this.notification.error("Initial payment was not found.")
          }
          break;
        case 'renewal_pay':
          if(this.isinitialPaymentDone){
            this.isRenewalPayment = true;
            let rangeOptions={
              ClientType:this.currentOrganization.ClientType,
              UsageType:this.currentOrganization.UsageType ,
              "Type" : "Range"
            };
            this.getRangeList(rangeOptions);
            this.loadOrganizationDefaultData();
            this.findAdhocPayments(this.currentOrganization._id,"Renewal");
            this.paymentModel.Organization = this.currentOrganization._id;
          }else{
            this.notification.error('Renewal will be available after initial payment done.')
          }
          break;
        case 'adhoc_pay':
          if(this.isinitialPaymentDone){
            this.isAdhocpayment=true;
            this.findAdhocPayments(this.currentOrganization._id,"Adhoc");
          }else{
            this.notification.error('Adhoc will be available after initial payment done.');
          }
          break;
        case 'client_renewal_pay':
          if(this.isinitialPaymentDone){
            this.isReseller = true;
            this.getClients();
          }else{
            this.notification.error('Renewal will be available after initial payment done.')
          }
          break;
        default:
          this.isNoNeededVisible=true;
          break;
      }
    }else{
      if(this.currentUser.Organization.ClientType === "Reseller"){
        this.isReseller = true;
        this.isNoNeededVisible = true;
      }
    }
  }

  setRange(selectedObj:any){
    console.log(selectedObj)
    let selectedRange = this.rangeList.find(range=>range._id==selectedObj)
    console.log(selectedRange);
    this.paymentScale=selectedRange;
    this.paymentScale.Tax = this.stateTax;
    this.paymentModel.Range = this.paymentScale._id;
  }

  onSelectRange(selectedObj:any){
    this.setRange(selectedObj);
    this.setPaymentBreakup();
  }

  setPaymentBreakup(){
    console.log("this.paymentScale");
    console.log(this.paymentScale);
    this.paymentStructure = this.paymentCaluculationService.GetLicenceBreakdownPayment(this.paymentScale);
    if(this.paymentStructure){
      this.getPaymentSummary();
    }
  }

  getRangeList(options){
    this.perfApp.route = "payments";
    this.perfApp.method = "range/list";
    this.perfApp.requestBody = options;
    this.perfApp.CallAPI().subscribe(_rangeList => {
      this.rangeList = _rangeList;
    });
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

  findAdhocPayments(selectedOrgnization,payType){
    let _requestBody={
      Organization:selectedOrgnization,
      Type:payType,
      Status:{"$ne":"Complete"}
    }
    this.perfApp.route = "payments";
    this.perfApp.method = "adhoc/latest";
    this.perfApp.requestBody = _requestBody;
    this.perfApp.CallAPI().subscribe(AdhocPay => {
      if(AdhocPay){
        let {Status} = AdhocPay;
        if(this.isAdhocpayment){
          if(Status === "Approved"){
            this.paymentReleaseData = AdhocPay;
            this.orgnizationDetails();
          }else if(Status === "Pending"){
            this.notification.error(`Adhoc payment Not Approved/Disapproved.`);
          }else if(Status === "Disapproved"){
            this.notification.error(`Adhoc payment Disapproved.`);
          }
        }
        if(this.isRenewalPayment){
          if(Status === "Pending"){
            this.paymentReleaseData = AdhocPay;
            this.orgnizationDetails();
            console.log(`this.paymentModel.RangeId: ${this.paymentModel.RangeId}`)
            this.paymentModel.Range = this.paymentReleaseData.RangeId;
            this.setRange(this.paymentReleaseData.RangeId);
          }
        }
        
        
      }else{
        if(!this.isRenewalPayment){
          this.notification.error(`Adhoc payment was not found.`);
        }
      }
    });
  }

  clientOrgnizationDetails(selectedOrgnization){
    console.log("On Select Organization")
    console.log(selectedOrgnization);
    this.useageTypeEmployee=false;
    this.paymentModel.RangeId="";
    this.paymentModel.Range="";
    this.paymentModel.NoOfEmployees=0;
  
    this.isReseller = false;
    this.paymentModel.NoNeeded=0;
  
    this.paymentStructure=null;
    this.paymentScale=null;
    this.paymentSummary=null;
    //this.isRangeSelectVisible=false;
    //this.isRangeSelectBox=true;
    this.isRenewalPayment = false;
    if(selectedOrgnization!=""){
      this.isNoNeededVisible = false;
      this.isRenewalPayment = true;
      this.selectedOrganizationObj = this.clientData.find(org=>org._id==selectedOrgnization);
      console.log(`selected org : ${JSON.stringify(this.selectedOrganizationObj)}`);
      this.getTaxInfo(this.selectedOrganizationObj.State);
      if(this.selectedOrganizationObj.UsageType && this.selectedOrganizationObj.UsageType==="License"){
        //this.isRangeSelectVisible=true;
        //this.isRangeSelectBox=false;
      }
      //=>Range List
      let rangeOptions={
        ClientType:this.selectedOrganizationObj.ClientType,
        UsageType:this.selectedOrganizationObj.UsageType || "License",
        "Type" : "Range"
      } 
      this.getRangeList(rangeOptions);
      //=> End
      let _requestBody={
        Organization:selectedOrgnization,
        Status:'Draft',
        Type:'Initial'
      }
      this.perfApp.route = "payments";
      this.perfApp.method = "release/organization";
      this.perfApp.requestBody = _requestBody;
      this.perfApp.CallAPI().subscribe(paymentRelease => {
        if(!paymentRelease){
          this.loadOrganizationDefaultData();
        }else{
          let {Organization,isAnnualPayment,NoOfMonthsLable,NoOfMonths,UserType,ActivationDate,Range,RangeId,NoOfEmployees,NoNeeded,Status} = paymentRelease;
          let {COST_PER_PA,COST_PER_MONTH,DISCOUNT_PA_PAYMENT,TOTAL_AMOUNT,COST_PER_MONTH_ANNUAL_DISCOUNT} = paymentRelease;
          
          COST_PER_PA = COST_PER_PA.$numberDecimal;
          COST_PER_MONTH = COST_PER_MONTH.$numberDecimal;
          DISCOUNT_PA_PAYMENT = DISCOUNT_PA_PAYMENT.$numberDecimal;
          TOTAL_AMOUNT = TOTAL_AMOUNT.$numberDecimal;
          COST_PER_MONTH_ANNUAL_DISCOUNT = COST_PER_MONTH_ANNUAL_DISCOUNT.$numberDecimal;

          let {DUE_AMOUNT,TAX_AMOUNT,TOTAL_PAYABLE_AMOUNT} = paymentRelease;

          DUE_AMOUNT = DUE_AMOUNT.$numberDecimal;
          TAX_AMOUNT = TAX_AMOUNT.$numberDecimal;
          TOTAL_PAYABLE_AMOUNT = TOTAL_PAYABLE_AMOUNT.$numberDecimal;

          this.paymentModel = {Organization,isAnnualPayment,NoOfMonthsLable,NoOfMonths,UserType,ActivationDate,Range,NoOfEmployees,NoNeeded,Status};
          if(this.selectedOrganizationObj.UsageType=="License"){
          this.paymentModel.RangeId = RangeId;
          this.paymentModel.Range = Range;
          }
          if(this.selectedOrganizationObj.UsageType=="Employees"){
            this.useageTypeEmployee=true;
            this.paymentModel.Range = Range;
          }
          if(this.selectedOrganizationObj.ClientType === "Reseller"){
            this.isReseller=true;
            if(this.paymentModel.UserType==="Employees"){
              this.useageTypeEmployee=true;
              //this.isRangeSelectVisible=false;
              //this.isRangeSelectBox=true;
              //rangeOptions.UsageType="Employees";
            }
          }
          this.paymentModel.paymentreleaseId = paymentRelease._id;
          this.paymentStructure = {COST_PER_PA,COST_PER_MONTH,DISCOUNT_PA_PAYMENT,TOTAL_AMOUNT,COST_PER_MONTH_ANNUAL_DISCOUNT};
          this.paymentSummary = {DUE_AMOUNT,TAX_AMOUNT,TOTAL_PAYABLE_AMOUNT};
          
        }
      });
      
    }else{
      if(this.currentUser.Organization.ClientType === "Reseller"){
        this.isReseller = true;
        this.isNoNeededVisible = true;
      }
    }
    this.paymentModel.Organization = this.currentUser.Organization._id;
}

  orgnizationDetails(){
      let {Organization,isAnnualPayment,NoOfMonthsLable,NoOfMonths,UserType,ActivationDate,Range,RangeId,NoOfEmployees,NoNeeded,Status} = this.paymentReleaseData;
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

      this.paymentModel = {Organization,isAnnualPayment,NoOfMonthsLable,NoOfMonths,UserType,ActivationDate,Range,RangeId,NoOfEmployees,NoNeeded,Status};
      this.paymentModel.paymentreleaseId = this.paymentReleaseData._id;
      this.paymentStructure = {COST_PER_PA,COST_PER_MONTH,DISCOUNT_PA_PAYMENT,TOTAL_AMOUNT,COST_PER_MONTH_ANNUAL_DISCOUNT};
      this.paymentSummary = {DUE_AMOUNT,TAX_AMOUNT,TOTAL_PAYABLE_AMOUNT};
      
  }

  loadOrganizationDefaultData(){
    this.selectedOrganizationObj = this.currentOrganization;
    this.caluculateNoOfMonths();
    if(this.isRenewalPayment){
      this.paymentModel.NoNeeded=12;
    }
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
    
    if(this.isRenewalPayment){
      noOfMonths = 12;
    }
    console.log(this.isRenewalPayment +" - "+ noOfMonths)
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
        if(this.selectedOrganizationObj.UsageType === "License"){
          this.paymentStructure = this.paymentCaluculationService.GetLicenceBreakdownPayment(this.paymentScale);
        }
        if(this.selectedOrganizationObj.UsageType === "Employees"){
          this.paymentScale.orgnization_noOfEmp = this.paymentModel.NoOfEmployees;
          this.paymentStructure = this.paymentCaluculationService.GetEmployeeBreakdownPayment(this.paymentScale);
        }
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
    if(this.isRenewalPayment){
      if(this.paymentModel.isAnnualPayment){
        noOfMonths=12;
      }
    }
    console.log(`inside:getPaymentSummary:noOfMonths = ${noOfMonths}`)
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
      NoNeeded:0,
      ClientId:""
    };
    this.paymentScale={};
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
    let isRemoveReleaseId:Boolean = false;
    if(this.paymentOption && this.paymentOption === "client_renewal_pay"){
      isRemoveReleaseId = true;
    }else if(this.paymentOption && this.paymentOption === "new"){
      isRemoveReleaseId = true;
    }
    let params = {
      totalAmount:this.paymentSummary.TOTAL_PAYABLE_AMOUNT,
      paymentreleaseId:this.paymentModel.paymentreleaseId,
      isRemoveReleaseId : isRemoveReleaseId
    };
    console.log(`sending params=> ${JSON.stringify(params)}`)
    this.router.navigate(['csa/dopayment',params],{ skipLocationChange: true });
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
    this.router.navigate(['csa/price-list'],{ skipLocationChange: true });
  }

  paymentReleaseInfo(){
    if(this.paymentModel && !this.paymentModel.paymentreleaseId){
      this.paymentModel.Status="Pending";
      this.savePaymentReleaseInfo();
    }else{
      this.checkout();
    }
    
  }
  
  savePaymentReleaseInfo(){
    console.log(this.paymentModel.Status);
    let requestBody:any={...this.paymentModel,...this.paymentStructure,...this.paymentSummary};
    requestBody.RangeId=this.paymentScale?this.paymentScale._id:this.paymentModel.RangeId;
    requestBody.Range=this.paymentScale?this.paymentScale.Range:this.paymentModel.Range;
    requestBody.Type="Renewal";
    console.log(requestBody);
     this.perfApp.route = "payments";
     this.perfApp.method = "/release/save";
     this.perfApp.requestBody = requestBody;
     this.perfApp.CallAPI().subscribe(c => {
     if(c){
      this.paymentModel.paymentreleaseId = c._id;
      console.log(`paymentreleaseId = ${c._id}`)
      this.notification.success(`Payment Released to ${this.currentOrganization.Name}`);
      this.checkout();
     }else{
       this.notification.error("Record not saved.")
     }
     });
  }

  onChangeNoNeeded(searchValue){
    if(searchValue && searchValue!="" && searchValue!="0"){
      this.paymentOption="new";
      this.paymentModel.ClientId=null;
      this.paymentModel.Organization = this.currentUser.Organization._id;
      this.setRange(this.paymentReleaseData.RangeId);
      this.setPaymentBreakup();
      this.isRenewalPayment=true;
    }else{
      this.refreshForm();
      this.isRenewalPayment=false;
    }
  }

}
