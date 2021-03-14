import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GridApi, GridOptions } from 'ag-grid-community';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from '../../../services/auth.service';

import { NotificationService } from '../../../services/notification.service';
import { PerfAppService } from '../../../services/perf-app.service';
import ReportTemplates from '../../../views/psa/reports/data/reports-templates';
import { AlertDialog } from '../../../Models/AlertDialog';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AlertComponent } from '../../../shared/alert/alert.component';

@Component({
  selector: 'app-request-rating',
  templateUrl: './request-rating.component.html',
  styleUrls: ['./request-rating.component.css']
})
export class RequestRatingComponent implements OnInit {
  public alert: AlertDialog;
  selectedCompetencyViewRef: BsModalRef;
  @ViewChild('selectedCompetencyView') selectedCompetencyView: TemplateRef<any>;

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
  peerDropdownSettings: any = {};
  selectedEmployeeDirectReporteeMappings: any = [];
  peerCompetencyMappingRowdata: any = [];
  drCompetencyUIMapping: any = {};
  drCompetencyMappingRowdata: any = [];
  competencyMappingRowdata: any;
  isViewCompetencies: boolean = false;
  selectedReport: string = 'peers';
  selectedEmployeeId: string;
  selectedEmployeePeersCollection: any = {};
  selectedEmployeeDirectReporteesCollection: any = {};
  selectedSavedEmployee: any = {};
  disableSubmittedRecord: boolean = false;

  kpiList: any = [];
  gridRefreshParams = {
    force: true,
    suppressFlash: false
  };
  public peerCompetencyUIMapping: any = {};
  public currentEvaluationYear: any;

  public monthList = ["", "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"]
  constructor(
    private formBuilder: FormBuilder,
    private perfApp: PerfAppService,
    private notification: NotificationService,
    private modalService: BsModalService,
    public authService: AuthService,
    public router: Router,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute
  ) {

    this.activatedRoute.params.subscribe(params => {
      if (params) {
        this.selectedEmployeeId = params['empId'];
      }
    });
  }

  ngOnInit(): void {
    this.alert = new AlertDialog();
    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
    this.getEvaluationList();
    this.getEmployeeCurrentEvaluation();

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

  public rowSelection = 'multiple';
  public isRowSelectable(rowNode) {
    return rowNode.data ? rowNode.data.Type === 'K' ? true : false : false
  }
  public getRowNodeId(data) {
    return data.Employee._id;
  };
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
      if (c && c.length > 0) {
        this.employeesList$ = c
        var clonedArray = this.employeesList$.map((_arrayElement) => Object.assign({}, _arrayElement));
        this.employeesList$.map(x => {
          var _f = Object.assign({}, x);
          x.displayTemplate = `${x.FirstName}-${x.LastName}-${x.Email}`,
            x.row = _f;
        });

      }
    })
  }
  getGridColumnsForEmpKpi() {
    return [
      {
        headerName: 'Employee', suppressSizeToFit: true, sortable: true, filter: true,

        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.data.Employee[0].FirstName}-${data.data.Employee[0].LastName}</span>` }
      },
      {
        headerName: 'Released On', sortable: true, filter: true,
        cellRenderer: (data) => {

          return new DatePipe('en-US').transform(data.data.CreatedDate, 'MM-dd-yyyy')

        }
      },

      {
        headerName: 'Evaluation Year', sortable: true, filter: true,
        cellRenderer: (data) => {
          return data.data.EvaluationYear
        }
      },
      {
        headerName: 'Manager', field: '', sortable: true, filter: true,
        cellRenderer: (data) => {
          if (this.getNested(data.data.Manager, 'Name')) {
            return `${data.data.Manager.Name} `
          }
        }
      },


      {
        headerName: "Review/Modify",
        suppressMenu: true,
        Sorting: false,
        cellRenderer: (data) => {
          return `<i class="icon-pencil" style="cursor:pointer ;padding: 7px 20px 0 0;
            font-size: 17px;"   data-action-type="changeModel" title="Change Model"></i>
            `
          //}
        }
      }
    ];

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
      headerName: 'Direct Report(s)', field: '', sortable: false, filter: false,
      cellRenderer: (data) => {
        return `<span style="color:blue;cursor:pointer" data-action-type="chooseDirectReports">View</span>`
      }
    },

    {
      headerName: "Review/Modify",
      suppressMenu: true,
      suppressSizeToFit: true,
      Sorting: false,
      cellRenderer: (data) => {

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

      if (c) {
        this.selectedEmployeesList = [];
        c.map(row => {
          if (row.Type === 'K') {
            if (row.Employee[0].HasActiveEvaluation !== 'Yes') {
              this.selectedEmployeesList.push({
                Type: row.Type,
                EmployeeRow: row.Employee[0],
                EvaluationRow: row,
                Peers: [],
                DirectReportees: [],
                Model: 'N/A',
                Employee: row.Employee[0],
                PeersCompetencyMessage: 'N/A',
                DirectReporteeComptencyMessage: 'N/A',
                PeersCompetencyList: [],
                DirectReporteeCompetencyList: []
              });
            }
          } else {
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

          }
        })

      }
      this.selectedEmployee = this.selectedEmployeesList.find(emp => emp.Employee._id == this.selectedEmployeeId);
      this.selectedModel = this.selectedEmployee.Model;
      this.getPeersForEmployees();
      this.getDirectReportees();
      this.getCompetencyList();
    })
  }

  openDirectReporteesView() {
    if (this.selectedSavedEmployee && !this.selectedSavedEmployee.IsDraft) {
      this.selectedSavedEmployee.DirectReportees = [];
    }

    this.selectedEmployeeDirectReporteeMappings = this.selectedEmployee.DirectReportees || [];
    this.directReporteeCompetencyMessage = "";
    this.selectedEmployeeDirectReportees = [];
    this.currentEmployeeSelectedDirectReportees = [];
    this.seletedDirectReporteeCompetencyList = [];
    this.directReporteeCompetencyMessage = "";
    this.drCompetencyMappingRowdata = [];
    this.drCompetencyUIMapping = {};
    this.drCompetencyMappingRowdata = this.selectedSavedEmployee.DirectReportees;
    for (let mapping of this.drCompetencyMappingRowdata) {
      this.drCompetencyUIMapping[mapping.EmployeeId] = {};
      this.drCompetencyUIMapping[mapping.EmployeeId].directReportee = mapping;
      this.drCompetencyUIMapping[mapping.EmployeeId].competencies = mapping.Competencies;
      this.drCompetencyUIMapping[mapping.EmployeeId].message = '';
    }

    var rowData: any = [];
    for (let mapping in this.drCompetencyUIMapping) {
      rowData.push({
        directReportee: this.drCompetencyUIMapping[mapping].directReportee,
        competencies: this.drCompetencyUIMapping[mapping].competencies,
        message: this.drCompetencyUIMapping[mapping].message
      });
    }
    this.drCompetencyMappingRowdata = rowData;

  }

  getPeersForEmployees() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetPeers",
      this.perfApp.requestBody = { company: this.currentOrganization._id, id: this.selectedEmployee.Employee._id }
    this.perfApp.CallAPI().subscribe(c => {

      this.formattedPeers = [];
      if (c && c.length > 0) {
        c.map(x => {
          var _f: any = {};
          _f.EmployeeId = x._id;
          _f.displayTemplate = `${x.FirstName}-${x.LastName}-${x.Email}`,
            this.formattedPeers.push(_f);
        });
        this.peersList = c;

      }
    })
  }

  openPeerView() {
    if (this.selectedSavedEmployee) {
      this.peerCompetencyMappingRowdata = [];
      if (!this.selectedSavedEmployee.IsDraft) {
        this.selectedSavedEmployee.Peer = [];
      }

      this.PeersCompetencyMessage = "";
      this.selectedEmployeePeers = [];
      this.currentPeerCompetencyList = [];
      this.selectedPeersCompetencyList = [];
      this.peerCompetencyMappingRowdata = this.selectedSavedEmployee.Peer;
      for (let mapping of this.peerCompetencyMappingRowdata) {
        this.peerCompetencyUIMapping[mapping.EmployeeId] = {};
        this.peerCompetencyUIMapping[mapping.EmployeeId].peer = mapping;
        this.peerCompetencyUIMapping[mapping.EmployeeId].competencies = mapping.Competencies;
        this.peerCompetencyUIMapping[mapping.EmployeeId].message = '';
      }

      var rowData: any = [];
      for (let mapping in this.peerCompetencyUIMapping) {

        rowData.push({
          peer: this.peerCompetencyUIMapping[mapping].peer,
          competencies: this.peerCompetencyUIMapping[mapping].competencies,
          message: this.peerCompetencyUIMapping[mapping].message
        });
      }

      this.peerCompetencyMappingRowdata = rowData;
    }
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
      //debugger
      var clonedArray2 = c.map((_arrayElement) => Object.assign({}, _arrayElement));
      this.peersCompetencyList = clonedArray2;

    }, error => {
      //debugger
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
      drCompetenceMapping: this.selectedEmployee.drCompetenceMapping,
      DirectReporteeCompetencyMessage: this.selectedEmployee.DirectReporteeComptencyMessage,
      DirectReporteeCompetencyList: this.selectedEmployee.DirectReportsCompetency
    }
    this.perfApp.route = "evaluation"
    this.perfApp.CallAPI().subscribe(x => {
      this.notification.success('Evaluation Updated Successfully.')
      this.refresh();
    }, error => {

      console.log('error while adding eval', error)
      this.notification.error(error.error.message)
    })

  }

  refresh(): void {
    window.location.reload();
  }
  updateEvaluation() {
    //debugger
    const _evform = this.evaluationForm.value;
    this.evaluationForm.value.CreatedBy = this.currentUser._id;
    this.evaluationForm.value.Company = this.currentOrganization._id;

    this.evaluationForm.value.Employees = this.selectedEmployees;

    this.perfApp.method = "UpdateEvaluationForm";
    this.perfApp.requestBody = this.currentEvaluationForm;
    this.perfApp.route = "evaluation"
    this.perfApp.CallAPI().subscribe(x => {

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

    this.selectedEmployees.push(item.row);
  }
  onSelectAllEmployees(items: any) {
    //this.selectedEmployees = items;
    this.selectedEmployees = [];
    items.map(x => {
      this.selectedEmployees.push(x.row);
    })

  }
  onEmployeeDeSelect(item: any) {
    var _position = this.selectedEmployees.indexOf(item);
    this.selectedEmployees.splice(_position, 1);
  }
  onModelChange(event) {
    this.selectedModel = event.target.value;
    this.getCompetencyList();
  }

  public peersForEmpGridOptions: GridOptions = {
    columnDefs: this.getPeersForEmpCols(),
    api: new GridApi()
  }
  public onPeersGridReady(params) {
    this.peersForEmpGridOptions.api = params.api;
    params.api.sizeColumnsToFit();
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

          return `<i class="icon-ban" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="deletePeer" title="Delete Peer"></i>
          <i class="icon-eye" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="viewPeerCompetencyMapping" title="View Competencies"></i> 
          `
        }
      }

    ];

  }

  closeDrModel() {
    this.selectedEmployee = {};
    this.currentEmployeeSelectedDirectReportees = [];
    this.navigateBacktoDashboard();
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

          return `<i class="icon-ban" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="deleteDirectReportee" title="Delete Reportee"></i>
          <i class="icon-eye" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="viewDrCompetencyMapping" title="View Competencies"></i>             
         `
          //}
        }
      }
    ];
  }
  onDirectReporteeGridReady(params) {
    //debugger
    this.directReporteesOfEmpGridOptions.api = params.api;
    params.api.sizeColumnsToFit();

  }


  public onDirectReporteeGridRowClicked(e) {
    //debugger
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
  async addDRCompetencyMapping() {
    if (!this.selectedEmployee.DirectReportees || this.selectedEmployee.DirectReportees.length === 0) {
      this.notification.error('At least one direct reports must be selected');
      return;
    }
    if (this.seletedDirectReporteeCompetencyList.length === 0) {
      this.notification.error('Please select at least 1 Competency');
      return;
    }

    await this.updateDRCompetencyUIMapping();
    this.selectedEmployee.DirectReportees = [];
    this.selectedEmployeeDirectReportees = [];
    this.currentEmployeeSelectedDirectReportees = [];
    this.seletedDirectReporteeCompetencyList = [];
    this.directReporteeCompetencyMessage = "";
    var rowData: any = [];
    for (let mapping in this.drCompetencyUIMapping) {
      rowData.push({
        directReportee: this.drCompetencyUIMapping[mapping].directReportee,
        competencies: this.drCompetencyUIMapping[mapping].competencies,
        message: this.drCompetencyUIMapping[mapping].message
      });
    }
    this.drCompetencyMappingRowdata = rowData;
    if (this.directReporteesOfEmpGridOptions.api) {
      this.directReporteesOfEmpGridOptions.api.setRowData(rowData);
    }
  }
  updateDRCompetencyUIMapping() {
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


  deleteDirectReportee() {

    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to delete the record ?";
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
        var _p = this.drCompetencyMappingRowdata.indexOf(this.currentDirectReportee);
        this.drCompetencyMappingRowdata.splice(_p, 1);
        this.directReporteesOfEmpGridOptions.api.setRowData(this.drCompetencyMappingRowdata);
      } else {

      }
    })
  }

  saveDirectReportees(isDraft) {
    if (this.drCompetencyMappingRowdata.length === 0) {
      this.notification.error('Please add at least one direct reportee to request review');
      return;
    }

    if (this.drCompetencyMappingRowdata && this.drCompetencyMappingRowdata.length !== 0) {
      this.selectedEmployee.DirectReportees = [];
      this.selectedEmployeeDirectReporteesCollection = {};
      this.selectedEmployeeDirectReporteesCollection['Employees'] = [];
      this.selectedEmployeeDirectReporteesCollection['Competencies'] = [];
      for (let mapping of this.drCompetencyMappingRowdata) {
        this.selectedEmployeeDirectReporteesCollection['Employees'].push(mapping.peer);
      }
      this.selectedEmployeeDirectReporteesCollection['Competencies'] = this.drCompetencyMappingRowdata[0].competencies[0];
      this.selectedEmployeeDirectReporteesCollection['IsDraft'] = isDraft;
      this.selectedEmployeeDirectReporteesCollection['EmployeeId'] = this.selectedEmployeeId;
      this.selectedEmployeeDirectReporteesCollection['CreatedBy'] = this.currentUser._id
      this.selectedEmployeeDirectReporteesCollection['Type'] = 'DirectReportees';
      this.selectedEmployeeDirectReporteesCollection['EvaluationYear'] = this.currentEvaluationYear;
      if (!isDraft) {
        this.alert.Title = "Alert";
        this.alert.Content = "Are you sure you want to add the direct reports to request review?";
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
            this.selectedEmployee['drCompetenceMapping'] = this.drCompetencyMappingRowdata;
            this.saveDirectReporteesApi(isDraft);
          } else {

          }
        })
      } else {
        this.saveDirectReporteesApi(isDraft);
      }
    }
  }


  public directReporteesOfEmpGridOptions: GridOptions = {
    columnDefs: this.getDirectReporteeGridCols(),
    api: new GridApi()
  }

  //#region Refactring

  currentPeer: any = {};
  onPeerSelect(item) {
    if (!this.selectedEmployee.Peers) {
      this.selectedEmployee.Peers = [];
    }
    this.selectedEmployee.Peers.push(item);
  }

  onSelectAllPeers(items: any) {
    if (!this.selectedEmployee.Peers) {
      this.selectedEmployee.Peers = [];
    }
    this.selectedEmployee.Peers = items;
    if (this.peersForEmpGridOptions.api) {
      this.peersForEmpGridOptions.api.setRowData(this.selectedEmployee.Peers);
    }
  }

  public getRowHeight = function (params) {
    return 34;
  };

  deletePeer() {
    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to delete the record ?";
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
        var _p = this.peerCompetencyMappingRowdata.indexOf(this.currentPeer);
        this.peerCompetencyMappingRowdata.splice(_p, 1);
        if (this.peersForEmpGridOptions.api) {
          this.peersForEmpGridOptions.api.setRowData(this.peerCompetencyMappingRowdata);
        }
      } else {

      }
    })
   

  }

  populateCompetencies() {
    this.currentPeerCompetencyList = this.currentPeer.peerCompetenceMapping.competencies;
    this.competencyDropdownSettings.itemsShowLimit = this.currentPeer.peerCompetenceMapping.competencies.length;
  }

  onPeerDeSelect(item: any) {
    var _position = this.selectedEmployee.Peers.findIndex(x => x.EmployeeId === item.EmployeeId);
    this.selectedEmployee.Peers.splice(_position, 1);
    // this.peersForEmpGridOptions.api.setRowData(this.selectedEmployee.Peers);
  }
  onDeSelectAllPeers(items: any) {
    this.selectedEmployees.Peers = [];
    // this.peersForEmpGridOptions.api.setRowData(this.selectedEmployee.Peers);
  }

  onPeerCompetencyDeSelect(item) {
    var _position = this.selectedPeersCompetencyList.indexOf(item);
    this.selectedPeersCompetencyList.splice(_position, 1);
  }
  onDeSelectAllPeerCompetencies(items) {
    this.selectedPeersCompetencyList = [];
  }
  closePeersModel() {
    // this.selectePeersViewRef.hide();
    this.selectedEmployee = {};
    this.selectedEmployeePeers = [];
    this.navigateBacktoDashboard();
  }
  public onPeersRowClicked(e) {
    //debugger
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

  async addPeerCompetencyMapping() {
    console.log('inside addPeerCompetencyMapping ::: ');
    if (this.selectedPeersCompetencyList.length === 0) {
      this.notification.error('Please select at least one  Competency');
      return;
    }
    if (!this.selectedEmployee.Peers || this.selectedEmployee.Peers.length === 0) {
      this.notification.error('At least one peer must be selected');
      return;
    }

    await this.updatePeerCompetencyUIMapping();

    this.selectedEmployee.Peers = [];
    this.selectedEmployeePeers = [];
    this.currentPeerCompetencyList = [];
    this.selectedPeersCompetencyList = [];
    this.PeersCompetencyMessage = "";
    var rowData: any = [];
    for (let mapping in this.peerCompetencyUIMapping) {

      rowData.push({
        peer: this.peerCompetencyUIMapping[mapping].peer,
        competencies: this.peerCompetencyUIMapping[mapping].competencies,
        message: this.peerCompetencyUIMapping[mapping].message
      });
    }

    this.peerCompetencyMappingRowdata = rowData;
    if (this.peersForEmpGridOptions.api) {
      this.peersForEmpGridOptions.api.setRowData(rowData);
    }
  }

  public viewCompetencyGridOptions: GridOptions = {
    columnDefs: this.getCompetencyViewGridCols(),
    api: new GridApi()
  }

  getCompetencyViewGridCols() {
    return [
      {
        headerName: 'Competencies', width: 400, sortable: true, filter: true,
        cellRenderer: (data) => { return `<span >${data.data.Name}</span>` }
      }
    ];
  }


  onViewCompetencyGridReady(params) {

    this.viewCompetencyGridOptions.api = params.api;
    params.api.sizeColumnsToFit();
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

  closeCompetencyViewModel() {
    console.log('closeCompetencyViewModel :::');
    this.isViewCompetencies = false;
    this.selectedCompetencyViewRef.hide();
    this.competencyMappingRowdata = {};
  }

  updatePeerCompetencyUIMapping() {
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
  savePeers(isDraft) {

    if (this.peerCompetencyMappingRowdata.length === 0) {
      this.notification.error('Please add at least one peer to request review');
      return;
    }

    if (this.peerCompetencyMappingRowdata && this.peerCompetencyMappingRowdata.length !== 0) {
      this.selectedEmployeePeersCollection = {};
      this.selectedEmployeePeersCollection['Employees'] = [];
      this.selectedEmployeePeersCollection['Competencies'] = [];
      for (let mapping of this.peerCompetencyMappingRowdata) {
        this.selectedEmployeePeersCollection['Employees'].push(mapping.peer);
      }
      this.selectedEmployeePeersCollection['Competencies'] = this.peerCompetencyMappingRowdata[0].competencies[0];
      this.selectedEmployeePeersCollection['IsDraft'] = isDraft;
      this.selectedEmployeePeersCollection['EmployeeId'] = this.selectedEmployeeId;
      this.selectedEmployeePeersCollection['CreatedBy'] = this.currentUser._id
      this.selectedEmployeePeersCollection['Type'] = 'Peer';
      this.selectedEmployeePeersCollection['EvaluationYear'] = this.currentEvaluationYear;

      if (!isDraft) {
        this.alert.Title = "Alert";
        this.alert.Content = "Are you sure you want to add peers for review request?";
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
            this.saveRequestPeersApi(isDraft);
          } else {

          }
        })
      } else {
        this.saveRequestPeersApi(isDraft);
      }
    }
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
    // this.seletedDirectReporteeCompetencyList.push(item)
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
  }
  onSelectAllDirectReportee(items: any) {
    //this.selectedEmployees = items;
    if (!this.selectedEmployee.DirectReportees) {
      this.selectedEmployee.DirectReportees = [];
    }
    this.selectedEmployee.DirectReportees = items;
    this.selectedEmployeeDirectReportees = this.selectedEmployee.DirectReportees
  }

  onDirectReporteeDeSelect(item: any) {
    var _position = this.selectedEmployee.DirectReportees.findIndex(x => x.EmployeeId === item.EmployeeId);
    this.selectedEmployee.DirectReportees.splice(_position, 1);
  }
  onDeSelectAllDirectReportee(items) {
    this.selectedEmployee.DirectReportees = []

  }
  //#endregion



  getNested(obj, ...args) {
    return args.reduce((obj, level) => obj && obj[level], obj)
  }
  initiateEvaluation() {
    this.router.navigate(['ea/rollout', { allKpi: 'true' }], { skipLocationChange: true });

  }


  onGridSizeChanged(params) {
    // params.api.sizeColumnsToFit();
  }

  getEVPeriod(evRow) {
    return ReportTemplates.getEvaluationPeriod(this.currentOrganization.StartMonth, this.currentOrganization.EndMonth);
  }

  changeReportSelection(value) {
    this.selectedReport = value;

    if (this.selectedReport == 'peers') {
      this.openPeerView();
    } else if (this.selectedReport == 'directReport') {
      this.openDirectReporteesView();
    }
  }


  saveRequestPeersApi(isDraft) {
    this.perfApp.route = "em/request/peer-direct";
    this.perfApp.method = "reports/save";
    this.perfApp.requestBody = this.selectedEmployeePeersCollection;
    this.perfApp.CallAPI().subscribe(x => {
      if (isDraft) {
        this.notification.success('Peers review request saved successfully.');
      } else {
        this.notification.success('Peers review request submitted successfully.');
      }
    }, error => {
      this.notification.error(error.error.message)
    })

  }

  saveDirectReporteesApi(isDraft) {
    this.perfApp.route = "em/request/peer-direct";
    this.perfApp.method = "reports/save";
    this.perfApp.requestBody = this.selectedEmployeeDirectReporteesCollection;
    this.perfApp.CallAPI().subscribe(x => {
      if (isDraft) {
        this.notification.success('Direct Reportees review request saved successfully.');
      } else {
        this.notification.success('Direct Reportees review request submitted successfully.');
      }
    }, error => {
      this.notification.error(error.error.message)
    })

  }

  getPeerDirectSelectedEmployee() {
    this.perfApp.route = "em/find/employee/peer-direct";
    this.perfApp.method = "reports",
      this.perfApp.requestBody = {
        "EvaluationYear": this.currentEvaluationYear,
        "EmpId": this.selectedEmployeeId,
        "owner": this.currentUser._id
      }
    this.perfApp.CallAPI().subscribe(c => {

      if (c) {
        this.selectedSavedEmployee = c;
        this.selectedSavedEmployee.IsDraft = true;
        if (!this.selectedSavedEmployee.IsDraft) {
          this.disableSubmittedRecord = true;
        } else {
          this.disableSubmittedRecord = false;
        }
      } else {
        this.selectedSavedEmployee.Peers = [];
        this.selectedSavedEmployee.DirectReportees = [];
      }

      this.changeReportSelection('peers');
    })
  }

  getEmployeeCurrentEvaluation() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetEmployeeCurrentEvaluation",
      this.perfApp.requestBody = {
        'empId': this.selectedEmployeeId,
        'orgId': this.currentOrganization._id
      }
    this.perfApp.CallAPI().subscribe(evaluationYear => {
      this.currentEvaluationYear = evaluationYear;
      this.getPeerDirectSelectedEmployee();
    })
  }

  navigateBacktoDashboard() {
    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to exit?";
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
        this.router.navigate(['dashboard']);
      } else {

      }
    })
  }

}
