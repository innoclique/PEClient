import { Component, OnInit ,ViewChild} from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { PerfAppService } from '../../../services/perf-app.service';
import * as moment from 'moment/moment';
import { ModalDirective, BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NotificationService } from '../../../services/notification.service';
import { Router ,ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.css']
})
export class PaymentHistoryComponent implements OnInit {
  paymentHistoryList:any=[];
  OrganizationName:any="";
  public PaymentGridOptions: GridOptions = {
    columnDefs: this.getColDef()      
  }
  constructor(private perfApp: PerfAppService,private activatedRoute: ActivatedRoute,) { }

  ngOnInit(): void {
    this.onloadParams();
  }

  onloadParams(){
    this.activatedRoute.params.subscribe(params => {
      if (params['Organization']) {
        this.getPaymentHistoryList(params['Organization'])
      }
      
     });  
  }


  getColDef(){
    return  [
      {
        headerName: 'Payment Date', field: 'paymentDate', tooltipField: 'clientName', sortable: true,  suppressSizeToFit: true, filter: true,  
        //cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="viewAdhocRequest">${data.value}</span>` }
      }, 
      //{ headerName: 'Client', field: 'clientName', sortable: true, filter: true },     
      { headerName: 'Amount', field: 'amount', sortable: true, filter: true },
      { headerName: 'Status', field: 'status', sortable: true, filter: true }
      
    ];
  
  }

  getPaymentHistoryList(Organization) {
    this.perfApp.route = "transactions";
    this.perfApp.method = "list",
    this.perfApp.requestBody = { 
      Organization
     }
    this.perfApp.CallAPI().subscribe(_paymentList => {
      //this.paymentHistoryList = _paymentList;
      _paymentList.map(row=>{
        let paymentObj=row;
        this.OrganizationName=paymentObj.Organization.Name;
        this.paymentHistoryList.push({
          paymentDate:moment(paymentObj.CreatedOn).format("MM/DD/YYYY"),
          amount:paymentObj.Amount,
          status:paymentObj.Status,
          //paymentFrequency:paymentObj.PaymentReleaseId.isAnnualPayment?"Annual":"Monthly",
        });
      });
      this.PaymentGridOptions.api.setRowData(this.paymentHistoryList);
    })
  }

}
