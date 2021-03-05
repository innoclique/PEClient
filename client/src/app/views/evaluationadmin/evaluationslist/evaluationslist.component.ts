import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GridApi, GridOptions } from 'ag-grid-community';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from '../../../services/auth.service';
import { startWith, map } from 'rxjs/operators';
import { NotificationService } from '../../../services/notification.service';
import { PerfAppService } from '../../../services/perf-app.service';
import ReportTemplates from'../../../views/psa/reports/data/reports-templates';
import { AlertDialog } from '../../../Models/AlertDialog';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { ThemeService } from '../../../services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomValidators } from '../../../shared/custom-validators';
import { Constants } from '../../../shared/AppConstants';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-evaluationslist',
  templateUrl: './evaluationslist.component.html',
  styleUrls: ['./evaluationslist.component.css']
})
export class EvaluationslistComponent implements OnInit {
 
  jobLevels: any;
  filteredOptions: Observable<any[]>;
  filteredOptionsTS: Observable<any[]>;
  filteredOptionsDR: Observable<any[]>;
  jobRoles=[];
  departments=[];
  loginUser: any;
  appRoles: any=[];
  public empForm: FormGroup;
  empDetails: any={IsActive:'true'}
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
  // currentOrganization: any;
  evaluationForm: any;
  isCreate: Boolean;
  employeesList$: any = [];
  currentAction='create';
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
  selectedEmployeeDirectReporteeMappings:any = [];
  peerCompetencyMappingRowdata:any = [];
  drCompetencyUIMapping:any = {};
  drCompetencyMappingRowdata:any = [];
  competencyMappingRowdata: any;
  isViewCompetencies: boolean = false;
  submitClicked=false;
  kpiList: any = [];
  gridRefreshParams = {
    force: true,
    suppressFlash: false
  };
  peersListData=[];
  
 
  
  cscData:any=undefined;


  

  
  countyFormReset: boolean;
  isRoleChanged: boolean;
 
  isDraftEmployee: boolean;
  
 
public currentOrganization:any={}

  show=false;
  public peerCompetencyUIMapping: any = {};
 
  public monthList = ["","January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"]
  constructor(
    private formBuilder: FormBuilder,
    private perfApp: PerfAppService,
    private notification: NotificationService,
    private modalService: BsModalService,
    public authService: AuthService,
    public router: Router,
    public dialog: MatDialog,
    public activatedRoute: ActivatedRoute,private fb: FormBuilder,
    
    private route: ActivatedRoute,
  
    public themeService: ThemeService,
    
    private snack: NotificationService,
    public translate: TranslateService,
     
   ) {


  }
  public employeeData :any
  public employeeDropDownData :any[]=[]
  public employeeThirdSigData :any[]=[]
  public employeeDirReportData :any[]=[]

  get f(){
    return this.empForm.controls;
  }
  
  ngOnInit(): void {
    this.alert = new AlertDialog();
    
    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
    this.getEvaluationList();
    this.getAllDepartments();
    //    this.getIndustries();
    this.initEmpForm()
    this.getEmployees();
    this.getManagersEmps();
    this.currentOrganization = this.authService.getOrganization();
    this.loginUser=this.authService.getCurrentUser();
    this.getEmployees();
    
    this.getThirdSignatoryEmps();
   this.getAllDepartments();

 

   this.alert = new AlertDialog();
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
  public EmpGridOptions: GridOptions = {
    columnDefs: this.getGridColumnsForEmp(),
    api: new GridApi()
  }
  public rowSelection = 'multiple';
  public isRowSelectable(rowNode) {
    return  rowNode.data ? rowNode.data.Type ==='K'?true:false:false
  }
  public getRowNodeId (data) {    
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
  getGridColumnsForEmpKpi() {
    return [
      {
        headerName: 'Employee', suppressSizeToFit:true, sortable: true, filter: true,

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
  
  getGridColumnsForEmp() {
    return [
      {
        headerName: 'Employee',checkboxSelection: true, sortable: true, width:180, wrapText: true, autoHeight: true, filter: true,
        // checkboxSelection: true,
        cellRenderer: (data) => {
          
          if (data.data.Type == "K") {
            return `  
           ${data.data.Employee.FirstName}-${data.data.Employee.LastName}`
          } else {
            return `  <input   data-action-type="orgView" title="Evaluation for the employee has already been rolled-out." type="checkbox" disabled  >
            ${data.data.Employee.FirstName}-${data.data.Employee.LastName}`
          }

          //return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.data.Employee.FirstName}-${data.data.Employee.LastName}</span>` 
        }
      },
      {
        headerName: 'Evaluation Released On', sortable: true, width:150, wrapText: true, autoHeight: true, filter: true,
        cellRenderer: (data) => {
          if (!data.data.Type) {
            if (this.getNested(data.data.EvaluationRow, 'CreatedDate')) // true
            return new DatePipe('en-US').transform(data.data.EvaluationRow.CreatedDate, 'MM-dd-yyyy')
          }else{
            return `N/A`;
          }
          
        }
      },
      {
        headerName: 'Performance Goals Released On', sortable: true, width:150, wrapText: true, autoHeight: true, filter: true,
        cellRenderer: (data) => {
          if (data.data.Type === "K") {
            if (this.getNested(data.data.EvaluationRow, 'CreatedDate')) // true
            return new DatePipe('en-US').transform(data.data.EvaluationRow.CreatedDate, 'MM-dd-yyyy')
          }else if(data.data.EvaluationRow.kpiFormCreatedOn){
            return new DatePipe('en-US').transform(data.data.EvaluationRow.kpiFormCreatedOn, 'MM-dd-yyyy')
          }else if (!data.data.Type) {
            if (this.getNested(data.data.EvaluationRow, 'CreatedDate')) // true
            return new DatePipe('en-US').transform(data.data.EvaluationRow.CreatedDate, 'MM-dd-yyyy')
          }else{
            return `N/A`;
          }
          
        }
      },
      // {
      //   headerName: 'Type', sortable: true, width:100,wrapText: true, autoHeight: true,  filter: true,
      //   cellRenderer: (data) => { return "Regular" }
      // },
      {
        headerName: 'Evaluation Period', sortable: true, width:180, wrapText: true, autoHeight: true, filter: true,
        cellRenderer: (data) => {
          if (this.getNested(data.data.EvaluationRow, 'EvaluationPeriod')) // true
            return this.getEVPeriod(data.data.EvaluationRow);
            else{
              return `N/A`;
            }
        }
      },
      {
        headerName: 'Evaluation Duration', sortable: true, width:180,wrapText: true, autoHeight: true,  filter: true,
        cellRenderer: (data) => {
          if (this.getNested(data.data.EvaluationRow, 'EvaluationDuration')) {
            return data.data.EvaluationRow.EvaluationDuration
          }else{
            return `N/A`;
          }
        }
      },
      {
        headerName: 'Model', field: '', sortable: true, width:100,wrapText: true, autoHeight: true,  filter: true,
        cellRenderer: (data) => {
          if (this.getNested(data.data.EmployeeRow, 'Model', 'Name')) {
            return data.data.EmployeeRow.Model.Name
          }else{
            return `N/A`;
          }
        }
      },
      {
        headerName: 'Manager', field: '', sortable: true, width:120, wrapText: true, autoHeight: true, filter: true,
        cellRenderer: (data) => {
          if (this.getNested(data.data.Employee, 'Manager', 'FirstName')) {
            return `${data.data.Employee.Manager.FirstName} ${data.data.Employee.Manager.LastName}`
          }else{
            return `N/A`;
          }
        }

      },

      {
        headerName: 'Peers', field: '', sortable: false, width:100, wrapText: true, autoHeight: true,  filter: false,
        cellRenderer: (data) => {
          
          if (this.getNested(data.data.EmployeeRow, 'Peers')){
            return `<span style="color:blue;cursor:pointer;" data-action-type="choosePeers">${data.data.EmployeeRow.peerCompetenceMapping.length}</span>`
          }else{
            return 'N/A';
          }
          
        }
      },
      {
        headerName: 'Direct Report(s)', field: '', width:180, wrapText: true, autoHeight: true,sortable: false, filter: false,
        
        cellRenderer: (data) => {
          if (this.getNested(data.data.EmployeeRow, 'DirectReportees')){
            return `<span style="color:blue;cursor:pointer;" data-action-type="chooseDirectReports">${data.data.EmployeeRow.drCompetenceMapping.length}</span>`
          }else{
            return 'N/A';
          }
          
        }
      },

       {
         headerName: "Review/Modify",
         width:130,
         suppressMenu: true,
         Sorting: false,
         cellRenderer: (data) => {
           

           return `<i class="icon-pencil" style="cursor:pointer ;padding: 7px 20px 0 0;
             font-size: 17px;"   data-action-type="changeModel" title="Change Model"></i>
             `
           }
         }
       
    ];

  }

  gotoCreateEvaluation() {
    var selectedRows = this.EmpGridOptions.api.getSelectedRows();
    //debugger
    this.router.navigate(['ea/rollout', { allKpi: selectedRows.length>0,list:selectedRows.map(x=>x.Employee._id) }], { skipLocationChange: true });
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
          if(row.Type==='K'){
            if(row.Employee[0].HasActiveEvaluation!=='Yes'){
            this.selectedEmployeesList.push({
              Type:row.Type,
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
          
        }else{
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
      console.table(this.selectedEmployeesList)
      this.EmpGridOptions.api.setRowData(this.selectedEmployeeList);
    })
  }

  onEmpGridReady(params) {
    //debugger
    this.EmpGridOptions.api = params.api; // To access the grids API
    // params.api.sizeColumnsToFit();
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
          return this.changeModel(data);

      }
    }
  }
  changeModel(data:any) {
    var selectedRows = this.EmpGridOptions.api.getSelectedRows();
    let selectedEvaluation={};
    selectedEvaluation['EvaluationRow'] = data.EvaluationRow;
    selectedEvaluation['Manager']=data.EmployeeRow.Manager;
    selectedEvaluation['empId']=data.EmployeeRow._id._id;
    this.router.navigate(['ea/rollout', {editEvaluation:JSON.stringify(selectedEvaluation), rollEvaluationEdit:true,allKpi: selectedRows.length>0,list:selectedRows.map(x=>x.Employee._id) }], { skipLocationChange: true });
    }
  openDirectReporteesView() {
    //debugger
    
      // this.directReporteeCompetencyMessage = this.selectedEmployee.DirectReportees[0].DirectReporteeComptencyMessage;
      // this.selectedEmployeeDirectReportees = this.selectedEmployee.DirectReportees || [];
      this.selectedEmployeeDirectReporteeMappings = this.selectedEmployee.DirectReportees || [];
      this.directReporteeCompetencyMessage = "";
      this.selectedEmployeeDirectReportees = [];
      this.selectedEmployee.DirectReportees = [];
      this.currentEmployeeSelectedDirectReportees = [];
      this.seletedDirectReporteeCompetencyList = [];
      this.directReporteeCompetencyMessage = "";
      this.drCompetencyMappingRowdata = [];
      this.drCompetencyUIMapping = {};
      this.drCompetencyMappingRowdata = this.selectedEmployee.EmployeeRow.drCompetenceMapping;
       if (this.selectedEmployee.EmployeeRow.drCompetenceMapping && this.selectedEmployee.EmployeeRow.drCompetenceMapping.length > 0) {
      for(let mapping of this.drCompetencyMappingRowdata){
        this.drCompetencyUIMapping[mapping.directReportee.EmployeeId] = mapping;
      }
     }
    this.selectedModel = this.selectedEmployee.Model;
    this.getDirectReportees();
    this.getCompetencyList();
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
        //debugger
        this.peersList = c;
        
      }
      this.selectePeersViewRef = this.modalService.show(this.selectePeersView, this.config);
    })
  }

  openPeerView() {
    if (this.selectedEmployee.EmployeeRow.peerCompetenceMapping) {
      this.peerCompetencyMappingRowdata = [];
      this.selectedEmployee.Peers=[];
      this.PeersCompetencyMessage = "";
      this.selectedEmployeePeers = [];
      this.currentPeerCompetencyList = [];
      this.selectedPeersCompetencyList = [];
      this.peerCompetencyMappingRowdata = this.selectedEmployee.EmployeeRow.peerCompetenceMapping;
      for(let mapping of this.peerCompetencyMappingRowdata){
        this.peerCompetencyUIMapping[mapping.peer.EmployeeId] = mapping;
      }
    }
    // this.PeersCompetencyMessage = this.selectedEmployee.Peers[0] ? this.selectedEmployee.Peers[0].PeersCompetencyMessage : "";
    // this.selectedEmployeePeers = this.selectedEmployee.Peers || [];
    //  this.currentPeerCompetencyList = this.selectedEmployee.Peers[0].PeersCompetencyList;

    //this.PeersCompetencyMessage = this.selectedEmployee.PeersCompetencyMessage;      
    //this.selectedEmployeePeers = this.selectedEmployee.Peers||[];    

    this.selectedModel = this.selectedEmployee.Model;
    // this.currentPeerCompetencyList = this.selectedEmployee.Peers[0] ? this.selectedEmployee.Peers[0].PeersCompetencyList : [];

    this.getPeersForEmployees();
    this.getCompetencyList();
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
      var newdata=rowNode.data;
      newdata.Peers=this.selectedEmployee.Peers;
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

    // this.setEmployeeIds();
    //this.setModelIds();
    //this.currentEvaluationForm.Employees=this.evaluationForm.value.Employees;
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
        cellRenderer: (data) => {return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.data.peer.displayTemplate}</span>` }
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
          //}
        }
      }
      // {
      //   headerName: 'Peer', sortable: true,width:300, filter: true, suppressSizeToFit: true, 
      //   cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.data.displayTemplate}</span>` }
      // },

      // {
      //   headerName: "Review/Modify",
      //   // suppressMenu: true,
      //   // suppressSizeToFit: true, 
      //   Sorting: false,
      //   cellRenderer: (data) => {
      //     console.log('column data', data)
      //     return `<i class="icon-ban" style="cursor:pointer ;padding: 7px 20px 0 0;
      //     font-size: 17px;"   data-action-type="deletePeer" title="Delete Peer"></i> `
      //     //}
      //   }
      // }
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
        cellRenderer: (data) => {return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.data.directReportee.displayTemplate}</span>` }
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
    // return [
    //   {
    //     headerName: 'Direct Report(s)', sortable: true, filter: true,
    //     cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="">${data.data.displayTemplate}</span>` }
    //   },

    //   {
    //     headerName: "Review/Modify",
    //     suppressMenu: true,
    //     Sorting: false,
    //     cellRenderer: (data) => {
    //       console.log('column data', data)
    //       return `<i class="icon-ban" style="cursor:pointer ;padding: 7px 20px 0 0;
    //       font-size: 17px;"   data-action-type="deleteDirectReportee" title="Delete Reportee"></i> `
    //       //}
    //     }
    //   }
    // ];

  }
  onDirectReporteeGridReady(params) {
    //debugger
    this.directReporteesOfEmpGridOptions.api = params.api;
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
   
    //debugger
    // this.selectedEmployee.DirectReporteeComptencyMessage = this.directReporteeCompetencyMessage;
    // this.selectedEmployee.DirectReportsCompetency = this.seletedDirectReporteeCompetencyList;
    // this.selectedEmployee.DirectReportees.map(element => {
    //   element.DirectReporteeComptencyMessage = this.directReporteeCompetencyMessage;
    //   element.DirectReporteeCompetencyList = this.seletedDirectReporteeCompetencyList;
    // });
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
        // this.selectedEmployees.find(x => x._id === this.selectedEmployee._id).DirectReportees = this.selectedEmployee.DirectReportees;
        // this.selectedEmployees.find(x => x._id === this.selectedEmployee._id).DirectReporteeComptencyMessage = this.directReporteeCompetencyMessage;
        // this.selectedEmployees.find(x => x._id === this.selectedEmployee._id).DirectReporteeCompetencyList = this.directReporteeCompetencyList;
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
    //var _f=  Object.assign({}, item.row);
    this.selectedEmployee.Peers.push(item);
    // if (this.peersForEmpGridOptions.api) {
    //   this.peersForEmpGridOptions.api.setRowData(this.selectedEmployee.Peers);
    // }
  }
  onSelectAllPeers(items: any) {
    //debugger
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
    if (this.peersForEmpGridOptions.api) {
      this.peersForEmpGridOptions.api.setRowData(this.selectedEmployee.Peers);
    }
  }

  public getRowHeight = function (params) {
    return 34;
  };

  deletePeer() {
    // var _p = this.selectedEmployee.Peers.indexOf(this.currentPeer);
    // this.selectedEmployee.Peers.splice(_p, 1);
    // if (this.peersForEmpGridOptions.api) {
    //   this.peersForEmpGridOptions.api.setRowData(this.selectedEmployee.Peers);
    // }
    // this.selectedEmployeePeers = [...this.selectedEmployee.Peers]

    var _p = this.peerCompetencyMappingRowdata.indexOf(this.currentPeer);
    this.peerCompetencyMappingRowdata.splice(_p, 1);
    if (this.peersForEmpGridOptions.api) {
      this.peersForEmpGridOptions.api.setRowData(this.peerCompetencyMappingRowdata);
    }
    
  }

  populateCompetencies(){
    // var _p = this.selectedEmployee.Peers.indexOf(this.currentPeer);
    // this.selectedEmployee.Peers.splice(_p, 1);
    // if (this.peersForEmpGridOptions.api) {
    //   this.peersForEmpGridOptions.api.setRowData(this.selectedEmployee.Peers);
    // }
    this.currentPeerCompetencyList = this.currentPeer.peerCompetenceMapping.competencies;
    this.competencyDropdownSettings.itemsShowLimit =this.currentPeer.peerCompetenceMapping.competencies.length;
 }

  onPeerDeSelect(item: any) {    
    var _position = this.selectedEmployee.Peers.findIndex(x=>x.EmployeeId===item.EmployeeId);
    this.selectedEmployee.Peers.splice(_position, 1);
    // this.peersForEmpGridOptions.api.setRowData(this.selectedEmployee.Peers);
  }
  onDeSelectAllPeers(items: any) {
    this.selectedEmployees.Peers = [];
    // this.peersForEmpGridOptions.api.setRowData(this.selectedEmployee.Peers);
  }

  onPeerCompetencyDeSelect(item){
    var _position = this.selectedPeersCompetencyList.indexOf(item);
    this.selectedPeersCompetencyList.splice(_position, 1);
  }
  onDeSelectAllPeerCompetencies(items){
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
    this.selectedEmployeePeers =[];
    this.currentPeerCompetencyList =[];
    this.selectedPeersCompetencyList = [];
    this.PeersCompetencyMessage = "";
    var rowData: any = [];
    for (let mapping in this.peerCompetencyUIMapping) {
      
      rowData.push({
        peer: this.peerCompetencyUIMapping[mapping].peer,
        competencies: this.peerCompetencyUIMapping[mapping].competencies,
        message:this.peerCompetencyUIMapping[mapping].message
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
  savePeers() {
    //debugger
    // if (this.currentPeerCompetencyList.length === 0) {
    //   this.notification.error('Please select at least one  Competency');
    //   return;
    // }
    // if (!this.selectedEmployee.Peers || this.selectedEmployee.Peers.length < 2) {
    //   this.notification.error('Peers should be minimum two members');
    //   return;
    // }
    // this.selectedEmployee.PeersCompetencyMessage = this.PeersCompetencyMessage;
    // this.selectedEmployee.PeersPeersCompetencyList = this.currentPeerCompetencyList;


    // this.selectedEmployee.Peers.map(element => {
    //   element.PeersCompetencyMessage = this.PeersCompetencyMessage;
    //   element.PeersCompetencyList = this.currentPeerCompetencyList;
    // });

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
    // if (this.directReporteesOfEmpGridOptions.api) {
    //   //debugger
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
    
    // if (this.directReporteesOfEmpGridOptions.api) {
    //   this.directReporteesOfEmpGridOptions.api.setRowData(this.selectedEmployee.DirectReportees)
    // }
  }

  onDirectReporteeDeSelect(item: any) {
    //debugger
    var _position = this.selectedEmployee.DirectReportees.findIndex(x=>x.EmployeeId===item.EmployeeId);   
    this.selectedEmployee.DirectReportees.splice(_position, 1);
    // this.directReporteesOfEmpGridOptions.api.setRowData(this.selectedEmployee.DirectReportees)
  }
  onDeSelectAllDirectReportee(items) {
    //debugger
    this.selectedEmployee.DirectReportees = []
    // this.directReporteesOfEmpGridOptions.api.setRowData([])

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
  
  getEVPeriod(evRow){
    return ReportTemplates.getEvaluationPeriod(this.currentOrganization.StartMonth, this.currentOrganization.EndMonth);
    // let year= new Date (evRow.CreatedDate);
    // if (this.currentOrganization.EvaluationPeriod === 'FiscalYear') {
    // return `${this.monthList[ this.currentOrganization.StartMonth].substring(0, 3) }'${year.getFullYear().toString().substring(2)} To ${this.currentOrganization.EndMonth.substring(0, 3)}' 
    // ${this.currentOrganization.StartMonth=='1' ? year.getFullYear().toString().substring(2) :(year.getFullYear()+1).toString().substring(2)}`
    // }else{
    //   return `${this.monthList[ this.currentOrganization.StartMonth].substring(0, 3) }'${year.getFullYear().toString().substring(2)} To ${this.currentOrganization.EndMonth.substring(0, 3)}'${year.getFullYear().toString().substring(2)}`

    // }
  }

   myFunction() {
    var x = document.getElementById("myDIV");
  
      x.style.display = "block";
    
   
  }

  onCancle(){
    var x = document.getElementById("myDIV");
    
      x.style.display = "none";
   
    
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

  
  onDepartmentChange(event){

    var depts= this.departments.filter(f=>f.DeptName== event.target.value)[0];
 this.jobRoles=depts.JobRoles;
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
   
  
}
