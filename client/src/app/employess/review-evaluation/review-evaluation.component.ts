import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { error } from 'console';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CompetencyBase } from '../../Models/CompetencyFormModel';
import { QuestionBase } from '../../Models/QuestionBase';
import { AuthService } from '../../services/auth.service';
import { CompetencyFormService } from '../../services/CompetencyFormService';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';
import { ThemeService } from '../../services/theme.service';


@Component({
  selector: 'app-review-evaluation',
  templateUrl: './review-evaluation.component.html',
  styleUrls: ['./review-evaluation.component.css']
})
export class ReviewEvaluationComponent implements OnInit,AfterViewInit {

  loginUser: any;
  selectedUser: any;
  seletedTabRole:any;
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
  currEvaluation: any;
  public oneAtATime: boolean = true;
  public FinalRatingForm: FormGroup;
  public showEmployeeSubmit: Boolean = true;
  public showManagerSubmit: Boolean = true;
  public showThirdSignatorySubmit: Boolean = true;
  public PeerScoreCard: any;
  DirectReporteeScoreCard: any;
  currentEmpId: any;
  currentAction: any;

  @ViewChild('evTabset') tabset: TabsetComponent;

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
   


    this.activatedRoute.params.subscribe(  params => {
      
      if (params['action']) {
       this.currentEmpId = params['empId'];
       this.currentAction = params['action'];
       this.seletedTabRole = params['actor'];
  debugger
       this.GetEmployeeDetailsById();
       

      }
      })

      this.loginUser = this.authService.getCurrentUser();
    
   
  }

  ngAfterViewInit(){
        this.goto(this.currentAction)
  }

  ngOnInit(): void {   
  }


  callInitApis(){
      this.initCompetencyForm();
      this.initFinalRatingForm();
      this.getTabsData();
}


goto(selTab){

  // if (selTab=='reviewKPI') {
  //   this.tabset.tabs[0].active = true;
  // } else  if (selTab=='reviewGoals') {
  //   this.tabset.tabs[2].active = true;
  // }
  // else  if (selTab=='reviewEval') {
  //   this.tabset.tabs[4].active = true;
  // }

  
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
      //this.getTSKPIs().pipe(catchError(error => of({ error: error, isError: true }))),
      //this.getCompetencyQuestionsList().pipe(catchError(error => of({ error: error, isError: true })))
    ).subscribe(([res1]) => {
      debugger
      if (res1 && !res1.isError) {

        this.evaluationForm = res1;
        if (res1.Competencies.Employee) {
          this.employeeCompetencyList = res1.Competencies.Employee.Competencies;
          
          // this.setCompetencies();
          this.prepareCompetencyQuestions();
          console.log('the evauation form', this.evaluationForm)
        }
        if (res1.FinalRating) {
          this.FinalRatingForm.controls["EmployeeComments"].setValue(res1.FinalRating.Self.YearEndComments)
          this.FinalRatingForm.controls["EmployeeOverallRating"].setValue(res1.FinalRating.Self.YearEndRating)
          this.FinalRatingForm.controls["EmployeeIsDraft"].setValue(!res1.FinalRating.Self.IsSubmitted)
          this.FinalRatingForm.controls["EmployeeSignOff"].setValue(res1.FinalRating.Self.SignOff)
          this.FinalRatingForm.controls["EmployeeSubmittedOn"].setValue(this.datePipe.transform(res1.FinalRating.Self.SubmittedOn))
          this.showEmployeeSubmit = !res1.FinalRating.Self.IsSubmitted;


          this.FinalRatingForm.controls["ManagerComments"].setValue(res1.FinalRating.Manager.YearEndComments)
          this.FinalRatingForm.controls["ManagerOverallRating"].setValue(res1.FinalRating.Manager.YearEndRating)
          this.FinalRatingForm.controls["ManagerIsDraft"].setValue(!res1.FinalRating.Manager.IsSubmitted)
          this.FinalRatingForm.controls["ManagerSignOff"].setValue(res1.FinalRating.Manager.SignOff?res1.FinalRating.Manager.SignOff
            :this.loginUser.FirstName+" "+this.loginUser.LastName)
          this.FinalRatingForm.controls["ManagerSubmittedOn"].setValue(this.datePipe.transform(res1.FinalRating.Manager.SubmittedOn))
          this.showManagerSubmit = !res1.FinalRating.Manager.IsSubmitted;
          this.FinalRatingForm.controls["ManagerRevComments"].setValue(res1.FinalRating.Manager.RevComments)
          this.FinalRatingForm.controls["ManagerReqRevision"].setValue(res1.FinalRating.Manager.ReqRevision)


          debugger
          this.FinalRatingForm.controls["ThirdSignatoryComments"].setValue(res1.FinalRating.ThirdSignatory.YearEndComments)
          this.FinalRatingForm.controls["ThirdSignatoryRevComments"].setValue(res1.FinalRating.ThirdSignatory.RevComments)
          this.FinalRatingForm.controls["TSReqRevision"].setValue(res1.FinalRating.ThirdSignatory.ReqRevision)
          this.FinalRatingForm.controls["ThirdSignatoryIsDraft"].setValue(!res1.FinalRating.ThirdSignatory.IsSubmitted)
          this.FinalRatingForm.controls["ThirdSignatorySignOff"].setValue(res1.FinalRating.ThirdSignatory.SignOff?res1.FinalRating.ThirdSignatory.SignOff
            :this.loginUser.FirstName+" "+this.loginUser.LastName)
          this.FinalRatingForm.controls["ThirdSignatorySubmittedOn"].setValue(this.datePipe.transform(res1.FinalRating.ThirdSignatory.SubmittedOn))
          this.showThirdSignatorySubmit = !res1.FinalRating.ThirdSignatory.IsSubmitted;


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
      
    },error=>{
      console.log('error while getting evaluation data',error)
      this.evaluationForm=null;
      this.snack.error('something went wrong')
    });

  }
  getCurrentEvaluationDetails() {
    this.perfApp.route = "evaluation";
    this.perfApp.method = "GetEmpCurrentEvaluation",
      this.perfApp.requestBody = { EmployeeId: this.currentEmpId }
    return this.perfApp.CallAPI()
  }

 async GetEmployeeDetailsById() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetEmployeeDataById",
      this.perfApp.requestBody = { id: this.currentEmpId }
      this.perfApp.CallAPI().subscribe(x => {
      this.selectedUser =x;

      this.callInitApis();
      }, error => {
        console.log('error', error)
        this.evaluationForm=null;
      this.snack.error('something went wrong')
      })
  }

  getTSKPIs() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetKpisForTS",
      this.perfApp.requestBody = { TsId: this.selectedUser._id }
    return this.perfApp.CallAPI()
  }
  getCompetencyQuestionsList() {
    this.perfApp.route = "evaluation";
    this.perfApp.method = "GetCompetencyValues",
      this.perfApp.requestBody = { EvaluationId: '5f91f79a597ad544742141df', employeeId: this.currentEmpId}
    return this.perfApp.CallAPI()
  }

  setWeighting(length: any) {
    this.weight = length == 0 ? 100 : Math.round(100 / length);
    this.kpiForm.patchValue({ Weighting: this.weight });
  }
 
  initCompetencyForm() {
    this.selfCompetencyForm = this.fb.group({
      OverallComments: ['', [Validators.required]],
      OverallRating: ['', [Validators.required]],
      IsDraft: [true]
    })

  }
  initFinalRatingForm() {
    this.FinalRatingForm = this.fb.group({
      EmployeeComments: ['', [Validators.required]],
      EmployeeOverallRating: [1, [Validators.required]],
      EmployeeIsDraft: [true],
      EmployeeSignOff: [],
      EmployeeSubmittedOn: ['']

      ,ManagerComments: ['', [Validators.required]],
      ManagerOverallRating: [1, [Validators.required]],
      ManagerRevComments: ['',],
      ManagerReqRevision: [false],
      ManagerIsDraft: [true],
      ManagerSignOff: [],
      ManagerSubmittedOn: ['']

      ,ThirdSignatoryComments: ['', [Validators.required]],
      ThirdSignatoryRevComments: ['',],
      TSReqRevision: [false],
      ThirdSignatoryIsDraft: [true],
      ThirdSignatorySignOff: [],
      ThirdSignatorySubmittedOn: ['']
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
  prepareCompetencyQuestions() {
    var questions: CompetencyBase<string>[] = [];
debugger
    this.selfCompetencyForm.controls["OverallComments"].setValue( this.evaluationForm.Competencies.Employee.CompetencyComments,),
    this.selfCompetencyForm.controls["OverallRating"].setValue( this.evaluationForm.Competencies.Employee.CompetencyOverallRating),
    this.selfCompetencyForm.controls["IsDraft"].setValue(!this.evaluationForm.Competencies.Employee.CompetencySubmitted)
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

      this.competencyQuestionsList.push({

        CompetenyName: element.Competency.Name,
        CompetencyId: element.Competency._id,
        CompetencyRowId: element._id,
        Questions: questions,
        form: this.qcs.toFormGroup(questions),
        comments:element.Comments,
        OverallComments: this.evaluationForm.Competencies.Employee.CompetencyComments,
        OverallRating: this.evaluationForm.Competencies.Employee.OverallRating,
        IsDraft: !this.evaluationForm.Competencies.Employee.CompetencySubmitted
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
      if (_qna && _qna.length > 0) {
        _qna.forEach(q => {
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
    competencyQA.Comments = this.selfCompetencyForm.value.OverallComments;
    competencyQA.OverallRating = this.selfCompetencyForm.value.OverallRating;
    competencyQA.EvaluationId = this.evaluationForm.Competencies._id;
    competencyQA.EmployeeId = this.selectedUser._id;
    competencyQA.IsDraft = isDraft;
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
  submitFinalRating() {

    
if (this.FinalRatingForm.value.ManagerReqRevision &&
  this.FinalRatingForm.value.ManagerRevComments.length==0) {
    this.snack.error('Revision Comments is mandatory')
    return;
}
    this.saveFinalRating(false)
  }
  draftFinalRating() {
    this.saveFinalRating(true)
  }
  saveFinalRating(isDraft) {
    debugger
    this.perfApp.route = "app";
    this.perfApp.method = "SaveManagerFinalRating",
      this.perfApp.requestBody = {
        EvaluationId: this.evaluationForm.Competencies.EvaluationId,
        EmployeeId: this.selectedUser._id,
        YearEndComments: this.FinalRatingForm.value.ManagerComments,
        OverallRating: this.FinalRatingForm.value.ManagerOverallRating,

        RevComments: this.FinalRatingForm.value.ManagerRevComments,
        ReqRevision: this.FinalRatingForm.value.ManagerReqRevision,

        IsDraft: isDraft,
        SignOff: `${this.loginUser.FirstName} ${this.loginUser.LastName}`
      };
    console.log('final rating form', this.perfApp.requestBody)
    this.perfApp.CallAPI().subscribe(x => {
      console.log(x)
      this.snack.success('Successfully Submitted Final Rating');
      window.location.reload();
    }, error => {
      console.log('error', error)
      this.snack.error('Something went wrong')
    })

  }

  submitTSFinalRating() {

if (this.FinalRatingForm.value.TSReqRevision &&
  this.FinalRatingForm.value.ThirdSignatoryRevComments.length==0) {
    this.snack.error('Revision Comments is mandatory')
    return;
}

    this.saveTSFinalRating(false)
  }
  draftTSFinalRating() {
    this.saveTSFinalRating(true)
  }
  
  saveTSFinalRating(isDraft) {
    this.perfApp.route = "app";
    this.perfApp.method = "SaveTSFinalRating",
      this.perfApp.requestBody = {
        EvaluationId: this.evaluationForm.Competencies.EvaluationId,
        EmployeeId: this.selectedUser._id,
        YearEndComments: this.FinalRatingForm.value.ThirdSignatoryComments,
        RevComments: this.FinalRatingForm.value.ThirdSignatoryRevComments,
        ReqRevision: this.FinalRatingForm.value.TSReqRevision,
        
        IsDraft: isDraft,
        SignOff: `${this.loginUser.FirstName} ${this.loginUser.LastName}`
      };
    console.log('final rating form', this.perfApp.requestBody)
    this.perfApp.CallAPI().subscribe(x => {
      console.log(x)
      this.snack.success('Successfully Submitted Final Rating');
      window.location.reload();
    }, error => {
      console.log('error', error)
      this.snack.error('Something went wrong')
    })

  }

  
  tsReqRevisionCheck(value) {
    if (value.target.value) {
      this.evaluationForm.controls['ThirdSignatoryRevComments'].setValidators(Validators.required);
    } else {
      this.evaluationForm.controls['ThirdSignatoryRevComments'].clearValidators();
      this.evaluationForm.controls['ThirdSignatoryRevComments'].reset();
      this.evaluationForm.controls['ThirdSignatoryRevComments'].setValue(null);
    }
  }

  
  managerReqRevisionCheck(value) {
    if (value.target.value) {
      this.evaluationForm.controls['ManagerRevComments'].setValidators(Validators.required);
    } else {
      this.evaluationForm.controls['ManagerRevComments'].clearValidators();
      this.evaluationForm.controls['ManagerRevComments'].reset();
      this.evaluationForm.controls['ManagerRevComments'].setValue(null);
    }
  }
  cancelFinalRating() {

  }
}

