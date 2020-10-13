import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GridApi, GridOptions } from 'ag-grid-community';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from '../../../services/auth.service';

import { NotificationService } from '../../../services/notification.service';
import { PerfAppService } from '../../../services/perf-app.service';
import { noop, Observable, Observer, of, Subscription } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';


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
  enablePeersRating: boolean = false;
  enableDirectReport: boolean = false;
  employeesList$: any[];
  peersList: any[];
  directReportees: any[];
  evaluationPeriods: any[];
  evaluationDuration: any[];
  peersCompetency: any[];
  directReporteeCompetency: any[];
  public currentOrganization: any;
  currentUser: any;
  departments: any[];
  kpiForList: string[] = ['Employee', 'Manager', 'EA'];
  modelsList: any[];
  competencyList: any[];
  config = {
    backdrop: true,
    ignoreBackdropClick: true,

  };
  selectePeersViewRef: BsModalRef;
  @ViewChild('selectePeersView') selectePeersView: TemplateRef<any>;
  @ViewChild('selecteDirectReporteeView') selecteDirectReporteeView: TemplateRef<any>;
  selecteDirectReporteeViewRef: BsModalRef;
  public isCreate:Boolean=true;
  constructor(private formBuilder: FormBuilder,
    private perfApp: PerfAppService,
    private notification: NotificationService,
    private modalService: BsModalService,
    public authService: AuthService,
    public router: Router,
    public activatedRoute: ActivatedRoute) {

  }
  subscription: Subscription = new Subscription();
  
  currentEvaluationForm:any={};
  ngOnInit(): void {
    this.subscription.add(this.activatedRoute.params.subscribe(params => {
      debugger
      if(params['id']){
        debugger
        this.isCreate=false;   
        this.currentEvaluationForm.id = params['id'];
      this.getEvaluationFormData();
         
      }else{
        this.isCreate=true;
      }

    }));

    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
    this.initForm();
    this.getEmployees();
    this.getModels();
    this.getCompetencyList();
    this.getPeersForEmp();
    this.getDirectReportees();
  }
  getEvaluationFormData(){
    this.perfApp.route = "evaluation";
    this.perfApp.method = "GetEvaluationFormById",
      this.perfApp.requestBody = { id: this.currentEvaluationForm.id }; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
      this.currentEvaluationForm = c;
      console.info('currentEvaluationForm record', c);
      //this.setValues(this.clientForm, c);
      //this.models=c.EvaluationModels
      this.selectedEmployees=c.Employees.map(x=>x._id)
      if(this.EmpGridOptions.api){
      this.EmpGridOptions.api.setRowData(this.selectedEmployees);
      }
    }, error => {
      this.notification.error('something went wrong')
      console.error(error);

      //this.notification.error(error.error.message)
    });
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
  getEmployees() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllEmployees",
      this.perfApp.requestBody = { 'parentId': this.currentUser.ParentUser ? this.currentUser.ParentUser : this.currentUser._id }
    this.perfApp.CallAPI().subscribe(c => {
      console.log('employeed data', c);
      if (c && c.length > 0) {
        this.employeesList$ = c
        var clonedArray = c.map((_arrayElement) => Object.assign({}, _arrayElement));
        console.log(clonedArray);
        this.peersList = clonedArray;
        clonedArray = [];
        clonedArray = c.map((_arrayElement) => Object.assign({}, _arrayElement));
        console.log(clonedArray);
        this.directReportees = clonedArray;
      }
    })
  }
  submitEvaluation() {
    this.isFormSubmitted = true;
    debugger
    if (this.evaluationForm.invalid)
      return;
    const _evform = this.evaluationForm.value;
    if (_evform.PeerRatingNeeded && _evform.Peers.length < 2) {
      this.notification.error('at least 2 peers needed to submit evalution')
      return false;
    }

    if (_evform.DirectReportRateNeeded && _evform.DirectReports.length < 2) {
      this.notification.error('at least 2 Direct Reports needed to submit evalution')
      return false;
    }

    this.evaluationForm.value.CreatedBy = this.currentUser._id;
    this.evaluationForm.value.Company = this.currentOrganization._id;

   // this.setEmployeeIds();
    //this.setModelIds();
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
    this.perfApp.route = "shared";
    this.perfApp.method = "GetCompetencyList",
      this.perfApp.requestBody = { id: this.currentOrganization._id, modelId: this.evaluationForm.controls["Model"].value }; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
      this.competencyList = c;
     var clonedArray = [];
        clonedArray = c.map((_arrayElement) => Object.assign({}, _arrayElement));
      this.directReporteeCompetencyList=clonedArray;
      debugger
     var clonedArray2 = c.map((_arrayElement) => Object.assign({}, _arrayElement));
      this.PeersCompetencyList=clonedArray2;
      
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

  setEmployeeIds() {
    var _curArray = this.evaluationForm.value.Employees
    console.log('mappppppppp', _curArray.map(x => { return { _id: x } }))
    this.evaluationForm.value.Employees = _curArray.map(x => { return { _id: x } });
    console.log('after settings ids', this.evaluationForm.value.Employees)
  }
  selectAllEmployees(ev) {debugger
    if (ev.checked) {
      this.selectedEmployees=[];
      this.evaluationForm.controls['Employees'].setValue(this.employeesList$);
      this.employeesList$.map(x=>{
        
        x.selected = true;
        this.selectedEmployees.push(x);
      });    
    }
    else {
      this.evaluationForm.controls['Employees'].setValue([]);
      this.selectedEmployees=[];
      this.employeesList$.map(x=>x.selected=false);

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


  //#region  Multi_Select_Employee 

  public selectedEmployees: any = [];
  public selectedEmployee: any;

  getSelectedOptions(selected) {
    this.selectedEmployees = selected;
  }

  onResetSelection() {
    this.selectedEmployees = [];
  }

  empselectedCount = "";
  displayFn(value: any[] | string): string | undefined {
    return "";
    // let displayValue: string;
    // if (Array.isArray(value)) {
    //   if (value.length === 0) {
    //     displayValue = "";
    //   } else {
    //     displayValue = "";
    //     this.empselectedCount = value.length + "  record (s) selected";;
    //   }
    // } else {
    //   displayValue = value;
    // }
    // return displayValue;
  }

  optionClicked(event: Event, user: any) {
    event.stopPropagation();
    this.toggleSelection(user);
  }

  toggleSelection(user: any) {
    debugger
    user.selected = !user.selected;
    if (user.selected) {
      this.selectedEmployees.push(user);
    } else {
      const i = this.selectedEmployees.findIndex(value => value.FirstName === user.FirstName && value.LastName === user.LastName);
      this.selectedEmployees.splice(i, 1);
    }

    this.evaluationForm.controls["Employees"].setValue(this.selectedEmployees);
    if(this.EmpGridOptions.api){
    this.EmpGridOptions.api.setRowData(this.selectedEmployees);
    }
  }
  onEmpGridReady(params) {
    this.EmpGridOptions.api = params.api; // To access the grids API
  }



  //#endregion

  //#region  Multi_Select_Peers








  currentEmployeeForPeers: any;



  //#endregion


  public empFilterList: any=[]
  
  public filterOption(filter: string): void {  
    if(!this.isCreate)  {
      return;
    }
    this.empFilterList = this.employeesList$.filter(x => x.FirstName.toLowerCase().includes(filter.toLowerCase()));
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
          return this.selectPeersForEmployee();
         case "deleteEmp":
        return this.deleteEmpFromList();
      }
    }
  }
public deleteEmpFromList(){  
  var _index=this.selectedEmployees.indexOf(this.selectedEmployee);
  this.selectedEmployees.splice(_index,1)
  this.EmpGridOptions.api.setRowData(this.selectedEmployees);
  _index=this.empFilterList.indexOf(this.selectedEmployee);  
  this.empFilterList[_index].selected=false;

}
  public EmpGridOptions: GridOptions = {
    columnDefs: this.getGridColumnsForEmp(),
    api:new GridApi()
  }


  //#region Peers Code Blocak

  currentPeer: any;
  PeersCompetencyList = [];
  PeersCompetencyMessage = "";
  peersSearch: "";
  selectedPeersOb: Observable<any[]>
  selectedPeersCompetencyList=[]
  getPeersForEmp() {
    this.selectedPeersOb = new Observable((observer: Observer<string>) => {
      observer.next(this.peersSearch);
    }).pipe(
      switchMap((query: string) => {
        if (query) {
          // using github public api to get users by name
          this.perfApp.route = "app";
          this.perfApp.method = "GetAllEmployees",
            this.perfApp.requestBody = { 'parentId': this.currentUser.ParentUser ? this.currentUser.ParentUser : this.currentUser._id }
          return this.perfApp.CallAPI()
            .pipe(
              map((data: any) => { return data || [] }),
              tap(() => noop, err => {
                // in case of http error

                this.errorMessage = err && err.message || 'Something goes wrong';
              })
            );
        } else {
          return of([]);
        }
      })
    );    
  }
  currentPeersList = []
  onPeerEmployeeSelect(value) {
    if(!this.isCreate){
this.currentPeersList.push(value);
this.selectedEmployees.find(x => x._id === this.selectedEmployee._id).Peers = this.currentPeersList
this.peersForEmpGridOptions.api.setRowData(this.currentPeersList);
    }else{    
    var ff = this.selectedEmployees.find(x => x._id === this.selectedEmployee._id);
    if (!ff.Peers) {
      ff.Peers = [];
    }
    ff.Peers.push(value)
    this.currentPeersList = ff.Peers;
    this.selectedEmployee.Peers = ff.Peers;;
    this.peersForEmpGridOptions.api.setRowData(this.currentPeersList);
    this.peersSearch = "";
    this.selectedEmployees.find(x => x._id === this.selectedEmployee._id).Peers = ff.Peers;
    this.selectedEmployees.find(x => x._id === this.selectedEmployee._id).PeersCompetencyMessage = this.PeersCompetencyMessage;
    this.selectedEmployees.find(x => x._id === this.selectedEmployee._id).PeersCompetencyList = this.PeersCompetencyList;
  }
  }
  public peersForEmpGridOptions: GridOptions = {
    columnDefs: this.getPeersForEmpCols(),
    api:new GridApi()
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
  selectPeersForEmployee() {
    debugger
    if(!this.isCreate && this.currentEvaluationForm ){
      var _empList=this.currentEvaluationForm.Employees;
      var _peers=_empList.find(x=>x._id._id===this.selectedEmployee._id).Peers;
      var _peersCompetencyMessage=_empList.find(x=>x._id._id===this.selectedEmployee._id).PeersCompetencyMessage;
      var _peersCompetencyList=_empList.find(x=>x._id._id===this.selectedEmployee._id).PeersCompetencyList;
      this.currentPeersList=_peers
      this.PeersCompetencyMessage=_peersCompetencyMessage;
      this.selectedPeersCompetencyList=_peersCompetencyList;
    }else{
      
    this.PeersCompetencyMessage=this.selectedEmployee.PeersCompetencyMessage;
    //this.PeersCompetencyList=this.selectedEmployee.PeersCompetencyList;
    this.currentPeersList=this.selectedEmployee.Peers;
    }
    this.selectePeersViewRef = this.modalService.show(this.selectePeersView, this.config);  
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
  deletePeer() {
    var _p = this.currentPeersList.indexOf(this.currentPeer);
    this.currentPeersList.splice(_p, 1);
    this.EmpGridOptions.api.setRowData(this.currentPeersList);
  }
  closePeersModel() {
    this.selectePeersViewRef.hide();
    this.selectedEmployee={};
    this.currentDirectReportees=[];
    this.selectedEmployees.find(x => x._id === this.selectedEmployee._id).Peers = this.selectedEmployee.DirectReportees;
    this.selectedEmployees.find(x => x._id === this.selectedEmployee._id).PeersCompetencyMessage = this.PeersCompetencyMessage;
    this.selectedEmployees.find(x => x._id === this.selectedEmployee._id).PeersCompetencyList = this.selectedPeersCompetencyList;
    
  }

  savePeers() {
    debugger
    if (this.PeersCompetencyList.length === 0) {
      this.notification.error('Please select at least one  Competency');
      return;
    }
    if (!this.selectedEmployee.Peers || this.selectedEmployee.Peers.length <2) {
      this.notification.error('Peers should be minimum two members');
      return;
    }
    this.selectedEmployee.PeersCompetencyMessage = this.PeersCompetencyMessage;
    this.selectedEmployee.PeersCompetencyList = this.selectedPeersCompetencyList;

    this.closePeersModel();
  }

  //#endregion

  directReporteeSearch: string;
  selectedDirectReporteeTypeHead: any;
  currentDirectReportees: any;
  currentDirectReportee: any;
  directReporteeCompetencyMessage: string = "";
  directReporteeCompetencyList = [];
  getGridColumnsForEmp() {
    return [
      {
        headerName: 'Employee', sortable: true, filter: true,
        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.data.FirstName}-${data.data.LastName}</span>` }
      },
      //  { headerName: 'Email', field: 'Email', sortable: true, filter: true },
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
          if(this.isCreate){
          return `<i class="icon-ban" style="cursor:pointer ;padding: 7px 20px 0 0;
            font-size: 17px;"   data-action-type="deleteEmp" title="Delete Employee"></i>
            `}else{
              return ``;
            }
        
          //}
        }
      }
    ];

  }
  public directReporteesOfEmpGridOptions: GridOptions = {
    columnDefs: this.getDirectReporteeGridCols()    
  }
  selectDirectReportees() {
    debugger
    if(!this.isCreate && this.currentEvaluationForm ){
      var _empList=this.currentEvaluationForm.Employees;
      var _drs=_empList.find(x=>x._id._id===this.selectedEmployee._id).DirectReportees;
      var _drCompetencyMessage=_empList.find(x=>x._id._id===this.selectedEmployee._id).directReporteeCompetencyMessage;
      var _drCompetencyList=_empList.find(x=>x._id._id===this.selectedEmployee._id).DirectReporteeCompetencyList;
      this.currentDirectReportees=_drs
      this.directReporteeCompetencyMessage=_drCompetencyMessage;
      this.selectedPeersCompetencyList=_drCompetencyList;
    }else{
    
    this.directReporteeCompetencyMessage = this.selectedEmployee.DirectReporteeComptencyMessage;
    this.currentDirectReportees=this.selectedEmployee.DirectReportees;
    }
    this.selecteDirectReporteeViewRef = this.modalService.show(this.selecteDirectReporteeView, this.config)
  }
  getDirectReportees() {
    this.selectedDirectReporteeTypeHead = new Observable((observer: Observer<string>) => {
      observer.next(this.directReporteeSearch);
    }).pipe(
      switchMap((query: string) => {
        if (query) {
          this.perfApp.route = "app";
          this.perfApp.method = "GetAllEmployees",
            this.perfApp.requestBody = { 'parentId': this.currentUser.ParentUser ? this.currentUser.ParentUser : this.currentUser._id }
          return this.perfApp.CallAPI()
            .pipe(
              map((data: any) => { ; return data || [] }),
              tap(() => noop, err => {                // in case of http error
                this.errorMessage = err && err.message || 'Something goes wrong';
              })
            );
        } else {
          return of([]);
        }
      })
    );
    debugger
  }
  onSelectDirectReportee(value) {    
    if(!this.isCreate){
      this.currentDirectReportees.push(value);
      this.selectedEmployees.find(x => x._id === this.selectedEmployee._id).DirectReportees = this.currentDirectReportees;  
      this.directReporteesOfEmpGridOptions.api.setRowData(this.currentDirectReportees);
    }else{
    var ff = this.selectedEmployees.find(x => x._id === this.selectedEmployee._id);
    if (!ff.DirectReportees) {
      ff.DirectReportees = [];
    }
    ff.DirectReportees.push(value)
    this.currentDirectReportees = ff.DirectReportees;
    this.selectedEmployee.DirectReportees = ff.DirectReportees;
    this.directReporteeSearch = "";
    if (this.directReporteesOfEmpGridOptions.api) {
      this.directReporteesOfEmpGridOptions.api.setRowData(this.currentDirectReportees);
  }
   
   debugger 
    this.selectedEmployees.find(x => x._id === this.selectedEmployee._id).DirectReportees = ff.DirectReportees;
    this.selectedEmployees.find(x => x._id === this.selectedEmployee._id).DirectReporteeComptencyMessage = this.directReporteeCompetencyMessage;
    this.selectedEmployees.find(x => x._id === this.selectedEmployee._id).DirectReporteeCompetencyList = this.directReporteeCompetencyList;
}
  }
  closeDrModel() {
    this.selecteDirectReporteeViewRef.hide();
    this.selectedEmployee={};
    this.currentDirectReportees=[];
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
      this.currentEmployeeForPeers = e.data;
      let actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "deleteDirectReportee":
          return this.deleteDirectReportee();
      }
    }
  }

  deleteDirectReportee() {
    var _p = this.currentDirectReportees.indexOf(this.currentDirectReportee);
    this.currentDirectReportees.splice(_p, 1);
    this.directReporteesOfEmpGridOptions.api.setRowData(this.currentDirectReportees);
  }
  saveDirectReportees() {
    if (this.directReporteeCompetencyList.length === 0) {
      this.notification.error('Please select at least 1 Competency');
      return;
    }
    if (!this.selectedEmployee.DirectReportees || this.selectedEmployee.DirectReportees.length <2) {
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
  public directReporteeSelectedCompetencyList=[];
  
updateEvaluation(){
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
}
