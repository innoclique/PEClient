import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { CompetencyBase } from '../../Models/CompetencyFormModel';
import { QuestionBase } from '../../Models/QuestionBase';
import { AuthService } from '../../services/auth.service';
import { CompetencyFormService } from '../../services/CompetencyFormService';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';

@Component({
  selector: 'app-do-dr-review',
  templateUrl: './do-dr-review.component.html',
  styleUrls: ['./do-dr-review.component.css']
})
export class DoDrReviewComponent implements OnInit {

  currentReview: any = {};
  loginUser: any;
  competencyList: any
  competencyForm: FormGroup;
  questions$: Observable<CompetencyBase<any>[]>;
  private subscriptions: Subscription[] = [];
  public oneAtATime: boolean = true;
  isSubmitted: Boolean = false;
  isContentOpen:Boolean=false;
  constructor(private authService: AuthService,
    private router: Router,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private qcs: CompetencyFormService,
    private fb: FormBuilder,) {
    this.loginUser = this.authService.getCurrentUser();

    this.activatedRoute.params.subscribe(params => {
      this.currentReview = params;
      console.log('current peer', this.currentReview)
      this.getCompetencyQuestions()
    });
  }

  ngOnInit(): void {
    this.initCompetencyForm()
  }
  initCompetencyForm() {
    this.competencyForm = this.fb.group({
      OverallComments: ['', [Validators.required]],
      OverallRating: [1, [Validators.required]],
      IsDraft: [true]
    })

  }
  getCompetencyQuestions() {

    this.perfApp.route = "app";
    this.perfApp.method = "GetPendingDRReviewsToSubmit",
      this.perfApp.requestBody = {
        "EvaluationId": this.currentReview.EvaluationId,// "5f9afa0b8705d33cfc4228fb",
        "ForEmployeeId": this.currentReview.EmployeeId,// "5f904bdfa8f3771460ef153b"
        "DirectReport": this.loginUser._id
      }
    this.subscriptions.push(this.perfApp.CallAPI().subscribe(c => {
      if (c) {
        this.competencyList = c;
        console.table(c)
        this.prepareCompetencyQuestions();
      }
    }, error => {
      this.snack.error(error.message)
    })
    )
  }

  competencyQuestionsList = [];
  prepareCompetencyQuestions() {
    var questions: CompetencyBase<string>[] = [];
    let _dr = this.competencyList.DirectReportee[0];
    if (_dr) {
      this.competencyForm.controls["OverallComments"].setValue(this.competencyList.DirectReportee[0].CompetencyComments)
      this.competencyForm.controls["OverallRating"].setValue(this.competencyList.DirectReportee[0].CompetencyOverallRating)
      this.competencyForm.value.IsDraft = this.competencyList.DirectReportee[0].CompetencySubmitted
      this.isSubmitted = this.competencyList.DirectReportee[0].CompetencySubmitted

      console.log('this.selfCompetencyForm.value', this.competencyForm.value)
      this.competencyList.Competencies.forEach(c => {
        questions = [];
        c.Questions.forEach(q => {
          let cq = this.competencyList.Questions.find(x => x._id === q)
          var selectedAnswer = "-1";
          if (cq && _dr.QnA && _dr.QnA.length > 0) {

            var answer = this.competencyList.DirectReportee[0].QnA.find(x => x.CompetencyId === c._id && x.QuestionId === q);

            if (answer) {
              selectedAnswer = answer.Answer ? answer.Answer : "-1"
              console.log('answer', answer.Answer);
            }
          }

          questions.push(new QuestionBase({
            key: cq._id,
            label: cq.Question,
            options: cq.Rating,
            order: 1,
            required: true,
            value: selectedAnswer
          }))
        });
        debugger
        var cc=_dr.QnA.find(x => x.CompetencyId === c._id);
        this.competencyQuestionsList.push({
          CompetenyName: c.Name,
          CompetencyId: c._id,
          //CompetencyRowId: element._id,
          Questions: questions,
          form: this.qcs.toFormGroup(questions),
          comments: cc?cc.Comments:"",
          CompetencyAvgRating:cc.CompetencyAvgRating
          // Comments: this.evaluationForm.Competencies.Employees[0].CompetencyComments,
          // OverallRating: this.evaluationForm.Competencies.Employees[0].OverallRating,
          // IsDraft: !this.evaluationForm.Competencies.Employees[0].CompetencySubmitted
        })

      });
    }
  }
  savePeerCompetencyFormAsDraft() {
    this.savePeerCompetencyForm(true)
  }
  submitPeerCompetencyForm() {
    this.savePeerCompetencyForm(false)
  }
  savePeerCompetencyForm(isDraft) {
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

          competencyQA.QnA.push({ CompetencyId: element.CompetencyId, QuestionId: q[0], Answer: q[1], Comments: _lastitem ? _lastitem[1] : "",CompetencyAvgRating: _avgScore })
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
    competencyQA.CompetencyComments = this.competencyForm.value.OverallComments
    competencyQA.OverallRating = this.competencyForm.value.OverallRating

    competencyQA.EvaluationId = this.currentReview.EvaluationId
    competencyQA.ForEmployeeId = this.currentReview.EmployeeId
    competencyQA.DrId = this.loginUser._id
    competencyQA.IsDraft = isDraft


    console.log('QnA', competencyQA);
    this.perfApp.route = "app";
    this.perfApp.method = "SaveDRReview",
      this.perfApp.requestBody = competencyQA;// { TsId: this.loginUser._id }
    this.perfApp.CallAPI().subscribe(x => {

      console.log(x)
      this.snack.success(' Review Submitted Successfully');
      this.router.navigate(['employee/drreview']);
    }, error => {
      this.snack.error('Something went wrong');
      console.log('error', error)
    })

  }

  cancelCompetencyRating() {
    this.router.navigate(['employee/drreview']);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
  getAverage(arr) {
    debugger
    var sum = 0;
    for (var i = 0; i < arr.length; i++) {
      sum += parseInt(arr[i], 10); //don't forget to add the base
    }

    var avg = sum / arr.length;
    // const average= arr.reduce((p, c) => p + c, 0) / arr.length;
    console.log('avarage score :', avg);
    return avg;
  }
}
