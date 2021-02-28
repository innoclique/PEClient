import { Component, OnInit, ViewChild } from '@angular/core';
import { Router ,ActivatedRoute} from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { PerfAppService } from '../../../services/perf-app.service';
import { PaymentCaluculationService } from '../../../services/payment-caluculation.service';
import * as moment from 'moment/moment';
import { ModalDirective, BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NotificationService } from '../../../services/notification.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AlertDialog } from '../../../Models/AlertDialog';
import { AlertComponent } from '../../../shared/alert/alert.component';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  public alert= new AlertDialog();
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
    UsageType:"",
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
  newPurchase:Boolean=false;
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
  isActiveDateDisabled:Boolean=true;
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
  public clientData: any = []
  selectedRangeValue: any;
  adhokPaymentLink:any="#/csa/adhoc-payment";
  @ViewChild("payment_Summary", { static: true }) emoModal: ModalDirective;
  public taxToolTip;
  isClientDropdownEnable:Boolean=false;

  constructor(
    public router: Router,
    public authService: AuthService,
    private perfApp: PerfAppService,
    private paymentCaluculationService:PaymentCaluculationService,
    private notification: NotificationService,
    public dialog: MatDialog,
    ) {
    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
    console.log("====this.currentOrganization==");
    console.log(this.currentOrganization)

    if (this.currentOrganization && this.currentOrganization.Country == "Canada") {
      this.taxToolTip = "For Canadian clients, tax is applied based on the province and will include applicable GST/HST/PST.";
    } else {
      this.taxToolTip = null;
    }
   }

  ngOnInit(): void {
    //console.log(this.currentOrganization._id)
    this.currentUser=this.authService.getCurrentUser();
    this.getTaxInfo(this.currentOrganization.State);
    //this.paymentModel.Organization = this.currentOrganization.Name;
    this.findInitialPayments(this.currentOrganization._id);
    if(this.currentUser.Organization.ClientType === "Reseller"){
      this.adhokPaymentLink = "#/rsa/adhoc-payment";
      this.isReseller = true;
      this.isNoNeededVisible = true;
      //this.getClients();
      let rangeOptions={
            ClientType:this.currentOrganization.ClientType,
            UsageType:this.currentOrganization.UsageType || "License" ,
            "Type" : "Range"
          };
      this.getRangeList(rangeOptions);
    }
  }

  getClients() {
    this.clientData = [];
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
    this.newPurchase = false;
    this.isClientDropdownEnable=false;
    this.isActiveDateDisabled = true;
    
    if(paymentOption!=""){

      //this.isActiveDateDisabled=false;
      this.isPaymentFrequencyDisabled=false;
      if(this.currentUser.Organization.ClientType === "Reseller"){
        this.isReseller = true;
      }

      switch (paymentOption) {  
        case 'initial_pay':
          if(this.paymentReleaseData){
            this.isInitialPayment=true;
            this.orgnizationDetails();
            this.isActiveDateDisabled=true;
            this.isPaymentFrequencyDisabled=true;
            if(this.currentUser.Organization.ClientType === "Reseller"){
              
              this.isNoNeededReadOnly = true;
              this.isNoNeededVisible = true;
            }
            this.selectedRangeValue = this.paymentReleaseData.Range;
          }else{
            this.notification.error("Initial payment was not found.")
          }
          break;
        case 'renewal_pay':
          if(this.isinitialPaymentDone){
            this.isActiveDateDisabled = false;
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
            if(this.paymentReleaseData.Range)
              this.selectedRangeValue = this.paymentReleaseData.Range;
          }else{
            this.notification.error('Renewal will be available after initial payment done.')
          }
          break;
        case 'adhoc_pay':
          if(this.isinitialPaymentDone && !this.isReseller){
            this.isAdhocpayment=true;
            this.findAdhocPayments(this.currentOrganization._id,"Adhoc");
            if(this.paymentReleaseData.Range)
              this.selectedRangeValue = this.paymentReleaseData.Range;
          }else if(this.isinitialPaymentDone && this.isReseller){
            this.isAdhocpayment=true;
            this.isClientDropdownEnable=true;
            this.getClients();
          }else{
            this.notification.error('Adhoc will be available after initial payment done.');
          }
          break;
        case 'client_renewal_pay':
          if(this.isinitialPaymentDone){
            this.isActiveDateDisabled = false;
            this.getClients();
          }else{
            this.notification.error('Renewal will be available after initial payment done.')
          }
          break;
        case 'new_purchase':
          if(this.isinitialPaymentDone){
            this.isActiveDateDisabled = false;
            this.paymentModel.Range="";
            this.isReseller = true;
            this.newPurchase = true;
            this.isNoNeededReadOnly = true;
            this.isNoNeededVisible = true;
            this.paymentModel.UsageType="License";
          }else{
            this.notification.error('Adhoc will be available after initial payment done.');
          }
          break;
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

  usageOnchange(){
    let rangeOptions={
      ClientType:this.currentOrganization.ClientType,
      UsageType:this.currentOrganization.UsageType || "License",
      "Type" : "Range"
    } 
    console.log(rangeOptions)
    this.useageTypeEmployee=false;
    if(this.paymentModel.UsageType==="Employees"){
      this.useageTypeEmployee=true;
      rangeOptions.UsageType="Employees";
      this.paymentModel.Range="";
    }else if(this.paymentModel.UsageType==="License"){
      rangeOptions.UsageType="License";
    }
    this.getRangeList(rangeOptions);
  }

  onChangeEmployee(searchValue){
    if(searchValue && searchValue!="" && searchValue!="0"){
      let paymentReleaseOptions:any={
        //"UsageType" : this.selectedOrganizationObj.UsageType,
        "ClientType" : this.currentOrganization.ClientType,
        "UsageType" : this.paymentModel.UsageType,
        "Type" : "Range",
        "RangeTo" : {$gte:searchValue},
        "RangeFrom" : {$lte:searchValue},
      };
      this.getResellerPaymentReleaseCost(paymentReleaseOptions);
    }else{
      //this.refreshForm();
    }
  }

  getResellerPaymentReleaseCost(paymentReleaseOptions){
    this.perfApp.route = "payments";
    this.perfApp.method = "Scale",
    this.perfApp.requestBody = paymentReleaseOptions;
    this.perfApp.CallAPI().subscribe(paymentScale => {
      if(paymentScale){
        this.paymentScale=paymentScale;
        this.paymentModel.Range = this.paymentScale.Range;
        this.paymentScale.Tax = this.stateTax;
        this.setRange(paymentScale._id);
        this.setPaymentBreakup();
      }else{
        this.paymentStructure=null;
        this.paymentScale=null;
      }
      
    });
  }

  setRange(selectedObj:any){
    console.log(selectedObj)
    let selectedRange = this.rangeList.find(range=>range._id==selectedObj)
    console.log(selectedRange);
    this.paymentScale=selectedRange;
    this.paymentScale.Tax = this.stateTax;
    this.paymentModel.Range = this.paymentScale._id;
    this.selectedRangeValue = this.paymentScale.Range;
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
        }else{
          
          if(this.selectedOrganizationObj.UsageType && this.selectedOrganizationObj.UsageType=="License"){
            this.paymentModel.Range  = this.selectedOrganizationObj.Range;
            this.onSelectRange(this.paymentModel.Range);
          }else if(this.selectedOrganizationObj.UsageType && this.selectedOrganizationObj.UsageType=="Employees"){
            this.getPaymentScaleDetails();
          }
          //
        }
      }
    });
  }
  getPaymentScaleDetails(){
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
        this.paymentModel.Range = this.paymentScale._id;
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
  clientOrgnizationDetails(selectedOrgnization){
    console.log("On Select Organization")
    console.log(selectedOrgnization);
    this.findAdhocPayments(selectedOrgnization,"Adhoc");
    if(this.paymentReleaseData){
      if(this.paymentReleaseData.Range)
      this.selectedRangeValue = this.paymentReleaseData.Range;
      this.useageTypeEmployee=false;
      if(this.paymentReleaseData.UsageType==="Employees"){
        this.useageTypeEmployee=true;
      }
    }
    
        
}

  orgnizationDetails(){
      let {Organization,isAnnualPayment,NoOfMonthsLable,NoOfMonths,UsageType,ActivationDate,Range,RangeId,NoOfEmployees,NoNeeded,Status} = this.paymentReleaseData;
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

      this.paymentModel = {Organization,isAnnualPayment,NoOfMonthsLable,NoOfMonths,UsageType,ActivationDate,Range,RangeId,NoOfEmployees,NoNeeded,Status};
      this.paymentModel.paymentreleaseId = this.paymentReleaseData._id;
      this.paymentStructure = {COST_PER_PA,COST_PER_MONTH,DISCOUNT_PA_PAYMENT,TOTAL_AMOUNT,COST_PER_MONTH_ANNUAL_DISCOUNT};
      this.paymentSummary = {DUE_AMOUNT,TAX_AMOUNT,TOTAL_PAYABLE_AMOUNT};
      this.paymentSummary.CD_PER_MONTH=COST_PER_MONTH;
      this.paymentSummary.CD_PER_MONTH_DISCOUNT=COST_PER_MONTH_ANNUAL_DISCOUNT;
      if(this.currentUser.Organization.ClientType === "Reseller" && NoNeeded!=0){
        this.paymentStructure.CD_PER_MONTH=(COST_PER_MONTH*NoNeeded).toFixed(2);
        this.paymentStructure.CD_PER_MONTH_DISCOUNT=(COST_PER_MONTH_ANNUAL_DISCOUNT*NoNeeded).toFixed(2);
      }
  }

  loadOrganizationDefaultData(){
    this.selectedOrganizationObj = this.currentOrganization;
    this.caluculateNoOfMonths();
    if(this.isRenewalPayment){
      this.paymentModel.NoNeeded=12;
    }
    this.paymentModel.UsageType = this.selectedOrganizationObj.UsageType;
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
    this.paymentStructure.CD_PER_MONTH=this.paymentStructure.COST_PER_MONTH;
    this.paymentStructure.CD_PER_MONTH_DISCOUNT=this.paymentStructure.COST_PER_MONTH_ANNUAL_DISCOUNT;
    if(this.currentUser.Organization.ClientType === "Reseller" && NoNeeded!=0){
      this.paymentStructure.CD_PER_MONTH=(this.paymentStructure.COST_PER_MONTH*NoNeeded).toFixed(2);
      this.paymentStructure.CD_PER_MONTH_DISCOUNT=(this.paymentStructure.COST_PER_MONTH_ANNUAL_DISCOUNT*NoNeeded).toFixed(2);
    }
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
      UsageType:"",
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
      
      this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to make this payment";
    this.alert.ShowCancelButton = true;
    this.alert.ShowConfirmButton = true;
    this.alert.CancelButtonText = "Cancel";
    this.alert.ConfirmButtonText = "Continue";
    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = this.alert;
    dialogConfig.height = "300px";
    dialogConfig.maxWidth = '40%';
    dialogConfig.minWidth = '40%';
    var dialogRef = this.dialog.open(AlertComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(resp => {
      if (resp == 'yes') {
        this.emoModal.show();
      }
    });
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

  newPurchaseReleaseInfo(){
    if(this.paymentModel && !this.paymentModel.paymentreleaseId){
      this.paymentModel.Status="Pending";
      this.savePurchasePayment();
    }else{
      //this.checkout();
    }
  }
  
  savePurchasePayment(){
    console.log(this.paymentModel.Status);
    let requestBody:any={...this.paymentModel,...this.paymentStructure,...this.paymentSummary};
    requestBody.RangeId=this.paymentScale?this.paymentScale._id:this.paymentModel.RangeId;
    requestBody.Range=this.paymentScale?this.paymentScale.Range:this.paymentModel.Range;
    requestBody.Type="NewPurchase";
    requestBody.ClientType="Reseller";
    console.log(requestBody);
     this.perfApp.route = "payments";
     this.perfApp.method = "release/save";
     this.perfApp.requestBody = requestBody;
     this.perfApp.CallAPI().subscribe(c => {
     if(c){
      this.paymentModel.paymentreleaseId = c._id;
      console.log(`paymentreleaseId = ${c._id}`)
      //this.notification.success(`Payment Released to ${this.currentOrganization.Name}`);
      this.checkout();
     }else{
       this.notification.error("Record not saved.")
     }
     });
  }

  savePaymentReleaseInfo(){
    console.log(this.paymentModel.Status);
    let requestBody:any={...this.paymentModel,...this.paymentStructure,...this.paymentSummary};
    requestBody.RangeId=this.paymentScale?this.paymentScale._id:this.paymentModel.RangeId;
    requestBody.Range=this.paymentScale?this.paymentScale.Range:this.paymentModel.Range;
    requestBody.Type="Renewal";
    console.log(requestBody);
     this.perfApp.route = "payments";
     this.perfApp.method = "release/save";
     this.perfApp.requestBody = requestBody;
     this.perfApp.CallAPI().subscribe(c => {
     if(c){
      this.paymentModel.paymentreleaseId = c._id;
      console.log(`paymentreleaseId = ${c._id}`)
      //this.notification.success(`Payment Released to ${this.currentOrganization.Name}`);
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
      this.setRange(this.paymentModel.Range);
      this.setPaymentBreakup();
      this.isRenewalPayment=true;
    }else{
      //this.refreshForm();
      //this.isRenewalPayment=false;
    }
  }

}
