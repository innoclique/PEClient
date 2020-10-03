import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';

import { NotificationService } from '../../../services/notification.service';
import { PerfAppService } from '../../../services/perf-app.service';
import { CustomValidators } from '../../../shared/custom-validators';

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
  employeesList$: Observable<any[]>;
  peersList: any[];
  directReportees: any[];
  evaluationPeriods: any[];
  evaluationDuration: any[];
  peersCompetency: any[];
  directReporteeCompetency: any[];
  currentUser: any;
  departments: any[];
  kpiForList:string[] = ['Employee', 'Manager', 'EA'];
  constructor(private formBuilder: FormBuilder,
    private perfApp: PerfAppService,
    private notification: NotificationService,
    private modalService: BsModalService,
    public authService: AuthService) {
    console.log('cmmmmmmmmmmmmmmmmmmmmmm')
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.initForm();
    this.getAllDepartments();
    this.disablePeerDirectReportes();
  }
  initForm() {
    this.evaluationForm = this.formBuilder.group({
      Employees: [[], [Validators.required]],
      EvaluationPeriod: ['', [Validators.required]],
      EvaluationDuration: ['', [Validators.required]],
      Model: ['', [Validators.required]],
      PeerRatingNeeded: [false, [Validators.required]],
      Peers: ['', []],
      PeerCompetency: ['', [Validators.required]],
      PeerComptencyMessage: ['', []],
      DirectReportRateNeeded: [false, []],
      DirectReports: ['', []],
      DirectReportsCompetency: ['', [Validators.required]],
      DirectReportMessage: ['', []],
      ActivateKPI: [false, []],
      ActivateActionPlan: [false, []],
      Department: ['', [Validators.required]],
      KPIFor: ["Employee", []]
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
      }
    })
  }
  submitEvaluation() {
    this.isFormSubmitted = true;
    debugger
    if (this.evaluationForm.invalid)
      return;
      
    this.setEmployeeIds();
    console.log('evaluation form', this.evaluationForm.value);
    this.perfApp.method = "CreateEvaluation";
    this.perfApp.requestBody = this.evaluationForm.value;
    this.perfApp.route = "evaluation"
    this.perfApp.CallAPI().subscribe(x => {
      debugger
      console.log('added evaluation', x)
      this.notification.success('Evaluation Created Successfully.')
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


  // getModels(){
  //   this.perfApp.route = "shared";
  //   this.perfApp.method = "GetModelsByIndustry",
  //     this.perfApp.requestBody ={id: this.clientForm.controls["Industry"].value}; //fill body object with form 
  //   this.perfApp.CallAPI().subscribe(c => {
  //     this.models=c.map(x=>x.Name)
  //   }, error => {
  //     debugger
  //     console.log('models error ',error)
  //     this.notification.error(error.error.message)
  //   });
  // }

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
    }else{
      this.evaluationForm.controls['KPIFor'].clearValidators();
      this.evaluationForm.controls['KPIFor'].reset();
      this.evaluationForm.controls['KPIFor'].setValue(null);
    }
  }
  enablePeerRating(value){
    this.enablePeersRating = value.target.checked; 
    if(!this.enablePeersRating){
      this.evaluationForm.controls['PeerComptencyMessage'].disable();
      this.evaluationForm.controls['PeerCompetency'].disable();
      this.evaluationForm.controls['Peers'].disable();    
  }else{

    this.evaluationForm.controls['PeerComptencyMessage'].enable();
    this.evaluationForm.controls['PeerCompetency'].enable();
    this.evaluationForm.controls['Peers'].enable();
  }
  }
  
  enableDirectReporting(value){
    this.enableDirectReport = value.target.checked;    
    
    if(!this.enableDirectReport){
      this.evaluationForm.controls['DirectReportsCompetency'].disable();
      this.evaluationForm.controls['DirectReportMessage'].disable();
      this.evaluationForm.controls['DirectReports'].disable();     
    }else{      
    this.evaluationForm.controls['DirectReportsCompetency'].enable();
    this.evaluationForm.controls['DirectReportMessage'].enable();
    this.evaluationForm.controls['DirectReports'].enable();
    }
  }
  disablePeerDirectReportes(){
    this.evaluationForm.controls['DirectReportsCompetency'].disable();
    this.evaluationForm.controls['DirectReportMessage'].disable();
    this.evaluationForm.controls['DirectReports'].disable();     
    this.evaluationForm.controls['PeerComptencyMessage'].disable();
      this.evaluationForm.controls['PeerCompetency'].disable();
      this.evaluationForm.controls['Peers'].disable();    
  }
  setEmployeeIds(){
    
    var _curArray=this.evaluationForm.value.Employees
    this.evaluationForm.value.Employees=_curArray.map(x=>{return {_id:x}});
    console.log('after settings ids',this.evaluationForm.value.Employees)
    
  }
}
