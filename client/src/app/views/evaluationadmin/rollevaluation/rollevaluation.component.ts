import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
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
      Employees: [null, [Validators.required]],
      EvaluationPeriod: ['', [Validators.required]],
      EvaluationDuration: ['', [Validators.required]],
      Model: ['', [Validators.required]],
      PeerRatingNeeded: ['', [Validators.required]],
      Peers: ['', [Validators.required]],
      PeerCompetency: ['', [Validators.required]],
      PeerComptencyMessage: ['', [Validators.required]],
      DirectReportRateNeeded: ['', [Validators.required]],
      DirectReports: ['', [Validators.required]],
      DirectReportsCompetency: ['', [Validators.required]],
      DirectReportMessage: ['', [Validators.required]],
      ActivateKPI: [null, [Validators.required]],
      ActivateActionPlan: [null, [Validators.required]],
    });
  }
  get f(){
    return this.evaluationForm.controls;
  }
}
