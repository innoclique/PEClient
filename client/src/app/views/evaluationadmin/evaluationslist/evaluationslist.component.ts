import { DatePipe } from '@angular/common';
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
  peersList: any = [];
  selectedEmployeeList: any = [];
  dropdownSettings: any = {};
  competencyDropdownSettings: any = {}
  directReporteeDropdownSettings: any = {}
  currentPeerCompetencyList: any = [];
  peerDropdownSettings: any = {}
  kpiList:any=[];
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
    this.peerDropdownSettings = {
      singleSelection: false,
      idField: 'EmployeeId',
      textField: 'displayTemplate',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
    this.directReporteeDropdownSettings = {
      singleSelection: false,
      idField: 'EmployeeId',
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
  public EmpKpiGridOptions: GridOptions = {
    columnDefs: this.getGridColumnsForEmpKpi(),
    api: new GridApi()
  }
  formattedPeers: any = []
  getEmployees() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllEmployees",
      this.perfApp.requestBody = { 'companyId': this.currentOrganization._id }
    this.perfApp.CallAPI().subscribe(c => {
      console.log('employeed data', c);
      if (c && c.length > 0) {
        this.employeesList$ = c
        var clonedArray = this.employeesList$.map((_arrayElement) => Object.assign({}, _arrayElement));
        this.employeesList$.map(x => {
          var _f = Object.assign({}, x);
          x.displayTemplate = `${x.FirstName}-${x.LastName}-${x.Email}`,
            x.row = _f;
        });
        console.log('formated data', this.employeesList$);

      }
    })
  }
  getGridColumnsForEmpKpi() {
    return [
      {
        headerName: 'Employee', sortable: true, filter: true,
        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.data.Employee[0].FirstName}-${data.data.Employee[0].LastName}</span>` }
      },
      {
        headerName: 'Released On', sortable: true, filter: true,
        cellRenderer: (data) => {
          
            return new DatePipe('en-US').transform(data.data.CreatedDate, 'MM-dd-yyyy')
        
      }},   
      
      {
        headerName: 'Evaluation Year', sortable: true, filter: true,
        cellRenderer: (data) => {          
            return data.data.EvaluationYear
      }},
      {
        headerName: 'Manager', field: '', sortable: true, filter: true,
        cellRenderer: (data) => { 
          if (this.getNested(data.data.Manager, 'Name')) {
            return `${data.data.Manager.Name} ` }
          }
          
      },

      {
        headerName: "Actions",
        suppressMenu: true,
        Sorting: false,
        cellRenderer: (data) => {
          console.log('column data', data)

            return `<i class="icon-pencil" style="cursor:pointer ;padding: 7px 20px 0 0;
            font-size: 17px;"   data-action-type="changeModel" title="Change Model"></i>
            `
          //}
        }
      }
    ];

  }
  getGridColumnsForEmp() {
    return [
      {
        headerName: 'Employee', sortable: true, filter: true,
        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.data.Employee.FirstName}-${data.data.Employee.LastName}</span>` }
      },
      {
        headerName: 'RolledOn', sortable: true, filter: true,
        cellRenderer: (data) => {
          if (this.getNested(data.data.EvaluationRow, 'CreatedDate')) // true
            return new DatePipe('en-US').transform(data.data.EvaluationRow.CreatedDate, 'MM-dd-yyyy')
        }
      },
      {
        headerName: 'Type', sortable: true, filter: true,
        cellRenderer: (data) => { return "Regular" }
      },
      {
        headerName: 'Evaluation Period', sortable: true, filter: true,
        cellRenderer: (data) => {
          if (this.getNested(data.data.EvaluationRow, 'EvaluationPeriod')) // true
            return data.data.EvaluationRow.EvaluationPeriod         
        }
      },
      {
        headerName: 'Evaluation Duration', sortable: true, filter: true,
        cellRenderer: (data) => {          
          if (this.getNested(data.data.EvaluationRow, 'EvaluationDuration')) {
            return data.data.EvaluationRow.EvaluationDuration
          }
        }
      },
      {
        headerName: 'Model', field: '', sortable: true, filter: true,
        cellRenderer: (data) => {
          if (this.getNested(data.data.EmployeeRow, 'Model','Name')) {
            return data.data.EmployeeRow.Model.Name
          }         
        }
      },
      {
        headerName: 'Manager', field: '', sortable: true, filter: true,
        cellRenderer: (data) => { 
          if (this.getNested(data.data.Employee, 'Manager','FirstName')) {
            return `${data.data.Employee.Manager.FirstName} ${data.data.Employee.Manager.LastName}` }
          }
          
      },

      {
        headerName: 'Peers', field: '', sortable: false, filter: false,
        cellRenderer: (data) => {
          return `<span style="color:blue;cursor:pointer;" data-action-type="choosePeers">${data.data.EmployeeRow.Peers.length}</span>`
        }
      },
      {
        headerName: 'Direct Reportees', field: '', sortable: false, filter: false,
        cellRenderer: (data) => {
          return `<span style="color:blue;cursor:pointer;" data-action-type="chooseDirectReports">${data.data.EmployeeRow.DirectReportees.length}</span>`
        }
      },

      {
        headerName: "Actions",
        suppressMenu: true,
        Sorting: false,
        cellRenderer: (data) => {
          console.log('column data', data)

            return `<i class="icon-pencil" style="cursor:pointer ;padding: 7px 20px 0 0;
            font-size: 17px;"   data-action-type="changeModel" title="Change Model"></i>
            `
          //}
        }
      }
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
      if (c) {
        this.selectedEmployeesList = [];
        c.evaluations.map(row => {
          var _f = Object.assign({}, row);
          row.Employees.map(x => {
            var _e = Object.assign({}, x);            
            this.selectedEmployeesList.push({
              EmployeeRow: _e,
              EvaluationRow: _f,
              Peers: x.Peers,
              DirectReportees: x.DirectReportees,
              Model: x.Model,
              Employee: x._id,
              PeersCompetencyMessage: x.PeersCompetencyMessage,
              DirectReporteeComptencyMessage: x.DirectReporteeComptencyMessage,
              PeersCompetencyList: x.PeersCompetencyList,
              DirectReporteeCompetencyList: x.DirectReporteeCompetencyList
            });
          })
        })
if(c.kpiList){
this.kpiList=c.kpiList;
this.EmpKpiGridOptions.api.setRowData(this.kpiList);
}


      }
      console.table(this.selectedEmployeesList)
      this.EmpGridOptions.api.setRowData(this.selectedEmployeeList);
    })
  }
  
  onEmpGridReady(params) {
    debugger
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
          return this.openDirectReporteesView();
        case "choosePeers":
          return this.openPeerView();
        case "deleteEmp":
          return this.deleteEmpFromList();
          case "changeModel":
          return this.changeModel();
          
      }
    }
  }
  changeModel(){

  }
  openDirectReporteesView() {
    debugger
    if (this.selectedEmployee.DirectReportees && this.selectedEmployee.DirectReportees.length > 0) {
      this.directReporteeCompetencyMessage = this.selectedEmployee.DirectReportees[0].DirectReporteeComptencyMessage;
      this.selectedEmployeeDirectReportees = this.selectedEmployee.DirectReportees || [];
      this.seletedDirectReporteeCompetencyList = this.selectedEmployee.DirectReportees[0].DirectReporteeCompetencyList;
    }
    this.selectedModel = this.selectedEmployee.Model;
    this.getDirectReportees();
    this.getCompetencyList();
  }
  getPeersForEmployees() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetPeers",
      this.perfApp.requestBody = { company: this.currentOrganization._id, id: this.currentUser._id }
    this.perfApp.CallAPI().subscribe(c => {
      console.log('employeed data', c);
      this.formattedPeers = [];
      if (c && c.length > 0) {
        c.map(x => {
          var _f: any = {};
          _f.EmployeeId = x._id;
          _f.displayTemplate = `${x.FirstName}-${x.LastName}-${x.Email}`,
            this.formattedPeers.push(_f);
        });
        debugger
        this.peersList = c;
        console.log('formated peers data', this.formattedPeers);
      }
      this.selectePeersViewRef = this.modalService.show(this.selectePeersView, this.config);
    })
  }
  openPeerView() {
    debugger

    this.PeersCompetencyMessage = this.selectedEmployee.Peers[0] ? this.selectedEmployee.Peers[0].PeersCompetencyMessage : "";
    this.selectedEmployeePeers = this.selectedEmployee.Peers || [];
    //  this.currentPeerCompetencyList = this.selectedEmployee.Peers[0].PeersCompetencyList;

    //this.PeersCompetencyMessage = this.selectedEmployee.PeersCompetencyMessage;      
    //this.selectedEmployeePeers = this.selectedEmployee.Peers||[];    

    this.selectedModel = this.selectedEmployee.Model;
    this.currentPeerCompetencyList = this.selectedEmployee.Peers[0] ? this.selectedEmployee.Peers[0].PeersCompetencyList : [];

    this.getPeersForEmployees();
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
    var modelId = "";
    if (this.selectedModel instanceof Object) {
      modelId = this.selectedModel._id
    } else {
      modelId = this.selectedModel
    }
    this.perfApp.route = "shared";
    this.perfApp.method = "GetCompetencyList",
      this.perfApp.requestBody = {
        id: this.currentOrganization._id,
        modelId: modelId
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
  updateDirectReporteesOfEmployee() {
    this.perfApp.method = "UpdateDirectReportees";
    this.perfApp.requestBody = {
      EvaluationId: this.selectedEmployee.EvaluationRow._id,
      EmployeeId: this.selectedEmployee.Employee._id,
      DirectReportees: this.selectedEmployee.DirectReportees,
      DirectReporteeCompetencyMessage: this.selectedEmployee.DirectReporteeComptencyMessage,
      DirectReporteeCompetencyList: this.selectedEmployee.DirectReportsCompetency
    }
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
  UpdatePeers() {
    this.perfApp.method = "UpdatePeers";
    this.perfApp.requestBody = {
      EvaluationId: this.selectedEmployee.EvaluationRow._id,
      EmployeeId: this.selectedEmployee.Employee._id,
      Peers: this.selectedEmployee.Peers,
      PeersCompetencyMessage: this.selectedEmployee.PeersCompetencyMessage,
      PeersCompetencyList: this.selectedEmployee.PeersCompetencyList
    }
    this.perfApp.route = "evaluation"
    this.perfApp.CallAPI().subscribe(x => {
      console.log('added evaluation', x)
      this.notification.success('Evaluation Updated Successfully.')
      this.router.navigate(['ea/evaluation-list'])
      this.closePeersModel();
    }, error => {
      this.closePeersModel();
      console.log('error while adding eval', error)
      this.notification.error(error.error.message)
    })

  }
  updateEvaluation() {
    debugger
    const _evform = this.evaluationForm.value;
    this.evaluationForm.value.CreatedBy = this.currentUser._id;
    this.evaluationForm.value.Company = this.currentOrganization._id;

    // this.setEmployeeIds();
    //this.setModelIds();
    //this.currentEvaluationForm.Employees=this.evaluationForm.value.Employees;
    this.evaluationForm.value.Employees = this.selectedEmployees;
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
    this.selectedEmployees = [];
    items.map(x => {
      this.selectedEmployees.push(x.row);
    })
    console.log('onSelectAll', items);
  }
  onEmployeeDeSelect(item: any) {
    var _position = this.selectedEmployees.indexOf(item);
    this.selectedEmployees.splice(_position, 1);
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
        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.data.displayTemplate}</span>` }
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

  closeDrModel() {
    this.selecteDirectReporteeViewRef.hide();
    this.selectedEmployee = {};
    this.currentEmployeeSelectedDirectReportees = [];
  }
  getDirectReporteeGridCols() {
    return [
      {
        headerName: 'Direct Reportee', sortable: true, filter: true,
        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="">${data.data.displayTemplate}</span>` }
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
    var _p = this.selectedEmployeeDirectReportees.indexOf(this.currentDirectReportee);
    this.selectedEmployeeDirectReportees.splice(_p, 1);
    this.directReporteesOfEmpGridOptions.api.setRowData(this.selectedEmployeeDirectReportees);
    this.selectedEmployeeDirectReportees = [...this.selectedEmployeeDirectReportees]
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
    this.selectedEmployee.DirectReportsCompetency = this.seletedDirectReporteeCompetencyList;
    this.selectedEmployee.DirectReportees.map(element => {
      element.DirectReporteeComptencyMessage = this.directReporteeCompetencyMessage;
      element.DirectReporteeCompetencyList = this.seletedDirectReporteeCompetencyList;
    });

    // this.selectedEmployees.find(x => x._id === this.selectedEmployee._id).DirectReportees = this.selectedEmployee.DirectReportees;
    // this.selectedEmployees.find(x => x._id === this.selectedEmployee._id).DirectReporteeComptencyMessage = this.directReporteeCompetencyMessage;
    // this.selectedEmployees.find(x => x._id === this.selectedEmployee._id).DirectReporteeCompetencyList = this.directReporteeCompetencyList;
    this.updateDirectReporteesOfEmployee();
    this.closeDrModel();
  }


  public directReporteesOfEmpGridOptions: GridOptions = {
    columnDefs: this.getDirectReporteeGridCols(),
    api: new GridApi()
  }

  //#region Refactring

  currentPeer: any = {};
  onPeerSelect(item) {
    console.log('onPeer Select', item);
    if (!this.selectedEmployee.Peers) {
      this.selectedEmployee.Peers = [];
    }
    //var _f=  Object.assign({}, item.row);
    this.selectedEmployee.Peers.push(item);
    if (this.peersForEmpGridOptions.api) {
      this.peersForEmpGridOptions.api.setRowData(this.selectedEmployee.Peers);
    }
  }
  onSelectAllPeers(items: any) {
    debugger
    //this.selectedEmployees = items;
    if (!this.selectedEmployee.Peers) {
      this.selectedEmployee.Peers = [];
    }
    this.selectedEmployee.Peers = items;
    // items.map(x => {
    //   var _f = Object.assign({}, x.row);
    //   this.selectedEmployee.Peers.push(x);
    // })
    // this.selectedEmployeePeers = this.selectedEmployee.Peers
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
    this.selectedEmployeePeers = [...this.selectedEmployee.Peers]
  }
  onPeerDeSelect(item: any) {
    var _position = this.selectedEmployee.Peers.indexOf(item);
    this.selectedEmployee.Peers.splice(_position, 1);
  }
  onDeSelectAllPeers(items: any) {
    this.selectedEmployees.Peers = [];
  }
  closePeersModel() {
    this.selectePeersViewRef.hide();
    this.selectedEmployee = {};
    this.selectedEmployeePeers = [];
  }
  public onPeersRowClicked(e) {
    debugger
    if (e.event.target !== undefined) {
      this.currentPeer = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "deletePeer":
          return this.deletePeer();
        // case "edit":
        // return this.editClient();
      }
    }
  }
  savePeers() {
    debugger
    if (this.currentPeerCompetencyList.length === 0) {
      this.notification.error('Please select at least one  Competency');
      return;
    }
    if (!this.selectedEmployee.Peers || this.selectedEmployee.Peers.length < 2) {
      this.notification.error('Peers should be minimum two members');
      return;
    }
    this.selectedEmployee.PeersCompetencyMessage = this.PeersCompetencyMessage;
    this.selectedEmployee.PeersPeersCompetencyList = this.currentPeerCompetencyList;


    this.selectedEmployee.Peers.map(element => {
      element.PeersCompetencyMessage = this.PeersCompetencyMessage;
      element.PeersCompetencyList = this.currentPeerCompetencyList;
    });
    this.UpdatePeers();
  }

  onDeSelectDirectReporteeCompetency(item) {
    var _position = this.seletedDirectReporteeCompetencyList.indexOf(item);
    this.seletedDirectReporteeCompetencyList.splice(_position, 1);

  }
  onDeSelectAllDirectReporteeCompetency(items) {
    this.seletedDirectReporteeCompetencyList = []
  }
  onSelectAllPeersCompetency(items) {
    this.selectedPeersCompetencyList = items;
  }
  onSelectPeersCompetency(item) {
    this.selectedPeersCompetencyList.push(item)
  }

  onSelectAllDirectReporteeCompetency(items) {
    this.seletedDirectReporteeCompetencyList = items

  }
  onSelectDirectReporteeCompetency(item) {
    this.seletedDirectReporteeCompetencyList.push(item)
  }

  public getDirectReportees(): void {
    this.perfApp.method = "GetDirectReporteesOfManager";
    this.perfApp.requestBody = { id: this.selectedEmployee.Employee._id };
    this.perfApp.route = "app"
    this.perfApp.CallAPI().subscribe(x => {
      this.currentEmployeeDirectReportees = [];
      console.table('emp list ', x)
      x.map(emp => {
        var _f: any = {};
        _f.EmployeeId = emp._id;
        _f.displayTemplate = `${emp.FirstName}-${emp.LastName}-${emp.Email}`,
          this.currentEmployeeDirectReportees.push(_f);
      });

      // this.currentEmployeeDirectReportees = x;
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
    this.selectedEmployee.DirectReportees.push(item);
    this.selectedEmployeeDirectReportees = this.selectedEmployee.DirectReportees
    if (this.directReporteesOfEmpGridOptions.api) {
      debugger
      this.directReporteesOfEmpGridOptions.api.setRowData(this.selectedEmployee.DirectReportees)
    }
  }
  onSelectAllDirectReportee(items: any) {
    //this.selectedEmployees = items;
    if (!this.selectedEmployee.DirectReportees) {
      this.selectedEmployee.DirectReportees = [];
    }
    this.selectedEmployee.DirectReportees = items;
    this.selectedEmployeeDirectReportees = this.selectedEmployee.DirectReportees
    console.log('onSelectAll', items);
    if (this.directReporteesOfEmpGridOptions.api) {
      this.directReporteesOfEmpGridOptions.api.setRowData(this.selectedEmployee.DirectReportees)
    }
  }

  onDirectReporteeDeSelect(item: any) {
    debugger
    var _position = this.selectedEmployee.DirectReportees.indexOf(item);
    this.selectedEmployee.DirectReportees.splice(_position, 1);
    this.directReporteesOfEmpGridOptions.api.setRowData(this.selectedEmployee.DirectReportees)
  }
  onDeSelectAllDirectReportee(items) {
    debugger
    this.selectedEmployee.DirectReportees = []
    this.directReporteesOfEmpGridOptions.api.setRowData([])

  }
  //#endregion



  getNested(obj, ...args) {
    return args.reduce((obj, level) => obj && obj[level], obj)
  }
  initiateEvaluation(){
    this.router.navigate(['ea/rollout', { allKpi: 'true' }], { skipLocationChange: true });
    
  }

}
