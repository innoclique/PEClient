import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
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
  }
  initForm() {
    this.evaluationForm = this.formBuilder.group({
      Employees: [[], [Validators.required]],
      EvaluationPeriod: ['', [Validators.required]],
      EvaluationDuration: ['', [Validators.required]],
      Model: [null, [Validators.required]],
      PeerRatingNeeded: [false, [Validators.required]],
      Peers: ['', []],
      PeersCompetency: ['', [Validators.required]],
      PeersComptencyMessage: ['', []],
      DirectReportRateNeeded: [false, []],
      DirectReports: ['', []],
      DirectReportsCompetency: ['', [Validators.required]],
      DirectReportMessage: ['', []],
      ActivateKPI: [false, []],
      ActivateActionPlan: [false, []],
      Department: ['', [Validators.required]],
      KPIFor: ["Employee", []],
      CreatedBy: ['', []],
      Company: ['', []]
    });
  }
  get f() {
    return this.evaluationForm.controls;
  }
  getEmployees() {
    debugger
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllEmployees",
      this.perfApp.requestBody = { 'parentId': this.currentUser.ParentUser ? this.currentUser.ParentUser : this.currentUser._id }
    this.perfApp.CallAPI().subscribe(c => {
      debugger
      console.log('lients data', c);
      if (c && c.length > 0) {
        this.employeesList$ = c
        this.directReportees = c;
        this.peersList = c;
      }
    })
  }
  submitEvaluation() {
    this.isFormSubmitted = true;
    debugger
    if (this.evaluationForm.invalid)
      return;

    this.evaluationForm.value.CreatedBy = this.currentUser._id;
    this.evaluationForm.value.Company = this.currentOrganization._id;
    this.setEmployeeIds();
    this.setModelIds();
    console.log('evaluation form', this.evaluationForm.value);
    this.perfApp.method = "CreateEvaluation";
    this.perfApp.requestBody = this.evaluationForm.value;
    this.perfApp.route = "evaluation"
    this.perfApp.CallAPI().subscribe(x => {
      debugger
      console.log('added evaluation', x)
      this.notification.success('Evaluation Created Successfully.')
      this.router.navigate(['ea/evaluation-list'])
    }, error => {
      debugger
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
      this.perfApp.requestBody = { id: this.currentOrganization._id,modelId:this.evaluationForm.controls["Model"].value }; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
      this.competencyList = c;
    }, error => {
      debugger
      console.log('competencyList error ', error)
      this.notification.error(error.error.message)
    });
  }
  public displayFn(user: any): string {
    return user && user.FirstName ? user.FirstName : '';
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
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
    } else {
      this.evaluationForm.controls['PeersComptencyMessage'].enable();
      this.evaluationForm.controls['PeersCompetency'].enable();
      this.evaluationForm.controls['Peers'].enable();
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
    console.log('mappppppppp',_curArray.map(x => { return { _id: x } }))
    this.evaluationForm.value.Employees = _curArray.map(x => { return { _id: x } });
    console.log('after settings ids', this.evaluationForm.value.Employees)
  }
  setModelIds() {
    var _curArray = this.evaluationForm.value.Model
    this.evaluationForm.value.Model = _curArray.map(x => { return { _id: x } });
    console.log('after settings Model ids', this.evaluationForm.value.Model)

  }
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
    if(this.evaluationForm.value.Department==="" || this.evaluationForm.value.Employees.length===0){

      this.notification.error('To save as Draft at least one department and Emloyeed need to select')
      return;
    }
    this.evaluationForm.value.CreatedBy = this.currentUser._id;
    this.evaluationForm.value.Company = this.currentOrganization._id;
    this.setEmployeeIds();
    this.evaluationForm.value.IsDraft=true;
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
}
