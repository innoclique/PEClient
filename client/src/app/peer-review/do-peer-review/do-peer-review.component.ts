import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { CompetencyBase } from '../../Models/CompetencyFormModel';
import { QuestionBase } from '../../Models/QuestionBase';
import { AuthService } from '../../services/auth.service';
import { CompetencyFormService } from '../../services/CompetencyFormService';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';

@Component({
  selector: 'app-do-peer-review',
  templateUrl: './do-peer-review.component.html',
  styleUrls: ['./do-peer-review.component.css']
})
export class DoPeerReviewComponent implements OnInit {
  currentReview: any = {};
  loginUser: any;
  competencyList:any
  peerCompetencyForm:FormGroup;
  questions$: Observable<CompetencyBase<any>[]>;
  private subscriptions: Subscription[] = [];
  public oneAtATime: boolean = true;
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
       this.currentReview =params;
       console.log('current peer',this.currentReview)
       this.getCompetencyQuestions()
     });   
  }

  ngOnInit(): void {
    this.initCompetencyForm()
  }
  initCompetencyForm() {
    this.peerCompetencyForm = this.fb.group({
      Comments: ['', [Validators.required]],
      OverallRating: [1, [Validators.required]],
      IsDraft: [true]
    })

  }
  getCompetencyQuestions(){
    
    this.perfApp.route = "app";
    this.perfApp.method = "GetPendingPeerReviewsToSubmit",
      this.perfApp.requestBody = {
        "EvaluationId":this.currentReview.EvaluationId,// "5f9afa0b8705d33cfc4228fb",
        "ForEmployeeId":this.currentReview.EmployeeId,// "5f904bdfa8f3771460ef153b"
        "PeerId":this.loginUser._id
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
this.peerCompetencyForm.controls["Comments"].setValue(this.competencyList.Peer[0].CompetencyComments)
this.peerCompetencyForm.controls["OverallRating"].setValue(this.competencyList.Peer[0].CompetencyOverallRating)
     
       
    //   this.peerCompetencyForm.value.IsDraft = !this.evaluationForm.Competencies.Employees[0].CompetencySubmitted
    console.log('this.selfCompetencyForm.value', this.peerCompetencyForm.value)
    this.competencyList.Competencies.forEach(c => {      
      questions = [];
      c.Questions.forEach(q => {        
        let cq=this.competencyList.Questions.find(x=>x._id===q)
        if(cq){
          questions.push(new QuestionBase({
            key: cq._id,
            label: cq.Question,
            options: cq.Rating,
            order: 1,
            required: true,
            value: this.competencyList.Peer[0].QnA.find(x=>x.CompetencyId===c._id && x.QuestionId===q).Answer
          }))
          
        }
      });
      
      
      this.competencyQuestionsList.push({
        CompetenyName: c.Name,
        CompetencyId: c._id,
        //CompetencyRowId: element._id,
        Questions: questions,
        form: this.qcs.toFormGroup(questions),
        // Comments: this.evaluationForm.Competencies.Employees[0].CompetencyComments,
        // OverallRating: this.evaluationForm.Competencies.Employees[0].OverallRating,
        // IsDraft: !this.evaluationForm.Competencies.Employees[0].CompetencySubmitted
      })

    });

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
      if (_qna && _qna.length > 0) {
        
        _qna.forEach(q => {
          
          competencyQA.QnA.push({  CompetencyId: element.CompetencyId, QuestionId: q[0], Answer: q[1] })
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
    competencyQA.CompetencyComments = this.peerCompetencyForm.value.Comments
    competencyQA.OverallRating = this.peerCompetencyForm.value.OverallRating

    competencyQA.EvaluationId = this.currentReview.EvaluationId
    competencyQA.ForEmployeeId = this.currentReview.EmployeeId
    competencyQA.PeerId = this.loginUser._id
    competencyQA.IsDraft = isDraft


    console.log('QnA', competencyQA);
    this.perfApp.route = "app";
    this.perfApp.method = "SavePeerReview",
      this.perfApp.requestBody = competencyQA;// { TsId: this.loginUser._id }
    this.perfApp.CallAPI().subscribe(x => {

      console.log(x)
    }, error => {

      console.log('error', error)
    })

  }

  cancelCompetencyRating(){
    
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

}
