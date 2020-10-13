import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
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
  evaluationViewRef: BsModalRef;
  @ViewChild('evaluationView') evaluationView: TemplateRef<any>;
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
    public router:Router
  ) {


  }

  ngOnInit(): void {
    this.getEvaluationList();    
//    this.getIndustries();
    
  }
  gotoCreateEvaluation(){
    this.router.navigate(['/ea/rollout'])
  }
  public columnDefs = [
    {
      headerName: 'Employee(s)', field: '', sortable: true, filter: true,

      cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="viewEmp">View</span>` }
    },
    { headerName: 'Email', field: 'Email', sortable: true, filter: true },
      {
        headerName: 'Peers', field: '', sortable: false, filter: false,
        cellRenderer: (data) => {
          return `<span style="color:blue;cursor:pointer" data-action-type="choosePeers">View</span>`
        }
      },
      {
        headerName: 'Direct Reportees', field: '', sortable: false, filter: false,
        cellRenderer: (data) => {
          return `<span style="color:blue;cursor:pointer" data-action-type="chooseDirectReports">View</span>`
        }
      },

      {
        headerName: "Actions",
        suppressMenu: true,
        Sorting: false,
        cellRenderer: (data) => {
          console.log('column data', data)
          return `<i class="icon-pencil" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="edit" title="Edit Form"></i> `
          //}
        }
      }
  ];

  public evaluationsList: any
  getEvaluationList() {
    this.perfApp.route = "evaluation";
    this.perfApp.method = "GetEvaluations",
      this.perfApp.requestBody = { clientId:this.authService.getOrganization()._id}
    this.perfApp.CallAPI().subscribe(c => {
      
      console.log('evaluationList data', c);
      if (c && c.length > 0) {

   
      //this.clientData=c;
      //this.clientData.push()
      this.evaluationsList = c.map(function (row) {

        return {
          Department:row.Department,
          EvaluationPeriod:row.EvaluationPeriod,
          EvaluationDuration:row.EvaluationDuration,
         
           RowData: row
        }
      })
    }
    })
  
  }
  public onRowClicked(e) {
    if (e.event.target !== undefined) {
      let data = e.data;
      this.currentRowItem = data.RowData;

      let actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "edit":
          return this.editEvaluationForm();
        case "approveRequest":
        // return this.approveRequest(data);
        case "rejectRequest":
        //return this.rejectRequest(data);
      }
    }
  }
  openOrgView() {
    this.evaluationViewRef = this.modalService.show(this.evaluationView, this.config);
    this.evaluationViewRef.setClass('modal-xlg');
    const cr = this.currentRowItem;
    

  }
  editEvaluationForm(){
    const cr = this.currentRowItem;
    this.router.navigate(['ea/rollout/'+cr._id])
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
