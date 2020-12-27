import { Component, OnInit ,ViewChild} from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { PerfAppService } from '../../../services/perf-app.service';
import * as moment from 'moment/moment';
import { ModalDirective, BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-payment-adhoc-list',
  templateUrl: './payment-adhoc-list.component.html',
  styleUrls: ['./payment-adhoc-list.component.css']
})
export class PaymentAdhocListComponent implements OnInit {
  @ViewChild("payment_Summary", { static: true }) emoModal: ModalDirective;
  paymentReleaseId:any;
  paymentReleaseData:any;
  checkoutActivationDate:any;
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
  adhocRequestList:any=[];
  public AdhocGridOptions: GridOptions = {
    columnDefs: this.getColDef()      
  }
  currentOrganization:any={};
  isActionButtonEnabled:Boolean=false;
  constructor(
    private perfApp: PerfAppService,
    private notification: NotificationService,
    ) {
    
   }

  ngOnInit(): void {
    this.getAdhocRequestList();
  }

  getColDef(){
    return  [
      {
        headerName: 'Client', field: 'clientName', tooltipField: 'clientName', sortable: true,  suppressSizeToFit: true, filter: true,  
        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="viewAdhocRequest">${data.value}</span>` }
      }, 
      //{ headerName: 'Client', field: 'clientName', sortable: true, filter: true },     
      { headerName: 'Active Since', field: 'activeSince', sortable: true, filter: true },
      { headerName: '# Of Request', field: 'requestRange', sortable: true, filter: true },
      { headerName: 'Amount', field: 'amount', sortable: true, filter: true },
      {
        headerName: "Actions",
        suppressSizeToFit: true,
    
        Sorting: false,        
        cellRenderer: (data) => {
          console.log(data);
          if(data && data.data){
            let {status} = data.data;
            switch (status) {
              case 'Pending':
                
                return `<i class="icon-minus" style="cursor:pointer ;padding: 7px 20px 0 0;
                      font-size: 17px;"   data-action-type="suspendorg" title="No Actions"></i>
                      `
              case 'Approved':
                return `<i class="icon-check" style="cursor:pointer ;padding: 7px 20px 0 0;
                font-size: 17px;"   data-action-type="suspendorg" title="Approved"></i>`;
              
                case 'Disapproved':
                  return `<i class="icon-close" style="cursor:pointer ;padding: 7px 20px 0 0;
                  font-size: 17px;"   data-action-type="suspendorg" title="Disapproved"></i>`;
              }
          }
        }
  
  
      }
    ];
  
  }

  getAdhocRequestList() {
    this.perfApp.route = "payments";
    this.perfApp.method = "adhoc/request/list",
    this.perfApp.requestBody = {  }
    this.perfApp.CallAPI().subscribe(adhocList => {
      //this._getAdhocRequestList(adhocList);
      adhocList.map(row=>{
        let adhocObj=row;
        let createdYear = moment(adhocObj.Organization.CreatedOn).format("YYYY");
        this.adhocRequestList.push({
          paymentReleaseId:adhocObj._id,
          organizationId:adhocObj.Organization._id,
          clientName:adhocObj.Organization.Name,
          activeSince:createdYear,
          requestRange:adhocObj.Range,
          amount:adhocObj.TOTAL_PAYABLE_AMOUNT,
          status:adhocObj.Status
        })
      });
      this.AdhocGridOptions.api.setRowData(this.adhocRequestList);
    })
  }

  public onRowClicked(e) {
    if (e.event.target !== undefined) {
      console.log("on onRowClicked")
      let data = e.data;
      this.isActionButtonEnabled=false;
      let actionType = e.event.target.getAttribute("data-action-type");
      //console.log(actionType);
      switch (actionType) {
        case "viewAdhocRequest":
          console.log(data.clientName);
          this.paymentReleaseId=data.paymentReleaseId;
          this.currentOrganization.Name=data.clientName;
          this.currentOrganization._id=data.organizationId;
          this.findInitialPayments(data.paymentReleaseId);
          if(data.status === 'Pending'){
            this.isActionButtonEnabled=true;
          }
          this.emoModal.show();
      }
    }
  }
  
  findInitialPayments(selectedOrgnization){
    /*let _requestBody={
      Organization:selectedOrgnization,
      Type:"Adhoc",
      Status:"Pending"
    };*/
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
      let {Organization,isAnnualPayment,NoOfMonthsLable,NoOfMonths,UserType,ActivationDate,Range,NoOfEmployees,NoNeeded,Status} = this.paymentReleaseData;
      this.checkoutActivationDate = moment(ActivationDate).format("MM/DD/YYYY");
      let {COST_PER_PA,COST_PER_MONTH,DISCOUNT_PA_PAYMENT,TOTAL_AMOUNT,COST_PER_MONTH_ANNUAL_DISCOUNT} = this.paymentReleaseData;
      let {DUE_AMOUNT,TAX_AMOUNT,TOTAL_PAYABLE_AMOUNT} = this.paymentReleaseData;
      this.paymentModel = {Organization,isAnnualPayment,NoOfMonthsLable,NoOfMonths,UserType,ActivationDate,Range,NoOfEmployees,NoNeeded,Status};
      this.paymentModel.paymentreleaseId = this.paymentReleaseData._id;
      this.paymentStructure = {COST_PER_PA,COST_PER_MONTH,DISCOUNT_PA_PAYMENT,TOTAL_AMOUNT,COST_PER_MONTH_ANNUAL_DISCOUNT};
      this.paymentSummary = {DUE_AMOUNT,TAX_AMOUNT,TOTAL_PAYABLE_AMOUNT};
      console.log(JSON.stringify(this.paymentSummary));
  }
  closeForm(){
    this.emoModal.hide();
  }
  releaseStatusChange(flag:any){
    console.log(flag);
    let status="";
    if(flag ===1){
      status="Approved";
    }
    if( flag === 0){
      status="Disapproved";
    }
    
    if(status!=""){
      this.paymentModel.Organization=this.currentOrganization._id;
      let requestBody:any={
        Status:status,
        paymentreleaseId:this.paymentReleaseId
      };
      console.log(requestBody);
       this.perfApp.route = "payments";
       this.perfApp.method = "/release/save",
       this.perfApp.requestBody = requestBody
       this.perfApp.CallAPI().subscribe(c => {
       if(c){
        this.notification.success(`${status} ${this.currentOrganization.Name}`);
       }else{
         this.notification.error("Record not updated.")
       }
       this.emoModal.hide();
      window.location.reload();
       });
    }
    


  }
}
