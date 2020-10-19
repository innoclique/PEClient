import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { GridApi, GridOptions } from 'ag-grid-community';
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
  competencyList: any[];
  selectePeersViewRef: BsModalRef;
  @ViewChild('selectePeersView') selectePeersView: TemplateRef<any>;
  @ViewChild('selecteDirectReporteeView') selecteDirectReporteeView: TemplateRef<any>;
  selecteDirectReporteeViewRef: BsModalRef;
  currentOrganization: any;
  evaluationForm: any;
  isCreate: Boolean;
  employeesList$: any = [];
  selectedEmployee: any;
  selectedEmployees: any = [];
  currentUser: any;
  errorMessage: any;
  currentEvaluationForm: any = [];
  currentEmployeeForPeers: any;
  selectedEmployeesList: any = []
  PeersCompetencyMessage: any;
  currentEmployeeSelectedDirectReportees: any[];
  currentDirectReportee: any;
  directReporteeCompetencyMessage: any;
  currentEmployeeDirectReportees: any;
  currentPeersList: any;
  peersList:any=[];
  selectedEmployeeList: any = [];
  dropdownSettings: any = {};
  competencyDropdownSettings:any={}
  directReporteeDropdownSettings:any={}
  currentPeerCompetencyList:any=[];
  constructor(
    private formBuilder: FormBuilder,
    private perfApp: PerfAppService,
    private notification: NotificationService,
    private modalService: BsModalService,
    public authService: AuthService,
    public router: Router
  ) {


  }
 
  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
    this.getEvaluationList();
    //    this.getIndustries();
    this.currentOrganization = this.authService.getOrganization();
    this.getEmployees();
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'row',
      textField: 'displayTemplate',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.directReporteeDropdownSettings = {
      singleSelection: false,
      idField: 'row',
      textField: 'displayTemplate',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.competencyDropdownSettings = {
      singleSelection: false,
      idField: '_id',
      textField: 'Name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }

  public EmpGridOptions: GridOptions = {
    columnDefs: this.getGridColumnsForEmp(),
    api: new GridApi()
  }
  getEmployees() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllEmployees",
      this.perfApp.requestBody = { 'parentId': this.currentUser.ParentUser ? 
      this.currentUser.ParentUser :
      this.currentUser._id }
    this.perfApp.CallAPI().subscribe(c => {
      console.log('employeed data', c);
      if (c && c.length > 0) {
        this.employeesList$ = c
        this.employeesList$.map(x => {
          var _f=  Object.assign({}, x);
          x.displayTemplate = `${x.FirstName}-${x.LastName}-${x.Email}`,
          x.row=  _f;          
        });
        console.log('formated data',this.employeesList$ );
        var clonedArray = this.employeesList$.map((_arrayElement) => Object.assign({}, _arrayElement));
        console.log(clonedArray);
        this.peersList = clonedArray;
        
      }
    })
  }
  getGridColumnsForEmp() {
    return [
      {
        headerName: 'Employee', sortable: true, filter: true,
        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.data.Employee.FirstName}-${data.data.Employee.LastName}</span>` }
      },
       { headerName: 'Email', field: '', sortable: true, filter: true,
       cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="">${data.data.Employee.Email}</span>` } },
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

      // {
      //   headerName: "Actions",
      //   suppressMenu: true,
      //   Sorting: false,
      //   cellRenderer: (data) => {
      //     console.log('column data', data)
    
      //       return `<i class="icon-ban" style="cursor:pointer ;padding: 7px 20px 0 0;
      //       font-size: 17px;"   data-action-type="deleteEmp" title="Delete Employee"></i>
      //       `
      //     //}
      //   }
      // }
    ];

  }
  gotoCreateEvaluation() {
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
      this.perfApp.requestBody = { clientId: this.authService.getOrganization()._id }
    this.perfApp.CallAPI().subscribe(c => {
      console.log('evaluationList data', c);
      if (c && c.length > 0) {
        c.map(row => {
          var _f=  Object.assign({}, row);
          row.Employees.map(x => {
            var _e=  Object.assign({}, x);
            debugger
            this.selectedEmployeesList.push({
              EmployeeRow: _e,
              EvaluationRow: _f,
              Peers: x.Peers,
              DirectReportees: x.DirectReportees,
              Model: x.Model,
              Employee: x._id,
              PeersCompetencyMessage:x.PeersCompetencyMessage,
              DirectReporteeComptencyMessage:x.DirectReporteeComptencyMessage,
              PeersCompetencyList:x.PeersCompetencyList,
              directReporteeCompetencyList:x.directReporteeCompetencyList
            });
          })
        })
      }
      console.table(this.selectedEmployeesList)
    })
  }

  onEmpGridReady(params) {
    this.EmpGridOptions.api = params.api; // To access the grids API
  }
  public onEmpRowClicked(e) {
    if (e.event.target !== undefined) {
      let data = e.data;
      //this.currentRowItem = data.RowData;
      this.selectedEmployee = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      
      switch (actionType) {
        // case "deleteEmp":
        //   return this.toggleSelection(this.selectedEmployee);
        case "chooseDirectReports":
          return this.selectDirectReportees();
        case "choosePeers":
          return this.selectPeersForEmployee();
        case "deleteEmp":
          return this.deleteEmpFromList();
      }
    }
  }

  selectDirectReportees() {
    debugger
      this.directReporteeCompetencyMessage = this.selectedEmployee.DirectReporteeComptencyMessage;
      this.currentEmployeeSelectedDirectReportees = this.selectedEmployee.DirectReportees;    
    this.getDirectReportees();    
  }
  selectPeersForEmployee() {    
    debugger
  this.PeersCompetencyMessage = this.selectedEmployee.PeersCompetencyMessage;      
  this.currentPeersList = this.selectedEmployee.Peers;    
  this.selectePeersViewRef = this.modalService.show(this.selectePeersView, this.config);
  this.selectedModel=this.selectedEmployee.Model;
  this.currentPeerCompetencyList=this.selectedEmployee.PeersCompetencyList;
  this.selectedEmployeePeers=this.selectedEmployee.Peers;
  this.getCompetencyList();
}
public deleteEmpFromList() {
  debugger
  var _index = this.selectedEmployees.indexOf(this.selectedEmployee);
  this.selectedEmployees.splice(_index, 1)
  _index = this.selectedEmployeesList.indexOf(this.selectedEmployee);
  this.selectedEmployeesList.splice(_index, 1);
  this.EmpGridOptions.api.setRowData(this.selectedEmployeesList);

}
  getCompetencyList() {
    this.perfApp.route = "shared";
    this.perfApp.method = "GetCompetencyList",
      this.perfApp.requestBody = {
        id: this.currentOrganization._id,
        modelId: this.selectedModel
      }; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
      this.competencyList = c;
      var clonedArray = [];
      clonedArray = c.map((_arrayElement) => Object.assign({}, _arrayElement));
      this.directReporteeCompetencyList = clonedArray;
      debugger
      var clonedArray2 = c.map((_arrayElement) => Object.assign({}, _arrayElement));
      this.peersCompetencyList = clonedArray2;

    }, error => {
      debugger
      console.log('competencyList error ', error)
      this.notification.error(error.error.message)
    });
  }

  public directReporteeSelectedCompetencyList = [];

  updateEvaluation() {
    debugger
    const _evform = this.evaluationForm.value;
    this.evaluationForm.value.CreatedBy = this.currentUser._id;
    this.evaluationForm.value.Company = this.currentOrganization._id;

    // this.setEmployeeIds();
    //this.setModelIds();
    //this.currentEvaluationForm.Employees=this.evaluationForm.value.Employees;
    console.log('evaluation form', this.evaluationForm.value);
    this.perfApp.method = "UpdateEvaluationForm";
    this.perfApp.requestBody = this.currentEvaluationForm;
    this.perfApp.route = "evaluation"
    this.perfApp.CallAPI().subscribe(x => {
      console.log('added evaluation', x)
      this.notification.success('Evaluation Updated Successfully.')
      this.router.navigate(['ea/evaluation-list'])
    }, error => {

      console.log('error while adding eval', error)
      this.notification.error(error.error.message)
    })

  }

  //#region multiselect code blocks of all controls
  public selectedModel: any;

  public selectedEmployeePeers: any = [];
  public selectedEmployeeDirectReportees: any = [];

  public peersCompetencyList: any = [];
  public selectedPeersCompetencyList: any = [];
  public directReporteeCompetencyList: any = [];
  public seletedDirectReporteeCompetencyList: any = [];

  onItemSelect(item: any) {
    console.log('onItemSelect', item);    
    this.selectedEmployees.push(item.row);
  }
  onSelectAllEmployees(items: any) {
    //this.selectedEmployees = items;
    this.selectedEmployees=[];
    items.map(x => {
      this.selectedEmployees.push(x.row);
    })
    console.log('onSelectAll', items);
  }
  onEmployeeDeSelect(item:any){
    var _position=this.selectedEmployees.indexOf(item);
    this.selectedEmployees.splice(_position,1);
  }
  onModelChange(event) {
    console.log('selected model', event)
    this.selectedModel = event.target.value;
    this.getCompetencyList();
  }

  public peersForEmpGridOptions: GridOptions = {
    columnDefs: this.getPeersForEmpCols(),
    api: new GridApi()
  }
  public onPeersGridReady(params) {
    this.peersForEmpGridOptions.api = params.api;
  }
  getPeersForEmpCols() {
    return [
      {
        headerName: 'Peer', sortable: true, filter: true,
        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.data.FirstName}-${data.data.LastName}</span>` }
      },

      {
        headerName: "Actions",
        suppressMenu: true,
        Sorting: false,
        cellRenderer: (data) => {
          console.log('column data', data)
          return `<i class="icon-ban" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="deletePeer" title="Delete Peer"></i> `
          //}
        }
      }
    ];

  }
  onPeerSelect(item) {
    console.log('onPeer Select', item);
    if (!this.selectedEmployee.Peers) {
      this.selectedEmployee.Peers = [];
    }
    var _f=  Object.assign({}, item.row);
    this.selectedEmployee.Peers.push(_f);
    if (this.peersForEmpGridOptions.api) {
      this.peersForEmpGridOptions.api.setRowData(this.selectedEmployee.Peers);
    }
  }
  onSelectAllPeers(items: any) {
    //this.selectedEmployees = items;
    if (!this.selectedEmployee.Peers) {
      this.selectedEmployee.Peers = [];
    }
    items.map(x => {      
    var _f=  Object.assign({}, x.row);
    this.selectedEmployee.Peers.push(_f);
    })
    this.selectedEmployeePeers = this.selectedEmployee.Peers
    console.log('onSelectAll peers', this.selectedEmployee.Peers);
    if (this.peersForEmpGridOptions.api) {
      this.peersForEmpGridOptions.api.setRowData(this.selectedEmployee.Peers);
    }
  }
  deletePeer() {
    debugger
    var _p = this.selectedEmployee.Peers.indexOf(this.currentPeer);
    this.selectedEmployee.Peers.splice(_p, 1);
    if (this.peersForEmpGridOptions.api) {
      this.peersForEmpGridOptions.api.setRowData(this.selectedEmployee.Peers);
    }
    this.selectedEmployeePeers = this.selectedEmployee.Peers
  }
  currentPeer(currentPeer: any) {
    throw new Error('Method not implemented.');
  }
  onPeerDeSelect(item:any){
    var _position=this.selectedEmployee.Peers.indexOf(item);
    this.selectedEmployee.Peers.splice(_position,1);
  }
  onDeSelectAllPeers(items:any){
    this.selectedEmployees.Peers=[];  
  }
  closePeersModel() {
    this.selectePeersViewRef.hide();
    this.selectedEmployee = {};  
  }

  savePeers() {
    debugger
    if (this.selectedPeersCompetencyList.length === 0) {
      this.notification.error('Please select at least one  Competency');
      return;
    }
    if (!this.selectedEmployee.Peers || this.selectedEmployee.Peers.length < 2) {
      this.notification.error('Peers should be minimum two members');
      return;
    }
    this.selectedEmployee.PeersCompetencyMessage = this.PeersCompetencyMessage;
    this.selectedEmployee.PeersCompetencyList = this.selectedPeersCompetencyList;

    this.closePeersModel();
  }

  onSelectAllPeersCompetency(items){
    this.selectedPeersCompetencyList.push(items)
  }
  onSelectPeersCompetency(item){
  this.selectedPeersCompetencyList.push(item)
  }

  closeDrModel() {
    this.selecteDirectReporteeViewRef.hide();
    this.selectedEmployee = {};
    this.currentEmployeeSelectedDirectReportees = [];
  }
  getDirectReporteeGridCols() {
    return [
      {
        headerName: 'Direct Reportee', sortable: true, filter: true,
        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="">${data.data.FirstName}-${data.data.LastName}</span>` }
      },

      {
        headerName: "Actions",
        suppressMenu: true,
        Sorting: false,
        cellRenderer: (data) => {
          console.log('column data', data)
          return `<i class="icon-ban" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="deleteDirectReportee" title="Delete Reportee"></i> `
          //}
        }
      }
    ];

  }
  onDirectReporteeGridReady(params) {
    debugger
    this.directReporteesOfEmpGridOptions.api = params.api;    
  }


  public onDirectReporteeGridRowClicked(e) {
    debugger
    if (e.event.target !== undefined) {
      this.currentDirectReportee = e.data;      
      let actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "deleteDirectReportee":
          return this.deleteDirectReportee();
      }
    }
  }

  deleteDirectReportee() {
    var _p = this.currentEmployeeSelectedDirectReportees.indexOf(this.currentDirectReportee);
    this.currentEmployeeSelectedDirectReportees.splice(_p, 1);
    this.directReporteesOfEmpGridOptions.api.setRowData(this.currentEmployeeSelectedDirectReportees);
  }
  saveDirectReportees() {
    if (this.seletedDirectReporteeCompetencyList.length === 0) {
      this.notification.error('Please select at least 1 Competency');
      return;
    }
    if (!this.selectedEmployee.DirectReportees || this.selectedEmployee.DirectReportees.length < 2) {
      this.notification.error('Please select minimum two Ditrct Reportee');
      return;
    }
    debugger
    this.selectedEmployee.DirectReporteeComptencyMessage = this.directReporteeCompetencyMessage;
    this.selectedEmployee.DirectReportsCompetency = this.directReporteeCompetencyList;

    this.selectedEmployees.find(x => x._id === this.selectedEmployee._id).DirectReportees = this.selectedEmployee.DirectReportees;
    this.selectedEmployees.find(x => x._id === this.selectedEmployee._id).DirectReporteeComptencyMessage = this.directReporteeCompetencyMessage;
    this.selectedEmployees.find(x => x._id === this.selectedEmployee._id).DirectReporteeCompetencyList = this.directReporteeCompetencyList;

    this.closeDrModel();
  }
  onSelectAllDirectReporteeCompetency(items){
    this.seletedDirectReporteeCompetencyList.push(items)
    
  }
  onSelectDirectReporteeCompetency(item){
  this.seletedDirectReporteeCompetencyList.push(item)
  }

  public directReporteesOfEmpGridOptions: GridOptions = {
    columnDefs: this.getDirectReporteeGridCols(),   
    api:new GridApi()
  }  
  public getDirectReportees(): void {
      this.perfApp.method = "GetDirectReporteesOfManager";
      this.perfApp.requestBody = { id: this.selectedEmployee._id };
      this.perfApp.route = "app"
      this.perfApp.CallAPI().subscribe(x => {
        console.table('emp list ', x)
        x.map(emp => {
          var _f=  Object.assign({}, emp);
          emp.displayTemplate = `${emp.FirstName}-${emp.LastName}-${emp.Email}`,
            emp.row = _f
        });
        
        this.currentEmployeeDirectReportees = x;
        this.selecteDirectReporteeViewRef = this.modalService.show(this.selecteDirectReporteeView, this.config)  
      }, error => {
        console.log('error while adding eval', error)

      })
    
  }
  onDirectReporteeSelect(item) {
    console.log('onItemSelect', item);
    if (!this.selectedEmployee.DirectReportees) {
      this.selectedEmployee.DirectReportees = [];
    }
    this.selectedEmployee.DirectReportees.push(item.row);
    this.selectedEmployeeDirectReportees = this.selectedEmployee.DirectReportees
    if(this.directReporteesOfEmpGridOptions.api){
      debugger
      this.directReporteesOfEmpGridOptions.api.setRowData(this.selectedEmployee.DirectReportees)
    }
  }
  onSelectAllDirectReportee(items: any) {
    //this.selectedEmployees = items;
    if (!this.selectedEmployee.DirectReportees) {
      this.selectedEmployee.DirectReportees = [];
    }    
    items.map(x => {
      this.selectedEmployee.DirectReportees.push(x.row);
    })
    this.selectedEmployeeDirectReportees = this.selectedEmployee.DirectReportees
    console.log('onSelectAll', items);
    if(this.directReporteesOfEmpGridOptions.api){
      this.directReporteesOfEmpGridOptions.api.setRowData(this.selectedEmployee.DirectReportees)
    }
  }
  
  onDirectReporteeDeSelect(item:any){
    debugger
    var _position=this.selectedEmployee.DirectReportees.indexOf(item.row);
    this.selectedEmployee.DirectReportees.splice(_position,1);
    this.directReporteesOfEmpGridOptions.api.setRowData(this.selectedEmployee.DirectReportees)
  }
  onDeSelectAllDirectReportee(items){    
    debugger
    this.selectedEmployee.DirectReportees=[]    
    this.directReporteesOfEmpGridOptions.api.setRowData([])
  
  }
  //#endregion

}
