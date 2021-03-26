
import { DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GridApi, GridOptions, _ } from 'ag-grid-community';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from '../../../services/auth.service';
import * as moment from 'moment';
import { NotificationService } from '../../../services/notification.service';
import { PerfAppService } from '../../../services/perf-app.service';
import ReportTemplates from '../../../views/psa/reports/data/reports-templates';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AlertDialog } from '../../../Models/AlertDialog';


import { ThemeService } from '../../../services/theme.service';

import { TranslateService } from '@ngx-translate/core';
import { CustomValidators } from '../../../shared/custom-validators';

import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

import { Constants } from '../../../shared/AppConstants';

@Component({
  selector: 'app-rollevaluation',
  templateUrl: './rollevaluation.component.html',
  styleUrls: ['./rollevaluation.component.css']
})
export class RollevaluationComponent implements OnInit {
  
  public empForm: FormGroup;
  empDetails: any={IsActive:'true'}
  currentAction='create';
  cscData:any=undefined;
  departments=[];
  jobRoles=[];
  appRoles: any=[];
  jobLevels: any;
  loginUser: any;
  countyFormReset: boolean;
  isRoleChanged: boolean;

  isDraftEmployee: boolean;
  
  filteredOptions: Observable<any[]>;
  filteredOptionsTS: Observable<any[]>;
  filteredOptionsDR: Observable<any[]>;
public currentOrganization:any={}
  submitClicked=false;
  show=false;
  public evaluationForm: FormGroup;
  public contactPersonForm: FormGroup;
  public isFormSubmitted = false;
  public alert: AlertDialog;
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

  // public currentOrganization: any;
  currentUser: any;
  isViewCompetencies: boolean = false;

  public monthList = ["", "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"]
  // kpiForList: string[] = ['Employee', 'Manager'];
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
  availableEvaluations: any = [];

  purposeDurationMap: Map<string, Map<string, number>>;
  pgsMap: Map<string, Map<string, number>>;
  existingPgs: any;
  existingEvals: any;
  evaluationsMap: Map<string, Map<string, number>>;
  isSingleEvaluationType: boolean = true;
  isSingleDurationType: boolean = true;
  evaluationType: string;
  durationOptionSelected: string;
  evaluationsRolledOut: number = 0;
  evaluationsAvailable: number = 0;
  evaluationTypes: Array<string> = [];
  evaluationDurationOptions: Array<string> = [];
  gridRefreshParams = {
    force: true,
    suppressFlash: false
  };
  peersListData=[];
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
    if (items.length > this.getEvaluationsAvailable()) {
      this.notification.error(`No more evaluations for this type are available to be rolled-out.`);
      return;
    }
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
    //debugger
    // console.log('onPeer Select', item);
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
        // console.log("after filter ::::", d);
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
    if (this.peerCompetencyMappingRowdata) {
      for (let mapping of this.peerCompetencyMappingRowdata) {
        this.peerCompetencyUIMapping[mapping.peer.EmployeeId] = mapping;
      }
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
    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to add peers for review?"
    this.alert.ShowConfirmButton = true;
    this.alert.ShowCancelButton = true;
    this.alert.CancelButtonText = "Cancel";
    this.alert.ConfirmButtonText = "Continue";


    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = this.alert;
    dialogConfig.height = "300px";
    dialogConfig.maxWidth = '40%';
    dialogConfig.minWidth = '40%';


    var dialogRef = this.dialog.open(AlertComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(resp => {
      if (resp == 'yes') {
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
      } else {

      }
    })

    
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
      // if (this.currentEmployeeDirectReportees.length > 0) {
      this.selecteDirectReporteeViewRef = this.modalService.show(this.selecteDirectReporteeView, this.config)
      // } else {
      //   alert("No Data Found");
      // }
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
    public dialog: MatDialog,
    private modalService: BsModalService,
    public authService: AuthService,
    public router: Router,
    public activatedRoute: ActivatedRoute,private fb: FormBuilder,
    
    private route: ActivatedRoute,
  
    public themeService: ThemeService,
    
    private snack: NotificationService,
    public translate: TranslateService) {

  }
  employeesList$Memory: any[] = [];
  pgSubmittedEmployeesList: any[] = [];
  currentEvaluationForm: any = {};
  selectedEmployeeList: any = [];
  dropdownSettings: any = {};
  competencyDropdownSettings: any = {}
  directReporteeDropdownSettings: any = {}
  public peerDropdownSettings: any = {};

  get f(){
    return this.empForm.controls;
  }
  get f1() {
    return this.evaluationForm.controls;
  }
  ngOnInit(): void {
    this.alert=new AlertDialog()
    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
    this.GetAvailableOrgEvaluations();
    this.activatedRoute.params.subscribe(params => {

      if (params['allKpi']) {
        this.allKpi = params['allKpi'];
        this.initializeFormFor = this.allKpi ? 'evaluation' : 'kpionly'
      }
      if (params["list"]) {
        this.kpiSelectedEmployees = params["list"].split(',')
      }
      this.initForm();
      this.getEvaluationList();
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

    this.currentOrganization = this.authService.getOrganization();
    this.loginUser=this.authService.getCurrentUser();
    this.getEmployees();
    this.getManagersEmps();
    this.getThirdSignatoryEmps();
   this.getAllDepartments();

   this.initEmpForm()

   this.alert = new AlertDialog();
  }


  initEmpForm() {
    this.empForm = this.fb.group({
      Email: [this.empDetails.Email?this.empDetails.Email:'', [Validators.required, Validators.email]],
      LastName: [this.empDetails.LastName?this.empDetails.LastName:'', Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
        Validators.minLength(1)])
      ],
      MiddleName: [this.empDetails.MiddleName?this.empDetails.MiddleName:'', Validators.compose([
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
      ])
      ],
      EmployeeId: [this.empDetails.EmployeeId?this.empDetails.EmployeeId:'', Validators.compose([
        CustomValidators.patternValidator(/(?=.*[()#-])/, { hasEmpIdSplChars: true }, 'hasEmpIdSplChars')
      
      ])
      ],
      FirstName: [this.empDetails.FirstName?this.empDetails.FirstName:'', Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),

        Validators.minLength(2)])
      ],

      Title: [this.empDetails.Title?this.empDetails.Title:'', Validators.compose([
        Validators.required,
        Validators.minLength(2)])
      ],


      Address: [this.empDetails.Address?this.empDetails.Address:'Not Applicable', Validators.compose([
        Validators.required, Validators.minLength(4),
        CustomValidators.patternValidator(/(?=.*[#)&.(-:/])/, { hasAddressSplChars: true }, 'hasAddressSplChars'),
      ])
      ],

      PhoneNumber: [this.empDetails.PhoneNumber?this.empDetails.PhoneNumber:'Not Applicable', Validators.compose([
         Validators.minLength(10),
        // CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      ExtNumber: [this.empDetails.ExtNumber?this.empDetails.ExtNumber:'Not Applicable', Validators.compose([
        Validators.minLength(2),
      // CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      AltPhoneNumber: [this.empDetails.AltPhoneNumber?this.empDetails.AltPhoneNumber:'Not Applicable', Validators.compose([
        Validators.minLength(10),
      //  CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      MobileNumber: [this.empDetails.MobileNumber?this.empDetails.MobileNumber:'Not Applicable', Validators.compose([
        Validators.minLength(10),
       // CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      IsActive: [this.empDetails.IsActive+'',[Validators.required] ],
      IsSubmit: ['false'],
      IsDraft: ['false'],
      JobLevel: [this.empDetails.JobLevel?this.empDetails.JobLevel:null,[Validators.required] ],
      JobRole: [this.empDetails.JobRole?this.empDetails.JobRole:'',[Validators.required] ],
      Department: [this.empDetails.Department?this.empDetails.Department:'',[Validators.required] ],
      ApplicationRole: [this.empDetails.ApplicationRole?this.empDetails.ApplicationRole:null,[Validators.required] ],
      ThirdSignatory: [this.empDetails.ThirdSignatory?this.empDetails.ThirdSignatory:'',],
      CopiesTo: [this.empDetails.CopiesTo?this.empDetails.CopiesTo:'', ],
      Manager: [this.empDetails.Manager?this.empDetails.Manager:'',[Validators.required]],
      Country: [this.empDetails.Country?this.empDetails.Country:'Not Applicable',],
      State: [this.empDetails.State?this.empDetails.State:'Not Applicable',],
      City: [this.empDetails.City?this.empDetails.City:'Not Applicable',],
      JoiningDate: [this.empDetails.JoiningDate?new Date (this.empDetails.JoiningDate):'',[Validators.required]],
      RoleEffFrom: [''],
      ZipCode: [this.empDetails.ZipCode?this.empDetails.ZipCode:'Not Applicable', Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/[^A-Za-z0-9\s]+/g, { isInValidZip: true }, 'isInValidZip'),
        Validators.minLength(5)
      ])
      ],


    });
  }
  saveCreateEmployee(){
    
    if(this.empForm.get('FirstName').value=="" || this.empForm.get('Email').value==""){
    if(this.empForm.get('FirstName').value=="" && this.empForm.get('Email').value==""){

      this.snack.error(this.translate.instant('First Name, Email is mandatory'));
      return
    }
    if(this.empForm.get('FirstName').value==""){
      this.snack.error(this.translate.instant('First Name is mandatory'));
      return
    }
    if(this.empForm.get('Email').value==""){
      this.snack.error(this.translate.instant('Email is mandatory'));
      return
    }
    
  }

    this.empForm.patchValue({ IsDraft: 'true' });
    this.isDraftEmployee = true;
    this.saveEmployee();

    //this.alert.Title = "Alert";
    //this.alert.Content = "Are you sure you want to add this employee?"
    //this.alert.ShowCancelButton = true;
    //this.alert.ShowConfirmButton = true;
    //this.alert.CancelButtonText = "Cancel";
    //this.alert.ConfirmButtonText = "Ok";

    //const dialogConfig = new MatDialogConfig()
    //dialogConfig.disableClose = true;
    //dialogConfig.autoFocus = true;
    //dialogConfig.data = this.alert;
    //dialogConfig.height = "300px";
    //dialogConfig.maxWidth = '100%';
    //dialogConfig.minWidth = '40%';

    //var dialogRef = this.dialog.open(AlertComponent, dialogConfig);
    //dialogRef.afterClosed().subscribe(resp => {
    //  if (resp=='yes') {
    //    this.saveEmployee();
    //  }
    //  else{

    //  }
    //})

  }

  

  submitCreateEmployee(){
this.submitClicked=true;
    if (!this.empForm.valid) {
        return;    
      }else{
        if (!this.empForm.get('PhoneNumber').value &&  !this.empForm.get('AltPhoneNumber').value
         && !this.empForm.get('MobileNumber').value) {
          this.snack.error(this.translate.instant('Please provide at least one contact (PhoneNumber, AltPhoneNumber, MobileNumber )'));
          return;    
        }
      }
  
    this.empForm.patchValue({IsSubmit: 'true' });
    this.empForm.patchValue({ IsDraft: 'false' });
    this.isDraftEmployee = false;
    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to add this employee?"
    this.alert.ShowCancelButton = true;
    this.alert.ShowConfirmButton = true;
    this.alert.CancelButtonText = "Cancel";
    this.alert.ConfirmButtonText = "Continue";

    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = this.alert;
    dialogConfig.height = "300px";
    dialogConfig.maxWidth = '100%';
    dialogConfig.minWidth = '40%';

    var dialogRef = this.dialog.open(AlertComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(resp => {
      if (resp=='yes') {
        this.saveEmployee();
      }
      else{

      }
    })
  }
  
  
  saveEmployee(){
    this.perfApp.route="app";
    this.perfApp.method= this.currentAction=='create'?"CreateEmployee":"UpdateEmployee",
    
    // this.empForm.patchValue({ThirdSignatory: this.empForm.get('ThirdSignatory').value?
    //   this.empForm.get('ThirdSignatory').value._id : ''});
    //   this.empForm.patchValue({CopiesTo: this.empForm.get('CopiesTo').value?
    //   this.empForm.get('CopiesTo').value._id : ''});
    //   this.empForm.patchValue({Manager: this.empForm.get('Manager').value?
    //   this.empForm.get('Manager').value._id : ''});
  
   
    
    this.perfApp.requestBody=this.empForm.value; //fill body object with form 
    
    // if (this.currentAction=='edit') {
    //   this.perfApp.requestBody._id=this.currentRowItem._id; 
    //   this.perfApp.requestBody.UpdatedBy=this.loginUser._id;
    // }else{


      if(this.perfApp.requestBody.ThirdSignatory)  this.perfApp.requestBody.ThirdSignatory = this.perfApp.requestBody.ThirdSignatory._id;
      if(this.perfApp.requestBody.CopiesTo)  this.perfApp.requestBody.CopiesTo=this.perfApp.requestBody.CopiesTo._id;
      if(this.perfApp.requestBody.Manager)  this.perfApp.requestBody.Manager=this.perfApp.requestBody.Manager._id;

      this.perfApp.requestBody.CreatedBy=this.loginUser._id;
      this.perfApp.requestBody.Organization=this.currentOrganization?this.currentOrganization._id:null ;
      this.perfApp.requestBody.UpdatedBy=this.loginUser._id;
      this.perfApp.requestBody.ParentUser=this.loginUser.ParentUser?this.loginUser.ParentUser:this.loginUser._id;
      this.perfApp.requestBody.IgnoreEvalAdminCreated=false;
     // let roleCode= this.appRoles.filter(e=>e._id==this.perfApp.requestBody.ApplicationRole[0])[0];
      let selectedRoles= [];
     if( this.perfApp.requestBody.ApplicationRole){
      this.perfApp.requestBody.ApplicationRole.forEach(element => {
            this.appRoles.filter(e=>
          {if (e._id==element)  selectedRoles.push( e.RoleCode)} )
            
      });
    }
      this.perfApp.requestBody.Role='EO';
      this.perfApp.requestBody.SelectedRoles=selectedRoles;
      this.perfApp.requestBody.RoleEffFrom= this.perfApp.requestBody.JoiningDate;
    // }
    
    this.callEmpApi();
   
  }
  
  callEmpApi(){
  
  if(!this.perfApp.requestBody.ThirdSignatory) delete this.perfApp.requestBody.ThirdSignatory;
  if(!this.perfApp.requestBody.CopiesTo) delete this.perfApp.requestBody.CopiesTo;
  if(!this.perfApp.requestBody.Manager) delete this.perfApp.requestBody.Manager;
  
    this.perfApp.CallAPI().subscribe(c=>{
  
      if (c.message == Constants.SuccessText) {
        this.submitClicked = false;

        if (this.isDraftEmployee) {
          this.snack.success(this.translate.instant(`The employee has been successfully saved.`));
      } else {
          this.snack.success(this.translate.instant(`
          The employee has been successfully ${this.currentAction == 'create' ? 'added' : 'updated'}.`));
      }
      this.listData();
        // this.getEmployees();
        // this.closeForm();
        // this.showSpinner = false;
        this.empForm.reset();
        this.onCancle();
     this.getEmployees();
       // this.router.navigate(['ea/setup-employee']);


      }
          
        }, error => {
          if (error.error.message === Constants.EvaluationAdminNotFound) {
            this.openEvaluationAdminNotFoundDialog()
          }else{
            this.snack.error(this.translate.instant(`Employee not ${this.currentAction == 'create' ? 'added' : 'updated'}, please try again`));
      
          } 
      
      
        });  
  
  }
  
  
   /**To alert user for duplicate sessions */
   openEvaluationAdminNotFoundDialog() {
    this.alert.Title = "Alert";
    this.alert.Content = "We found that Evaluation Administrator not created. Do you want to continue ?";
    this.alert.ShowCancelButton = true;
    this.alert.ShowConfirmButton = true;
    this.alert.CancelButtonText = "Cancel";
    this.alert.ConfirmButtonText = "Continue";
  
  
    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = this.alert;
    dialogConfig.height = "300px";
    dialogConfig.maxWidth = '40%';
    dialogConfig.minWidth = '40%';
  
  
    var dialogRef = this.dialog.open(AlertComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(resp => {
     if (resp=='yes') {
      this.perfApp.requestBody.IgnoreEvalAdminCreated=true;
      this.callEmpApi();
     } else {
       
     }
    })
  }






  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }
  
  
  displayFn(user: any): string {
    return user && user.FirstName ? user.FirstName : '';
  }
  
  private _filter(name: string): any[] {
    const filterValue = this._normalizeValue(name);
  
    return this.employeeDropDownData.filter(option => this._normalizeValue(option.FirstName).includes(filterValue) );
  }
  
  private _filterDR(name: string): any[] {
    const filterValue = this._normalizeValue(name);
  
    return this.employeeDirReportData.filter(option => this._normalizeValue(option.FirstName).includes(filterValue) );
  } 
  private _filterTD(name: string): any[] {
    const filterValue = this._normalizeValue(name);
  
    return this.employeeThirdSigData.filter(option => this._normalizeValue(option.FirstName).includes(filterValue) );
  }
  
  
  
  onCSCSelect(data){
  this.empForm.patchValue({City:data.City.name});
  this.empForm.patchValue({Country:data.Country.name});
  this.empForm.patchValue({State:data.State.name});
  var add=""
   add= `${data.City.name?data.City.name+",":""}
   ${data.State.name?data.State.name+",":""}
    ${data.Country.name?data.Country.name:""}
   `
  //  if(data.City.name)
  
  }

  public employeeData :any
  public employeeDropDownData :any[]=[]
  public employeeThirdSigData :any[]=[]
  public employeeDirReportData :any[]=[]
  getManagersEmps(){
    this.perfApp.route="app";
    this.perfApp.method="GetManagers",
    this.perfApp.requestBody = { companyId: this.currentOrganization._id }
    // this.perfApp.requestBody={'parentId':this.loginUser.ParentUser?this.loginUser.ParentUser:this.loginUser._id}
    this.perfApp.CallAPI().subscribe(c=>{
      
      console.log('lients data',c);
      if(c && c.length>0){
        
        this.employeeDirReportData=c;
        this.filteredOptionsDR = this.empForm.controls['Manager'].valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value :  value? value.FirstName:""),
          map(name => name ? this._filterDR(name) : this.employeeDirReportData.slice())
        );
      }
     
       
    })

  }



  getThirdSignatoryEmps(){
    this.perfApp.route="app";
    this.perfApp.method="GetThirdSignatorys",
    this.perfApp.requestBody = { companyId: this.currentOrganization._id }

    this.perfApp.CallAPI().subscribe(c=>{
      
      console.log('lients data',c);
      if(c && c.length>0){


        this.employeeThirdSigData=c;
       
      
        this.filteredOptionsTS = this.empForm.controls['ThirdSignatory'].valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : value? value.FirstName:""),
          map(name => name ? this._filterTD(name) : this.employeeThirdSigData.slice())
        );

      }
     
       
    })

  }



  

  
  onDepartmentChange(event){

    var depts= this.departments.filter(f=>f.DeptName== event.target.value)[0];
 this.jobRoles=depts.JobRoles;
}
  
getAllDepartments(){
  this.perfApp.route="app";
  this.perfApp.method="GetEmpSetupBasicData",
  this.perfApp.requestBody={industry:this.authService.getOrganization().Industry}
  this.perfApp.CallAPI().subscribe(c=>{
    
    console.log('CLIENTS DATA',c);
    if(c){
      this.departments=c.Industries[0].Department;
    //  this.jobRoles=c.JobRoles;
      this.appRoles=c.AppRoles;
      this.jobLevels=c.JobLevels;
      console.log('CLIENT JOB ROLES',this.appRoles);

      this.appRoles.filter(e=>{
        if(e.RoleName=="ClientSuperAdmin"){
e.RoleName="Client Super Admin"
        }
      }


      )

      this.appRoles.filter(e=>{ 
        if (e.RoleName=="Employee") {
          this.empForm.patchValue({ApplicationRole: [e._id] });
        }   
        
      } )
    }
  })
}
keyPressNumbersDecimal(event) {
  var charCode = (event.which) ? event.which : event.keyCode;
 if(charCode >= 48 && charCode <= 57) {
    return true
    
  }else if(charCode == 45){
return true;
  }

  else 
  
  {
    event.preventDefault();
    return false;
  }
  return true;
}

keyPressNumbers(event) {
  var charCode = (event.which) ? event.which : event.keyCode;
 if(charCode >= 48 && charCode <= 57) {
    return true
    
  }else 
  
  {
    event.preventDefault();
    return false;
  }
  return true;
}
keyPressNumbersZip(event) {
  var charCode = (event.which) ? event.which : event.keyCode;
  console.log(charCode)
 if(charCode >= 48 && charCode <= 57) {
    return true
    
  }
  else if(charCode >= 97 && charCode <= 122){
    return true
      }
     else if(charCode>=65 && charCode<=90){
      return true
    }
  else 
  
  {
    event.preventDefault();
    return false;
  }
  return true;
}
keyPressEmail(event) {
  var charCode = (event.which) ? event.which : event.keyCode;
  if (charCode >= 97 && charCode <= 122){
    return true;

  } else if(charCode>=65 && charCode<=90){
    return true;

  }    if(charCode >= 48 && charCode <= 57) {
    return true
    
  }else if(charCode == 46 || charCode == 64){
return true;
  }
  else 
  
  {
    event.preventDefault();
    return false;
  }
  return true;
}



keyPressAlphaAndPeriod(event) {
  debugger
  var charCode = (event.which) ? event.which : event.keyCode;
  if (charCode >= 97 && charCode <= 122){
    return true;

  } else if(charCode>=65 && charCode<=90){
    return true;

  }  else if(charCode == 46){
return true;
  }
  else 
  
  {
    event.preventDefault();
    return false;
  }
  return true;
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
      Company: ['', []],
      EvaluationType: ['Year-end', []],
    });
    this.evaluationForm.controls["EvaluationPeriod"].setValue(this.currentOrganization.EvaluationPeriod);
    this.evaluationForm.controls["EvaluationDuration"].setValue(this.currentOrganization.EvaluationDuration);
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

        this.employeesList$Memory = this.employeesList$


      } else {
        this.notification.error('You have reached maximum employees limit for evaluation or for all existing employees evaluation is rolled out. Please contact Admin')
      }
    })
  }

  getPeersForEmployees() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetPeers",
      //this.perfApp.requestBody = { 'parentId': this.currentUser.ParentUser ? this.currentUser.ParentUser : this.currentUser._id,'id':this.selectedEmployee._id }    
      this.perfApp.requestBody = { company: this.currentOrganization._id, id: this.selectedEmployee._id }
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
listData(){
  this.perfApp.route = "app";
  this.perfApp.method = "GetPeers",
    //this.perfApp.requestBody = { 'parentId': this.currentUser.ParentUser ? this.currentUser.ParentUser : this.currentUser._id,'id':this.selectedEmployee._id }    
    this.perfApp.requestBody = { company: this.currentOrganization._id, id: this.selectedEmployee._id }
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
    this.peersListData=c
  }) 
}
  submitEvaluation() {
    if (this.selectedEmployeeList.length > this.getEvaluationsAvailable()) {
      // this.notification.error(`only ${this.getEvaluationsAvailable()} allowed to rollout`)
      this.notification.error(`No more evaluations for this type are available to be rolled-out.`);
      return;
    }

    if (this.rollEvaluationEdit) {
      this.evaluationForm.value.EvaluationDuration = this.durationOptionSelected;
      this.evaluationForm.value.EvaluationType = this.evaluationType;
      let formdata = this.evaluationForm.value;
      formdata.EvaluationId = this.readonlyEmployee.evaluationId;
      this.openConfirmSubmitEVDialog()
    } else {
      this.isFormSubmitted = true;
      console.log('inside submit:::', this.selectedEmployee, this.selectedEmployeeList);

      this.getActivationDate();
      
      for (let emp of this.selectedEmployeeList) {
        if (emp.peerCompetenceMapping) {
          emp.Peers = [];
          for (let mapping of emp.peerCompetenceMapping) {
            var mappingInOldFormat = {};
            mappingInOldFormat['EmployeeId'] = mapping.peer.EmployeeId;
            mappingInOldFormat['displayTemplate'] = mapping.peer.displayTemplate;
            mappingInOldFormat['PeersCompetencyMessage'] = mapping.message;
            mappingInOldFormat['PeersCompetencyList'] = mapping.competencies;
            mappingInOldFormat['peerCompetenceMapping'] = mapping;
            emp.Peers.push(mappingInOldFormat);
          }
        }
        if (emp.drCompetenceMapping) {
          emp.DirectReportees = [];
          for (let mapping of emp.drCompetenceMapping) {
            var mappingInOldFormat = {};
            mappingInOldFormat['EmployeeId'] = mapping.directReportee.EmployeeId;
            mappingInOldFormat['displayTemplate'] = mapping.directReportee.displayTemplate;
            mappingInOldFormat['DirectReporteeComptencyMessage'] = mapping.message;
            mappingInOldFormat['DirectReporteeCompetencyList'] = mapping.competencies;
            mappingInOldFormat['drCompetenceMapping'] = mapping;
            emp.DirectReportees.push(mappingInOldFormat);
          }
        }
      }

      if (this.evaluationForm.invalid)
        return;
      const _evform = this.evaluationForm.value;
      this.openConfirmSubmitEVDialog();

    }

  }



  openConfirmSubmitEVDialog() {
    this.alert.Title = "Alert";
    this.alert.Content = "Once the evaluation is rolled-out, you will not be able to make changes to the Models until all the evaluations are completed. Are you sure you want to roll-out the evaluations?";
    this.alert.ShowCancelButton = true;
    this.alert.ShowConfirmButton = true;
    this.alert.CancelButtonText = "Cancel";
    this.alert.ConfirmButtonText = "Continue";
  
  
    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = this.alert;
    dialogConfig.height = "300px";
    dialogConfig.maxWidth = '40%';
    dialogConfig.minWidth = '40%';
  
  
    var dialogRef = this.dialog.open(AlertComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(resp => {
     if (resp=='yes') {
      this.perfApp.requestBody.IgnoreEvalAdminCreated=true;
      this.submitValidEvaluation();
     } else {
       
     }
    })
  }










  submitValidEvaluation() {
    this.evaluationForm.value.CreatedBy = this.currentUser._id;
    this.evaluationForm.value.Company = this.currentOrganization._id;
    this.evaluationForm.value.EvaluationType = this.evaluationType;
    this.evaluationForm.value.EvaluationDuration = this.durationOptionSelected;

    // this.setEmployeeIds();
    //this.setModelIds();
    this.evaluationForm.value.Employees = this.selectedEmployeeList;
    console.log('evaluation form', this.evaluationForm.value);
    this.perfApp.method = "CreateEvaluation";
    this.perfApp.requestBody = this.evaluationForm.value;
    this.perfApp.requestBody.EvaluationPeriodText= ReportTemplates.getEvaluationPeriod(this.currentOrganization.StartMonth, this.currentOrganization.EndMonth);
    this.perfApp.route = "evaluation"
    this.perfApp.CallAPI().subscribe(x => {
      console.log('added evaluation', x);
      if (this.rollEvaluationEdit) {
        this.notification.success('Evaluation Updated Successfully.')
      } else {
        this.notification.success(`The Evaluations have been
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
    this.perfApp.method = "GetModelsByIndustryByOrganization",
      this.perfApp.requestBody = { id: this.currentOrganization.Industry, Organization: this.currentOrganization._id }; //fill body object with form 
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
          this.onDeleteEmployee();
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
    this.notification.success('Selected name has been removed successfully');
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

  getActivationDate() {
    console.log('inside getActivationDate::::');
    var available = 0;
    if (this.purposeDurationMap && this.purposeDurationMap.get(this.evaluationType) && this.purposeDurationMap.get(this.evaluationType).get(this.durationOptionSelected)) {
      available = this.purposeDurationMap.get(this.evaluationType).get(this.durationOptionSelected);
      console.log(' available : ',available ,this.evaluationType , this.durationOptionSelected);
    }
    var rolledOut = this.getEvaluationsRolledOut();
    console.log(' rolledOut : ',rolledOut);
    var arrayActivationDates = [];
    var arrayIndex =0;
    this.availableEvaluations.forEach(item => {
      console.log(" current item : ",item.Purpose , item.DurationMonths);
      if (item.Purpose && item.DurationMonths &&  this.evaluationType == item.Purpose && item.DurationMonths+' Months' == this.durationOptionSelected) {
        console.log('emp count : ',this.getEmpCount(item));
        console.log(' item.ActivationDate: ',item.ActivationDate);
        var empCount = this.getEmpCount(item);
        empCount = arrayIndex+empCount
        while(arrayIndex< empCount){
          arrayActivationDates.push(item.ActivationDate);
          arrayIndex++;
        }
      }
    });
    arrayActivationDates.sort(function(a,b){
      return new Date(a).getTime() - new Date(b).getTime();
      });
    console.log('arrayActivationDates : ',arrayActivationDates);
    
    for(let emp of this.selectedEmployeeList){
     emp.ActivationDate = arrayActivationDates[rolledOut];
     rolledOut++;
    }
  }
  
  getEmpCount(item: any) {
    console.log('inside getEmpCount : ', item);
    if (item.Type == 'Adhoc' || item.UsageType != 'License') {
      console.log('emp count : ', item.NoOfEmployees);
      return item.NoOfEmployees;
    } else {
      console.log('else emp count : ', parseInt(item.Range.substring(item.Range.indexOf('-') + 1, item.Range.length)));
      return parseInt(item.Range.substring(item.Range.indexOf('-') + 1, item.Range.length));
    }
  }

  GetAvailableOrgEvaluations() {
    this.perfApp.route = "evaluation";
    this.perfApp.method = "GetAvailableOrgEvaluations",
      this.perfApp.requestBody = { clientId: this.currentOrganization._id };
    this.perfApp.CallAPI().subscribe(c => {
      console.log('GetAvailableOrgEvaluations : ', c);
      if (c) {
        this.pgsMap = new Map<string, Map<string, number>>();
        this.evaluationsMap = new Map<string, Map<string, number>>();
        this.availableEvaluations = c.payments;
        if (c.pgs) {
          this.existingPgs = c.pgs;
          c.pgs.forEach(item => {
            if (!item.EvaluationType) {
              item.EvaluationType = 'Year-end';
            }
            if (this.pgsMap.get(item.EvaluationType)) {
              //update purpose
              var durationMap: Map<string, number> = this.pgsMap.get(item.EvaluationType);
              if (durationMap.get(item.EvaluationType == 'Year-end' ? '12 Months' :item.EvaluationDuration)) {
                // update duration
                var existingDurationEmpCount = durationMap.get(item.EvaluationType == 'Year-end' ? '12 Months' :item.EvaluationDuration);
                durationMap.set(item.EvaluationType == 'Year-end' ? '12 Months' :item.EvaluationDuration, existingDurationEmpCount + 1);
                this.pgsMap.set(item.EvaluationType, durationMap);
              } else {
                // add duration
                durationMap.set(item.EvaluationType == 'Year-end' ? '12 Months' :item.EvaluationDuration, 1);
                this.pgsMap.set(item.EvaluationType, durationMap);
              }
            } else {
              // add EvaluationType
              var durationMap = new Map<string, number>();
              durationMap.set(item.EvaluationType == 'Year-end' ? '12 Months' :item.EvaluationDuration, 1);
              this.pgsMap.set(item.EvaluationType, durationMap);
            }
          });
        }

        if (c.evaluations) {
          this.existingEvals = c.evaluations;
          c.evaluations.forEach(item => {
            if (!item.EvaluationType) {
              item.EvaluationType = 'Year-end';
            }
            if (this.evaluationsMap.get(item.EvaluationType)) {
              //update purpose
              var durationMap: Map<string, number> = this.evaluationsMap.get(item.EvaluationType);
              if (durationMap.get(item.EvaluationType == 'Year-end' ? '12 Months' :item.EvaluationDuration)) {
                // update duration
                var existingDurationEmpCount = durationMap.get(item.EvaluationType == 'Year-end' ? '12 Months' :item.EvaluationDuration);
                durationMap.set(item.EvaluationType == 'Year-end' ? '12 Months' :item.EvaluationDuration, existingDurationEmpCount + item.Employees.length);
                this.evaluationsMap.set(item.EvaluationType, durationMap);
              } else {
                // add duration
                durationMap.set(item.EvaluationType == 'Year-end' ? '12 Months' :item.EvaluationDuration, item.Employees.length);
                this.evaluationsMap.set(item.EvaluationType, durationMap);
              }
            } else {
              // add EvaluationType
              var durationMap = new Map<string, number>();
              durationMap.set(item.EvaluationType == 'Year-end' ? '12 Months' :item.EvaluationDuration, item.Employees.length);
              this.evaluationsMap.set(item.EvaluationType, durationMap);
            }
          });
        }

        this.purposeDurationMap = new Map<string, Map<string, number>>();

        this.availableEvaluations.forEach(item => {
          if (!item.Purpose) {
            item.Purpose = 'Year-end';
          }
          if (this.purposeDurationMap.get(item.Purpose)) {
            //update purpose
            var durationMap: Map<string, number> = this.purposeDurationMap.get(item.Purpose);
            if (durationMap.get(item.Purpose == 'Year-end' ? '12 Months' : `${item.DurationMonths} Months`)) {
              // update duration
              var existingDurationEmpCount = durationMap.get(item.Purpose == 'Year-end' ? '12 Months' : `${item.DurationMonths} Months`);
              durationMap.set(item.Purpose == 'Year-end' ? '12 Months' : `${item.DurationMonths} Months`, existingDurationEmpCount + this.getEmpCount(item));
              this.purposeDurationMap.set(item.Purpose, durationMap);
            } else {
              // add duration
              durationMap.set(item.Purpose == 'Year-end' ? '12 Months' : `${item.DurationMonths} Months`, this.getEmpCount(item));
              this.purposeDurationMap.set(item.Purpose, durationMap);
            }
          } else {
            // add purpose
            var durationMap = new Map<string, number>();
            durationMap.set(item.Purpose == 'Year-end' ? '12 Months' : `${item.DurationMonths} Months`, this.getEmpCount(item));
            this.purposeDurationMap.set(item.Purpose, durationMap);
          }
        });
        console.log('this.pgsMap : ', this.pgsMap);
        console.log('this.evaluationsMap : ', this.evaluationsMap);
        console.log('map : ', this.purposeDurationMap);
        console.log('purposes : ', this.evaluationTypes);
        console.log('durations : ', Array.from(this.purposeDurationMap.get('Year-end').keys()));

        this.evaluationTypes = Array.from(this.purposeDurationMap.keys());
        if (this.evaluationTypes) {
          if (this.evaluationTypes.length === 1) {
            this.isSingleEvaluationType = true;
            this.evaluationType = this.evaluationTypes[0];
          } else {
            this.evaluationType = this.evaluationTypes[0];
            this.isSingleEvaluationType = false;
          }
        }

        if (this.evaluationType) {
          this.evaluationDurationOptions = Array.from(this.purposeDurationMap.get(this.evaluationType).keys());
          if (this.evaluationDurationOptions) {
            if (this.evaluationDurationOptions.length == 1) {
              this.durationOptionSelected = this.evaluationDurationOptions[0];
              this.isSingleDurationType = true;
            } else {
              this.isSingleDurationType = false;
              this.durationOptionSelected = this.evaluationDurationOptions[0];
            }
          }
        }

      }
    })
  }

  getEvaluationsRolledOut() {
    var noOfPgs = 0;
    var noOfEvs = 0;
    if (this.pgsMap && this.pgsMap.get(this.evaluationType) && this.pgsMap.get(this.evaluationType).get(this.durationOptionSelected)) {
      noOfPgs = Number(this.pgsMap.get(this.evaluationType).get(this.durationOptionSelected)) ? (this.pgsMap.get(this.evaluationType).get(this.durationOptionSelected)) : 0;
    }
    if (this.evaluationsMap && this.evaluationsMap.get(this.evaluationType) && this.evaluationsMap.get(this.evaluationType).get(this.durationOptionSelected)) {
      var noOfEvs = Number(this.evaluationsMap.get(this.evaluationType).get(this.durationOptionSelected)) ? this.evaluationsMap.get(this.evaluationType).get(this.durationOptionSelected) : 0;
    }

    var noOfExistingEvalsWithPGRolledOut = 0;
    if (this.existingPgs) {
      for (let pg of this.existingPgs) {
        // console.log(`pg emp id : ${pg.EmployeeId.toString()}`)
        if (pg.EvaluationType == this.evaluationType && pg.EvaluationDuration) {
          if (this.existingEvals) {
            for(let existingEval of this.existingEvals){
              existingEval.Employees.forEach(empl => {
                if (empl._id.toString() == pg.EmployeeId.toString()) {
                  noOfExistingEvalsWithPGRolledOut++;
                }
              });
            }
          }
        }
      }
    }
    return noOfEvs + noOfPgs - noOfExistingEvalsWithPGRolledOut;
  }

  getEvaluationsRolledOutForUI() {
    var available = 0;
    if (this.purposeDurationMap && this.purposeDurationMap.get(this.evaluationType) && this.purposeDurationMap.get(this.evaluationType).get(this.durationOptionSelected)) {
      available = this.purposeDurationMap.get(this.evaluationType).get(this.durationOptionSelected);
      //console.log('available : ',available);
      if (this.evaluationType === 'Year-end') {
        // console.log('EmployeeBufferCount ::: ',Number(parseInt(this.currentOrganization.EmployeeBufferCount))? parseInt(this.currentOrganization.EmployeeBufferCount): 0);
        var empBufferCount = parseInt(this.currentOrganization.EmployeeBufferCount) ? parseInt(this.currentOrganization.EmployeeBufferCount) : 0;
        available = available + empBufferCount;
        // console.log('final available : ',available);
      }
    }
    return this.getEvaluationsRolledOut().toString() + " out of " + available.toString();
  }

  getEvaluationsAvailable() {
    var available = 0;
    if (this.purposeDurationMap && this.purposeDurationMap.get(this.evaluationType) && this.purposeDurationMap.get(this.evaluationType).get(this.durationOptionSelected)) {
      available = this.purposeDurationMap.get(this.evaluationType).get(this.durationOptionSelected);
    }

    if (this.evaluationType === 'Year-end') {
      // console.log('EmployeeBufferCount ::: ',Number(parseInt(this.currentOrganization.EmployeeBufferCount))? parseInt(this.currentOrganization.EmployeeBufferCount): 0);
      var empBufferCount = parseInt(this.currentOrganization.EmployeeBufferCount) ? parseInt(this.currentOrganization.EmployeeBufferCount) : 0;
      available = available + empBufferCount;
      // console.log('final available : ',available);
    }
    var existingPGsSelectedForEvaluation = 0;
    if (this.existingPgs) {
      for (let pg of this.existingPgs) {
        if (pg.EvaluationType == this.evaluationType && pg.EvaluationDuration) {
          if (this.selectedEmployees) {
            // console.log('this.selectedEmployees : ', this.selectedEmployees);
            this.selectedEmployees.forEach(function (x) {
              if (x._id.toString() == pg.EmployeeId.toString()) {
                existingPGsSelectedForEvaluation++;
              }
            });

          }

        }
      }
    }
    // console.log('existingPGsSelectedForEvaluation : ', existingPGsSelectedForEvaluation);
    return (available - this.getEvaluationsRolledOut() + existingPGsSelectedForEvaluation);
  }

  onEvaluationTypeChange(event) {
    if (this.selectedEmployeeList.length > 0) {
      let isConform = window.confirm("Once the evaluation type changed, you will loose all the employees added for current evaluation type . Are you sure you want to change the evaluations type?")
      if (isConform) {
        this.initializeFormFor = this.initializeFormFor ? 'kpionly' : 'evaluation';
        this.selectedEmployeeList = [];
        this.selectedEmployeesForEvaluation = [];
        this.EmpGridOptions.api.setRowData(this.selectedEmployeeList);
      }
      else {
        event.target.value = this.evaluationType;
        return;
      }
    }
    console.log('onEvaluationTypeChange : ', event.target.value)
    this.evaluationType = event.target.value;
    if (this.evaluationType) {
      this.evaluationDurationOptions = Array.from(this.purposeDurationMap.get(this.evaluationType).keys());
      if (this.evaluationDurationOptions) {
        if (this.evaluationDurationOptions.length == 1) {
          this.isSingleDurationType = true;
        } else {
          this.isSingleDurationType = false;
        }
        this.durationOptionSelected = this.evaluationDurationOptions[0];
        // this.evaluationsAvailable = this.getEvaluationsAvailable();
        // this.evaluationsRolledOut = this.getEvaluationsRolledOut();
      }
    }
  }

  onDurationChange(event) {
    console.log('inside onDurationChange : ', event.target.value, this.evaluationType);
    if (this.selectedEmployeeList.length > 0) {
      let isConform = window.confirm("Once the Duration type changed, you will loose all the employees added for current duration type . Are you sure you want to change the duration type?")
      if (isConform) {
        this.initializeFormFor = this.initializeFormFor ? 'kpionly' : 'evaluation';
        this.selectedEmployeeList = [];
        this.selectedEmployeesForEvaluation = [];
        this.EmpGridOptions.api.setRowData(this.selectedEmployeeList);
      }
      else {
        event.target.value = this.durationOptionSelected;
        return;
      }
    }
    this.durationOptionSelected = event.target.value;
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
        headerName: "Review/Modify",
        suppressMenu: true,
        Sorting: false,
        cellRenderer: (data) => {
          console.log('column data', data)
          return `<i class="icon-ban" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="deletePeer" title="Delete Peer"></i> 
          <i class="icon-eye" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="viewPeerCompetencyMapping" title="View Competencies"></i> 
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
            var _count = data.data.peerCompetenceMapping ? data.data.peerCompetenceMapping.length : 0
            if (this.rollEvaluationEdit) {
              return `<span>${_count}</span>`
            } else {
              return `<span style="color:blue;cursor:pointer" data-action-type="choosePeers">${_count}</span>`
            }

          }

        }
      },
      {
        headerName: 'Direct Report(s)', field: '', sortable: false, filter: false,
        cellRenderer: (data) => {
          if (this.initializeFormFor === 'kpionly') {
            return '';
          } else {
            var _count = data.data.drCompetenceMapping ? data.data.drCompetenceMapping.length : 0
            if (this.rollEvaluationEdit) {
              return `<span>${_count}</span>`
            } else {
              return `<span style="color:blue;cursor:pointer" data-action-type="chooseDirectReports">${_count}</span>`
            }
          }
        }
      },
      {
        headerName: "Review/Modify",
        width: 130,
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
        headerName: "Review/Modify",
        suppressMenu: true,
        Sorting: false,
        cellRenderer: (data) => {
          console.log('column data', data)
          return `<i class="icon-ban" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="deleteDirectReportee" title="Delete Reportee"></i> 
          <i class="icon-eye" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="viewDrCompetencyMapping" title="View Competencies"></i>           
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
    //     headerName: "Review/Modify",
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
    if (!this.drCompetencyMappingRowdata || this.drCompetencyMappingRowdata.length < 2) {
      this.notification.error('At least two direct reports must be selected');
      return;
    }

    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to add the direct reports?"
    this.alert.ShowConfirmButton = true;
    this.alert.ShowCancelButton = true;
    this.alert.CancelButtonText = "Cancel";
    this.alert.ConfirmButtonText = "Continue";


    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = this.alert;
    dialogConfig.height = "300px";
    dialogConfig.maxWidth = '40%';
    dialogConfig.minWidth = '40%';


    var dialogRef = this.dialog.open(AlertComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(resp => {
      if (resp == 'yes') {
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
        this.notification.success('Evaluation Updated Successfully.');
      } else {

      }
    })
  }


   myFunction() {
    var x = document.getElementById("myDIV");
  
      x.style.display = "block";
    
   
  }

  onCancle(){
    var x = document.getElementById("myDIV");
    
      x.style.display = "none";
   
    
  }
  addToGrid() {
    if (this.selectedEmployees.length === 0) {
      this.notification.error('At least one employee must be selected.')
      return;
    }

    if (this.selectedEmployees.length + this.selectedEmployeeList.length > this.getEvaluationsAvailable()) {
      this.notification.error(`No more evaluations for this type are available to be rolled-out.`);
      return;
    }

    if (this.initializeFormFor === 'evaluation' && (this.evaluationForm.value.Model === null || this.evaluationForm.value.Model === '')) {
      this.notification.error('Please select Model')
      return;
    }
    this.selectedEmployees.map(x => {

      x.Model = this.modelsList.find(x => x._id === this.selectedModel);
    })

    this.selectedEmployeeList=[];
    this.selectedEmployees.forEach(element => {
      if (  this.selectedEmployeeList.findIndex(e=>e._id==element._id)    < 0) {
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

    if (this.selectedEmployees.length + this.selectedEmployeeList.length > this.getEvaluationsAvailable()) {
      this.notification.error(`only ${this.getEvaluationsAvailable()} employees evaluations left to rollout, to  add more please contact `);
      return;
    }

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
    // this.selectedEmployeeList = [];
    // this.selectedEmployeesForEvaluation = [];
    this.EmpGridOptions.api.setRowData(this.selectedEmployeeList);

    // returns pg employees which are not submitted yet
    let pgEmpDropdown = [];
    if (this.initializeFormFor === 'kpionly') {
      pgEmpDropdown = this.employeesList$Memory.filter(emp => (this.pgSubmittedEmployeesList.findIndex(pg => pg.Employee._id == emp._id) == -1));
    } else {
      pgEmpDropdown = this.employeesList$Memory;
    }

    this.employeesList$ = pgEmpDropdown;
    console.log("try",this.selectedEmployeeList)
  }
  getOrganizationStartAndEndDates() {
    let Organization = this.currentOrganization;
    let { StartMonth, EndMonth, EvaluationPeriod } = Organization;
    StartMonth = parseInt(StartMonth);
    let currentMoment = moment();
    let evaluationStartMoment;
    let evaluationEndMoment
    if (EvaluationPeriod === "FiscalYear") {
      var currentMonth = parseInt(currentMoment.format('M'));
      console.log(`${currentMonth} <= ${StartMonth}`)
      if (currentMonth <= StartMonth) {
        evaluationStartMoment = moment().month(StartMonth - 1).startOf('month').subtract(1, 'years');
        evaluationEndMoment = moment().month(StartMonth - 2).endOf('month');
        console.log(`${evaluationStartMoment.format("MM DD,YYYY")} = ${evaluationEndMoment.format("MM DD,YYYY")}`);
      } else {
        evaluationStartMoment = moment().month(StartMonth - 1).startOf('month');
        evaluationEndMoment = moment().month(StartMonth - 2).endOf('month').add(1, 'years');
        console.log(`${evaluationStartMoment.format("MM DD,YYYY")} = ${evaluationEndMoment.format("MM DD,YYYY")}`);
      }
    } else if (EvaluationPeriod === "CalendarYear") {
      evaluationStartMoment = moment().startOf('month');
      evaluationEndMoment = moment().month(0).endOf('month').add(1, 'years');
    }
    return {
      start: evaluationStartMoment,
      end: evaluationEndMoment
    }
  }



  confirmSaveKpiForm(){

    
    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to roll-out the performance goals?";
    this.alert.ShowCancelButton = true;
    this.alert.ShowConfirmButton = true;
    this.alert.CancelButtonText = "Cancel";
    this.alert.ConfirmButtonText = "Continue";
  
  
    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = this.alert;
    dialogConfig.height = "300px";
    dialogConfig.maxWidth = '40%';
    dialogConfig.minWidth = '40%';
  
  
    var dialogRef = this.dialog.open(AlertComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(resp => {
     if (resp=='yes') {
      this.perfApp.requestBody.IgnoreEvalAdminCreated=true;
      this.saveKpiForm();
     } else {
       
     }
    })


  }

  saveKpiForm() {
    let orgStartEnd = this.getOrganizationStartAndEndDates();
    let EvaluationYear = orgStartEnd.start.format("YYYY");
    let list = this.evaluationForm.value.Employees;
    var body: any;
    if (list && list.length > 0) {
      body = list.map(x => { return { EmployeeId: x.row._id, Company: this.currentOrganization._id, 
        KPIFor:this.evaluationForm.value.KPIFor, EvaluationDuration: this.durationOptionSelected, EvaluationType: this.evaluationType } 
      })

    }
    this.perfApp.method = "ReleaseKpiForm";
    this.perfApp.requestBody = body;
    this.perfApp.requestBody.CreatedBy=this.currentUser._id;
    this.perfApp.requestBody.EvaluationPeriodText= ReportTemplates.getEvaluationPeriod(this.currentOrganization.StartMonth, this.currentOrganization.EndMonth);
    this.perfApp.route = "evaluation"
    this.perfApp.CallAPI().subscribe(x => {
      console.log('added evaluation', x)
      this.notification.success(`The Performance Goals Setting have been
       successfully setup to be rolled out on ${new DatePipe('en-US').transform(new Date(), 'MM-dd-yyyy, h:mm a')}.`)
      this.router.navigate(['ea/evaluation-list'])
    }, error => {
      console.log('error while adding eval', error)
      this.notification.error(error.error.message)
    });
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


  getEvaluationList() {
    this.perfApp.route = "evaluation";
    this.perfApp.method = "GetEvaluations",
      this.perfApp.requestBody = { clientId: this.authService.getOrganization()._id }
    this.perfApp.CallAPI().subscribe(c => {
      if (c) {
        this.pgSubmittedEmployeesList = [];
        c.map(row => {
          if (row.Type === 'K') {
            this.pgSubmittedEmployeesList.push({
              Type: row.Type,
              EvaluationRow: row,
              Employee: row.Employee[0],
            });
          }
        })
      }
    })
  }

  onDeleteEmployee() {
    this.alert.Title = "Alert";
    if (this.initializeFormFor === 'kpionly') {
      this.alert.Content = "Are you sure you want to remove the selected name from performance goal roll-out?"
    } else {
      this.alert.Content = "Are you sure you want to remove the selected name from evaluation roll-out?"
    }
    this.alert.ShowConfirmButton = true;
    this.alert.ShowCancelButton = true;
    this.alert.CancelButtonText = "Cancel";
    this.alert.ConfirmButtonText = "Continue";


    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = this.alert;
    dialogConfig.height = "300px";
    dialogConfig.maxWidth = '40%';
    dialogConfig.minWidth = '40%';


    var dialogRef = this.dialog.open(AlertComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(resp => {
      if (resp == 'yes') {
        return this.deleteEmpFromList();
      } else {

      }
    })
  }
}
