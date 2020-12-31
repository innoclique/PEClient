import { Component, OnInit ,ViewChild} from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { PerfAppService } from '../../../services/perf-app.service';
import * as moment from 'moment/moment';
import { ModalDirective, BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NotificationService } from '../../../services/notification.service';
import { Router ,ActivatedRoute} from '@angular/router';
import { TabsetComponent } from 'ngx-bootstrap/tabs';

@Component({
  selector: 'app-price-list',
  templateUrl: './price-list.component.html',
  styleUrls: ['./price-list.component.css']
})
export class PriceListComponent implements OnInit {
  licensePriceList:any=[];
  employeesPriceList:any=[];
  OrganizationName:any="";
  public PaymentGridOptions: GridOptions = {
    columnDefs: this.getColDef()      
  }
  @ViewChild('staticTabs', { static: false }) staticTabs: TabsetComponent;
  constructor(private perfApp: PerfAppService,private activatedRoute: ActivatedRoute,) { }

  ngOnInit(): void {
    this.getLicensePriceList();
    this.getEmployeePriceList();
  }

  getColDef(){
    return  [
      {
        headerName: 'Range', field: 'Range', tooltipField: 'clientName', sortable: true,  suppressSizeToFit: true, filter: true,  
        //cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="viewAdhocRequest">${data.value}</span>` }
      }, 
      //{ headerName: 'Client', field: 'clientName', sortable: true, filter: true },     
      { headerName: 'Cost per year', field: 'Cost', sortable: true, filter: true },
      { headerName: 'Discount', field: 'Discount', sortable: true, filter: true,
      cellRenderer:(data)=>{return `${data.value}%`}
      },
      { headerName: 'Monthly with discount', field: 'Discount', sortable: true, filter: true,
      cellRenderer:(data)=>{
        let rowData = data.data;
        let {Cost,Discount} = rowData;
        let discountAmount = Cost*Discount/100;
        let totalAmount = Cost-discountAmount;
        let monthlyAmountWithDiscount = totalAmount/12;
        return `${parseFloat(""+monthlyAmountWithDiscount).toFixed(2)}`
      }
      },
      { headerName: 'Monthly no discount', field: 'Discount', sortable: true, filter: true,
      cellRenderer:(data)=>{
        let rowData = data.data;
        let {Cost,Discount} = rowData;
        let monthlyAmount = Cost/12;
        return `${parseFloat(""+monthlyAmount).toFixed(2)}`
      }
      }
      
    ];
  
  }

  getLicensePriceList() {
    this.perfApp.route = "payments";
    this.perfApp.method = "price/list",
    this.perfApp.requestBody = { 
      "UsageType" : "License",
      "ClientType" : "Client"
     }
    this.perfApp.CallAPI().subscribe(priceList => {
      this.licensePriceList = priceList;
      this.PaymentGridOptions.api.setRowData(this.licensePriceList);
    })
  }

  getEmployeePriceList() {
    this.perfApp.route = "payments";
    this.perfApp.method = "price/list",
    this.perfApp.requestBody = { 
      "UsageType" : "Employees",
      "ClientType" : "Client"
     }
    this.perfApp.CallAPI().subscribe(priceList => {
      this.employeesPriceList = priceList;
      this.PaymentGridOptions.api.setRowData(this.employeesPriceList);
    })
  }

}
