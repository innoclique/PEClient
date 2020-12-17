import { Component, OnInit,ViewChild } from '@angular/core';
import { TabsetComponent, TabDirective } from 'ngx-bootstrap/tabs';
import {ClientOrganizationModel,ResellerModel} from './models/payment-setting-model';
import { PaymentSettiingsService } from "../../../services/payment-settiings.service";
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'app-payment-settings',
  templateUrl: './payment-settings.component.html',
  styleUrls: ['./payment-settings.component.css']
})
export class PaymentSettingsComponent implements OnInit {
  disableSwitching: boolean;
  clientOrgModel = new ClientOrganizationModel('','','',0,0,0);
  resellerModel = new ResellerModel('','','',0,0,0,0,0);
  constructor(public paymentSettiingsService:PaymentSettiingsService,private flashMessage: FlashMessagesService) { }
  @ViewChild('tabset') tabset: TabsetComponent;
  ngOnInit(): void {
  }
  ngAfterViewInit(){
    console.log(this.tabset.tabs);
  }
  goto(id){
    this.tabset.tabs[id].active = true;
  }
  saveClientOrgData(){
    console.log(this.clientOrgModel);
    this.clientOrgModel.PaymentSettingType="Client";
    this.clientOrgModel.PaymentDuration=parseInt(""+this.clientOrgModel.PaymentDuration);
    this.paymentSettiingsService
    .saveClientOrgPaymentSetting(this.clientOrgModel)
    .subscribe(apiResponse => {
      console.log("Record inserted");
      this.showFlash("Added Payment Setting.");
    });
  }
  resetClientData(){
    this.clientOrgModel = new ClientOrganizationModel('','','',0,0,0);
    
  }

  saveResellerData(){
    console.log(this.resellerModel);
    this.resellerModel.PaymentSettingType="Reseller";
    this.resellerModel.PaymentDuration=parseInt(""+this.resellerModel.PaymentDuration);
    this.paymentSettiingsService
    .saveClientOrgPaymentSetting(this.resellerModel)
    .subscribe(apiResponse => {
      console.log("Record inserted");
      this.showFlash("Added Payment Setting.");
    });
  }
  resetResellerData(){
    this.resellerModel = new ResellerModel('','','',0,0,0,0,0);
    
  }

  showFlash(msg:string) {
    // 1st parameter is a flash message text
    // 2nd parameter is optional. You can pass object with options.
    this.flashMessage.show(msg, { cssClass: 'alert-success', timeout: 2000 });
}
  
}
