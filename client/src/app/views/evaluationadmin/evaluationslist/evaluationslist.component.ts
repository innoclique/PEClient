import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from '../../../services/auth.service';

import { NotificationService } from '../../../services/notification.service';
import { PerfAppService } from '../../../services/perf-app.service';


@Component({
  selector: 'app-evaluationslist',
  templateUrl: './evaluationslist.component.html',
  styleUrls: ['./evaluationslist.component.css']
})
export class EvaluationslistComponent implements OnInit {

  @ViewChild('closeModal') closeModal: ElementRef
  currentRowItem: any;
  orgViewRef: BsModalRef;
  @ViewChild('orgView') orgView: TemplateRef<any>;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,

  };
  industries: any;
  constructor(
    private formBuilder: FormBuilder,
    private perfApp: PerfAppService,
    private notification: NotificationService,
    private modalService: BsModalService,
    public authService: AuthService,
  ) {


  }

  ngOnInit(): void {
    this.getClients();    
    this.getIndustries();
    
  }
  
  public columnDefs = [
    {
      headerName: 'Client', field: 'Name', sortable: true, filter: true,

      cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.value}</span>` }
    },
    { headerName: 'Employee', field: 'Employees', sortable: true, filter: true },
    { headerName: 'Title', field: 'Industry', sortable: true, filter: true },
    { headerName: 'Usage Type', field: 'UsageType', sortable: true, filter: true },
    { headerName: 'Contact Person', field: 'ContactName', sortable: true, filter: true },
    {
      headerName: "Actions",
      suppressMenu: true,
      Sorting: false,
      //width: 170,
      cellRenderer: (data) => {
        console.log('column data', data)
        //if (data.data.ApprovalRecord.status === 'ACTIVE') {
        return `<i class="icon-ban" style="cursor:pointer ;padding: 7px 20px 0 0;
  font-size: 17px;"   data-action-type="suspendorg" ></i>`
        //}
      }


    }
  ];

  public evaluationsList: any
  getClients() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetEvaluations",
      this.perfApp.requestBody = { }
    this.perfApp.CallAPI().subscribe(c => {
      
      console.log('lients data', c);
      if (c && c.length > 0) {

      }
      //this.clientData=c;
      //this.clientData.push()
      this.evaluationsList = c.map(function (row) {

        return {
         
           RowData: row
        }
      }
      )
    })
  }
  public onRowClicked(e) {
    if (e.event.target !== undefined) {
      let data = e.data;
      this.currentRowItem = data.RowData;

      let actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "orgView":
          return this.openOrgView();
        case "approveRequest":
        // return this.approveRequest(data);
        case "rejectRequest":
        //return this.rejectRequest(data);
      }
    }
  }
  openOrgView() {
    this.orgViewRef = this.modalService.show(this.orgView, this.config);
    this.orgViewRef.setClass('modal-xlg');
    const cr = this.currentRowItem;
    

  }
  hideorgView() {
    this.orgViewRef.hide();
   
  }

  getIndustries() {
    this.perfApp.route = "shared";
    this.perfApp.method = "GetIndustries",
      this.perfApp.requestBody = {}; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
      this.industries = c;
      console.table(c);
    }, error => {


      //this.notification.error(error.error.message)
    });
  }

}
