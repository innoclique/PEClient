import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import html2PDF from 'jspdf-html2canvas';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CompetencyBase } from '../../../Models/CompetencyFormModel';
import { QuestionBase } from '../../../Models/QuestionBase';
import { AuthService } from '../../../services/auth.service';
import { CompetencyFormService } from '../../../services/CompetencyFormService';
import { NotificationService } from '../../../services/notification.service';
import { PerfAppService } from '../../../services/perf-app.service';
import ReportTemplates from '../../../views/psa/reports/data/reports-templates';

@Component({
  selector: 'app-current-evaluation-report-pdf',
  templateUrl: './current-evaluation-report-pdf.component.html',
  styleUrls: ['./current-evaluation-report-pdf.component.css']
})
export class CurrentEvaluationReportPdfComponent implements OnInit {
  @Input() loginUser: any;
  @Input() currentOrganization: any;
  @Input() isReport: boolean = true;
  selfCompetencyForm: FormGroup;
  competencyList: any = [];
  performanceGoals: any = [];
  devGoals: any = [];
  strengths: any = [];
  finalRating: any = {};
  evaluationForm: any = {};
  employeeCompetencyList: any;
  RatingList: any;
  public PeerScoreCard: any;
  DirectReporteeScoreCard: any;
  public performanceGoalsRowData: any[];
  public devGoalsRowData: any[];
  public devGoalsActionRowData: any[];
  constructor(private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService,
    private qcs: CompetencyFormService,
  ) {
    // this.loginUser = this.authService.getCurrentUser();
    // this.currentOrganization = this.authService.getOrganization();
  }

  ngOnInit(): void {
    this.getTabsData();
    this.getAllKPIs();
    this.getAllDevGoalsDetails();
    this.getAllStrengthDetails();
    this.getFinalRating();
  }

  async printPage() {
    const clonedDoc = document.getElementById('pdfBody');
    await html2PDF(clonedDoc, 
      {
        // onclone: function (clonedDoc) {
        //   console.log('before: ',clonedDoc);
        //     clonedDoc.getElementById('card').style.visibility = 'visible';
        //     clonedDoc.getElementById('card').style.overflow = 'visible';
        //     clonedDoc.getElementById('card').style.height = 'auto';
        //     console.log('after: ',clonedDoc);
        // },
      
      jsPDF: {
        format: 'a4',
      },
      // imageType: 'image/jpeg',
      // watermark: {
      //   src: 'assets/img/brand/Optimal_Assessments_logo88x75.jpg',
      //   handler({ pdf, imgNode, pageNumber, totalPageNumber }) {
      //     const props = pdf.getImageProperties(imgNode);
      //     // do something...
      //     pdf.addImage(imgNode, 'JPG', 0, 0, 30, 30);
      //   },
      // },
      imageQuality: 1,
      margin: {
        top: 50,
        right: 25,
        bottom: 50,
        left: 25,
      },
      output: './pdf/generate.pdf'
    });
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

  /**To GET ALL  tabs data */
  getTabsData() {
    forkJoin(
      this.getCurrentEvaluationDetails().pipe(catchError(error => of({ error: error, isError: true })))
    ).subscribe(([res1]) => {
      if (res1 && !res1.isError) {
        this.evaluationForm = res1;
        if (res1.Competencies) {
          this.employeeCompetencyList = res1.Competencies.Employee.Manager.Competencies // Gets Manager ratings instead of emloyee
          this.RatingList = res1.Competencies.Employee.Competencies[0].Questions[0].Rating; // Gets Manager ratings instead of emloyee
          this.prepareCompetencyQuestions();
          console.log('the evauation form', this.evaluationForm)
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
        this.finalRating.Self.SubmittedOn = new Date(this.finalRating.Self.SubmittedOn).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
        this.finalRating.Manager.SubmittedOn = new Date(this.finalRating.Manager.SubmittedOn).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
        console.log('inside getFinalRating :::: ');
        console.log(this.finalRating);
      }
    }
      , error => {
        // this.snack.error(error.error.message);
        this.snack.error('something went wrong.')
        console.log('error', error)
      }
    )
  }
  getEVPeriod() {
    return ReportTemplates.getEvaluationPeriod(this.currentOrganization.StartMonth, this.currentOrganization.EndMonth);
  }

  getCurrentEvaluationDetails() {
    this.perfApp.route = "evaluation";
    this.perfApp.method = "GetEmpCurrentEvaluation",
      this.perfApp.requestBody = { EmployeeId: this.loginUser._id }
    return this.perfApp.CallAPI()
  }

  competencyQuestionsList = [];
  prepareCompetencyQuestions() {

    var questions: CompetencyBase<string>[] = [];
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


  getRatingText(value){
    debugger
    if (this.RatingList && this.RatingList.length>0)
    return " -" +this.RatingList.find(e=> e.value== value).Text;
    else return "";
  }

  getCompetencyOverallRating(competencyId) {
    if (this.evaluationForm.OverallCompetencyRating) {
      var _rate = this.evaluationForm.OverallCompetencyRating.find(x => x.competencyId === competencyId);
      return _rate.overallScore || "Pending";
    }
  }

}
