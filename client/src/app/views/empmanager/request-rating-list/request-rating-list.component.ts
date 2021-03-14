import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, TemplateRef, ViewChild, Input } from '@angular/core';
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
  selector: 'app-request-rating-list',
  templateUrl: './request-rating-list.component.html',
  styleUrls: ['./request-rating-list.component.css']
})
export class RequestRatingListComponent implements OnInit {
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
  selectedEmployeeId: string;
  empEvaluationYear: string = '';

  kpiList: any = [];
  gridRefreshParams = {
    force: true,
    suppressFlash: false
  };
  public peerCompetencyUIMapping: any = {};

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

  public EmpGridOptions: GridOptions = {
    columnDefs: this.getGridColumnsForEmp(),
    api: new GridApi()
  }
  public rowSelection = 'multiple';
  public isRowSelectable(rowNode) {
    return rowNode.data ? rowNode.data.Type === 'K' ? true : false : false
  }
  public getRowNodeId(data) {
    return data.EmployeeId._id;
  };

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


  getGridColumnsForEmp() {
    return [
      {
        headerName: 'Employee', sortable: true, width: 180, wrapText: true, autoHeight: true, filter: true,
        // checkboxSelection: true,
        cellRenderer: (data) => {
          //return `<a href="/" onclick="return false;"   data-action-type="setEmployee">${data.data.Employee.FirstName}-${data.data.Employee.LastName}</a>`
          return `<span data-action-type="orgView">${data.data.EmployeeId.FirstName}-${data.data.EmployeeId.LastName}</span>`
        }
      },
      {
        headerName: 'Title', field: '', sortable: true, width: 180, wrapText: true, autoHeight: true, filter: true,
        cellRenderer: (data) => {
          //return `<a href="/" onclick="return false;"   data-action-type="setEmployee">${data.data.Employee.FirstName}-${data.data.Employee.LastName}</a>`
          return `<span  data-action-type="orgView">${data.data.EmployeeId.Title}</span>`
        }
      },
      {
        headerName: 'Peers', field: '', sortable: false, width: 100, wrapText: true, autoHeight: true, filter: false,
        cellRenderer: (data) => {

          if (data.data.Peer) {
            return `<span style="color:blue;cursor:pointer;" data-action-type="choosePeers">${data.data.Peer.length}</span>`
          } else {
            return 'N/A';
          }

        }
      },
      {
        headerName: 'Direct Report(s)', field: '', width: 180, wrapText: true, autoHeight: true, sortable: false, filter: false,

        cellRenderer: (data) => {
          if (data.data.DirectReportees) {
            return `<span style="color:blue;cursor:pointer;" data-action-type="chooseDirectReports">${data.data.DirectReportees.length}</span>`
          } else {
            return 'N/A';
          }

        },
      },
      {
        headerName: 'Requested On', field: '', width: 180, wrapText: true, autoHeight: true, sortable: false, filter: false,
        cellRenderer: (data) => {
          //return `<a href="/" onclick="return false;"   data-action-type="setEmployee">${data.data.Employee.FirstName}-${data.data.Employee.LastName}</a>`
          return `<span data-action-type="orgView">${data.data.CreatedOn ? new DatePipe('en-US').transform(data.data.CreatedOn, 'MM-dd-yyyy') : 'N/A'}</span>`
        }
      },
    ];
  }

  gotoCreateEvaluation() {
    var selectedRows = this.EmpGridOptions.api.getSelectedRows();
    //debugger
    this.router.navigate(['ea/rollout', { allKpi: selectedRows.length > 0, list: selectedRows.map(x => x.Employee._id) }], { skipLocationChange: true });
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
    this.perfApp.route = "em/request/peer-direct";
    this.perfApp.method = "reports/list",
      this.perfApp.requestBody = {
        "EvaluationYear": this.empEvaluationYear,
        "owner": this.currentUser._id
      }
    this.perfApp.CallAPI().subscribe(c => {

      if (c) {
        this.selectedEmployeesList = c;
      }

      this.EmpGridOptions.api.setRowData(this.selectedEmployeeList);
    })
  }

  onEmpGridReady(params) {
    //debugger
    this.EmpGridOptions.api = params.api; // To access the grids API
    params.api.sizeColumnsToFit();
  }
  public onEmpRowClicked(e) {
    if (e.event.target !== undefined) {
      let data = e.data;
      //this.currentRowItem = data.RowData;
      this.selectedEmployee = e.data;

      let actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "chooseDirectReports":
          return this.openDirectReporteesView();
        case "choosePeers":
          return this.openPeerView();
        case "deleteEmp":
          return this.deleteEmpFromList();
      }
    }
  }

  openDirectReporteesView() {
    this.selectedEmployeeDirectReporteeMappings = this.selectedEmployee.DirectReportees || [];
    this.directReporteeCompetencyMessage = "";
    this.selectedEmployeeDirectReportees = [];
    this.currentEmployeeSelectedDirectReportees = [];
    this.seletedDirectReporteeCompetencyList = [];
    this.directReporteeCompetencyMessage = "";
    this.drCompetencyMappingRowdata = [];
    this.drCompetencyUIMapping = {};
    this.drCompetencyMappingRowdata = this.selectedEmployee.DirectReportees;
    for (let mapping of this.drCompetencyMappingRowdata) {
      this.drCompetencyUIMapping[mapping.EmployeeId] = mapping;
    }
    this.selectedModel = this.selectedEmployee.Model;
    this.getDirectReportees();
  }

  getPeersForEmployees() {
    //this.perfApp.route = "app";
    //this.perfApp.method = "GetPeers",
    //  this.perfApp.requestBody = { company: this.currentOrganization._id, id: this.selectedEmployee.Employee._id }
    //this.perfApp.CallAPI().subscribe(c => {

    //  this.formattedPeers = [];
    //  if (c && c.length > 0) {
    //    c.map(x => {
    //      var _f: any = {};
    //      _f.EmployeeId = x._id;
    //      _f.displayTemplate = `${x.FirstName}-${x.LastName}-${x.Email}`,
    //        this.formattedPeers.push(_f);
    //    });
    //    //debugger
    //    this.peersList = c;

    //  }
    //  this.selectePeersViewRef = this.modalService.show(this.selectePeersView, this.config);
    //})

    this.selectePeersViewRef = this.modalService.show(this.selectePeersView, this.config);
  }

  openPeerView() {
    if (this.selectedEmployee.Peer) {
      this.peerCompetencyMappingRowdata = [];
      this.selectedEmployee.Peers = [];
      this.PeersCompetencyMessage = "";
      this.selectedEmployeePeers = [];
      this.currentPeerCompetencyList = [];
      this.selectedPeersCompetencyList = [];
      this.peerCompetencyMappingRowdata = this.selectedEmployee.Peer;
      for (let mapping of this.peerCompetencyMappingRowdata) {
        this.peerCompetencyUIMapping[mapping.EmployeeId] = mapping;
      }

      this.selectedModel = this.selectedEmployee.Model;

      this.getPeersForEmployees();
      // this.getCompetencyList();
    }
  }

  public deleteEmpFromList() {
    //debugger
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
      // this.router.navigate(['ea/evaluation-list'])
      this.refresh();
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
      peerCompetenceMapping: this.selectedEmployee.peerCompetenceMapping,
      PeersCompetencyMessage: this.selectedEmployee.PeersCompetencyMessage,
      PeersCompetencyList: this.selectedEmployee.PeersCompetencyList
    }
    this.perfApp.route = "evaluation"
    this.perfApp.CallAPI().subscribe(x => {
      this.notification.success('Evaluation Updated Successfully.')

      var rowNode = this.EmpGridOptions.api.getRowNode(this.selectedEmployee.Employee._id);
      //debugger
      var newdata = rowNode.data;
      newdata.Peers = this.selectedEmployee.Peers;
      rowNode.setData(newdata);
      this.EmpGridOptions.api.refreshCells(this.gridRefreshParams);
      this.refresh();

    }, error => {
      this.closePeersModel();
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
        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.data.displayTemplate}</span>` }
      },
      {
        headerName: 'Competencies', field: '', sortable: false, filter: false,
        cellRenderer: (data) => {
          var _count = data.data.Competencies ? data.data.Competencies.length : 0
          return `<span>${_count}</span>`
        }
      },
      {
        headerName: "Review/Modify",
        suppressMenu: true,
        Sorting: false,
        cellRenderer: (data) => {

          //return `<i class="icon-ban" style="cursor:pointer ;padding: 7px 20px 0 0;
          //font-size: 17px;"   data-action-type="deletePeer" title="Delete Peer"></i>
          //<i class="icon-eye" style="cursor:pointer ;padding: 7px 20px 0 0;
          //font-size: 17px;"   data-action-type="viewPeerCompetencyMapping" title="View Competencies"></i> 
          //`
          return `<i class="icon-eye" style="cursor:pointer ;padding: 7px 20px 0 0;
          font-size: 17px;"   data-action-type="viewPeerCompetencyMapping" title="View Competencies"></i> 
          `
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
        headerName: 'Direct Report(s)', sortable: true, filter: true,
        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.data.displayTemplate}</span>` }
      },
      {
        headerName: 'Competencies', field: '', sortable: false, filter: false,
        cellRenderer: (data) => {
          var _count = data.data.Competencies ? data.data.Competencies.length : 0
          return `<span>${_count}</span>`
        }
      },
      {
        headerName: "Review/Modify",
        suppressMenu: true,
        Sorting: false,
        cellRenderer: (data) => {

          // return `<i class="icon-ban" style="cursor:pointer ;padding: 7px 20px 0 0;
          // font-size: 17px;"   data-action-type="deleteDirectReportee" title="Delete Reportee"></i>
          // <i class="icon-eye" style="cursor:pointer ;padding: 7px 20px 0 0;
          // font-size: 17px;"   data-action-type="viewDrCompetencyMapping" title="View Competencies"></i>             
          //`
          return `<i class="icon-eye" style="cursor:pointer ;padding: 7px 20px 0 0;
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
    var _p = this.drCompetencyMappingRowdata.indexOf(this.currentDirectReportee);
    this.drCompetencyMappingRowdata.splice(_p, 1);
    this.directReporteesOfEmpGridOptions.api.setRowData(this.drCompetencyMappingRowdata);
  }
  saveDirectReportees() {
    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to add the direct reports?";
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
        this.updateDirectReporteesOfEmployee();
        this.closeDrModel();
      } else {

      }
    })
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
    var _p = this.peerCompetencyMappingRowdata.indexOf(this.currentPeer);
    this.peerCompetencyMappingRowdata.splice(_p, 1);
    if (this.peersForEmpGridOptions.api) {
      this.peersForEmpGridOptions.api.setRowData(this.peerCompetencyMappingRowdata);
    }

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
    this.selectePeersViewRef.hide();
    this.selectedEmployee = {};
    this.selectedEmployeePeers = [];
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
    this.viewCompetencies(this.currentPeer, this.currentPeer.Competencies);
  }

  viewDrCompetencyMapping() {
    this.viewCompetencies(this.currentDirectReportee, this.currentDirectReportee.Competencies);
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
  savePeers() {
    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to add peers for review?";
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

        this.UpdatePeers();
      } else {

      }
    })

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
    this.selecteDirectReporteeViewRef = this.modalService.show(this.selecteDirectReporteeView, this.config)

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

  getEmployeeCurrentEvaluation() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetEmployeeCurrentEvaluation",
      this.perfApp.requestBody = {
        'empId': this.selectedEmployeeId,
        'orgId': this.currentOrganization._id
      }
    this.perfApp.CallAPI().subscribe(evaluationYear => {
      this.empEvaluationYear = evaluationYear;
      this.getEvaluationList();
    })
  }
}
