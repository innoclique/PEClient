import { Component, OnInit ,ViewChild} from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { PerfAppService } from '../../../services/perf-app.service';
import * as moment from 'moment/moment';
import { ModalDirective, BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NotificationService } from '../../../services/notification.service';
import { Router ,ActivatedRoute} from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AlertDialog } from '../../../Models/AlertDialog';
import { AlertComponent } from '../../../shared/alert/alert.component';

@Component({
  selector: 'app-payment-adhoc-list',
  templateUrl: './payment-adhoc-list.component.html',
  styleUrls: ['./payment-adhoc-list.component.css']
})
export class PaymentAdhocListComponent implements OnInit {
  public alert= new AlertDialog();
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
  adhocRequestList:any=[];
  public AdhocGridOptions: GridOptions = {
    columnDefs: this.getColDef()      
  }
  currentOrganization:any={};
  isActionButtonEnabled:Boolean=false;
  paymentDate:any;
  constructor(
    private perfApp: PerfAppService,
    private notification: NotificationService,
    public router: Router,
    public dialog: MatDialog,
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
      { headerName: 'Total Request', field: 'totalRequest', sortable: true, filter: true },
      { headerName: 'Current Request', field: 'noOfEmployees', sortable: true, filter: true },
      { headerName: 'Purpose', field: 'purpose', sortable: true, filter: true },
      { headerName: 'Amount', field: 'amount', sortable: true, filter: true ,
      cellRenderer: (data) => {
        console.log(data)
        return `${data.value.$numberDecimal}`;
      }},
      {
        headerName: "Review/Modify",
        suppressSizeToFit: true,
    
        Sorting: false,        
        cellRenderer: (data) => {
          return `<i class="icon-minus" style="cursor:check ;padding: 7px 20px 0 0;
                      font-size: 17px;"   data-action-type="suspendorg" title="Approved"></i>
                      <i class="icon-close" style="cursor:check ;padding: 7px 20px 0 0;
                      font-size: 17px;"   data-action-type="suspendorg" title="Disapproved"></i>
                      `
        }
  
  
      }
    ];
  
  }

  getAdhocRequestList() {
    this.perfApp.route = "payments";
    this.perfApp.method = "adhoc/request/list",
    this.perfApp.requestBody = {  }
    this.perfApp.CallAPI().subscribe(adhocList => {
      this.adhocRequestList = adhocList;
      /*adhocList.map(row=>{
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
        });
      });*/
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
      let {Organization,isAnnualPayment,NoOfMonthsLable,NoOfMonths,UserType,ActivationDate,Range,NoOfEmployees,NoNeeded,Status,Paymentdate,DurationMonths} = this.paymentReleaseData;
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

      this.paymentModel = {Organization,isAnnualPayment,NoOfMonthsLable,NoOfMonths,UserType,ActivationDate,Range,NoOfEmployees,NoNeeded,Status,DurationMonths};
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
      this.alert.Content = "Are you sure you want to approve this purchase and release the payment information to the client?";
      status="Approved";
    }
    if( flag === 0){
      this.alert.Content = "Are you sure you want to disapprove this purchase?";
      status="Disapproved";
    }
    if(status!=""){
      this.alert.Title = "Alert";
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
          if(flag ===1){
            this.notification.success(`The purchase has been approved and payment info sent to ${this.currentOrganization.Name}.`);
          }
          if( flag === 0){
            this.notification.success(`The purchase has been disapproved and information sent to ${this.currentOrganization.Name}.`);
          }
          
         }else{
           this.notification.error("Record not updated.")
         }
         this.emoModal.hide();
        window.location.reload();
         });
      }
    });



      


    }
    


  }
 
}
