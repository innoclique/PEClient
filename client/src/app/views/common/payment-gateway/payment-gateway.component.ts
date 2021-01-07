import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { MonerisService } from '../../../services/moneris.service';
import { Router ,ActivatedRoute} from '@angular/router';
import { PerfAppService } from '../../../services/perf-app.service';
import { NotificationService } from '../../../services/notification.service';

declare const monerisCheckout: any;
var loginUser:any;
var loginorganization:any;
var perfApp1: PerfAppService;
var payment_releaseId:any;
var payable_Amount:any
@Component({
  selector: 'app-payment-gateway',
  templateUrl: './payment-gateway.component.html',
  styleUrls: ['./payment-gateway.component.css']
})
export class PaymentGatewayComponent implements OnInit {
  errorMsg:any="";
  currentUser:any;
  appInputparams:any={};
  transactionId:any;
  currentOrganization:any;
  url = 'https://gatewayt.moneris.com/chkt/js/chkt_v1.00.js';

  constructor(
    public authService: AuthService,
    public monerisService: MonerisService,
    private activatedRoute: ActivatedRoute,
    private perfApp: PerfAppService,
    private notification: NotificationService,
    ) {
      perfApp1=this.perfApp;
      this.loadScript();
      this.currentUser = this.authService.getCurrentUser();
      loginUser=this.currentUser;
      this.currentOrganization = this.authService.getOrganization();
      loginorganization=this.currentOrganization;
      this.loadInputParams();

    }

  ngOnInit(): void {
    console.log(this.currentUser);
    this.getTicket();
  }
  public loadScript() {
    console.log('preparing to load...')
    let node = document.createElement('script');
    node.src = this.url;
    node.type = 'text/javascript';
    node.async = true;
    node.charset = 'utf-8';
    document.getElementsByTagName('head')[0].appendChild(node);
    }
  loadInputParams(){
    this.activatedRoute.params.subscribe(params => {
      if (params['paymentreleaseId']) {
        this.appInputparams.paymentreleaseId=params['paymentreleaseId'];
        payment_releaseId=params['paymentreleaseId'];
      }
      if (params['totalAmount']) {
        this.appInputparams.totalAmount=params['totalAmount'];
        payable_Amount=params['totalAmount'];
      }
     });  
  };
  
  
  getTicket(){
    this.errorMsg="";
    let reqBody: any = {};
    reqBody.payableAmount=this.appInputparams.totalAmount;
    reqBody.transactionId=this.appInputparams.paymentreleaseId;
    this.monerisService.getTicket(reqBody).subscribe(apiResponse => {
      console.log("apiResponse")
      console.log(apiResponse)
      if(apiResponse){
        let {response} = apiResponse;
        if(response.success && response.success!=="false"){
          this.loadPaymentPage(apiResponse.response.ticket);
        }else{
          this.notification.error("Payment gateway problem. Please try again later.");
          this.errorMsg="Payment gateway problem. Please try again later.";
        }
      }else{
        this.notification.error("Payment gateway problem. Please try again later.");
          this.errorMsg="Payment gateway problem. Please try again later.";
      }
      
      
    });
    
}
loadPaymentPage(ticket){
  console.log(' ticket : ',ticket);
  var myCheckout = new monerisCheckout();
  myCheckout.setCheckoutDiv('moneris-checkout');
  myCheckout.setMode("qa");
  myCheckout.startCheckout(ticket);
  myCheckout.setCallback("page_loaded", this.initiateTransactionHistory);
  myCheckout.setCallback("payment_receipt", this.paymentReceipt);
  myCheckout.setCallback("cancel_transaction", this.initiateTransactionHistory);
  //myCheckout.setCallback("payment_complete", this.initiateTransaction);
  myCheckout.setCallback("error_event", this.initiateTransactionHistory);
}
initiateTransactionHistory(response){
  console.log("inside:initiateTransactionHistory");
  let transactionHistoryRequest:any={
    UserId:loginUser._id,
    PaymentReleaseId:payment_releaseId,
    Amount:payable_Amount,
    TransactionResponse:JSON.parse(response),
    Organization:loginorganization._id,
  }
  
  perfApp1.route = "transactions";
  perfApp1.method = "history/add",
  perfApp1.requestBody = transactionHistoryRequest
  perfApp1.CallAPI().subscribe(c => {
   console.log(c);
  });
}

paymentReceipt(response){
  console.log("inside:paymentReceipt");
  response = JSON.parse(response);
  console.log(response);
  let transactionRequest:any={
    UserId:loginUser._id,
    PaymentReleaseId:payment_releaseId,
    Amount:payable_Amount,
    TransactionResponse:response,
    Organization:loginorganization._id,
  }
  if(response && response.response_code=="001"){
    transactionRequest.Status = "Success";
  }else{
    transactionRequest.Status = "Fail";
  }
  
  perfApp1.route = "transactions";
  perfApp1.method = "history/add";
  if(response.response_code=="001"){
    perfApp1.method = "add";
  }
  console.log(transactionRequest);
  
  perfApp1.requestBody = transactionRequest
  perfApp1.CallAPI().subscribe(c => {
   //this.transactionId = c._id;
  });
}

initiateTransaction(response){
  console.log("inside:initiateTransaction")
  let transactionRequest:any={
    UserId:loginUser._id,
    PaymentReleaseId:payment_releaseId,
    Amount:payable_Amount,
    TransactionResponse:response,
    Organization:loginorganization._id,
  }
  if(response && response.success){
    transactionRequest.Status = "Success";
  }else{
    transactionRequest.Status = "Fail";
  }
  
  console.log(transactionRequest);
  perfApp1.route = "transactions";
  perfApp1.method = "add",
  perfApp1.requestBody = transactionRequest
  perfApp1.CallAPI().subscribe(c => {
   //this.transactionId = c._id;
  });
}

paymentComplete(data){
  console.log("inside:paymentComplete");
  let response = data.response?data.response:data;
  console.log(response);
  //this.initiateTransaction(response);
  //this.initiateTransactionHistory(data);
}

}
