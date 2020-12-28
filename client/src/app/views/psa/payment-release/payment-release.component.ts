import { Component, OnInit } from '@angular/core';
import { Router ,ActivatedRoute} from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { PerfAppService } from '../../../services/perf-app.service';
import { PaymentCaluculationService } from '../../../services/payment-caluculation.service';
import * as moment from 'moment/moment';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-payment-release',
  templateUrl: './payment-release.component.html',
  styleUrls: ['./payment-release.component.css']
})
export class PaymentReleaseComponent implements OnInit {
  
  organizationList:any;
  currentUser:any;
  currentOrganization:any;
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
  rangeList:Array<any>;
  isRangeSelectVisible:Boolean=false;
  isRangeSelectBox:Boolean=true;
  

  constructor(
    public router: Router,
    public authService: AuthService,
    private perfApp: PerfAppService,
    private paymentCaluculationService:PaymentCaluculationService,
    private notification: NotificationService,
    private activatedRoute: ActivatedRoute,
    ) {
    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
    
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
      this.organizationList = c;
      this.onloadOrgEMail();
    })
  }
  getRangeList(options){
      this.perfApp.route = "payments";
      this.perfApp.method = "range/list";
      this.perfApp.requestBody = options;
      this.perfApp.CallAPI().subscribe(_rangeList => {
        this.rangeList = _rangeList;
      });
  }
  orgnizationDetails(selectedOrgnization){
    console.log("On Select Organization")
    console.log(selectedOrgnization);
    this.useageTypeEmployee=false;
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
      
      if(this.selectedOrganizationObj.UsageType && this.selectedOrganizationObj.UsageType==="License"){
        this.isRangeSelectVisible=true;
        this.isRangeSelectBox=false;
      }
      //=>Range List
      let rangeOptions={
        UsageType:this.selectedOrganizationObj.UsageType,
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
          let {DUE_AMOUNT,TAX_AMOUNT,TOTAL_PAYABLE_AMOUNT} = paymentRelease;
          this.paymentModel = {Organization,isAnnualPayment,NoOfMonthsLable,NoOfMonths,UserType,ActivationDate,Range,NoOfEmployees,NoNeeded,Status};
          if(this.selectedOrganizationObj.UsageType=="License"){
          this.paymentModel.Range = RangeId;
          }
          if(this.selectedOrganizationObj.UsageType=="Employees"){
            this.useageTypeEmployee=true;
            this.paymentModel.Range = Range;
            }
          this.paymentModel.paymentreleaseId = paymentRelease._id;
          this.paymentStructure = {COST_PER_PA,COST_PER_MONTH,DISCOUNT_PA_PAYMENT,TOTAL_AMOUNT,COST_PER_MONTH_ANNUAL_DISCOUNT};
          this.paymentSummary = {DUE_AMOUNT,TAX_AMOUNT,TOTAL_PAYABLE_AMOUNT}
        }
      });
      
    }
  }
  onChangeEmployee(searchValue){
    if(searchValue && searchValue!="" && searchValue!="0"){
      let paymentReleaseOptions:any={
        "UsageType" : this.selectedOrganizationObj.UsageType,
        "Type" : "Range",
        "RangeTo" : {$gte:searchValue},
        "RangeFrom" : {$lte:searchValue},
      };
      this.getPaymentReleaseCost(paymentReleaseOptions);
    }else{
      this.refreshForm();
    }


    
  }
  loadOrganizationDefaultData(){
    console.log("Inside:loadOrganizationDefaultData")
    this.caluculateNoOfMonths();
    this.paymentModel.UserType = this.selectedOrganizationObj.UsageType;
    if(this.selectedOrganizationObj.UsageType === "Employees"){
      this.useageTypeEmployee=true;
      this.paymentModel.NoOfEmployees=this.selectedOrganizationObj.UsageCount;
    }
    if(this.selectedOrganizationObj.ClientType === "Reseller"){
      this.isReseller=true;
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
      
  }
  onSelectRange(selectedObj:any){
    console.log(selectedObj)
    let selectedRange = this.rangeList.find(range=>range._id==selectedObj)
    console.log(selectedRange);
    this.paymentScale=selectedRange;
    this.paymentModel.Range = this.paymentScale._id;
    this.setPaymentBreakup();
  }

  caluculateNoOfMonths(){
    console.log(this.paymentModel.ActivationDate)
    let activaDateMoment = moment(this.paymentModel.ActivationDate).startOf('month');
    //let activaDateMoment = moment("11/01/2020").startOf('month');
    let {EvaluationPeriod,EndMonth} = this.selectedOrganizationObj;
    let noOfMonths = 0;
    if(EvaluationPeriod === 'CalendarYear'){
      let momentEvlEndDate = moment(this.paymentModel.ActivationDate).endOf('year');
      noOfMonths = momentEvlEndDate.diff(activaDateMoment,'months')+1;
    }
    else if(EvaluationPeriod === 'FiscalYear'){
      let endMonthVal = moment().month(EndMonth).format("M");
      let nextYear = moment(this.paymentModel.ActivationDate).add(1, 'years').month(parseInt(endMonthVal)-1).endOf('month');
      noOfMonths = nextYear.diff(activaDateMoment,'months')+1;
    }
    this.paymentModel.NoOfMonthsLable = `${noOfMonths} Months`;
    this.paymentModel.NoOfMonths = noOfMonths;
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
    if(this.paymentModel.isAnnualPayment){
      noOfMonths=this.paymentModel.NoOfMonths;
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
      this.orgnizationDetails(this.paymentModel.Organization);
    }
  }
  savePayment(){
    this.paymentModel.Status="Draft";
    this.savePaymentReleaseInfo();
  }
  paymentReleaseInfo(){
    console.log(":")
    this.paymentModel.Status="Pending";
    this.savePaymentReleaseInfo();
  }
  
  savePaymentReleaseInfo(){
    console.log(this.paymentModel.Status);
    let requestBody:any={...this.paymentModel,...this.paymentStructure,...this.paymentSummary};
    requestBody.RangeId=this.paymentScale?this.paymentScale._id:this.paymentModel.RangeId;
    requestBody.Range=this.paymentScale?this.paymentScale.Range:this.paymentModel.Range;
    requestBody.Type="Initial"
    console.log(requestBody);
     this.perfApp.route = "payments";
     this.perfApp.method = "/release/save",
     this.perfApp.requestBody = requestBody
     this.perfApp.CallAPI().subscribe(c => {
     if(c){
       if(this.paymentModel.Status === "Pending"){
          this.notification.success(`Payment Released to ${this.selectedOrganizationObj.Name}`)
      }
      if(this.paymentModel.Status === "Draft"){
          this.notification.success(`${this.selectedOrganizationObj.Name} payment release saved.`);
      }
       
     }else{
       this.notification.error("Record not saved.")
     }
     });
  }

}
