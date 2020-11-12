import { DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GridApi, GridOptions, _ } from 'ag-grid-community';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from '../../../services/auth.service';

import { NotificationService } from '../../../services/notification.service';
import { PerfAppService } from '../../../services/perf-app.service';


@Component({
  selector: 'app-rollevaluation',
  templateUrl: './rollevaluation.component.html',
  styleUrls: ['./rollevaluation.component.css']
})
export class RollevaluationComponent implements OnInit {
  public evaluationForm: FormGroup;
  public contactPersonForm: FormGroup;
  public isFormSubmitted = false;
  errorOnSave = false;
  errorMessage: string = "";
  enableKPIFor: boolean = false;
  employeesList$: any[]=[];
  peersList: any[];
  directReportees: any[];
  evaluationPeriods: any[];
  evaluationDuration: any[];
  public currentOrganization: any;
  currentUser: any;

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
  allKpi: Boolean=false;
  kpiSelectedEmployees:any=[];
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
    var _position = this.selectedEmployees.indexOf(item);
    this.selectedEmployees.splice(_position, 1);
    
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
    
    var _position = this.selectedEmployee.Peers.findIndex(x=>x.EmployeeId===item.EmployeeId);
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
    this.selectedEmployee.Peers.map(element => {
      element.PeersCompetencyMessage = this.PeersCompetencyMessage;
      element.PeersCompetencyList = this.selectedPeersCompetencyList;
    });
    this.EmpGridOptions.api.setRowData(this.selectedEmployeeList)
    this.EmpGridOptions.api.refreshCells(this.gridRefreshParams)
    this.closePeersModel();
  }

  onSelectAllPeersCompetency(items) {
    this.selectedPeersCompetencyList = items;
  }
  onSelectPeersCompetency(item) {
    this.selectedPeersCompetencyList.push(item)
  }

  onSelectAllDirectReporteeCompetency(items) {
    this.seletedDirectReporteeCompetencyList.push(items)
  }

  onSelectDirectReporteeCompetency(item) {
    this.seletedDirectReporteeCompetencyList.push(item)
  }
  onDeSelectDirectReporteeCompetency(item) {
    var _position = this.seletedDirectReporteeCompetencyList.indexOf(item);
    this.seletedDirectReporteeCompetencyList.splice(_position, 1);

  }
  onDeSelectAllDirectReporteeCompetency(items) {
    this.seletedDirectReporteeCompetencyList = []
  }

  public directReporteesOfEmpGridOptions: GridOptions = {
    columnDefs: this.getDirectReporteeGridCols(),
    api: new GridApi()
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
    
    var _position = this.selectedEmployee.DirectReportees.findIndex(x=>x.EmployeeId===item.EmployeeId);
    this.selectedEmployee.DirectReportees.splice(_position, 1);
    this.directReporteesOfEmpGridOptions.api.setRowData(this.selectedEmployee.DirectReportees)
  }
  onDeSelectAllDirectReportee(items) {
    debugger
    this.selectedEmployee.DirectReportees = []
    this.directReporteesOfEmpGridOptions.api.setRowData([])

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
     debugger
      if (params['allKpi']) {
       this.allKpi = params['allKpi'];
       this.initializeFormFor=this.allKpi?'evaluation':'kpionly'
      }
      if(params["list"]){
        this.kpiSelectedEmployees=params["list"].split(',')
      }
      this.initForm();
      this.getEmployees();
      this.getModels();  
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
      this.perfApp.requestBody = { company: this.currentOrganization._id,allKpi:this.allKpi }
    this.perfApp.CallAPI().subscribe(c => {
      console.log('employeed data', c);
      
      if (c && c.IsSuccess && c.Data && c.Data.length > 0) {
        if(this.kpiSelectedEmployees.length>0){
        var gi=[]
          this.kpiSelectedEmployees.forEach(element => {
            gi.push(c.Data.find(x=>x._id===element) ) 
            
          });
          this.employeesList$=[...gi]
          this.employeesList$.map(x => {
            debugger
            var _f = Object.assign({}, x);
            this.selectedEmployees.push(_f);
            x.displayTemplate = `${x.FirstName}-${x.LastName}-${x.Email}`,
              x.row = _f;
          });
          this.selectedEmployeesForEvaluation = [...this.employeesList$]
        }else{
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
        debugger
        this.peersList = c;
        console.log('formated peers data', this.formattedPeers);
      }
      this.selectePeersViewRef = this.modalService.show(this.selectePeersView, this.config);
    })
  }
  submitEvaluation() {
    this.isFormSubmitted = true;
    debugger
    if (this.evaluationForm.invalid)
      return;
    const _evform = this.evaluationForm.value;


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
      console.log('added evaluation', x)
      this.notification.success('Evaluation Created Successfully.')
      this.router.navigate(['ea/evaluation-list'])
    }, error => {

      console.log('error while adding eval', error)
      this.notification.error(error.error.message)
    })

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
      debugger
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
      debugger
      var clonedArray2 = c.map((_arrayElement) => Object.assign({}, _arrayElement));
      this.peersCompetencyList = clonedArray2;
      this.disabledAddButton = false;
    }, error => {
      debugger
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
    debugger
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
      debugger
      console.log('draft evaluation', x)
      this.notification.success('Evaluation Form Saved Successfully.')
      this.router.navigate(['ea/evaluation-list'])
    }, error => {
      debugger
      console.log('error while saving form', error)
      this.notification.error(error.error.message)
    })

  }




  /**Code refactoring starts from here */
  /**For Grid */
  public onEmpRowClicked(e) {
    debugger
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
    debugger
    var _index = this.selectedEmployees.indexOf(this.selectedEmployee);
    this.selectedEmployees.splice(_index, 1)
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
  public currentPeerCompetencyList: any = [];
  openPeersView() {
    debugger
    if (this.selectedEmployee.Peers) {
      this.PeersCompetencyMessage = this.selectedEmployee.Peers[0].PeersCompetencyMessage;
      this.selectedEmployeePeers = this.selectedEmployee.Peers || [];
      this.currentPeerCompetencyList = this.selectedEmployee.Peers[0].PeersCompetencyList;
    }
    this.getPeersForEmployees();

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
        headerName: 'Model', field: '', sortable: true, filter: true,
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
        headerName: 'Manager', field: '', sortable: true, filter: true,
        cellRenderer: (data) => {
          var _name = data.data.Manager ? data.data.Manager.FirstName : ""
          return `${_name}`
        },
      },

      {
        headerName: 'Peers', field: '', sortable: false, filter: false,
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
    debugger
    this.directReporteeCompetencyMessage = this.selectedEmployee.DirectReporteeComptencyMessage;
    this.selectedEmployeeDirectReportees = this.selectedEmployee.DirectReportees || [];
    this.seletedDirectReporteeCompetencyList = this.selectedEmployee.DirectReportsCompetency;
    if (this.selectedEmployeeDirectReportees.length > 0 && this.directReporteesOfEmpGridOptions.api) {
      this.directReporteesOfEmpGridOptions.api.setRowData(this.selectedEmployeeDirectReportees);
    }
    this.getDirectReportees();
  }
  closeDrModel() {
    this.selecteDirectReporteeViewRef.hide();
    this.selectedEmployee = {};
    this.currentEmployeeSelectedDirectReportees = [];
    this.selectedEmployeeDirectReportees = []
  }
  getDirectReporteeGridCols() {
    return [
      {
        headerName: 'Direct Report(s)', sortable: true, filter: true,
        cellRenderer: (data) => {
          return `<span style="color:blue;cursor:pointer" data-action-type="">
        ${data.data.displayTemplate}</span>`
        }
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
    if (!this.selectedEmployee.DirectReportees || this.selectedEmployee.DirectReportees.length < 2) {
      this.notification.error('Please select minimum two Ditrct Reportee');
      return;
    }
    if (this.seletedDirectReporteeCompetencyList.length === 0) {
      this.notification.error('Please select at least 1 Competency');
      return;
    }
    
    debugger
    this.selectedEmployee.DirectReporteeComptencyMessage = this.directReporteeCompetencyMessage;
    this.selectedEmployee.DirectReportsCompetency = this.seletedDirectReporteeCompetencyList;

    this.selectedEmployee.DirectReportees.map(element => {
      element.DirectReporteeComptencyMessage = this.directReporteeCompetencyMessage;
      element.DirectReporteeCompetencyList = this.directReporteeCompetencyList;
    });
    this.EmpGridOptions.api.refreshCells(this.gridRefreshParams)


    this.closeDrModel();
  }



  addToGrid() {
    debugger
    if (this.selectedEmployees.length === 0) {
      this.notification.error('Please select Employee(s)')
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
    //this.selectedEmployeeList.push(...this.selectedEmployees);
    if (this.EmpGridOptions.api) {
      this.EmpGridOptions.api.setRowData(this.selectedEmployeeList);
    }
    this.selectedEmployees = [];
    this.disabledAddButton = true;
  }

  addToGridForKPI() {
    debugger
    if (this.selectedEmployees.length === 0) {
      this.notification.error('Please select Employee(s)')
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
      this.notification.success('Evaluation Created Successfully.')
      this.router.navigate(['ea/evaluation-list'])
    }, error => {
      console.log('error while adding eval', error)
      this.notification.error(error.error.message)
    })


  }
}
