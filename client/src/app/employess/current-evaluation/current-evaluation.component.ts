import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { error } from 'console';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CompetencyBase } from '../../Models/CompetencyFormModel';
import { QuestionBase } from '../../Models/QuestionBase';
import { AuthService } from '../../services/auth.service';
import { CompetencyFormService } from '../../services/CompetencyFormService';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';

@Component({
  selector: 'app-current-evaluation',
  templateUrl: './current-evaluation.component.html',
  styleUrls: ['./current-evaluation.component.css']
})
export class CurrentEvaluationComponent implements OnInit {

  loginUser: any;
  public empKPIData: any[] = []
  kpiDetails: any = {};
  currentKpiId: any;
  selIndex: number;
  weight: number;
  kpiForm: FormGroup;
  selfCompetencyForm: FormGroup;
  competencyList: any = [];
  evaluationForm: any = {};
  employeeCompetencyList: any;
  questions$: Observable<CompetencyBase<any>[]>;
  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService,
    private fb: FormBuilder,
    private qcs: CompetencyFormService,
  ) {
    this.loginUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.initKPIForm()
    this.initCompetencyForm();
    this.getTabsData();
  }
  public columnDefs = [
    {
      headerName: 'Name', field: 'Name', width: 320, sortable: true, filter: true,
      cellRenderer: (data) => {
        return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
      }
    },
    { headerName: 'No.of Kpis', field: 'KpiCount', sortable: true, filter: true },
    // { headerName: 'Score (self)', field: 'Score', width: 150, sortable: true, filter: true },
    // { headerName: 'Status', field: 'Status', width: 150, sortable: true, filter: true },
    // { headerName: 'KPI Submited', field: 'IsSubmitedKPIs', width: 150, sortable: true, filter: true },
    {
      headerName: 'Action', field: '', width: 200, autoHeight: true, suppressSizeToFit: true,
      cellRenderer: (data) => {
        return `<i class="icon-plus font-1xl" style="cursor:pointer ;padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="addKPI" title="Add KPI"></i>       
        `


      }
    }
  ];

  /**To GET ALL  tabs data */
  getTabsData() {
    forkJoin(
      this.getCurrentEvaluationDetails().pipe(catchError(error => of({ error: error, isError: true })))
      //this.getTSKPIs().pipe(catchError(error => of({ error: error, isError: true }))),
      //this.getCompetencyQuestionsList().pipe(catchError(error => of({ error: error, isError: true })))
    ).subscribe(([res1]) => {
      if (res1) {

        this.evaluationForm = res1;
        if (res1.Competencies.Employees[0]) {
          this.employeeCompetencyList = res1.Competencies.Employees[0].Competencies;
          this.employeeCompetencyList = res1.Competencies.Employees[0].Competencies;
          // this.setCompetencies();
          this.prepareCompetencyQuestions();
        }

        console.log('the evauation form', this.evaluationForm)

      }
      //   if (res1 && !res1.isError) {
      //     this.setWeighting(res1.filter(item => item.IsDraft === false).length);
      //     if (res1 && res1.length > 0) {
      //       this.empKPIData = res1;
      //       debugger
      //       this.kpiDetails = this.empKPIData[0];//.filter(e => e._id == this.currentKpiId)[0];
      //       this.selIndex = 0;//this.empKPIData.findIndex(e => e._id == this.currentKpiId);
      //       this.initKPIForm();
      //     }
      //   }
      //  if(res2) {
      //    debugger
      //  }

    });

  }
  getCurrentEvaluationDetails() {
    this.perfApp.route = "evaluation";
    this.perfApp.method = "GetEmpCurrentEvaluation",
      this.perfApp.requestBody = { empId: this.loginUser._id }
    return this.perfApp.CallAPI()
  }

  getTSKPIs() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetKpisForTS",
      this.perfApp.requestBody = { TsId: this.loginUser._id }
    return this.perfApp.CallAPI()
  }
  getCompetencyQuestionsList() {
    this.perfApp.route = "evaluation";
    this.perfApp.method = "GetCompetencyValues",
      this.perfApp.requestBody = { EvaluationId: '5f91f79a597ad544742141df', employeeId: this.loginUser._id }
    return this.perfApp.CallAPI()
  }

  setWeighting(length: any) {
    this.weight = length == 0 ? 100 : Math.round(100 / length);
    this.kpiForm.patchValue({ Weighting: this.weight });
  }
  initKPIForm() {

    this.kpiForm = this.fb.group({
      MeasurementCriteria: [this.kpiDetails.MeasurementCriteria ?
        (this.kpiDetails.MeasurementCriteria[0] ? this.kpiDetails.MeasurementCriteria[0].measureId.Name : '') : '',
      ],

      Kpi: [this.kpiDetails.Kpi],
      TargetCompletionDate: [this.kpiDetails.TargetCompletionDate ? new Date(this.kpiDetails.TargetCompletionDate) : '', []],
      YearEndComments: [this.kpiDetails.YearEndComments ? this.kpiDetails.YearEndComments : ''],
      YECommManager: [this.kpiDetails.YECommManager ? this.kpiDetails.YECommManager : ''],
      Weighting: [this.kpiDetails.Weighting ? this.kpiDetails.Weighting : ""],
      Signoff: [this.loginUser.FirstName],
      CoachingReminder: [this.kpiDetails.CoachingReminder ? this.kpiDetails.CoachingReminder : this.loginUser.Organization.CoachingReminder],

      IsSubmit: ['false'],
      IsDraft: [''],
      Score: [this.kpiDetails.Score ? this.kpiDetails.Score : ''],
      ManagerScore: [this.kpiDetails.ManagerScore ? this.kpiDetails.ManagerScore : ''],
      IsActive: [this.kpiDetails.IsActive + ''],
      ManagerFTSubmitedOn: [this.kpiDetails.ManagerFTSubmitedOn],
      Status: [this.kpiDetails.Status ? this.kpiDetails.Status : ''],
    });


  }
  initCompetencyForm() {
    this.selfCompetencyForm = this.fb.group({
      Comments: ['', [Validators.required]],
      OverallRating: [1, [Validators.required]],
      IsDraft: [true]
    })

  }

  nextKpi() {
    this.selIndex = this.selIndex + 1;
    this.kpiDetails = this.empKPIData[this.selIndex];
    this.initKPIForm()
    this.currentKpiId = this.kpiDetails._id;
  }

  priKpi() {
    this.selIndex = this.selIndex - 1;
    this.kpiDetails = this.empKPIData[this.selIndex];
    this.initKPIForm()
    this.currentKpiId = this.kpiDetails._id;
  }

  /**For Self-Competency Rating Begin */
  get scfc() {
    return this.selfCompetencyForm.controls.competencyList;
  }
  get scf() {
    return this.selfCompetencyForm.controls;
  }
  setCompetencies() {
    let control = <FormArray>this.selfCompetencyForm.controls.competencyList;
    this.employeeCompetencyList.forEach(x => {
      control.push(this.fb.group({
        Competency: x.Competency.Name,
        Questions: this.setQuestions(x)
      }))
    })
    console.log('control', control)
  }
  setQuestions(x) {
    let arr = new FormArray([])
    x.Questions.forEach(y => {
      arr.push(this.fb.group({
        Question: y.Question,
        Rating: y.Rating.Ra //this.setOptions(y)
      }))
    })
    return arr;
  }
  setOptions(y) {

    let arr = new FormArray([])
    y.Rating.forEach(o => {
      arr.push(this.fb.group({
        Text: o.Text,
        Value: o.Value
      }))
    })
    return arr;
  }

  submitCompetencyRating() {
    debugger
    console.log('after submit with rating', this.employeeCompetencyList)

  }
  competencyQuestionsList = [];
  prepareCompetencyQuestions() {
    var questions: CompetencyBase<string>[] = [];

    this.selfCompetencyForm.value.Comments = this.evaluationForm.Competencies.Employees[0].CompetencyComments,
      this.selfCompetencyForm.value.OverallRating = this.evaluationForm.Competencies.Employees[0].OverallRating,
      this.selfCompetencyForm.value.IsDraft = !this.evaluationForm.Competencies.Employees[0].CompetencySubmitted
    console.log('this.selfCompetencyForm.value', this.selfCompetencyForm.value)
    this.employeeCompetencyList.forEach(element => {
      questions = [];
      element.Questions.forEach(q => {
        questions.push(new QuestionBase({
          key: q._id,
          label: q.Question,
          options: q.Rating,
          order: 1,
          required: true,
          value: q.SelectedRating
        }))

      });
      debugger
      this.competencyQuestionsList.push({

        CompetenyName: element.Competency.Name,
        CompetencyId: element.Competency._id,
        CompetencyRowId: element._id,
        Questions: questions,
        form: this.qcs.toFormGroup(questions),
        Comments: this.evaluationForm.Competencies.Employees[0].CompetencyComments,
        OverallRating: this.evaluationForm.Competencies.Employees[0].OverallRating,
        IsDraft: !this.evaluationForm.Competencies.Employees[0].CompetencySubmitted
      })

    });

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
      if (_qna && _qna.length > 0) {
        debugger
        _qna.forEach(q => {
          debugger
          competencyQA.QnA.push({ CompetencyRowId: element.CompetencyRowId, CompetencyId: element.CompetencyId, QuestionId: q[0], Answer: q[1] })
        });
      } else {
        if (!isDraft) {
          isvalid = false;

        }
      }


    });
    if (!isvalid) {
      this.snack.error('Please provide rating to all question(s) in each competency')
      return;
    }
    competencyQA.Comments = this.selfCompetencyForm.value.Comments
    competencyQA.OverallRating = this.selfCompetencyForm.value.OverallRating

    competencyQA.EvaluationId = this.evaluationForm.Competencies._id
    competencyQA.EmployeeId = this.loginUser._id
    competencyQA.IsDraft = isDraft


    console.log('QnA', competencyQA);
    this.perfApp.route = "app";
    this.perfApp.method = "SaveCompetencyQnA",
      this.perfApp.requestBody = competencyQA;// { TsId: this.loginUser._id }
    this.perfApp.CallAPI().subscribe(x => {

      console.log(x)
    }, error => {

      console.log('error', error)
    })

  }
  /**For Self-Competency Rating End */

}
