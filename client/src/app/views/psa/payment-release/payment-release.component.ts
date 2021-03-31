import { Component, OnInit } from '@angular/core';
import { Router ,ActivatedRoute} from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { PerfAppService } from '../../../services/perf-app.service';
import { PaymentCaluculationService } from '../../../services/payment-caluculation.service';
import * as moment from 'moment/moment';
import { NotificationService } from '../../../services/notification.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AlertDialog } from '../../../Models/AlertDialog';
import { AlertComponent } from '../../../shared/alert/alert.component';

@Component({
  selector: 'app-payment-release',
  templateUrl: './payment-release.component.html',
  styleUrls: ['./payment-release.component.css']
})
export class PaymentReleaseComponent implements OnInit {
  public alert= new AlertDialog();
  stateTax:any;
  organizationList: any;
  public licensePeriod: any;
  currentUser:any;
  currentOrganization:any;
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
  rangeList:Array<any>;
  isRangeSelectVisible:Boolean=false;
  isRangeSelectBox:Boolean=true;
  overridePriceList:Array<any>;
  public taxToolTip;
  paymentCurrency:any;
  constructor(
    public router: Router,
    public authService: AuthService,
    private perfApp: PerfAppService,
    private paymentCaluculationService:PaymentCaluculationService,
    private notification: NotificationService,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    ) {
    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
    this.paymentCurrency = this.paymentCaluculationService.getCurrencyType(this.currentOrganization.Country);
    if (this.currentOrganization && this.currentOrganization.Country == "Canada") {
      this.taxToolTip = "For Canadian clients, tax is applied based on the province and will include applicable GST/HST/PST.";
    } else {
      this.taxToolTip = null;
    }
   }

  ngOnInit(): void {
    this.getClients();
    this.currentUser=this.authService.getCurrentUser();
     
  }
  onloadOrgEMail(){
    this.activatedRoute.params.subscribe(params => {
      if (params['email']) {
        let matchOrgObj = this.organizationList.find(orgObj=>orgObj.Email==params['email']);
        console.log(matchOrgObj);
        if(matchOrgObj){
          this.paymentModel.Organization=matchOrgObj._id;
          this.orgnizationDetails(matchOrgObj._id);
        }
      }
      
     });  
  }
  
  getClients() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllOrganizations",
    this.perfApp.requestBody = { 'companyId': this.currentOrganization._id }
    this.perfApp.CallAPI().subscribe(c => {
      this.organizationList = c.filter((org) => !org.IsDraft);
     // this.organizationList = c;
      this.onloadOrgEMail();
    })
  }
  getRangeList(options){
      this.perfApp.route = "payments";
      this.perfApp.method = "range/list";
      this.perfApp.requestBody = options;
      this.perfApp.CallAPI().subscribe(_rangeList => {
        this.rangeList = _rangeList;
        let isRangeAvailable = _rangeList.find(r=>{
          if(this.selectedOrganizationObj.Range){
            console.log(`${r._id.toString()} == ${this.selectedOrganizationObj.Range.toString()}`)
            return r._id.toString() === this.selectedOrganizationObj.Range.toString()
          }
        })
        if(isRangeAvailable){
          this.paymentModel.Range = isRangeAvailable._id.toString();
          this.onSelectRange(this.paymentModel.Range)
        }
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
usageOnchange(){

  let rangeOptions={
    ClientType:this.selectedOrganizationObj.ClientType,
    UsageType:this.selectedOrganizationObj.UsageType || "License",
    "Type" : "Range"
  } 
  this.useageTypeEmployee=false;
  if(this.paymentModel.UsageType==="Employees"){
    this.useageTypeEmployee=true;
    this.isRangeSelectVisible=false;
    this.isRangeSelectBox=true;
    rangeOptions.UsageType="Employees";
    this.paymentModel.Range="";
  }else if(this.paymentModel.UsageType==="License"){
    this.isRangeSelectVisible=true;
    this.isRangeSelectBox=false;
    rangeOptions.UsageType="License";
  }
  this.getRangeList(rangeOptions);
}

getOverridePriceScale(){
  let options:any = {};
  options.Organization = this.selectedOrganizationObj._id;
  options.ClientType = this.selectedOrganizationObj.ClientType;
  if(this.selectedOrganizationObj.UsageType){
    options.UsageType = this.selectedOrganizationObj.UsageType;
  }
  this.perfApp.route = "payments";
  this.perfApp.method = "override/price/scale";
  this.perfApp.requestBody = options;
  this.perfApp.CallAPI().subscribe(_overridePriceList => {
    this.overridePriceList = _overridePriceList;
  });
}

  orgnizationDetails(selectedOrgnization){
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
    this.isRangeSelectVisible=false;
    this.isRangeSelectBox=true;
    if(selectedOrgnization!=""){
      this.selectedOrganizationObj = this.organizationList.find(org=>org._id==selectedOrgnization);
      console.log(this.selectedOrganizationObj);
      this.getOverridePriceScale();
      let _releaseRequestBody={
        Organization:selectedOrgnization,
        Type:"Initial"
      }
      this.perfApp.route = "payments";
      this.perfApp.method = "release/organization";
      this.perfApp.requestBody = _releaseRequestBody;
      this.perfApp.CallAPI().subscribe(paymentRelease => {
        if(!paymentRelease){
          this.getTaxInfo(this.selectedOrganizationObj.State);
      if(this.selectedOrganizationObj.UsageType && this.selectedOrganizationObj.UsageType==="License"){
        this.isRangeSelectVisible=true;
        this.isRangeSelectBox=false;
      }
      
      //=>Range List
      let rangeOptions={
        ClientType:this.selectedOrganizationObj.ClientType,
        UsageType:this.selectedOrganizationObj.UsageType || "License",
        "Type" : "Range"
      } 

      this.getRangeList(rangeOptions);

      if (this.selectedOrganizationObj && this.selectedOrganizationObj.Country == "Canada") {
        this.taxToolTip = "For Canadian clients, tax is applied based on the province and will include applicable GST/HST/PST.";
      } else {
        this.taxToolTip = null;
      }
      
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
          console.log(`this.paymentModel.Range => ${this.paymentModel.Range}`);
          if(this.paymentModel.Range)
          this.onSelectRange(this.paymentModel.Range)
          
        }else{
          let {Organization,isAnnualPayment,NoOfMonthsLable,NoOfMonths,UsageType,ActivationDate,Range,RangeId,NoOfEmployees,NoNeeded,Status} = paymentRelease;
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

          this.paymentModel = {Organization,isAnnualPayment,NoOfMonthsLable,NoOfMonths,UsageType,ActivationDate,Range,NoOfEmployees,NoNeeded,Status};
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
            if(this.paymentModel.UsageType==="Employees"){
              this.useageTypeEmployee=true;
              //this.isRangeSelectVisible=false;
              //this.isRangeSelectBox=true;
              //rangeOptions.UsageType="Employees";
            }
          }
          this.paymentModel.paymentreleaseId = paymentRelease._id;
          this.paymentStructure = {COST_PER_PA,COST_PER_MONTH,DISCOUNT_PA_PAYMENT,TOTAL_AMOUNT,COST_PER_MONTH_ANNUAL_DISCOUNT};
          this.paymentSummary = {DUE_AMOUNT,TAX_AMOUNT,TOTAL_PAYABLE_AMOUNT};

          this.paymentSummary.CD_PER_MONTH=COST_PER_MONTH;
          this.paymentSummary.CD_PER_MONTH_DISCOUNT=COST_PER_MONTH_ANNUAL_DISCOUNT;
          if(this.currentUser.Organization.ClientType === "Reseller" && NoNeeded!=0){
            this.paymentStructure.CD_PER_MONTH=(COST_PER_MONTH*NoNeeded).toFixed(2);
            this.paymentStructure.CD_PER_MONTH_DISCOUNT=(COST_PER_MONTH_ANNUAL_DISCOUNT*NoNeeded).toFixed(2);
          }
          
        }
      });
        }else{
          this.notification.error('Payment has been released');
        }
      });
    }
  }
  
  onChangeEmployee(searchValue){
    if(searchValue && searchValue!="" && searchValue!="0"){
      let paymentReleaseOptions:any={
        //"UsageType" : this.selectedOrganizationObj.UsageType,
        "ClientType" : this.selectedOrganizationObj.ClientType,
        "UsageType" : this.paymentModel.UsageType,
        "Type" : "Range",
        "RangeTo" : {$gte:searchValue},
        "RangeFrom" : {$lte:searchValue},
      };
      this.getPaymentReleaseCost(paymentReleaseOptions);
    }else{
      this.refreshForm();
    }
  }

  onChangeNoNeeded(searchValue){
    if(searchValue && searchValue!="" && searchValue!="0"){
      this.setPaymentBreakup();
    }else{
      this.refreshForm();
    }
  }

  loadOrganizationDefaultData(){
    console.log("Inside:loadOrganizationDefaultData")
    this.caluculateNoOfMonths();
    this.paymentModel.UsageType = this.selectedOrganizationObj.UsageType;
    if(this.selectedOrganizationObj.UsageType === "Employees"){
      this.useageTypeEmployee=true;
      this.paymentModel.NoOfEmployees=this.selectedOrganizationObj.UsageCount;
    }
    if(this.selectedOrganizationObj.ClientType === "Reseller"){
      this.paymentModel.NoNeeded=1;
      this.isReseller=true;
      this.paymentModel.UsageType="";
      this.isRangeSelectVisible=true;
      this.isRangeSelectBox=false;
    }
    if(this.selectedOrganizationObj.UsageType!="License"){
      let paymentReleaseOptions:any={
        "UsageType" : this.selectedOrganizationObj.UsageType,
        "Type" : "Range",
        "RangeTo" : {$gte:this.selectedOrganizationObj.UsageCount},
        "RangeFrom" : {$lte:this.selectedOrganizationObj.UsageCount},
      };
      this.getPaymentReleaseCost(paymentReleaseOptions);
    }

    this.licensePeriod = this.getActivationPeriod();

      
  }
  onSelectRange(selectedObj:any){
    if(selectedObj && selectedObj!=""){
      let selectedRange = this.rangeList.find(range=>range._id==selectedObj);
      this.paymentScale=selectedRange;
      if(this.overridePriceList && this.overridePriceList.length>0){
        let UsageType = this.paymentModel.UsageType;
        let overridePayment = this.overridePriceList.find(op=>op.UsageType==UsageType&&op.Range==selectedRange.Range);
        if(overridePayment){
          this.paymentScale.Cost = overridePayment.Cost;
          this.paymentScale.Discount = overridePayment.Discount;
        }
      }
      this.paymentScale.Tax = this.stateTax;
      this.paymentModel.Range = this.paymentScale._id;
      this.setPaymentBreakup();
    }else{
      this.refreshForm();
    }
    
    
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
      if(currentMonth>endMonthVal){
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

  getPaymentReleaseCost(paymentReleaseOptions){
    /*let paymentReleaseOptions:any={};
    paymentReleaseOptions.Organization=this.selectedOrganizationObj._id;
    paymentReleaseOptions.ClientType=this.selectedOrganizationObj.ClientType;
    paymentReleaseOptions.UsageType=this.selectedOrganizationObj.UsageType;
    paymentReleaseOptions.UsageCount=this.selectedOrganizationObj.UsageCount;
    paymentReleaseOptions.Type="Default"
    if(this.selectedOrganizationObj.Range){
      paymentReleaseOptions.Type="Range";
    };*/
    
    
    this.perfApp.route = "payments";
    this.perfApp.method = "Scale",
    this.perfApp.requestBody = paymentReleaseOptions;
    this.perfApp.CallAPI().subscribe(paymentScale => {
      if(paymentScale){
        this.paymentScale=paymentScale;
        this.paymentModel.Range = this.paymentScale.Range;
        this.paymentScale.Tax = this.stateTax;
        this.setPaymentBreakup();
      }else{
        this.paymentStructure=null;
        this.paymentScale=null;
      }
      
    });
  }

  setPaymentBreakup(){
    this.paymentStructure = this.paymentCaluculationService.GetLicenceBreakdownPayment(this.paymentScale);
    if(this.paymentStructure){
      this.getPaymentSummary();
    }
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

    this.paymentStructure.CD_PER_MONTH=this.paymentStructure.COST_PER_MONTH;
    this.paymentStructure.CD_PER_MONTH_DISCOUNT=this.paymentStructure.COST_PER_MONTH_ANNUAL_DISCOUNT;
    if(this.paymentScale.ClientType === "Reseller" && NoNeeded!=0){
      this.paymentStructure.CD_PER_MONTH=(this.paymentStructure.COST_PER_MONTH*NoNeeded).toFixed(2);
      this.paymentStructure.CD_PER_MONTH_DISCOUNT=(this.paymentStructure.COST_PER_MONTH_ANNUAL_DISCOUNT*NoNeeded).toFixed(2);
    }
    
  }

  onChangeFrequency() {
    this.licensePeriod = this.getActivationPeriod();
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
    this.licensePeriod = this.getActivationPeriod();
    if(this.paymentModel.Organization!=""){
      this.orgnizationDetails(this.paymentModel.Organization);
    }
  }
  savePayment(){
    if (!this.paymentModel.Organization) {
      this.notification.error('Organization Name is mandatory');
      return;
    }
    if (this.paymentModel.UsageType === "License" && !this.paymentModel.Range) {
      this.notification.error('Range is mandatory');
      return;
    }
    if (this.paymentModel.UsageType === "Employees" && (this.paymentModel.NoOfEmployees < 1 || !this.paymentModel.NoOfEmployees)) {
      this.notification.error('# Of Employees is mandatory');
      return;
    }
    if (!this.paymentSummary || !this.paymentSummary.TOTAL_PAYABLE_AMOUNT) {
      this.notification.error('Invalid Payment Release Amount');
      return;
    }
    if (this.paymentSummary && this.paymentSummary.TOTAL_PAYABLE_AMOUNT) {
      if(!isNaN(this.paymentSummary.TOTAL_PAYABLE_AMOUNT)){
        if(Number(this.paymentSummary.TOTAL_PAYABLE_AMOUNT)<=0){
          this.notification.error('Invalid Payment Release Amount');
        return;
        }
      }else{
        this.notification.error('Invalid Payment Release Amount');
        return;
      }
      
    }

    this.paymentModel.Status="Draft";
    this.savePaymentReleaseInfo();
  }
  paymentReleaseInfo(){
    
    if (!this.paymentModel.Organization) {
      this.notification.error('Organization Name is mandatory');
      return;
    }
    if (this.paymentModel.UsageType === "") {
      this.notification.error('UsageType is mandatory');
      return;
    }
    if (this.paymentModel.UsageType === "License" && !this.paymentModel.Range) {
      this.notification.error('Range is mandatory');
      return;
    }
    if (this.paymentModel.UsageType === "Employees" && (this.paymentModel.NoOfEmployees < 1 || !this.paymentModel.NoOfEmployees)) {
      this.notification.error('# Of Employees is mandatory');
      return;
    }
    if (!this.paymentSummary || !this.paymentSummary.TOTAL_PAYABLE_AMOUNT) {
      this.notification.error('Invalid Payment Release Amount');
      return;
    }
    if (this.paymentSummary && this.paymentSummary.TOTAL_PAYABLE_AMOUNT) {
      if(!isNaN(this.paymentSummary.TOTAL_PAYABLE_AMOUNT)){
        if(Number(this.paymentSummary.TOTAL_PAYABLE_AMOUNT)<=0){
          this.notification.error('Invalid Payment Release Amount');
        return;
        }
      }else{
        this.notification.error('Invalid Payment Release Amount');
        return;
      }
      
    }
    
    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to release the payment info?";
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
            this.paymentModel.Status="Pending";
            this.savePaymentReleaseInfo();
      }
    });


  }
  
  savePaymentReleaseInfo(){
    console.log(this.paymentModel.Status);
    let requestBody:any={...this.paymentModel,...this.paymentStructure,...this.paymentSummary};
    requestBody.RangeId=this.paymentScale?this.paymentScale._id:this.paymentModel.RangeId;
    requestBody.Range=this.paymentScale?this.paymentScale.Range:this.paymentModel.Range;
    requestBody.Type="Initial";
    requestBody.ClientType=this.selectedOrganizationObj.ClientType;
    console.log(requestBody);
     this.perfApp.route = "payments";
     this.perfApp.method = "/release/save",
     this.perfApp.requestBody = requestBody
     this.perfApp.CallAPI().subscribe(c => {
     if(c){
       if(this.paymentModel.Status === "Pending"){
          this.notification.success(`Payment info has been sent to the ${this.selectedOrganizationObj.Name}`)
      }
      if(this.paymentModel.Status === "Draft"){
          this.notification.success(`Payment info of ${this.selectedOrganizationObj.Name} saved.`);
      }

       this.router.navigate(['psa/list']);
       
     }else{
       this.notification.error("Record not saved.")
     }
     });
  }
  loadPaymentHistory(){
    if (this.selectedOrganizationObj && this.selectedOrganizationObj._id != "") {
      //this.router.navigate(['psa/payment-history', { Organization: this.currentOrganization._id }], { skipLocationChange: true });
      this.router.navigate(['psa/reports/revenue/client/details/' + this.selectedOrganizationObj._id]);
    } else {
      this.router.navigate(['psa/reports/revenue/client']);
    }
    
  }
  loadPriceListPage(){
    this.router.navigate(['psa/price-list'],{ skipLocationChange: true });
  }


  private getActivationPeriod() {
    let aDate = moment(this.paymentModel.ActivationDate, 'YYYY/MM/DD');

    let StartMonth = parseInt(aDate.format('M'));
    let day = aDate.format('D');
    let activationYear = aDate.format('YYYY');
    // For reseller there is no end month, so calculating with NoOfMonths
    let duration = Number(this.paymentModel.NoOfMonths);
    let currentEndMonth = StartMonth - 1 + duration;
    if (currentEndMonth > 11) {
      currentEndMonth = currentEndMonth - 12;
    }
    let calEndMonth = this.months[currentEndMonth];

    let EndMonth = this.currentOrganization.EndMonth ? this.currentOrganization.EndMonth : calEndMonth;
    return this.months[StartMonth - 1] + " " + activationYear + " to " + EndMonth.substring(0, 3) + " " + this.getYearEnd(EndMonth.substring(0, 3));
  }

  private getYearStart(month: string) {
    if (this.months.indexOf(month) > new Date().getMonth()) {
      var currentYear: string = (new Date().getFullYear() - 1).toString();
      return currentYear;
    } else {
      var currentYear: string = new Date().getFullYear().toString();
      return currentYear;
    }
  }

  private getYearEnd(month: string) {
    if (this.months.indexOf(month) > new Date().getMonth()) {
      var currentYear: string = new Date().getFullYear().toString();
      return currentYear;
    } else {
      var currentYear: string = (new Date().getFullYear() + 1).toString();
      return currentYear;
    }
  }
  private months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct", "Nov", "Dec"];
  
}
