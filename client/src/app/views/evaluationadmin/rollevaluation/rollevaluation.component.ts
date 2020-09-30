import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
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

  employeesLift: any[];
  peersList: any[];
  directReportees: any[];
  evaluationPeriods: any[];
  evaluationDuration: any[];
  peersCompetency: any[];
  directReporteeCompetency: any[];

  constructor(private formBuilder: FormBuilder,
    private perfApp: PerfAppService,
    private notification: NotificationService,
    private modalService: BsModalService,
    public authService: AuthService) { 
      console.log('cmmmmmmmmmmmmmmmmmmmmmm')
    }

  ngOnInit(): void {
    this.initForm();
  }
  initForm() {
    this.evaluationForm = this.formBuilder.group({
      Employees: [[], [Validators.required]],
      EvaluationPeriod: ['', [Validators.required]],
      EvaluationDuration: ['', [Validators.required]],
      Model: ['', [Validators.required]],
      PeerRatingNeeded: ['', [Validators.required]],
      Peers: ['', []],
      PeerCompetency: ['', [Validators.required]],
      PeerComptencyMessage: ['', []],
      DirectReportRateNeeded: ['', []],
      DirectReports: ['', []],
      DirectReportsCompetency: ['', [Validators.required]],
      DirectReportMessage: ['', []],
      ActivateKPI: [false, []],
      ActivateActionPlan: [false, []],
    });
  }
  get f(){
    return this.evaluationForm.controls;
  }

  submitEvaluation(){
    this.isFormSubmitted=true;
    debugger
if(this.evaluationForm.invalid)
return;
console.log('evaluation form',this.evaluationForm.value);
this.perfApp.method="CreateEvaluation";
this.perfApp.requestBody=this.evaluationForm.value;
this.perfApp.route="evaluation"
this.perfApp.CallAPI().subscribe(x=>{
  debugger
  console.log('added evaluation',x)
  this.notification.success('Evaluation Created Successfully.')
},error=>{
  debugger
  console.log('error while adding eval',error)
  this.notification.error(error.error.message)
})

  }
  reset(){
    this.evaluationForm.reset();
    this.isFormSubmitted=false;

  }
}
