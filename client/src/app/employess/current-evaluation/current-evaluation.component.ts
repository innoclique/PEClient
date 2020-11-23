import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
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
  selfCompetencyForm: FormGroup;
  competencyList: any = [];
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
  pgSubmitStatus="";
  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService,
    private fb: FormBuilder,
    private qcs: CompetencyFormService,
    private datePipe: DatePipe
  ) {
    this.loginUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {

    this.initCompetencyForm();
    this.initFinalRatingForm();
    this.getTabsData();

    this.authService.getIsPGSubmitStatus().subscribe(status=>this.pgSubmitStatus=status);

  }
  public columnDefs = [
    {
      headerName: 'Name', field: 'Name', width: 320, sortable: true, filter: true,
      cellRenderer: (data) => {
        return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
      }
    },
    { headerName: 'No.of  Performance Goals', field: 'KpiCount', sortable: true, filter: true },
    // { headerName: 'Score (self)', field: 'Score', width: 150, sortable: true, filter: true },
    // { headerName: 'Status', field: 'Status', width: 150, sortable: true, filter: true },
    // { headerName: 'Performance Goal Submited', field: 'IsSubmitedKPIs', width: 150, sortable: true, filter: true },
    {
      headerName: 'Action', field: '', width: 200, autoHeight: true, suppressSizeToFit: true,
      cellRenderer: (data) => {
        return `<i class="icon-plus font-1xl" style="cursor:pointer ;padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="addKPI" title="Add Performance Goal"></i>       
        `
      }
    }
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
          this.FinalRatingForm.controls["EmployeeSubmittedOn"].setValue(this.datePipe.transform(res1.FinalRating.Self.SubmittedOn))
          this.showEmployeeSubmit = !res1.FinalRating.Self.IsSubmitted;
        }
        if (res1 && Object.keys(res1.PeerScoreCard).length > 0) {
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
      EmployeeSignOff: [],
      EmployeeSubmittedOn: ['']
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
          showEmpRating:false,
          empRating:0,
          empKey:q._id
        }))

      });

      this.competencyQuestionsList.push({
        CompetenyName: element.Competency.Name,
        CompetencyId: element.Competency._id,
        CompetencyRowId: element._id,
        Questions: questions,
        form: this.qcs.toFormGroup(questions),
        comments: element.Comments,
        CompetencyAvgRating:element.CompetencyAvgRating
      })

    });

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

      if (_qna && _qna.length > 0 && _qna.filter(x=>x[1]==="").length===0) {
        var _avgScore = this.getAverage(_qna.map(x => x[1]));
        _qna.forEach(q => {
          competencyQA.QnA.push({ CompetencyRowId: element.CompetencyRowId, CompetencyId: element.CompetencyId, QuestionId: q[0], Answer: q[1], Comments: _lastitem ? _lastitem[1] : "", CompetencyAvgRating: _avgScore })
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
      this.showCompetencySubmit=false;
      this.snack.success(isDraft ? 'Competencies Rating Saved Successfully' : 'Competency Rating Submitted Successfully');
    }, error => {
      this.snack.error('something went wrong.')
      console.log('error', error)
    })

  }
  /**For Self-Competency Rating End */
  submitFinalRating() {
        if(this.pgSubmitStatus!='true'){
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
        RevComments: this.FinalRatingForm.value.EmployeeRevComments,
        OverallRating: this.FinalRatingForm.value.EmployeeOverallRating,
        IsDraft: isDraft,
        SignOff: `${this.loginUser.FirstName} ${this.loginUser.LastName}`
      };
    console.log('final rating form', this.perfApp.requestBody)

    if (isDraft) {
      this.perfApp.CallAPI().subscribe(x => {
        console.log(x)
        this.snack.success('Successfully Submitted Final Rating');
        window.location.reload();
      }, error => {
        console.log('error', error)
        this.snack.error('Something went wrong')
      })
    } else {
      var confirm = window.confirm('Are you sure, you want to submit Final Rating?')

      if (confirm) {
        this.perfApp.CallAPI().subscribe(x => {
          console.log(x)
          this.snack.success('Successfully Submitted Final Rating');
          window.location.reload();
        }, error => {
          console.log('error', error)
          this.snack.error('Something went wrong')
        })

      }
    }


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
