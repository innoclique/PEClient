import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { MonerisService } from '../../../services/moneris.service';
import { Router ,ActivatedRoute} from '@angular/router';
import { PerfAppService } from '../../../services/perf-app.service';

declare const monerisCheckout: any;

@Component({
  selector: 'app-payment-gateway',
  templateUrl: './payment-gateway.component.html',
  styleUrls: ['./payment-gateway.component.css']
})
export class PaymentGatewayComponent implements OnInit {
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
    ) {
      this.loadScript();
      this.currentUser = this.authService.getCurrentUser();
      this.currentOrganization = this.authService.getOrganization();
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
      }
      if (params['totalAmount']) {
        this.appInputparams.totalAmount=params['totalAmount'];
      }
     });  
  };
  initiateTransaction(response:any){
    let transactionRequest:any={
      UserId:this.currentUser._id,
      PaymentReleaseId:this.appInputparams.paymentreleaseId,
      Amount:this.appInputparams.totalAmount,
      TransactionResponse:response,
      Organization:this.currentOrganization._id,
    }
    if(response && response.success){
      transactionRequest.Status = "Success";
    }else{
      transactionRequest.Status = "Fail";
    }
    
    console.log(transactionRequest);
    this.perfApp.route = "transactions";
    this.perfApp.method = "/add",
    this.perfApp.requestBody = transactionRequest
    this.perfApp.CallAPI().subscribe(c => {
     this.transactionId = c._id;
     
    });
  }
  getTicket(){
    let reqBody: any = {};
    reqBody.payableAmount=this.appInputparams.totalAmount;
    reqBody.transactionId=this.transactionId;
    this.monerisService.getTicket(reqBody).subscribe(apiResponse => {
        this.loadPaymentPage(apiResponse.response.ticket);
    });
    
}
loadPaymentPage(ticket){
  console.log(' ticket : ',ticket);
  var myCheckout = new monerisCheckout();
  myCheckout.setCheckoutDiv('moneris-checkout');
  myCheckout.setMode("qa");
  myCheckout.startCheckout(ticket);
  myCheckout.setCallback("page_loaded", this.onloadPaymentGateway);
  myCheckout.setCallback("payment_receipt", this.paymentReceipt);
  myCheckout.setCallback("cancel_transaction", this.cancelTransaction);
  myCheckout.setCallback("payment_complete", this.paymentComplete);
  myCheckout.setCallback("error_event", this.erroEvent);
}
paymentComplete(data){
  let response = data.response?data.response:data;
  this.initiateTransaction(response);
}
onloadPaymentGateway(data){
  console.log("inside:page_loaded:event");
  console.log(data);
}
paymentReceipt(data){
  console.log(data);
}

cancelTransaction(data){
  console.log(data)
}
erroEvent(data){
  console.log(data);
}



}
