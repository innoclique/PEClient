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

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AlertDialog } from '../../Models/AlertDialog';
import { AlertComponent } from '../../shared/alert/alert.component';

@Component({
  selector: 'app-do-peer-review',
  templateUrl: './do-peer-review.component.html',
  styleUrls: ['./do-peer-review.component.css']
})
export class DoPeerReviewComponent implements OnInit {
  public alert: AlertDialog;
  currentReview: any = {};
  loginUser: any;
  competencyList: any
  peerCompetencyForm: FormGroup;
  questions$: Observable<CompetencyBase<any>[]>;
  private subscriptions: Subscription[] = [];
  public oneAtATime: boolean = true;
  isSubmitted: Boolean = false;
  isContentOpen:Boolean=false;
  public forEmployee:any;
  constructor(private authService: AuthService,
    public dialog: MatDialog,
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
    this.alert = new AlertDialog();
  }
  initCompetencyForm() {
    this.peerCompetencyForm = this.fb.group({
      OverallComments: ['', [Validators.required]],
      OverallRating: [1, [Validators.required]],
      IsDraft: [true]
    })

  }
  getCompetencyQuestions() {

    this.perfApp.route = "app";
    this.perfApp.method = "GetPendingPeerReviewsToSubmit",
      this.perfApp.requestBody = {
        "EvaluationId": this.currentReview.EvaluationId,// "5f9afa0b8705d33cfc4228fb",
        "ForEmployeeId": this.currentReview.EmployeeId,// "5f904bdfa8f3771460ef153b"
        "PeerId": this.loginUser._id
      }
    this.subscriptions.push(this.perfApp.CallAPI().subscribe(c => {
      if (c) {
        this.competencyList = c;
        console.table(c)
        
        this.forEmployee=c.ForEmployee[0]
        this.forEmployee.EvaluationPeriod=c.EvaluationPeriod;
        this.forEmployee.EvaluationDuration=c.EvaluationDuration;
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
    let _peer = this.competencyList.Peer[0];
    if (_peer) {
      this.peerCompetencyForm.controls["OverallComments"].setValue(this.competencyList.Peer[0].CompetencyComments)
      this.peerCompetencyForm.controls["OverallRating"].setValue(this.competencyList.Peer[0].CompetencyOverallRating)
      this.peerCompetencyForm.value.IsDraft = this.competencyList.Peer[0].CompetencySubmitted
      this.isSubmitted = this.competencyList.Peer[0].CompetencySubmitted

      console.log('this.selfCompetencyForm.value', this.peerCompetencyForm.value)
      this.competencyList.Competencies.forEach(c => {
        questions = [];
        c.Questions.forEach(q => {
          let cq = this.competencyList.Questions.find(x => x._id === q)
          var selectedAnswer = "-1";
          if (cq && _peer.QnA && _peer.QnA.length > 0) {
            var answer = this.competencyList.Peer[0].QnA.find(x => x.CompetencyId === c._id && x.QuestionId === q);
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
        var cc=_peer.QnA.find(x => x.CompetencyId === c._id);
        this.competencyQuestionsList.push({
          CompetenyName: c.Name,
          CompetencyId: c._id,
          //CompetencyRowId: element._id,
          Questions: questions,
          form: this.qcs.toFormGroup(questions),
          comments: cc?cc.Comments:""
        })

      });
    }
  }
  savePeerCompetencyFormAsDraft() {
    this.savePeerCompetencyForm(true)
  }
  submitPeerCompetencyForm() {
    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to submit peer rating?";
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
     if (resp=='yes') {
      this.savePeerCompetencyForm(false)

     } else {
       
     }
    })
    
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
    competencyQA.CompetencyComments = this.peerCompetencyForm.value.OverallComments
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
  const snref=  this.snack.success(`Peer Review ${isDraft?'Saved':'Submitted'} Successfully`);
  snref.afterDismissed().subscribe(() => {
    console.log('The snack-bar was dismissed sgsgggsjr');
    this.router.navigate(['employee/peerreview']);
  });  
 
    }, error => {
      this.snack.error('Something went wrong');
      console.log('error', error)
    })

  }

  cancelCompetencyRating() {
    this.router.navigate(['employee/peerreview']);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }
  getAverage(arr) {
    debugger
    var sum = 0;
    for (var i = 0; i < arr.length; i++) {
      if(arr[i] != '-1')
      sum += parseInt(arr[i], 10); //don't forget to add the base
    }
    var avg = sum / arr.length;
    // const average= arr.reduce((p, c) => p + c, 0) / arr.length;
    console.log('average score :', avg);
    return avg;
  }
}
