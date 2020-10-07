import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
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
  constructor(private formBuilder: FormBuilder,
    private perfApp: PerfAppService,
    private notification: NotificationService,
    private modalService: BsModalService,
    public authService: AuthService,
    public router: Router) {

  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
    this.initForm();
    this.getAllDepartments();
    this.disablePeerDirectReportes();

    this.getModels();
    this.getCompetencyList();
    debugger

  }
  initForm() {
    this.evaluationForm = this.formBuilder.group({
      Employees: [[], [Validators.required]],
      EvaluationPeriod: ['', []],
      EvaluationDuration: ['', []],
      Model: [null, [Validators.required]],
      PeerRatingNeeded: [false, [Validators.required]],
      Peers: [[], [Validators.required]],
      PeersCompetency: ['', [Validators.required]],
      PeersComptencyMessage: ['', []],
      DirectReportRateNeeded: [false, []],
      DirectReports: [[], []],
      DirectReportsCompetency: ['', [Validators.required]],
      DirectReportMessage: ['', []],
      ActivateKPI: [false, []],
      ActivateActionPlan: [false, []],
      Department: ['', [Validators.required]],
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
const _evform=this.evaluationForm.value;
      if(_evform.PeerRatingNeeded && _evform.Peers.length<2){
        this.notification.error('at least 2 peers needed to submit evalution')
        return false;
      }
      
      if(_evform.DirectReportRateNeeded && _evform.DirectReports.length<2){
        this.notification.error('at least 2 Direct Reports needed to submit evalution')
        return false;
      }

    this.evaluationForm.value.CreatedBy = this.currentUser._id;
    this.evaluationForm.value.Company = this.currentOrganization._id;
    this.setEmployeeIds();
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
    }, error => {
      debugger
      console.log('competencyList error ', error)
      this.notification.error(error.error.message)
    });
  }

  onDepartmentChange(event) {
    this.getEmployees();
    console.log('depart value', event)
  }


  getAllDepartments() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetEmpSetupBasicData",
      this.perfApp.requestBody = { 'empId': this.currentUser._id }
    this.perfApp.CallAPI().subscribe(c => {
      console.log('departments', c);
      if (c) {

        this.departments = c.Industries.Department;
      }
    })
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
  enablePeerRating(value) {
    this.enablePeersRating = value.target.checked;
    if (!this.enablePeersRating) {
      this.evaluationForm.controls['PeersComptencyMessage'].disable();
      this.evaluationForm.controls['PeersCompetency'].disable();
      this.evaluationForm.controls['Peers'].disable();
      this.evaluationForm.controls['PeersCompetency'].setValidators(null);
      this.evaluationForm.controls['Peers'].setValidators(null);
    } else {
      this.evaluationForm.controls['PeersComptencyMessage'].enable();
      this.evaluationForm.controls['PeersCompetency'].enable();
      this.evaluationForm.controls['Peers'].enable();

      this.evaluationForm.controls['PeersCompetency'].setValidators(Validators.required);
      this.evaluationForm.controls['Peers'].setValidators(Validators.required);
    }
  }

  enableDirectReporting(value) {
    this.enableDirectReport = value.target.checked;
    if (!this.enableDirectReport) {
      this.evaluationForm.controls['DirectReportsCompetency'].disable();
      this.evaluationForm.controls['DirectReportMessage'].disable();
      this.evaluationForm.controls['DirectReports'].disable();
    } else {
      this.evaluationForm.controls['DirectReportsCompetency'].enable();
      this.evaluationForm.controls['DirectReportMessage'].enable();
      this.evaluationForm.controls['DirectReports'].enable();
    }
  }
  disablePeerDirectReportes() {
    this.evaluationForm.controls['DirectReportsCompetency'].disable();
    this.evaluationForm.controls['DirectReportMessage'].disable();
    this.evaluationForm.controls['DirectReports'].disable();
    this.evaluationForm.controls['PeersComptencyMessage'].disable();
    this.evaluationForm.controls['PeersCompetency'].disable();
    this.evaluationForm.controls['Peers'].disable();
  }
  setEmployeeIds() {
    var _curArray = this.evaluationForm.value.Employees
    console.log('mappppppppp', _curArray.map(x => { return { _id: x } }))
    this.evaluationForm.value.Employees = _curArray.map(x => { return { _id: x } });
    console.log('after settings ids', this.evaluationForm.value.Employees)
  }
  // setModelIds() {
  //   var _curArray = this.evaluationForm.value.Model;
  //   this.evaluationForm.value.Model = _curArray.map(x => { return { _id: x._id } });
  //   console.log('after settings Model ids', this.evaluationForm.value.Model);
  // }
  selectAllEmployees(ev) {
    if (ev._selected) {
      this.evaluationForm.controls['Employees'].setValue(this.employeesList$.map(x => x._id));
      ev._selected = true;
    }
    if (ev._selected == false) {
      this.evaluationForm.controls['Employees'].setValue([]);
    }

  }

  selectAllPeersCompetency(ev) {

    if (ev._selected) {
      this.evaluationForm.controls['PeersCompetency'].setValue(this.competencyList.map(x => x._id));
      ev._selected = true;
    }
    if (ev._selected == false) {
      this.evaluationForm.controls['PeersCompetency'].setValue([]);
    }

  }

  selectAllDRCompetency(ev) {

    if (ev._selected) {
      this.evaluationForm.controls['DirectReportsCompetency'].setValue(this.competencyList.map(x => x._id));
      ev._selected = true;
    }
    if (ev._selected == false) {
      this.evaluationForm.controls['DirectReportsCompetency'].setValue([]);
    }

  }

  selectAllPeers(ev) {

    if (ev._selected) {
      this.evaluationForm.controls['Peers'].setValue(this.peersList.map(x => x._id));
      ev._selected = true;
    }
    if (ev._selected == false) {
      this.evaluationForm.controls['Peers'].setValue([]);
    }

  }


  selectAllDRs(ev) {

    if (ev._selected) {
      this.evaluationForm.controls['DirectReports'].setValue(this.directReportees.map(x => x._id));
      ev._selected = true;
    }
    if (ev._selected == false) {
      this.evaluationForm.controls['DirectReports'].setValue([]);
    }

  }
  draftEvaluation() {
    debugger
    if (this.evaluationForm.value.Department === "" || this.evaluationForm.value.Employees.length === 0) {
      this.notification.error('To save as Draft at least one department and Emloyeed need to select')
      return;
    }
    this.evaluationForm.value.CreatedBy = this.currentUser._id;
    this.evaluationForm.value.Company = this.currentOrganization._id;
    this.setEmployeeIds();
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

  public empGridOptions: GridOptions = {
    columnDefs: this.getEmpColDef()
  }
  getSelectedOptions(selected) {
    this.selectedEmployees = selected;
  }

  onResetSelection() {
    this.selectedEmployees = [];
  }

  
  displayFn(value: any[] | string): string | undefined {
    let displayValue: string;
    if (Array.isArray(value)) {
      if(value.length ===0){
        displayValue = "Please select";  
      }
      displayValue = value.length + "  record (s) selected";
      // value.forEach((user, index) => {
      //   if (index === 0) {
      //     displayValue = user.FirstName + ' ' + user.LastName;
      //   } else {
      //     displayValue += ', ' + user.FirstName + ' ' + user.LastName;
      //   }
      // });
    } else {
      displayValue = value;
    }
    return displayValue;
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
    this.empGridOptions.api.setRowData(this.selectedEmployees);
  }
  getEmpColDef() {
    return [
      {
        headerName: 'Employee', sortable: true, filter: true,
        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.data.FirstName}-${data.data.LastName}</span>` }
      },
      { headerName: 'Title', field: 'Title', sortable: true, filter: true },
      { headerName: 'Email', field: 'Email', sortable: true, filter: true },
      {
        headerName: "Actions",
        suppressMenu: true,
        Sorting: false,
        cellRenderer: (data) => {
          console.log('column data', data)
          return ``
          //}
        }
      }
    ];

  }

  onEmpGridReady(params) {
    this.empGridOptions.api = params.api; // To access the grids API
  }
  public onEmpRowClicked(e) {
    debugger
    if (e.event.target !== undefined) {

      this.selectedEmployee = e.data;

      let actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "deleteEmp":
          return this.toggleSelection(this.selectedEmployee);
        // case "suspendorg":
        //   return this.suspendOrg();
        // case "edit":
        // return this.editClient();
      }
    }
  }


  //#endregion

  //#region  Multi_Select_Peers

  public selectedPeers: any = [];
  public selectedPeer: any;

  public PeersGridOptions: GridOptions = {
    columnDefs: this.getPeerColDef()
  }



  peersOptionClicked(event: Event, user: any) {
    event.stopPropagation();
    this.togglePeersSelection(user);
  }


  togglePeersSelection(user: any) {
    debugger
    user.selected = !user.selected;
    if (user.selected) {
      this.selectedPeers.push(user);
    } else {
      const i = this.selectedPeers.findIndex(value => value.FirstName === user.FirstName && value.LastName === user.LastName);
      this.selectedPeers.splice(i, 1);
    }

    this.evaluationForm.controls["Peers"].setValue(this.selectedPeers);
    this.PeersGridOptions.api.setRowData(this.selectedPeers);
  }
  getPeerColDef() {
    return [
      {
        headerName: 'Employee', sortable: true, filter: true,
        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.data.FirstName}-${data.data.LastName}</span>` }
      },
      { headerName: 'Title', field: 'Title', sortable: true, filter: true },
      { headerName: 'Email', field: 'Email', sortable: true, filter: true },
      {
        headerName: "Actions",
        suppressMenu: true,
        Sorting: false,
        cellRenderer: (data) => {
          console.log('column data', data)
          return ` `
          //}
        }
      }
    ];

  }

  onPeersGridReady(params) {
    this.PeersGridOptions.api = params.api; // To access the grids API
  }
  public onPeersRowClicked(e) {
    debugger
    if (e.event.target !== undefined) {

      this.selectedPeer = e.data;

      let actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "deleteEmp":
          return this.togglePeersSelection(this.selectedPeer);
        // case "suspendorg":
        //   return this.suspendOrg();
        // case "edit":
        // return this.editClient();
      }
    }
  }

  
  //#endregion

//#region Direct Reports

public selectedDrs: any = [];
public selectedDr: any;

public DrGridOptions: GridOptions = {
  columnDefs: this.getDrsColDef()
}
DrsOptionClicked(event: Event, user: any) {
  event.stopPropagation();
  this.toggleDrsSelection(user);
}

toggleDrsSelection(user: any) {
  debugger
  user.selected = !user.selected;
  if (user.selected) {
    this.selectedDrs.push(user);
  } else {
    const i = this.selectedDrs.findIndex(value => value.FirstName === user.FirstName && value.LastName === user.LastName);
    this.selectedDrs.splice(i, 1);
  }

  this.evaluationForm.controls["DirectReports"].setValue(this.selectedDrs);
  this.DrGridOptions.api.setRowData(this.selectedDrs);
}
getDrsColDef() {
  return [
    {
      headerName: 'Employee', sortable: true, filter: true,
      cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.data.FirstName}-${data.data.LastName}</span>` }
    },
    { headerName: 'Title', field: 'Title', sortable: true, filter: true },
    { headerName: 'Email', field: 'Email', sortable: true, filter: true },
    {
      headerName: "Actions",
      suppressMenu: true,
      Sorting: false,
      cellRenderer: (data) => {
        console.log('column data', data)
        return ``
        //}
      }
    }
  ];

}

onDrsGridReady(params) {
  this.DrGridOptions.api = params.api; // To access the grids API
}
public onDrsRowClicked(e) {
  debugger
  if (e.event.target !== undefined) {

    this.selectedPeer = e.data;

    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
      case "deleteEmp":
        return this.togglePeersSelection(this.selectedPeer);
      // case "suspendorg":
      //   return this.suspendOrg();
      // case "edit":
      // return this.editClient();
    }
  }
}
//#endregion

}
