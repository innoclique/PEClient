import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { GridOptions, GridApi } from 'ag-grid-community';
import { debug } from 'console';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AlertDialog } from '../../../Models/AlertDialog';
import { CompetencyBase } from '../../../Models/CompetencyFormModel';
import { QuestionBase } from '../../../Models/QuestionBase';
import { AuthService } from '../../../services/auth.service';
import { CompetencyFormService } from '../../../services/CompetencyFormService';
import { NotificationService } from '../../../services/notification.service';
import { PerfAppService } from '../../../services/perf-app.service';
import { AlertComponent } from '../../../shared/alert/alert.component';
import ReportTemplates from '../../../views/psa/reports/data/reports-templates';

@Component({
  selector: 'app-current-evaluation-report',
  templateUrl: './current-evaluation-report.component.html',
  styleUrls: ['./current-evaluation-report.component.css']
})
export class CurrentEvaluationReportComponent implements OnInit {
  loginUser: any;
  currentOrganization: any;
  selfCompetencyForm: FormGroup;
  competencyList: any = [];
  performanceGoals: any = [];
  devGoals: any = [];
  strengths: any = [];
  finalRating: any = {};
  evaluationForm: any = {};
  employeeCompetencyList: any;
  questions$: Observable<CompetencyBase<any>[]>;
  currEvaluation: any;
  public oneAtATime: boolean = true;
  public FinalRatingForm: FormGroup;
  public showEmployeeSubmit: Boolean = true;
  public PeerScoreCard: any;
  DirectReporteeScoreCard: any;
  isContentOpen: boolean = false;
  pgSubmitStatus = "";
  appScores: any = [];
  kpiStatus: any = [];
  coachingRemDays: any = [];
  public gridOptions: GridOptions;
  public devGoalsGridOptions: GridOptions;
  public showGrid: boolean;
  public performanceGoalsRowData: any[];
  public devGoalsRowData: any[];
  public devGoalsActionRowData: any[];
  private api: GridApi;
  detailCellRendererParams: any;
  defaultColDef: any;
  public alert = new AlertDialog();
  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private qcs: CompetencyFormService,
    private datePipe: DatePipe
  ) {
    this.loginUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
  }

  ngOnInit(): void {
    this.getAllKpiBasicData();
    this.initCompetencyForm();
    this.initFinalRatingForm();
    this.getTabsData();
    this.authService.getIsPGSubmitStatus().subscribe(status => this.pgSubmitStatus = status);
    this.gridOptions = <GridOptions>{};
    this.gridOptions = {
      columnDefs: this.performanceGoalsColumnDefs,
    }


    this.defaultColDef = ReportTemplates.defaultColDef;
    this.getAllKPIs();
    this.devGoalsGridOptions = <GridOptions>{};
    this.devGoalsGridOptions = {
      columnDefs: this.getDevGoalsColDef(),
    }
    this.getAllDevGoalsDetails();
    this.getAllStrengthDetails();
    this.getFinalRating();
  }

  printPage() {
    window.print();
  }
  
  headerHeightSetter(event) {
    var padding = 20;
    var height = ReportTemplates.headerHeightGetter() + padding;
    this.api.setHeaderHeight(height);
    this.api.resetRowHeights();
    this.api.sizeColumnsToFit();
  }
  getAllKPIs() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllKpis",
      this.perfApp.requestBody = { 'empId': this.loginUser._id, 'orgId': this.authService.getOrganization()._id }
    this.perfApp.CallAPI().subscribe(c => {
      if (c && c.length > 0) {
        console.log('inside getAllKPIs :::: ');
        console.log(c);
        this.performanceGoals = c;
        this.createPerformanceGoalsRowData();
      }
    }
      , error => {
        this.snack.error(error.error.message);
      }
    )
  }

  createPerformanceGoalsRowData() {
    const rowData: any[] = [];
    console.log('inside createPerformanceGoalsRowData :::: ');
    console.log(this.performanceGoals);
    var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    for (let i = 0; i < this.performanceGoals.length; i++) {
      rowData.push({
        goal: this.performanceGoals[i].Kpi,
        kpi: this.performanceGoals[i].Kpi,
        weighting: this.performanceGoals[i].Weighting,
        targetCompletion: new Date(this.performanceGoals[i].TargetCompletionDate).toLocaleDateString(undefined, options),
        yearEndComments: this.performanceGoals[i].YearEndComments,
        yearEndManagerComments: this.performanceGoals[i].YECommManager,
        score: this.performanceGoals[i].ManagerScore,
      });
    }
    this.performanceGoalsRowData = rowData;
  }

  getDevGoalsColDef() {
    return [
      { headerName: 'Action Step', field: 'ActionStep', width: 160, autoHeight: true },
      { headerName: 'Progress Indicators', field: 'ProgressIndicators', width: 190, autoHeight: true },
      { headerName: 'Barriers', field: 'Barriers', width: 160, autoHeight: true },
      {
        headerName: 'Target Date', field: 'TargetDate', width: 150, autoHeight: true,
        cellRenderer: (data) => { return new DatePipe('en-US').transform(data.data.TargetDate, 'MM-dd-yyyy') }
      },
      { headerName: 'Other Participants', field: 'OtherParticipants', width: 170, autoHeight: true },
      { headerName: 'Status', field: 'Status', width: 140, autoHeight: true },
    ];
  }

  getDevGoalsRowData() {
    const rowData: any[] = [];
    const actionRowData: any[] = [];
    console.log('inside getDevGoalsRowData :::: ');
    console.log(this.devGoals);
    var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    for (let i = 0; i < this.devGoals.length; i++) {
      rowData.push({
        DesiredOutcomes: this.devGoals[i].DesiredOutcomes ? this.devGoals[i].DesiredOutcomes : '',
        ManagerComments: this.devGoals[i].ManagerComments ? this.devGoals[i].ManagerComments : '',
        DevGoal: this.devGoals[i].DevGoal ? this.devGoals[i].DevGoal : '',
        Kpi: [this.devGoals[i].Kpi ? this.devGoals[i].Kpi.Kpi ? this.devGoals[i].Kpi.Kpi : '' : ''],
        GoalActionItems: [{
          ActionStep: this.devGoals[i].GoalActionItems[0].ActionStep,
          Barriers: this.devGoals[i].GoalActionItems[0].Barriers,
          OtherParticipants: this.devGoals[i].GoalActionItems[0].OtherParticipants,
          ProgressIndicators: this.devGoals[i].GoalActionItems[0].ProgressIndicators,
          Status: this.devGoals[i].GoalActionItems[0].Status,
          TargetDate: new Date(this.devGoals[i].GoalActionItems[0].TargetDate).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' }),
        }],
      });
      actionRowData.push({
        ActionStep: this.devGoals[i].GoalActionItems[0].ActionStep,
        Barriers: this.devGoals[i].GoalActionItems[0].Barriers,
        OtherParticipants: this.devGoals[i].GoalActionItems[0].OtherParticipants,
        ProgressIndicators: this.devGoals[i].GoalActionItems[0].ProgressIndicators,
        Status: this.devGoals[i].GoalActionItems[0].Status,
        TargetDate: this.devGoals[i].GoalActionItems[0].TargetDate,
      });
    }
    this.devGoalsRowData = rowData;
    this.devGoalsActionRowData = actionRowData;
    console.log("devGoalsRowData :::: ", this.devGoalsRowData);
    console.log("devGoalsActionRowData :::: ", this.devGoalsActionRowData);

  }

  getAllDevGoalsDetails() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllDevGoalsByManger",
      this.perfApp.requestBody = {
        'empId': this.loginUser._id,
        'fetchAll': true, 'orgId': this.authService.getOrganization()._id
      }
    this.perfApp.CallAPI().subscribe(c => {
      if (c && c.length > 0) {
        this.devGoals = c;
        this.getDevGoalsRowData();
      }
    }
      , error => {
        this.snack.error(error.error.message);
      }

    )
  }

  getStrengthDetailsRowData() {
    const rowData: any[] = [];
    console.log('inside getStrengthDetailsRowData :::: ');
    console.log(this.strengths);
  }

  getAllStrengthDetails() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllStrengths",
      this.perfApp.requestBody = {
        'empId': this.loginUser._id,
        'fetchAll': true, 'orgId': this.authService.getOrganization()._id
      }
    this.perfApp.CallAPI().subscribe(c => {
      if (c && c.length > 0) {
        this.strengths = c;
        this.getStrengthDetailsRowData();
      }
    }
      , error => {
        this.snack.error(error.error.message);
      }
    )
  }

  onReady(params: any) {
    this.api = params.api;
    console.log('onReady');
    this.gridOptions.rowHeight = 40;
  }

  onQuickFilterChanged($event: any) {
    this.api.setQuickFilter($event.target.value);
  }

  public performanceGoalsColumnDefs = [
    { headerName: 'Goal', field: 'goal' },
    { headerName: 'KPI', field: 'kpi' },
    { headerName: 'Target Completion', field: 'targetCompletion' },
    { headerName: 'Weighting', field: 'weighting' },
    { headerName: 'Year-end Comments', field: 'yearEndComments' },
    { headerName: 'Manager Comments', field: 'yearEndManagerComments' },
    { headerName: 'Score', field: 'score' },
  ];

  /**To GET ALL  tabs data */
  getTabsData() {
    forkJoin(
      this.getCurrentEvaluationDetails().pipe(catchError(error => of({ error: error, isError: true })))
    ).subscribe(([res1]) => {
      if (res1 && !res1.isError) {
        this.evaluationForm = res1;
        if (res1.Competencies) {
          this.employeeCompetencyList = res1.Competencies.Employee.Competencies
          this.prepareCompetencyQuestions();
          console.log('the evauation form', this.evaluationForm)
        }
        if (res1.FinalRating) {
          this.FinalRatingForm.controls["EmployeeComments"].setValue(res1.FinalRating.Self.YearEndComments)
          this.FinalRatingForm.controls["EmployeeOverallRating"].setValue(res1.FinalRating.Self.YearEndRating)
          this.FinalRatingForm.controls["EmployeeIsDraft"].setValue(!res1.FinalRating.Self.IsSubmitted)
          this.FinalRatingForm.controls["EmployeeSignOff"].setValue(res1.FinalRating.Self.SignOff)
          this.FinalRatingForm.controls["EmployeeRevComments"].setValue(res1.FinalRating.Self.RevComments)
          this.FinalRatingForm.controls["IsManagerReqRev"].setValue(res1.FinalRating.Manager.ReqRevision)
          this.FinalRatingForm.controls["IsManagerSubmited"].setValue(res1.FinalRating.Manager.IsSubmitted)
          this.FinalRatingForm.controls["EmployeeSubmittedOn"].setValue(this.datePipe.transform(res1.FinalRating.Self.SubmittedOn))
          this.showEmployeeSubmit = !res1.FinalRating.Self.IsSubmitted;


          this.FinalRatingForm.controls["ManagerComments"].setValue(res1.FinalRating.Manager.YearEndComments)
          this.FinalRatingForm.controls["ManagerOverallRating"].setValue(res1.FinalRating.Manager.YearEndRating)
          this.FinalRatingForm.controls["ManagerSignOff"].setValue(res1.FinalRating.Manager.SignOff)
          this.FinalRatingForm.controls["ManagerSubmittedOn"].setValue(this.datePipe.transform(res1.FinalRating.Manager.SubmittedOn))
          this.FinalRatingForm.controls["ManagerRevComments"].setValue(res1.FinalRating.Manager.RevComments)


        }
        if (res1 && Object.keys(res1.PeerScoreCard).length > 0) {
          debugger
          console.log(res1.PeerScoreCard);
          debugger
          this.PeerScoreCard = res1.PeerScoreCard;
        }
        if (res1 && Object.keys(res1.DirectReporteeScoreCard).length > 0) {
          this.DirectReporteeScoreCard = res1.DirectReporteeScoreCard;
        }
      } else {
        this.evaluationForm = null;
      }
    });

  }

  getFinalRating() {
    this.perfApp.route = "evaluation";
    this.perfApp.method = "GetEmpCurrentEvaluation",
      this.perfApp.requestBody = { EmployeeId: this.loginUser._id }
    this.perfApp.CallAPI().subscribe(res => {
      if (res && !res.isError) {
        this.finalRating = res.FinalRating;
        console.log('inside getFinalRating :::: ');
        console.log(this.finalRating);
      }
    }
      , error => {
        this.snack.error(error.error.message);
      }
    )
  }

  public monthList = ["", "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];


  getEVPeriod() {
    let year = this.currEvaluation ? new Date(this.currEvaluation.CreatedDate) : new Date();
    if (this.currentOrganization.EvaluationPeriod === 'FiscalYear') {
      return `${this.monthList[this.currentOrganization.StartMonth].substring(0, 3)} ${year.getFullYear()} to ${this.currentOrganization.EndMonth.substring(0, 3)} 
            ${this.currentOrganization.StartMonth == '1' ? year.getFullYear() : year.getFullYear() + 1}`

    } else {
      return `${this.monthList[this.currentOrganization.StartMonth].substring(0, 3)} ${year.getFullYear()} to ${this.currentOrganization.EndMonth.substring(0, 3)} ${year.getFullYear()}`

    }
  }
  getCurrentEvaluationDetails() {
    this.perfApp.route = "evaluation";
    this.perfApp.method = "GetEmpCurrentEvaluation",
      this.perfApp.requestBody = { EmployeeId: this.loginUser._id }
    return this.perfApp.CallAPI()
  }

  getTSKPIs() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetKpisForTS",
      this.perfApp.requestBody = { TsId: this.loginUser._id }
    return this.perfApp.CallAPI()
  }

  initCompetencyForm() {
    this.selfCompetencyForm = this.fb.group({
      OverallComments: ['', [Validators.required]],
      OverallRating: [1, [Validators.required]],
      IsDraft: [true]
    })

  }
  initFinalRatingForm() {
    this.FinalRatingForm = this.fb.group({
      EmployeeComments: ['', [Validators.required]],
      EmployeeRevComments: [''],
      EmployeeOverallRating: [1, [Validators.required]],
      EmployeeIsDraft: [true],
      IsManagerReqRev: [false],
      IsManagerSubmited: [false],
      EmployeeSignOff: [],
      EmployeeSubmittedOn: ['']

      , ManagerComments: ['',],
      ManagerOverallRating: [],
      ManagerRevComments: ['',],
      // ManagerReqRevision: [false],
      // ManagerIsDraft: [true],
      ManagerSignOff: [],
      ManagerSubmittedOn: ['']
    })

  }



  /**For Self-Competency Rating Begin */
  get scfc() {
    return this.selfCompetencyForm.controls.competencyList;
  }
  get scf() {
    return this.selfCompetencyForm.controls;
  }

  submitCompetencyRating() {
    console.log('after submit with rating', this.employeeCompetencyList)

  }
  competencyQuestionsList = [];
  showCompetencySubmit = true;
  prepareCompetencyQuestions() {

    var questions: CompetencyBase<string>[] = [];
    this.selfCompetencyForm.controls["OverallComments"].setValue(this.evaluationForm.Competencies.Employee.CompetencyComments,),
      this.selfCompetencyForm.controls["OverallRating"].setValue(this.evaluationForm.Competencies.Employee.CompetencyOverallRating),
      this.selfCompetencyForm.controls["IsDraft"].setValue(!this.evaluationForm.Competencies.Employee.CompetencySubmitted)
    console.log('this.selfCompetencyForm.value', this.selfCompetencyForm.value);
    this.showCompetencySubmit = !this.evaluationForm.Competencies.Employee.CompetencySubmitted
    this.employeeCompetencyList.forEach(element => {
      questions = [];
      element.Questions.forEach(q => {
        questions.push(new QuestionBase({
          key: q._id,
          label: q.Question,
          options: q.Rating,
          order: 1,
          required: true,
          value: q.SelectedRating,
          showEmpRating: false,
          empRating: 0,
          empKey: q._id
        }))

      });

      this.competencyQuestionsList.push({
        CompetenyName: element.Competency.Name,
        CompetencyId: element.Competency._id,
        CompetencyRowId: element._id,
        Questions: questions,
        form: this.qcs.toFormGroup(questions),
        comments: element.Comments,
        CompetencyAvgRating: this.getCompetencyOverallRating(element.Competency._id)
      })
      console.log(" inside prepareCompetencyQuestions :::: ")
console.log(this.competencyQuestionsList);
    });

  }

  getCompetencyOverallRating(competencyId) {
    if (this.evaluationForm.OverallCompetencyRating) {
      var _rate = this.evaluationForm.OverallCompetencyRating.find(x => x.competencyId === competencyId);
      return _rate.overallScore || "Pending";
    }
  }
  cancelCompetencyRating() {

  }
  saveSelfCompetencyFormAsDraft() {
    this.saveSelfCompetencyForm(true)
  }
  submitSelfCompetencyForm() {
    this.saveSelfCompetencyForm(false)
  }
  saveSelfCompetencyForm(isDraft) {
    //selfCompetencyForm

    const competencyQA: any = {}
    competencyQA.QnA = []
    let isvalid = true;
    this.competencyQuestionsList.forEach(element => {
      var _qna = Object.entries(element.form.value);
      var _lastitem = _qna.pop();
      var _lastitem = _qna.pop();
      debugger

      if (_qna && _qna.length > 0 && _qna.filter(x => x[1] === "").length === 0) {
        var _avgScore = this.getAverage(_qna.map(x => x[1]));
        _qna.forEach(q => {
          competencyQA.QnA.push({ CompetencyRowId: element.CompetencyRowId, CompetencyId: element.CompetencyId, QuestionId: q[0], Answer: q[1], Comments: _lastitem ? _lastitem[1] : "", CompetencyAvgRating: _avgScore })
        });

      } else {

        _qna.forEach(q => {
          competencyQA.QnA.push({ CompetencyRowId: element.CompetencyRowId, CompetencyId: element.CompetencyId, QuestionId: q[0], Answer: q[1], Comments: _lastitem ? _lastitem[1] : "" })
        });

        if (!isDraft) {
          isvalid = false;
        }
      }
    });
    if (!isvalid) {
      this.snack.error('Please provide rating to all question(s) in each competency')
      return;
    }
    competencyQA.Comments = this.selfCompetencyForm.value.OverallComments;
    competencyQA.OverallRating = this.selfCompetencyForm.value.OverallRating;
    competencyQA.EvaluationId = this.evaluationForm.Competencies.EvaluationId
    competencyQA.EmployeeId = this.evaluationForm.Competencies.Employee._id;;
    competencyQA.IsDraft = isDraft;
    console.log('QnA', competencyQA);
    this.perfApp.route = "app";
    this.perfApp.method = "SaveCompetencyQnA",
      this.perfApp.requestBody = competencyQA;// { TsId: this.loginUser._id }
    this.perfApp.CallAPI().subscribe(x => {
      console.log(x)
      //after successfully submitted hide submit button
      this.showCompetencySubmit = false;
      const snref = this.snack.success(isDraft ? 'Competencies Rating Saved Successfully' : 'Competency Rating Submitted Successfully');
      snref.afterDismissed().subscribe(() => {
        window.location.reload();
      });
    }, error => {
      this.snack.error('something went wrong.')
      console.log('error', error)
    })

  }
  refresh(): void {
    window.location.reload();
  }
  /**For Self-Competency Rating End */
  submitFinalRating() {
    if (this.pgSubmitStatus != 'true') {
      this.snack.error("Please score performance goals")
      return
    }
    this.saveFinalRating(false)
  }
  draftFinalRating() {
    this.saveFinalRating(true)
  }
  saveFinalRating(isDraft) {

    if (this.FinalRatingForm.value.IsManagerReqRev &&
      this.FinalRatingForm.value.EmployeeRevComments.length == 0) {
      this.snack.error('Revision Comments is mandatory')
      return;
    }
    if (!this.evaluationForm.Competencies.Employee.CompetencySubmitted) {
      this.snack.error('Competencies Rating should be Submitted')
      return;
    }
    this.perfApp.route = "app";
    this.perfApp.method = "SaveEmployeeFinalRating",

      this.perfApp.requestBody = {
        EvaluationId: this.evaluationForm.Competencies.EvaluationId,
        EmployeeId: this.loginUser._id,
        YearEndComments: this.FinalRatingForm.value.EmployeeComments,
        IsManagerSubmited: this.FinalRatingForm.value.IsManagerSubmited,
        RevComments: this.FinalRatingForm.value.EmployeeRevComments,
        OverallRating: this.FinalRatingForm.value.EmployeeOverallRating,
        IsDraft: isDraft,
        SignOff: `${this.loginUser.FirstName} ${this.loginUser.LastName}`
      };
    console.log('final rating form', this.perfApp.requestBody)

    if (isDraft) {
      this.perfApp.CallAPI().subscribe(x => {
        console.log(x)
        const snref = this.snack.success('Evaluation has been successfully saved.');
        snref.afterDismissed().subscribe(() => {
          window.location.reload();
        });
      }, error => {
        console.log('error', error)
        this.snack.error('Evaluation not saved, please try again.')
      })
    } else {
      //  var confirm = window.confirm('Are you sure, you want to submit Final Rating?')



      /**To alert user for submit Final Rating */
      this.alert.Title = "Alert";
      this.alert.Content = "Are you sure you want to submit your evaluation?";
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
        if (resp == 'yes') {
          this.perfApp.requestBody.IgnoreEvalAdminCreated = true;
          this.perfApp.CallAPI().subscribe(x => {
            console.log(x)
            const snref = this.snack.success('Evaluation has been successfully submitted.');
            snref.afterDismissed().subscribe(() => {
              window.location.reload();
            });
          }, error => {
            console.log('error', error)
            this.snack.error('Evaluation not submitted, please try again.')
          })

        } else {

        }
      })


      // if (confirm) {
      // this.perfApp.CallAPI().subscribe(x => {
      //   console.log(x)
      //   this.snack.success('Successfully Submitted Final Rating');
      //   window.location.reload();
      // }, error => {
      //   console.log('error', error)
      //   this.snack.error('Something went wrong')
      // })

      //}
    }


  }




  getAllKpiBasicData() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetKpiSetupBasicData";
    this.perfApp.requestBody = {
      'empId': this.loginUser._id,
      'orgId': this.authService.getOrganization()._id
    }
    this.perfApp.CallAPI().subscribe(c => {

      if (c) {

        this.appScores = c.KpiScore;
        this.kpiStatus = c.KpiStatus;
        this.coachingRemDays = c.coachingRem;
        this.currEvaluation = c.evaluation;

      }
    })
  }

  cancelFinalRating() {

  }

  getAverage(arr) {
    debugger
    var sum = 0;
    for (var i = 0; i < arr.length; i++) {
      sum += parseInt(arr[i], 10); //don't forget to add the base
    }

    var avg = sum / arr.length;
    // const average= arr.reduce((p, c) => p + c, 0) / arr.length;
    console.log('average score :', avg);
    return parseFloat(avg.toFixed(2));
  }
}
