
import { DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GridApi, GridOptions, _ } from 'ag-grid-community';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from '../../../services/auth.service';

import { NotificationService } from '../../../services/notification.service';
import { PerfAppService } from '../../../services/perf-app.service';
import ReportTemplates from '../../../views/psa/reports/data/reports-templates';


@Component({
  selector: 'app-rollevaluation',
  templateUrl: './rollevaluation.component.html',
  styleUrls: ['./rollevaluation.component.css']
})
export class RollevaluationComponent implements OnInit {

  public evaluationForm: FormGroup;
  public contactPersonForm: FormGroup;
  public isFormSubmitted = false;
  isPeerCompetencyMappingEdit: boolean = false;
  errorOnSave = false;
  errorMessage: string = "";
  enableKPIFor: boolean = false;
  employeesList$: any[] = [];
  peersList: any[];
  directReportees: any[];
  evaluationPeriods: any[];
  evaluationDuration: any[];
  competencyMappingRowdata: any;

  public currentOrganization: any;
  currentUser: any;
  isViewCompetencies: boolean = false;

  public monthList = ["", "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"]
  kpiForList: string[] = ['Employee', 'Manager', 'EA'];
  modelsList: any[];
  config = {
    backdrop: true,
    ignoreBackdropClick: true,

  };
  selectePeersViewRef: BsModalRef;
  @ViewChild('selectePeersView') selectePeersView: TemplateRef<any>;
  @ViewChild('selecteDirectReporteeView') selecteDirectReporteeView: TemplateRef<any>;
  selecteDirectReporteeViewRef: BsModalRef;
  selectedCompetencyViewRef: BsModalRef;
  @ViewChild('selectedCompetencyView') selectedCompetencyView: TemplateRef<any>;

  public initializeFormFor = 'kpionly';

  //#region Refactring
  public selectedModel: any;
  public selectedEmployees: any = [];
  public selectedEmployeePeers: any = [];
  public selectedEmployeeDirectReportees: any = [];
  public competencyList: any = [];
  public peersCompetencyList: any = [];
  public selectedPeersCompetencyList: any = [];
  public directReporteeCompetencyList: any = [];
  public seletedDirectReporteeCompetencyList: any = [];
  public selectedEmployee: any;
  public selectedEmployeesForEvaluation: any = [];
  public disabledAddButton: Boolean = false;
  public peerCompetencyMapping: any[];
  public peerCompetencyUIMapping: any;
  peerCompetencyMappingRowdata: any[];
  public drCompetencyMapping: any[];
  public drCompetencyUIMapping: any;
  drCompetencyMappingRowdata: any[];
  allKpi: Boolean = false;
  rollEvaluationEdit: Boolean = false;
  readonlyEmployee: any = {};
  editEvaluation: any;
  kpiSelectedEmployees: any = [];
  gridRefreshParams = {
    force: true,
    suppressFlash: false
  };
  onEmpGridReady(params) {
    this.EmpGridOptions.api = params.api; // To access the grids API
  }
  onItemSelect(item: any) {
    console.log('onItemSelect', item);
    this.selectedEmployees.push(item.row);
    this.disabledAddButton = false;

  }
  onSelectAllEmployees(items: any) {
    //this.selectedEmployees = items;
    this.selectedEmployees = [];
    this.selectedEmployeesForEvaluation = []
    items.map(x => {
      this.selectedEmployees.push(x.row);

    })
    console.log('onSelectAll', items);
    this.disabledAddButton = false;
  }
  onEmployeeDeSelect(item: any) {
    console.log('onEmployeeDeSelect', item);
    var _index = this.selectedEmployeeList.findIndex(x => x._id === item.row._id);
    this.selectedEmployeeList.splice(_index, 1);
    this.selectedEmployeeList = [...this.selectedEmployeeList];
    var _indexSelectedEmployees = this.selectedEmployees.findIndex(x => x._id === item.row._id);
    this.selectedEmployees.splice(_indexSelectedEmployees, 1);
    this.selectedEmployees = [...this.selectedEmployees];
  }
  onDeSelectAllEmployees(items: any) {
    //this.selectedEmployees = items;
    this.selectedEmployees = [];
    this.selectedEmployeesForEvaluation = [];
    console.log('onSelectAll', items);
  }
  onModelChange(event) {
    console.log('selected model', event)
    this.selectedModel = event.target.value;
    this.getCompetencyList();

  }

  onPeerSelect(item) {
    debugger
    console.log('onPeer Select', item);
    if (!this.selectedEmployee.Peers) {
      this.selectedEmployee.Peers = [];
    }
    //var _f=  Object.assign({}, item.row);
    this.selectedEmployee.Peers.push(item);
    // if (this.peersForEmpGridOptions.api) {
    //   this.peersForEmpGridOptions.api.setRowData(this.selectedEmployee.Peers);
    // }
  }

  // uniqueArray = a => [...new Set(a.map(o => JSON.stringify(o)))].map(s => JSON.parse(s));
  updateDRCompetencyUIMapping() {
    console.log('users ::: ', this.selectedEmployee.DirectReportees);
    console.log('competencies ::: ', this.seletedDirectReporteeCompetencyList);
    console.log('message ::: ', this.directReporteeCompetencyMessage);
    for (let index = 0; index < this.selectedEmployee.DirectReportees.length; index++) {
      let directReportee = this.selectedEmployee.DirectReportees[index];
      var key = directReportee.EmployeeId;
      var value: any = {};
      value['directReportee'] = directReportee;
      value['message'] = this.directReporteeCompetencyMessage;
      if (this.drCompetencyUIMapping && this.drCompetencyUIMapping[directReportee.EmployeeId]) {
        var c = this.seletedDirectReporteeCompetencyList.concat(this.drCompetencyUIMapping[directReportee.EmployeeId].competencies);
        var d = c.filter((thing, i, arr) => {
          return arr.indexOf(arr.find(t => t._id === thing._id)) === i;
        });
        console.log("after filter ::::", d);
        value['competencies'] = d;
        this.drCompetencyUIMapping[key] = value;
      } else {
        if (!this.drCompetencyUIMapping) {
          this.drCompetencyUIMapping = {};
        }
        value['competencies'] = this.seletedDirectReporteeCompetencyList;
        this.drCompetencyUIMapping[key] = value;
      }
    }
  }

  updatePeerCompetencyUIMapping() {
    console.log('users ::: ', this.selectedEmployee.Peers);
    console.log('competencies ::: ', this.selectedPeersCompetencyList);
    console.log('message ::: ', this.PeersCompetencyMessage);
    for (let index = 0; index < this.selectedEmployee.Peers.length; index++) {
      let peer = this.selectedEmployee.Peers[index];
      var key = peer.EmployeeId;
      var value: any = {};
      value['peer'] = peer;
      value['message'] = this.PeersCompetencyMessage;
      if (this.peerCompetencyUIMapping && this.peerCompetencyUIMapping[peer.EmployeeId]) {
        var c = this.selectedPeersCompetencyList.concat(this.peerCompetencyUIMapping[peer.EmployeeId].competencies);
        var d = c.filter((thing, i, arr) => {
          return arr.indexOf(arr.find(t => t._id === thing._id)) === i;
        });
        console.log("after filter ::::", d);
        console.log("after filter ::::", d);
        value['competencies'] = d;
        this.peerCompetencyUIMapping[key] = value;
      } else {
        if (!this.peerCompetencyUIMapping) {
          this.peerCompetencyUIMapping = {};
        }
        value['competencies'] = this.selectedPeersCompetencyList;
        this.peerCompetencyUIMapping[key] = value;
      }
    }
  }

  viewCompetencies(user: any, competencies: any) {
    this.isViewCompetencies = true;
    this.selectedCompetencyViewRef = this.modalService.show(this.selectedCompetencyView, this.config);
    this.competencyMappingRowdata = {};
    this.competencyMappingRowdata.peer = user;
    this.competencyMappingRowdata.competencies = competencies;
  }

  viewPeerCompetencyMapping() {
    this.viewCompetencies(this.currentPeer.peer, this.currentPeer.competencies);
  }

  viewDrCompetencyMapping() {
    this.viewCompetencies(this.currentDirectReportee.directReportee, this.currentDirectReportee.competencies);
  }

  async addPeerCompetencyMapping() {
    console.log('inside addPeerCompetencyMapping ::: ');
    if (this.selectedPeersCompetencyList.length === 0) {
      this.notification.error('Please select at least one  Competency');
      return;
    }
    if (!this.selectedEmployee.Peers || this.selectedEmployee.Peers.length === 0 && !this.isPeerCompetencyMappingEdit) {
      this.notification.error('At least one peer must be selected');
      return;
    }

    await this.updatePeerCompetencyUIMapping();
    console.log('mapping ::: ', this.peerCompetencyUIMapping);
    this.selectedEmployee.Peers = [];
    this.selectedEmployeePeers = [];
    this.currentPeerCompetencyList = [];
    this.selectedPeersCompetencyList = [];
    this.PeersCompetencyMessage = "";
    var rowData: any = [];
    for (let mapping in this.peerCompetencyUIMapping) {
      console.log(mapping);
      rowData.push({
        peer: this.peerCompetencyUIMapping[mapping].peer,
        competencies: this.peerCompetencyUIMapping[mapping].competencies,
        message: this.peerCompetencyUIMapping[mapping].message
      });
    }
    console.log('rowData::::', rowData);
    this.peerCompetencyMappingRowdata = rowData;
    if (this.peersForEmpGridOptions.api) {
      this.peersForEmpGridOptions.api.setRowData(rowData);
    }
  }

  async addDRCompetencyMapping() {
    console.log('inside addDRCompetencyMapping ::: ');
    console.log('users ::: ', this.selectedEmployee.DirectReportees);
    console.log('competencies ::: ', this.seletedDirectReporteeCompetencyList);
    console.log('message ::: ', this.directReporteeCompetencyMessage);
    // this.currentEmployeeSelectedDirectReportees = [];
    // this.selectedEmployeeDirectReportees = []
    if (!this.selectedEmployee.DirectReportees || this.selectedEmployee.DirectReportees.length === 0) {
      this.notification.error('At least one direct reports must be selected');
      return;
    }
    if (this.seletedDirectReporteeCompetencyList.length === 0) {
      this.notification.error('Please select at least 1 Competency');
      return;
    }

    await this.updateDRCompetencyUIMapping();
    console.log('mapping ::: ', this.drCompetencyUIMapping);
    this.selectedEmployee.DirectReportees = [];
    this.selectedEmployeeDirectReportees = [];
    this.currentEmployeeSelectedDirectReportees = [];
    this.seletedDirectReporteeCompetencyList = [];
    this.directReporteeCompetencyMessage = "";
    var rowData: any = [];
    for (let mapping in this.drCompetencyUIMapping) {
      console.log(mapping);
      rowData.push({
        directReportee: this.drCompetencyUIMapping[mapping].directReportee,
        competencies: this.drCompetencyUIMapping[mapping].competencies,
        message: this.drCompetencyUIMapping[mapping].message
      });
    }
    console.log('dr rowData::::', rowData);
    this.drCompetencyMappingRowdata = rowData;
    if (this.directReporteesOfEmpGridOptions.api) {
      this.directReporteesOfEmpGridOptions.api.setRowData(rowData);
    }
  }

  onSelectAllPeers(items: any) {
    console.log('inside onSelectAllPeers :::', items);
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
    // if (this.peersForEmpGridOptions.api) {
    //   this.peersForEmpGridOptions.api.setRowData(this.selectedEmployee.Peers);
    // }
    console.log('onSelectAll peers done');
  }

  deletePeer() {
    console.log('inside deletePeer :::');

    // var _p = this.selectedEmployee.Peers.indexOf(this.currentPeer);
    // this.selectedEmployee.Peers.splice(_p, 1);
    // if (this.peersForEmpGridOptions.api) {
    //   this.peersForEmpGridOptions.api.setRowData(this.selectedEmployee.Peers);
    // }
    // this.selectedEmployeePeers = [...this.selectedEmployee.Peers]

    var _p = this.peerCompetencyMappingRowdata.indexOf(this.currentPeer);
    console.log('no of mapping before :::', this.peerCompetencyMappingRowdata.length);
    console.log('index to be deleted ::', _p);
    this.peerCompetencyMappingRowdata.splice(_p, 1);
    if (this.peersForEmpGridOptions.api) {
      this.peersForEmpGridOptions.api.setRowData(this.peerCompetencyMappingRowdata);
    }
    console.log('no of mapping  after :::', this.peerCompetencyMappingRowdata.length);
    // this.peerCompetencyMappingRowdata = [...this.peerCompetencyMappingRowdata]
  }

  onPeerDeSelect(item: any) {
    console.log('inside onPeerDeSelect:::', item, this.selectedEmployee.Peers, this.selectedEmployeePeers);
    var _position = this.selectedEmployee.Peers.findIndex(x => x.EmployeeId === item.EmployeeId);
    this.selectedEmployee.Peers.splice(_position, 1);
    this.selectedEmployeePeers.splice(_position, 1);
    console.log('after onPeerDeSelect:::', item, this.selectedEmployee.Peers, this.selectedEmployeePeers);
  }

  onDeSelectAllPeers(items: any) {
    console.log('inside onDeSelectAllPeers:::');
    this.selectedEmployee.Peers = [];
    this.selectedEmployeePeers = [];
  }

  closeCompetencyViewModel() {
    console.log('closeCompetencyViewModel :::');
    this.isViewCompetencies = false;
    this.selectedCompetencyViewRef.hide();
    this.competencyMappingRowdata = {};
  }

  closePeersModel() {
    console.log('closePeersModel :::');
    this.selectePeersViewRef.hide();
    this.selectedEmployee.Peers = [];
    this.selectedEmployeePeers = [];
    this.currentPeerCompetencyList = [];
    this.selectedPeersCompetencyList = [];
    this.PeersCompetencyMessage = "";
    this.peerCompetencyMappingRowdata = this.selectedEmployee['peerCompetenceMapping'];
    this.peerCompetencyUIMapping = {};
    for (let mapping of this.peerCompetencyMappingRowdata) {
      this.peerCompetencyUIMapping[mapping.peer.EmployeeId] = mapping;
    }
  }

  savePeers() {
    if (this.peerCompetencyMappingRowdata.length < 2) {
      this.notification.error('Please add at least two  peer competency mappings');
      return;
    }
    // if (this.selectedPeersCompetencyList.length === 0) {
    //   this.notification.error('Please select at least one  Competency');
    //   return;
    // }
    // if (!this.selectedEmployee.Peers || this.selectedEmployee.Peers.length < 2) {
    //   this.notification.error('At least two peers must be selected');
    //   return;
    // }
    // this.peerCompetencyUIMapping[key]
    this.selectedEmployee.Peers = [];
    for (let mapping of this.peerCompetencyMappingRowdata) {
      var mappingInOldFormat = {};
      mappingInOldFormat['EmployeeId'] = mapping.peer.EmployeeId;
      mappingInOldFormat['displayTemplate'] = mapping.peer.displayTemplate;
      mappingInOldFormat['PeersCompetencyMessage'] = mapping.message;
      mappingInOldFormat['PeersCompetencyList'] = mapping.competencies;
      mappingInOldFormat['peerCompetenceMapping'] = mapping;
      this.selectedEmployee.Peers.push(mappingInOldFormat);
    }
    this.selectedEmployee['peerCompetenceMapping'] = this.peerCompetencyMappingRowdata;

    // this.selectedEmployee.Peers.map(element => {
    //   element.PeersCompetencyMessage = this.PeersCompetencyMessage;
    //   element.PeersCompetencyList = this.selectedPeersCompetencyList;
    // });
    this.EmpGridOptions.api.setRowData(this.selectedEmployeeList)
    this.EmpGridOptions.api.refreshCells(this.gridRefreshParams)
    this.closePeersModel();
  }

  onSelectAllPeersCompetency(items) {
    this.selectedPeersCompetencyList = items;
  }

  onSelectPeersCompetency(item) {
    console.log('onSelectPeersCompetency :::', item);
    this.selectedPeersCompetencyList.push(item)
  }
  onPeerCompetencyDeSelect(item) {
    var _position = this.selectedPeersCompetencyList.indexOf(item);
    this.selectedPeersCompetencyList.splice(_position, 1);
  }
  onDeSelectAllPeerCompetencies(items) {
    this.selectedPeersCompetencyList = [];
  }

  onSelectAllDirectReporteeCompetency(items) {
    console.log("selected items::::", items);
    // this.seletedDirectReporteeCompetencyList.push(items);
  }

  onSelectDirectReporteeCompetency(item) {
    console.log("selected item::::", item, this.seletedDirectReporteeCompetencyList);
    // this.seletedDirectReporteeCompetencyList.push(item);
  }

  onDeSelectDirectReporteeCompetency(item) {
    console.log('inside onDeSelectDirectReporteeCompetency');
    var _position = this.seletedDirectReporteeCompetencyList.indexOf(item);
    this.seletedDirectReporteeCompetencyList.splice(_position, 1);

  }
  onDeSelectAllDirectReporteeCompetency(items) {
    console.log('inside onDeSelectAllDirectReporteeCompetency');
    this.seletedDirectReporteeCompetencyList = []
  }

  public directReporteesOfEmpGridOptions: GridOptions = {
    columnDefs: this.getDirectReporteeGridCols(),
    api: new GridApi()
  }


  public viewCompetencyGridOptions: GridOptions = {
    columnDefs: this.getCompetencyViewGridCols(),
    api: new GridApi()
  }

  getCompetencyViewGridCols() {
    return [
      {
        headerName: 'Competencies', width: 400, sortable: true, filter: true,
        cellRenderer: (data) => { console.log('----', data); return `<span >${data.data.Name}</span>` }
      }
    ];
  }

  public getDirectReportees(): void {
    this.perfApp.method = "GetDirectReporteesOfManager";
    this.perfApp.requestBody = { id: this.selectedEmployee._id };
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
      if (this.currentEmployeeDirectReportees.length > 0) {
        this.selecteDirectReporteeViewRef = this.modalService.show(this.selecteDirectReporteeView, this.config)
      } else {
        alert("No Data Found");
      }
    }, error => {
      console.log('error while adding eval', error)

    })

  }
  onDirectReporteeSelect(item) {
    console.log('onItemSelect', item);
    console.log("selected item::::", this.seletedDirectReporteeCompetencyList);
    if (!this.selectedEmployee.DirectReportees) {
      this.selectedEmployee.DirectReportees = [];
    }
    this.selectedEmployee.DirectReportees.push(item);
    this.selectedEmployeeDirectReportees = this.selectedEmployee.DirectReportees
    // if (this.directReporteesOfEmpGridOptions.api) {

    //   this.directReporteesOfEmpGridOptions.api.setRowData(this.selectedEmployee.DirectReportees)
    // }
  }
  onSelectAllDirectReportee(items: any) {
    //this.selectedEmployees = items;
    if (!this.selectedEmployee.DirectReportees) {
      this.selectedEmployee.DirectReportees = [];
    }
    this.selectedEmployee.DirectReportees = items;
    this.selectedEmployeeDirectReportees = this.selectedEmployee.DirectReportees
    console.log('onSelectAll', items);
    // if (this.directReporteesOfEmpGridOptions.api) {
    //   this.directReporteesOfEmpGridOptions.api.setRowData(this.selectedEmployee.DirectReportees)
    // }
  }

  onDirectReporteeDeSelect(item: any) {


    var _position = this.selectedEmployee.DirectReportees.findIndex(x => x.EmployeeId === item.EmployeeId);
    this.selectedEmployee.DirectReportees.splice(_position, 1);
    // this.directReporteesOfEmpGridOptions.api.setRowData(this.selectedEmployee.DirectReportees)
  }
  onDeSelectAllDirectReportee(items) {

    this.selectedEmployee.DirectReportees = []
    // this.directReporteesOfEmpGridOptions.api.setRowData([])

  }
  //#endregion

  constructor(private formBuilder: FormBuilder,
    private perfApp: PerfAppService,
    private notification: NotificationService,
    private modalService: BsModalService,
    public authService: AuthService,
    public router: Router,
    public activatedRoute: ActivatedRoute) {

  }

  currentEvaluationForm: any = {};
  selectedEmployeeList: any = [];
  dropdownSettings: any = {};
  competencyDropdownSettings: any = {}
  directReporteeDropdownSettings: any = {}
  public peerDropdownSettings: any = {};
  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
    this.activatedRoute.params.subscribe(params => {

      if (params['allKpi']) {
        this.allKpi = params['allKpi'];
        this.initializeFormFor = this.allKpi ? 'evaluation' : 'kpionly'
      }
      if (params["list"]) {
        this.kpiSelectedEmployees = params["list"].split(',')
      }
      this.initForm();
      this.getEmployees();
      this.getModels();
      if (params['rollEvaluationEdit'] && params['editEvaluation']) {
        this.rollEvaluationEdit = true;
        let evalationData = JSON.parse(params['editEvaluation']);
        let empId = evalationData.empId;
        let employeesList = evalationData.EvaluationRow.Employees;
        let employee = employeesList.find(empdata => empdata._id._id == empId);
        let { Model } = employee;
        this.evaluationForm.controls["Model"].setValue(Model._id);
        //let selectedModel = evalationData.EvaluationRow.Model;
        employee.EmployeeId = employee._id._id;
        employee.FirstName = employee._id.FirstName;
        employee.LastName = employee._id.LastName;
        employee.Email = employee._id.LastName;
        employee.Manager = employee._id.Manager;
        this.readonlyEmployee.name = `${employee._id.FirstName}-${employee._id.LastName}-${employee._id.Email}`;
        this.readonlyEmployee.evaluationId = evalationData.EvaluationRow._id;
        this.disabledAddButton = true;

        this.selectedEmployeeList.push(employee);

      }
    });


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




  initForm() {
    this.evaluationForm = this.formBuilder.group({
      Employees: [[], [Validators.required]],
      EvaluationPeriod: ['', []],
      EvaluationDuration: ['', []],
      Model: [null, [Validators.required]],
      PeerRatingNeeded: [false, [Validators.required]],
      ActivateKPI: [false, []],
      ActivateActionPlan: [false, []],
      KPIFor: ["Employee", []],
      CreatedBy: ['', []],
      Company: ['', []]
    });
    this.evaluationForm.controls["EvaluationPeriod"].setValue(this.currentOrganization.EvaluationPeriod);
    this.evaluationForm.controls["EvaluationDuration"].setValue(this.currentOrganization.EvaluationDuration);
  }
  get f() {
    return this.evaluationForm.controls;
  }
  formattedPeers: any = []
  getEmployees() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetUnlistedEmployees",
      //  this.perfApp.requestBody = { 'parentId': this.currentUser.ParentUser ? this.currentUser.ParentUser : this.currentUser._id }
      this.perfApp.requestBody = { company: this.currentOrganization._id, allKpi: this.allKpi }
    this.perfApp.CallAPI().subscribe(c => {
      console.log('employeed data', c);

      if (c && c.IsSuccess && c.Data && c.Data.length > 0) {
        if (this.kpiSelectedEmployees.length > 0) {
          var gi = []
          this.kpiSelectedEmployees.forEach(element => {
            gi.push(c.Data.find(x => x._id === element))

          });
          this.employeesList$ = [...gi]
          this.employeesList$.map(x => {

            var _f = Object.assign({}, x);
            this.selectedEmployees.push(_f);
            x.displayTemplate = `${x.FirstName}-${x.LastName}-${x.Email}`,
              x.row = _f;
          });
          this.selectedEmployeesForEvaluation = [...this.employeesList$]
        } else {
          this.employeesList$ = c.Data
          this.employeesList$.map(x => {

            var _f = Object.assign({}, x);

            x.displayTemplate = `${x.FirstName}-${x.LastName}-${x.Email}`,
              x.row = _f;
          });

        }



      } else {
        this.notification.error('You have reached maximum employees limit for evaluation. Please contact Admin')
      }
    })
  }

  getPeersForEmployees() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetPeers",
      //this.perfApp.requestBody = { 'parentId': this.currentUser.ParentUser ? this.currentUser.ParentUser : this.currentUser._id,'id':this.selectedEmployee._id }    
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

        this.peersList = c;
        console.log('formated peers data', this.formattedPeers);
      }
      this.selectePeersViewRef = this.modalService.show(this.selectePeersView, this.config);
    })
  }

  submitEvaluation() {

    if (this.rollEvaluationEdit) {

      let formdata = this.evaluationForm.value;
      formdata.EvaluationId = this.readonlyEmployee.evaluationId;
      let isConform = window.confirm("Once the evaluation is rolled-out, you will not be able to make changes to the Models until all the evaluations are completed. Are you sure you want to roll-out the evaluations?")
      if (isConform)
        this.submitValidEvaluation();
    } else {
      this.isFormSubmitted = true;

      if (this.evaluationForm.invalid)
        return;
      const _evform = this.evaluationForm.value;
      let isConform = window.confirm("Once the evaluation is rolled-out, you will not be able to make changes to the Models until all the evaluations are completed. Are you sure you want to roll-out the evaluations?")
      if (isConform)
        this.submitValidEvaluation();

    }

  }
  submitValidEvaluation() {
    this.evaluationForm.value.CreatedBy = this.currentUser._id;
    this.evaluationForm.value.Company = this.currentOrganization._id;

    // this.setEmployeeIds();
    //this.setModelIds();
    this.evaluationForm.value.Employees = this.selectedEmployeeList;
    console.log('evaluation form', this.evaluationForm.value);
    this.perfApp.method = "CreateEvaluation";
    this.perfApp.requestBody = this.evaluationForm.value;
    this.perfApp.route = "evaluation"
    this.perfApp.CallAPI().subscribe(x => {
      console.log('added evaluation', x);
      if (this.rollEvaluationEdit) {
        this.notification.success('Evaluation Updated Successfully.')
      } else {
        this.notification.success(`The Evaluations Setting have been
          successfully setup to be rolled out on ${new DatePipe('en-US').transform(new Date(), 'MM-dd-yyyy, h:mm a')}.`)
      }

      this.router.navigate(['ea/evaluation-list'])
    }, error => {

      console.log('error while adding eval', error)
      this.notification.error(error.error.message)
    });
  }
  reset() {
    this.evaluationForm.reset();
    this.isFormSubmitted = false;
  }
  getModels() {
    this.perfApp.route = "shared";
    this.perfApp.method = "GetModelsByIndustry",
      this.perfApp.requestBody = { id: this.currentOrganization.Industry }; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
      this.modelsList = c;
    }, error => {

      console.log('models error ', error)
      this.notification.error(error.error.message)
    });
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

      var clonedArray2 = c.map((_arrayElement) => Object.assign({}, _arrayElement));
      this.peersCompetencyList = clonedArray2;
      if (this.rollEvaluationEdit) {
        this.disabledAddButton = true;
      } else {
        this.disabledAddButton = false;
      }
    }, error => {

      console.log('competencyList error ', error)
      this.notification.error(error.error.message)
    });
  }

  onChangeKPIFor(value) {
    this.enableKPIFor = value.target.checked;
    if (value.target.value) {
      this.evaluationForm.controls['KPIFor'].setValidators(Validators.required);
    } else {
      this.evaluationForm.controls['KPIFor'].clearValidators();
      this.evaluationForm.controls['KPIFor'].reset();
      this.evaluationForm.controls['KPIFor'].setValue(null);
    }
  }

  draftEvaluation() {

    if (this.evaluationForm.value.Employees.length === 0) {
      this.notification.error('To save as Draft at least one department and Emloyeed need to select')
      return;
    }
    this.evaluationForm.value.CreatedBy = this.currentUser._id;
    this.evaluationForm.value.Company = this.currentOrganization._id;
    //this.setEmployeeIds();
    //this.setModelIds();
    this.evaluationForm.value.IsDraft = true;
    console.log('evaluation form', this.evaluationForm.value);
    this.perfApp.method = "DraftEvaluation";
    this.perfApp.requestBody = this.evaluationForm.value;
    this.perfApp.route = "evaluation"
    this.perfApp.CallAPI().subscribe(x => {

      console.log('draft evaluation', x)
      this.notification.success('Evaluation Form Saved Successfully.')
      this.router.navigate(['ea/evaluation-list'])
    }, error => {

      console.log('error while saving form', error)
      this.notification.error(error.error.message)
    })

  }




  /**Code refactoring starts from here */
  /**For Grid */
  public onEmpRowClicked(e) {

    if (e.event.target !== undefined) {
      this.selectedEmployee = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        // case "deleteEmp":
        //   return this.toggleSelection(this.selectedEmployee);
        case "chooseDirectReports":
          return this.selectDirectReportees();
        case "choosePeers":
          return this.openPeersView();
        case "deleteEmp":
          return this.deleteEmpFromList();
      }
    }
  }
  public deleteEmpFromList() {

    var _index = this.selectedEmployees.indexOf(this.selectedEmployee);
    this.selectedEmployees.splice(_index, 1);
    _index = this.selectedEmployeeList.indexOf(this.selectedEmployee);

    this.selectedEmployeesForEvaluation.splice(_index, 1);
    this.selectedEmployeesForEvaluation = [...this.selectedEmployeesForEvaluation]
    this.selectedEmployeeList.splice(_index, 1);
    this.EmpGridOptions.api.setRowData(this.selectedEmployeeList);

  }
  public EmpGridOptions: GridOptions = {
    columnDefs: this.getGridColumnsForEmp(),
    api: new GridApi()
  }


  //#region Peers Code Blocak

  currentPeer: any;
  PeersCompetencyList = [];
  PeersCompetencyMessage = "";



  //  currentEmployeePeers: any = [];
  currentEmployeeSelectedPeers: any = [];
  currentPeersList = []

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
        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.data.peer.displayTemplate}</span>` }
      },
      {
        headerName: 'Competencies', field: '', sortable: false, filter: false,
        cellRenderer: (data) => {
          var _count = data.data.competencies ? data.data.competencies.length : 0
          return `<span>${_count}</span>`
        }
      },
      {
        headerName: "Actions",
        suppressMenu: true,
        Sorting: false,
        cellRenderer: (data) => {
          console.log('column data', data)
          return `<i class="icon-ban" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="deletePeer" title="Delete Peer"></i> 
          <i class="icon-eye" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="viewPeerCompetencyMapping" title="Delete Peer"></i> 
         `
        }
      }
    ];

  }
  public currentPeerCompetencyList: any = [];
  openPeersView() {
    console.log('openPeersView :::');
    // if (this.selectedEmployee.Peers) {
    //   this.PeersCompetencyMessage = this.selectedEmployee.Peers[0].PeersCompetencyMessage;
    //   this.selectedEmployeePeers = this.selectedEmployee.Peers || [];
    //   this.currentPeerCompetencyList = this.selectedEmployee.Peers[0].PeersCompetencyList;
    // }
    if (this.selectedEmployee.peerCompetenceMapping) {
      this.peerCompetencyMappingRowdata = [];
      this.selectedEmployee.Peers = [];
      this.PeersCompetencyMessage = "";
      this.selectedEmployeePeers = [];
      this.currentPeerCompetencyList = [];
      this.peerCompetencyMappingRowdata = this.selectedEmployee.peerCompetenceMapping;
    }

    this.getPeersForEmployees();

  }
  public onPeersRowClicked(e) {
    console.log('onPeersRowClicked :::');
    if (e.event.target !== undefined) {
      this.currentPeer = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "deletePeer":
          return this.deletePeer();
        case "viewPeerCompetencyMapping":
          return this.viewPeerCompetencyMapping();
      }
    }
  }

  //#endregion

  //#region Direct Reportee Section


  currentEmployeeDirectReportees: any = [];
  currentEmployeeSelectedDirectReportees: any = [];
  currentDirectReportee: any;
  directReporteeCompetencyMessage: string = "";



  getGridColumnsForEmp() {
    return [
      {
        headerName: 'Employee', sortable: true, filter: true,
        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.data.FirstName}-${data.data.LastName}</span>` }
      },
      {
        headerName: 'Model', width: 150, field: '', sortable: true, filter: true,
        cellRenderer: (data) => {
          console.log('data for grid', data);
          if (this.initializeFormFor === 'kpionly') {
            return '';
          } else {
            return `${data.data.Model.Name}`
          }
        },
      },
      {
        headerName: 'Manager', width: 150, field: '', sortable: true, filter: true,
        cellRenderer: (data) => {
          var _name = data.data.Manager ? data.data.Manager.FirstName : ""
          return `${_name}`
        },
      },

      {
        headerName: 'Peers', width: 150, field: '', sortable: false, filter: false,
        cellRenderer: (data) => {
          if (this.initializeFormFor === 'kpionly') {
            return '';
          } else {
            var _count = data.data.Peers ? data.data.Peers.length : 0
            return `<span style="color:blue;cursor:pointer" data-action-type="choosePeers">${_count}</span>`
          }

        }
      },
      {
        headerName: 'Direct Report(s)', field: '', sortable: false, filter: false,
        cellRenderer: (data) => {
          if (this.initializeFormFor === 'kpionly') {
            return '';
          } else {
            var _count = data.data.DirectReportees ? data.data.DirectReportees.length : 0
            return `<span style="color:blue;cursor:pointer" data-action-type="chooseDirectReports">${_count}</span>`
          }
        }
      },
      {
        headerName: "Actions",
        width: 120,
        suppressMenu: true,
        Sorting: false,
        cellRenderer: (data) => {
          console.log('column data', data)

          return `<i class="icon-ban" style="cursor:pointer ;padding: 7px 20px 0 0;
            font-size: 17px;"   data-action-type="deleteEmp" title="Delete Employee"></i>
            `

        }
      }
    ];


  }

  selectDirectReportees() {
    console.log("inside selectDirectReportees::::::::::");
    this.directReporteeCompetencyMessage = "";
    this.selectedEmployeeDirectReportees = [];
    this.selectedEmployee.DirectReportees = [];
    this.currentEmployeeSelectedDirectReportees = [];
    this.seletedDirectReporteeCompetencyList = [];
    this.directReporteeCompetencyMessage = "";
    // this.seletedDirectReporteeCompetencyList = this.selectedEmployee.DirectReportsCompetency;
    if (this.selectedEmployeeDirectReportees.length > 0 && this.directReporteesOfEmpGridOptions.api) {
      this.directReporteesOfEmpGridOptions.api.setRowData(this.selectedEmployeeDirectReportees);
    }
    this.getDirectReportees();
  }

  closeDrModel() {
    this.selecteDirectReporteeViewRef.hide();
    this.selectedEmployeeDirectReportees = [];
    this.selectedEmployee.DirectReportees = [];
    this.currentEmployeeSelectedDirectReportees = [];
    this.seletedDirectReporteeCompetencyList = [];
    this.directReporteeCompetencyMessage = "";
  }

  getDirectReporteeGridCols() {
    return [
      {
        headerName: 'Direct Report(s)', sortable: true, filter: true,
        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.data.directReportee.displayTemplate}</span>` }
      },
      {
        headerName: 'Competencies', field: '', sortable: false, filter: false,
        cellRenderer: (data) => {
          var _count = data.data.competencies ? data.data.competencies.length : 0
          return `<span>${_count}</span>`
        }
      },
      {
        headerName: "Actions",
        suppressMenu: true,
        Sorting: false,
        cellRenderer: (data) => {
          console.log('column data', data)
          return `<i class="icon-ban" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="deleteDirectReportee" title="Delete Reportee"></i> 
          <i class="icon-eye" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="viewDrCompetencyMapping" title="Delete Peer"></i>           
         `
          //}
        }
      }
    ];
    // return [
    //   {
    //     headerName: 'Direct Report(s)', sortable: true, filter: true,
    //     cellRenderer: (data) => {
    //       return `<span style="color:blue;cursor:pointer" data-action-type="">
    //     ${data.data.displayTemplate}</span>`
    //     }
    //   },

    //   {
    //     headerName: "Actions",
    //     suppressMenu: true,
    //     Sorting: false,
    //     cellRenderer: (data) => {
    //       console.log('column data', data)
    //       return `<i class="icon-ban" style="cursor:pointer ;padding: 7px 20px 0 0;
    //       font-size: 17px;"   data-action-type="deleteDirectReportee" title="Delete Reportee"></i>
    //       <i class="icon-ban" style="cursor:pointer ;padding: 7px 20px 0 0;
    //       font-size: 17px;"   data-action-type="editDirectReportee" title="Edit Reportee"></i> `
    //       //}
    //     }
    //   }
    // ];

  }

  onViewCompetencyGridReady(params) {

    this.viewCompetencyGridOptions.api = params.api;
  }

  onDirectReporteeGridReady(params) {

    this.directReporteesOfEmpGridOptions.api = params.api;
  }
  public onDirectReporteeGridRowClicked(e) {

    if (e.event.target !== undefined) {
      this.currentDirectReportee = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "deleteDirectReportee":
          return this.deleteDirectReportee();
        case "viewDrCompetencyMapping":
          return this.viewDrCompetencyMapping();
      }
    }
  }

  deleteDirectReportee() {
    var _p = this.drCompetencyMappingRowdata.indexOf(this.currentDirectReportee);
    this.drCompetencyMappingRowdata.splice(_p, 1);
    delete this.updateDRCompetencyUIMapping[this.currentDirectReportee.EmployeeId];
    this.directReporteesOfEmpGridOptions.api.setRowData(this.drCompetencyMappingRowdata);
  }

  saveDirectReportees() {
    if (this.drCompetencyMappingRowdata.length < 2) {
      this.notification.error('At least two direct reports must be selected');
      return;
    }
    this.selectedEmployee.DirectReportees = [];
    for (let mapping of this.drCompetencyMappingRowdata) {
      var mappingInOldFormat = {};
      mappingInOldFormat['EmployeeId'] = mapping.directReportee.EmployeeId;
      mappingInOldFormat['displayTemplate'] = mapping.directReportee.displayTemplate;
      mappingInOldFormat['DirectReporteeComptencyMessage'] = mapping.message;
      mappingInOldFormat['DirectReporteeCompetencyList'] = mapping.competencies;
      mappingInOldFormat['drCompetenceMapping'] = mapping;
      this.selectedEmployee.DirectReportees.push(mappingInOldFormat);
    }
    this.selectedEmployee['drCompetenceMapping'] = this.drCompetencyMappingRowdata;
    // this.selectedEmployee.DirectReporteeComptencyMessage = this.directReporteeCompetencyMessage;
    // this.selectedEmployee.DirectReportsCompetency = this.seletedDirectReporteeCompetencyList;
    // this.selectedEmployee.DirectReportees.map(element => {
    //   element.DirectReporteeComptencyMessage = this.directReporteeCompetencyMessage;
    //   element.DirectReporteeCompetencyList = this.directReporteeCompetencyList;
    // });
    this.EmpGridOptions.api.refreshCells(this.gridRefreshParams)
    this.closeDrModel();
  }



  addToGrid() {
    if (this.selectedEmployees.length === 0) {
      this.notification.error('At least one employee must be selected.')
      return;
    }
    if (this.initializeFormFor === 'evaluation' && (this.evaluationForm.value.Model === null || this.evaluationForm.value.Model === '')) {
      this.notification.error('Please select Model')
      return;
    }
    this.selectedEmployees.map(x => {

      x.Model = this.modelsList.find(x => x._id === this.selectedModel);
    })
    this.selectedEmployees.forEach(element => {
      if (this.selectedEmployeeList.indexOf(element) < 0) {
        this.selectedEmployeeList.push(element);
      }
    });
    if (this.EmpGridOptions.api) {
      this.EmpGridOptions.api.setRowData(this.selectedEmployeeList);
    }
    this.selectedEmployees = [];
    this.disabledAddButton = true;

  }

  addToGridForKPI() {

    if (this.selectedEmployees.length === 0) {
      this.notification.error('At least one employee must be selected.')
      return;
    }

    this.selectedEmployees.map(x => {
      x.Model = null;
    })
    this.selectedEmployees.forEach(element => {
      if (this.selectedEmployeeList.indexOf(element) < 0) {
        this.selectedEmployeeList.push(element);
      }
    });
    //this.selectedEmployeeList.push(...this.selectedEmployees);
    if (this.EmpGridOptions.api) {
      this.EmpGridOptions.api.setRowData(this.selectedEmployeeList);
    }
    this.selectedEmployees = [];
    this.disabledAddButton = true;
  }
  /**Bookmark1 */


  changeFormFor(value) {
    this.initializeFormFor = value;
    this.selectedEmployeeList = [];
    this.selectedEmployeesForEvaluation = [];
    this.EmpGridOptions.api.setRowData(this.selectedEmployeeList);
  }
  saveKpiForm() {
    let list = this.evaluationForm.value.Employees;
    var body: any;
    if (list && list.length > 0) {
      body = list.map(x => { return { EmployeeId: x.row._id, Company: this.currentOrganization._id } })

    }

    this.perfApp.method = "ReleaseKpiForm";
    this.perfApp.requestBody = body;
    this.perfApp.route = "evaluation"
    this.perfApp.CallAPI().subscribe(x => {
      console.log('added evaluation', x)
      this.notification.success(`The Performance Goals Setting have been
       successfully setup to be rolled out on ${new DatePipe('en-US').transform(new Date(), 'MM-dd-yyyy, h:mm a')}.`)
      this.router.navigate(['ea/evaluation-list'])
    }, error => {
      console.log('error while adding eval', error)
      this.notification.error(error.error.message)
    })


  }


  getEVPeriod() {
    return ReportTemplates.getEvaluationPeriod(this.currentOrganization.StartMonth, this.currentOrganization.EndMonth);
    // let ev = this.currentOrganization.EvaluationPeriod;

    // if(ev="FiscalYear") ev = "Fiscal Year"
    // if (ev="CalendarYear") ev = "Calendar Year"
    // let year= new Date (this.currentOrganization.CreatedOn);
    // if (this.currentOrganization.EvaluationPeriod === 'FiscalYear') {
    // return `${ev} - ${this.monthList[ this.currentOrganization.StartMonth] } to ${this.currentOrganization.EndMonth}`
    // }else{
    //   return `${ev} - ${this.monthList[ this.currentOrganization.StartMonth] } to ${this.currentOrganization.EndMonth}`

    // }
  }
}
