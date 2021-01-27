import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CompetencyBase } from '../../Models/CompetencyFormModel';
import { QuestionBase } from '../../Models/QuestionBase';
import { AuthService } from '../../services/auth.service';
import { CompetencyFormService } from '../../services/CompetencyFormService';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';



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
  managerCompetencyForm: FormGroup;
  competencyList: any = [];
  evaluationForm: any = {};
  employeeCompetencyList: any;
  managerCompetencyList: any;
  questions$: Observable<CompetencyBase<any>[]>;
  appScores: any = [];
  kpiStatus: any = [];
  coachingRemDays: any = [];
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
  mpgSubmitStatus="";
  showCompetencySubmitForManager:Boolean=true;
  isContentOpen: boolean = false;
  @ViewChild('evTabset') tabset: TabsetComponent;
  isReqRevDisabled=false;
  currentEmpName: any;
  isPdfView:boolean = false;
  currentOrganization: any;

  config = {
    backdrop: true,
    ignoreBackdropClick: true,
  };
  competencyViewRef: BsModalRef;
  @ViewChild('competencyView') competencyView: TemplateRef<any>;
  public showReviewRating: boolean = false;
  public disableManagerSubmit: boolean = false;
  public disableManagerRating: boolean = true;
  public isCompetencyTabActive: boolean = false;

  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService,
    private fb: FormBuilder,
    private qcs: CompetencyFormService,
    private datePipe: DatePipe,
    private modalService: BsModalService,
  ) {
   

this.currentOrganization = this.authService.getOrganization();
    this.activatedRoute.params.subscribe(  params => {
      if (params['action']) {
       this.currentEmpId = params['empId'];
       this.currentAction = params['action'];
       this.seletedTabRole = params['actor'];  
       this.currentEmpName = params['empName'];
  
       this.GetEmployeeDetailsById();
      }
      })
      this.loginUser = this.authService.getCurrentUser();

  }

  ngAfterViewInit(){
        this.goto(this.currentAction)
  }

  ngOnInit(): void {   
    this.authService.getManagerPGSubmitStatus().subscribe(status=>this.mpgSubmitStatus=status);
  }


  callInitApis(){
  this.getAllKpiBasicData();
      this.initCompetencyForm();
      this.initFinalRatingForm();
      this.getTabsData();
}

exitReportView(){
  this.isPdfView = false;
  this.evaluationForm = true;
}

viewReport(){
  this.isPdfView = true;
  this.evaluationForm = false;
}

goto(selTab){

  if (selTab=='reviewKPI') {
    this.tabset.tabs[0].active = true;
  } else  if (selTab=='reviewGoals') {
    this.tabset.tabs[2].active = true;
  }
  else  if (selTab=='reviewEval') {
    this.tabset.tabs[4].active = true;
  }

  
}


  public columnDefs = [
    {
      headerName: 'Name', field: 'Name', width: 320, sortable: true, filter: true,
      cellRenderer: (data) => {
        return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
      }
    },
    { headerName: 'No.of Performance Goals', field: 'KpiCount', sortable: true, filter: true },
    // { headerName: 'Score (self)', field: 'Score', width: 150, sortable: true, filter: true },
    // { headerName: 'Status', field: 'Status', width: 150, sortable: true, filter: true },
    // { headerName: 'Performance Goal Submited', field: 'IsSubmitedKPIs', width: 150, sortable: true, filter: true },
    {
      headerName: 'Review/Modify', field: '', width: 200, autoHeight: true, suppressSizeToFit: true,
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
        if (res1.Competencies.Employee) {
          this.employeeCompetencyList = res1.Competencies.Employee.Competencies;
          
          // this.setCompetencies();
         // this.prepareCompetencyQuestions();
          this.prepareCompetencyQuestionsByManager();
          console.log('the evauation form', this.evaluationForm)
        }
        debugger
        if (res1.FinalRating) {
          this.FinalRatingForm.controls["EmployeeComments"].setValue(res1.FinalRating.Self.YearEndComments)
          this.FinalRatingForm.controls["EmployeeRevComments"].setValue(res1.FinalRating.Self.RevComments)
          this.FinalRatingForm.controls["EmployeeOverallRating"].setValue(res1.FinalRating.Self.YearEndRating)
          this.FinalRatingForm.controls["EmployeeIsDraft"].setValue(!res1.FinalRating.Self.IsSubmitted);
          this.FinalRatingForm.controls["EmployeeSignOff"].setValue(res1.FinalRating.Self.SignOff)
          this.FinalRatingForm.controls["EmployeeSubmittedOn"].setValue(this.datePipe.transform(res1.FinalRating.Self.SubmittedOn))
          this.showEmployeeSubmit = !res1.FinalRating.Self.IsSubmitted;


          this.FinalRatingForm.controls["ManagerComments"].setValue(res1.FinalRating.Manager.YearEndComments)
          this.FinalRatingForm.controls["ManagerOverallRating"].setValue(res1.FinalRating.Manager.YearEndRating)
          this.FinalRatingForm.controls["ManagerIsDraft"].setValue(!res1.FinalRating.Manager.IsSubmitted)
          this.FinalRatingForm.controls["ManagerSignOff"].setValue(res1.FinalRating.Manager.SignOff?res1.FinalRating.Manager.SignOff
            :this.selectedUser.Manager.FirstName+" "+this.selectedUser.Manager.LastName)
          this.FinalRatingForm.controls["ManagerSubmittedOn"].setValue(this.datePipe.transform(res1.FinalRating.Manager.SubmittedOn))
          this.showManagerSubmit = !res1.FinalRating.Manager.IsSubmitted;
          this.FinalRatingForm.controls["ManagerRevComments"].setValue(res1.FinalRating.Manager.RevComments)
          this.FinalRatingForm.controls["ManagerReqRevision"].setValue(res1.FinalRating.Manager.ReqRevision)


          
          this.FinalRatingForm.controls["ThirdSignatoryComments"].setValue(res1.FinalRating.ThirdSignatory.YearEndComments)
          this.FinalRatingForm.controls["ThirdSignatoryRevComments"].setValue(res1.FinalRating.ThirdSignatory.RevComments)
          this.FinalRatingForm.controls["TSReqRevision"].setValue(res1.FinalRating.ThirdSignatory.ReqRevision)
     
          this.isReqRevDisabled =res1.FinalRating.FRReqRevision;
          this.FinalRatingForm.controls["FRReqRevision"].setValue(res1.FinalRating.FRReqRevision)
          this.FinalRatingForm.controls["ThirdSignatoryIsDraft"].setValue(!res1.FinalRating.ThirdSignatory.IsSubmitted)
          this.FinalRatingForm.controls["ThirdSignatorySignOff"].setValue(res1.FinalRating.ThirdSignatory.SignOff?res1.FinalRating.ThirdSignatory.SignOff
            :this.selectedUser.ThirdSignatory?this.selectedUser.ThirdSignatory.FirstName+" "+this.selectedUser.ThirdSignatory.LastName:"")
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
      EmployeeRevComments: [''],
      EmployeeOverallRating: [1, [Validators.required]],
      EmployeeIsDraft: [true],
      EmployeeSignOff: [],
      EmployeeSubmittedOn: []

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
      FRReqRevision: [false],
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
  managerCompetencyQuestionsList=[];
  prepareCompetencyQuestions() {
    var questions: CompetencyBase<string>[] = [];

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
        CompetencyAvgRating:element.CompetencyAvgRating
      })

    });

  }
  prepareCompetencyQuestionsByManager() {
    var questions: CompetencyBase<string>[] = [];
    
    this.managerCompetencyList = this.evaluationForm.ManagerCompetencies.Manager.Competencies;
    this.showCompetencySubmitForManager = !this.evaluationForm.ManagerCompetencies.Manager.CompetencySubmitted;
    this.showReviewRating = this.evaluationForm.ManagerCompetencies.Manager.CompetencySubmitted;
    this.disableManagerSubmit = !this.evaluationForm.Competencies.Employee.CompetencySubmitted;
   // console.log('this.managerCompetencyForm.value', this.managerCompetencyForm.value)
   this.managerCompetencyQuestionsList=[];
   this.managerCompetencyList.forEach(element => {
      questions = [];
      element.Questions.forEach(q => {
        questions.push(new QuestionBase({
          key: q._id,
          label: q.Question,
          options: q.Rating,
          order: 1,
          required: true,
          value: q.SelectedRating,
          showEmpRating:true,
          empRating:this.getQuestionRating(q._id),
          empKey:q._id
        }))

      });

      this.managerCompetencyQuestionsList.push({
        CompetenyName: element.Competency.Name,
        CompetencyId: element.Competency._id,
        CompetencyRowId: element._id,
        Questions: questions,
        form: this.qcs.toFormGroup(questions),
        comments:element.Comments,
        empComments:this.getEmpCommentsForCompetency(element.Competency._id),
        CompetencyAvgRating:this.getCompetencyOverallRating(element.Competency._id)//element.CompetencyAvgRating
      })

    });

  }
  getCompetencyOverallRating(competencyId){
    if(this.evaluationForm.OverallCompetencyRating){
      var _rate=this.evaluationForm.OverallCompetencyRating.find(x=>x.competencyId===competencyId);
      return _rate.overallScore||"Pending";
    }
  }
  getQuestionRating(questionId){        
    var ff=this.employeeCompetencyList.map(element => {return element.Questions.find(q=>q._id===questionId)})      
      if(ff){
        var _questionvalue=ff.find(x=>x)
        if(_questionvalue){
          return _questionvalue.SelectedRating
        }
        
      }
      return "Pending"
  }
  getEmpCommentsForCompetency(competencyId){   
    var ff=this.employeeCompetencyList.map(element => {return element.Competency._id===competencyId?element.Comments:""});
      if(ff){
        var _competencyValue=ff.find(x=>x)
        if(_competencyValue){
          return _competencyValue;
        }
      }else{
        return "";
      }
  }
  cancelCompetencyRating() {

  }
  saveManagerCompetencyFormAsDraft() {
    this.saveManagerCompetencyForm(true)
  }
  submitManagerCompetencyForm() {
    this.saveManagerCompetencyForm(false)
  }
  saveManagerCompetencyForm(isDraft) {
    //selfCompetencyForm
    const competencyQA: any = {}
    competencyQA.QnA = []
    let isvalid = true;
    this.managerCompetencyQuestionsList.forEach(element => {
      var _qna = Object.entries(element.form.value);
      var _lastitem = _qna.pop();
      var _lastitem = _qna.pop();
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
    competencyQA.EvaluationId = this.evaluationForm.Competencies.EvaluationId;
    competencyQA.EmployeeId = this.selectedUser._id;
    competencyQA.IsDraft = isDraft;
    this.showCompetencySubmitForManager=isDraft;
    console.log('QnA', competencyQA);
    this.perfApp.route = "app";
    this.perfApp.method = "SaveCompetencyQnAByManager",
      this.perfApp.requestBody = competencyQA;// { TsId: this.loginUser._id }
    this.perfApp.CallAPI().subscribe(x => {
      console.log(x)
      this.snack.success(isDraft ? 'Competencies Rating Saved Successfully' : 'Competency Rating Submitted Successfully');
      if (!isDraft) {
        this.openCompetencyReport();
      }
     this.getTabsData();
      // this.refresh()
    }, error => {
      console.log('error', error)
    })

  }
  refresh(): void {
    this.router.navigate(['employee/review-evaluation']);
}
  /**For Self-Competency Rating End */
  submitFinalRating() {
  
    if(this.mpgSubmitStatus!='true'){
      this.snack.error("Please score performance goals");
      return;
    }

    if(this.PeerScoreCard){
      const peers=this.PeerScoreCard.Employees.Peers;
      if(peers.length>0 && ( peers[0].CompetencySubmitted==false || peers[1].CompetencySubmitted==false ) ){
      this.snack.error("Peer competency not submitted");
      return;
      }
    }
    if(this.DirectReporteeScoreCard){
      const direReportee=this.DirectReporteeScoreCard.Employees.DirectReportees;
      if(direReportee.length>0 && ( direReportee[0].CompetencySubmitted==false || direReportee[1].CompetencySubmitted==false  ) ){
      this.snack.error("Direct Reportee competency not submitted");
      return;
      }
    }
    
if (this.FinalRatingForm.value.TSReqRevision &&
  this.FinalRatingForm.value.ManagerRevComments.length==0) {
    this.snack.error('Revision Comments is mandatory')
    return;
}

if(this.FinalRatingForm.value.ManagerOverallRating==''){
  this.snack.error('Rating is mandatory')
  return;
}

    this.saveFinalRating(false)
  }
  draftFinalRating() {
    this.saveFinalRating(true)
  }
  saveFinalRating(isDraft) {
    
    let reqRev=this.FinalRatingForm.value.ManagerRevComments;
    this.perfApp.route = "app";
    this.perfApp.method = "SaveManagerFinalRating",
      this.perfApp.requestBody = {
        EvaluationId: this.evaluationForm.Competencies.EvaluationId,
        EmployeeId: this.selectedUser._id,
        YearEndComments: this.FinalRatingForm.value.ManagerComments,
        OverallRating: this.FinalRatingForm.value.ManagerOverallRating,

        RevComments: this.FinalRatingForm.value.ManagerRevComments,
      //  ReqRevision: this.FinalRatingForm.value.ManagerReqRevision,

        IsDraft: isDraft,
        SignOff: `${this.loginUser.FirstName} ${this.loginUser.LastName}`
      };
      if(!isDraft){
        if (!this.evaluationForm.ManagerCompetencies.Manager.CompetencySubmitted) {
          this.snack.error('Competencies Rating should be Submitted')
          return;
        }
      }
      let aResult = window.confirm("Are you sure you want to submit the evaluation for this employee?")
    console.log('final rating form', this.perfApp.requestBody)
    if(aResult==true){

    
    this.perfApp.CallAPI().subscribe(x => {
      console.log(x)
   const snref=   this.snack.success(`Successfully ${reqRev ? 'Request Revision' : 'Submitted'} Final Rating`);
      snref.afterDismissed().subscribe(() => {
        window.location.reload();
      }); 
    }, error => {
      console.log('error', error)
      this.snack.error('Something went wrong')
    })
  }
  

  }

  submitTSFinalRating() {

// if (this.FinalRatingForm.value.TSReqRevision &&
//   this.FinalRatingForm.value.ThirdSignatoryRevComments.length==0) {
//     this.snack.error('Revision Comments is mandatory')
//     return;
// }

    this.saveTSFinalRating(false)
  }
  draftTSFinalRating() {
    this.saveTSFinalRating(true)
  }
  
  saveTSFinalRating(isDraft) {
    let reqRev=this.FinalRatingForm.value.TSReqRevision;
    let msg = reqRev?"Are you sure you want to request a revision of the rating for this employee?":"Are you sure you want to sign-off this rating?"
   let conf =  window.confirm(msg)
   if (conf==true)
   {

   
    
    this.perfApp.route = "app";
    this.perfApp.method = "SaveTSFinalRating",
      this.perfApp.requestBody = {
        EvaluationId: this.evaluationForm.Competencies.EvaluationId,
        EmployeeId: this.selectedUser._id,
        YearEndComments: this.FinalRatingForm.value.ThirdSignatoryComments,
        RevComments: this.FinalRatingForm.value.ThirdSignatoryRevComments,
        ReqRevision: this.FinalRatingForm.value.TSReqRevision,
        FRReqRevision: this.FinalRatingForm.value.FRReqRevision,
        
        IsDraft: isDraft,
        SignOff: `${this.loginUser.FirstName} ${this.loginUser.LastName}`
      };
    console.log('final rating form', this.perfApp.requestBody)
    this.perfApp.CallAPI().subscribe(x => {
      console.log(x)
      let aMsg = reqRev?"Revision request has been sent successfully":"Rating has been signed-off"
    const snref=  this.snack.success(aMsg);
     
      snref.afterDismissed().subscribe(() => {
        window.location.reload();
      }); 

    }, error => {
      console.log('error', error)
      this.snack.error('Something went wrong')
    })
  }
  else{

  }
  }

  
  // tsReqRevisionCheck(value) {
    
  //   if (value.target.value=='on') {
  //     this.FinalRatingForm.controls['FRReqRevision'].setValue(true);
  //   } else {
     
  //     this.FinalRatingForm.controls['FRReqRevision'].setValue(false);
  //   }
  // }

  
  cancelFinalRating() {

  }

  

  getAllKpiBasicData() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetKpiSetupBasicData";
    this.perfApp.requestBody = { 'empId': this.loginUser._id ,
    'orgId':this.authService.getOrganization()._id
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


  getAverage(arr) {
    
    var sum = 0;
    for (var i = 0; i < arr.length; i++) {
      sum += parseInt(arr[i], 10); //don't forget to add the base
    }

    var avg = sum / arr.length;
    // const average= arr.reduce((p, c) => p + c, 0) / arr.length;
    console.log('average score :', avg);
    return avg;
  }

  public openCompetencyReport() {
    this.competencyViewRef = this.modalService.show(this.competencyView, this.config);
  }

  public closeDrModel() {
    this.competencyViewRef.hide();
  }

  public changeTab(event, isCompetencyTab) {
    this.isCompetencyTabActive = isCompetencyTab;
  }
}

