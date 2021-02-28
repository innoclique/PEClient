


import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AlertDialog } from '../../../Models/AlertDialog';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { PerfAppService } from '../../../services/perf-app.service';
import { ThemeService } from '../../../services/theme.service';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { Constants } from '../../../shared/AppConstants';
import { CustomValidators } from '../../../shared/custom-validators';
import html2PDF from 'jspdf-html2canvas';
import ReportTemplates from '../../../views/psa/reports/data/reports-templates';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-kpi-review-manager',
  templateUrl: './kpi-review.component.html',
  styleUrls: ['./kpi-review.component.css']
})
export class KpiReviewComponent implements OnInit {


@Input()
actor:any;


  public kpiForm: FormGroup;
  kpiDetails: any = { IsActive: 'true',MeasurementCriteria:[] }
  loginUser: any;
  public alert: AlertDialog;
  appScores: any = [];
  coachingRemDays: any = [];

  kpiStatus: any = [];
  currentAction = 'create';
  isAllSelected = false;
  addMCSwitch = true;

  filteredOptionsKPI: Observable<any[]>;
  public empKPIData: any[] = []
  // public selectedKPIItems :any[]=[]
  
  @Input()
  accessingFrom:any;

  showKpiForm=false;



  filteredOptionsTS: Observable<any[]>;
  public empMeasuCriData: any[] = []
  public selectedItems: any[] = []
  weight:any;
  currentKpiId: any;
  currentEmpId: any;
  currentEmpManagerId: any;
  selIndex: any;
  isKpiActivated: boolean;
  msSelText="";
  msSelVal="";
  currEvaluation: any;
  unSubmitedCount=0;
  submitedCount=0;
  scoreUnSubmitedCount:any;
  isEmployeePgSignoff:boolean = false;
  isSignOffDisabled=false;
  isFinalSignoffDone=false;

  
  @ViewChild('kpiTrack', { static: true }) kpiTrackView: TemplateRef<any>;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,

  };
  trackViewRef: BsModalRef;
  isManagerFRSignOff=false;
  currentOrganization: any;
  draftGoals:Boolean = false;
  currentEvaluationYear:any;
  public index:any;
  indexcolor:any;
  index1:any;
  base64data: any;

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    public themeService: ThemeService,
    private snack: NotificationService,
    private http: HttpClient,
    private modalService: BsModalService,
    private perfApp: PerfAppService,
    public translate: TranslateService) {
    this.loginUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();

    

    this.activatedRoute.params.subscribe(params => {
     if(params['currentEvaluationYear']){
      this.currentEvaluationYear = params['currentEvaluationYear'];
     }
     if (params['action']) {
      this.currentKpiId = params['id'];
      this.currentEmpId = params['empId'];
      this.currentEmpManagerId = params['empManagerId'];
      this.currentAction = params['action'];
      this.findPgSignoff();
      if(params['draftGoals']){
        this.draftGoals = true;
      }
      
     }
     
    });   

   

  }

  findPgSignoff(){
    console.log(this.loginUser)
    let orgStartEnd = this.getOrganizationStartAndEndDates();
    let EvaluationYear = this.currentEvaluationYear;
    let {Manager,Organization} = this.loginUser;
    let options = {
      EvaluationYear,
      Owner:this.currentEmpId,
      
    };
    console.log(options);
    this.perfApp.route = "app";
    this.perfApp.method = "Find/PG/Signoff";
    this.perfApp.requestBody = options;
    this.perfApp.CallAPI().subscribe(result => {
      if(!result){
        this.isEmployeePgSignoff = false;
        this.getClientConfiguation();
      }else{
        let {FinalSignoff, SignOff, ManagerSignOff}  = result;
        this.isFinalSignoffDone = FinalSignoff;
        this.isEmployeePgSignoff = true;
        if(ManagerSignOff.submited){
          this.isSignOffDisabled=true;
        }else{
          this.getClientConfiguation();
        }
        
      }
      
    })
  }

  getOrganizationStartAndEndDates(){
    let Organization = this.currentOrganization;
    let {StartMonth,EndMonth,EvaluationPeriod} = Organization;
    StartMonth = parseInt(StartMonth);
    let currentMoment = moment();
    let evaluationStartMoment;
    let evaluationEndMoment
    if(EvaluationPeriod === "FiscalYear"){
      var currentMonth = parseInt(currentMoment.format('M'));
      console.log(`${currentMonth} <= ${StartMonth}`)
      if(currentMonth <= StartMonth){
        evaluationStartMoment = moment().month(StartMonth-1).startOf('month').subtract(1, 'years');
        evaluationEndMoment = moment().month(StartMonth-2).endOf('month');
        console.log(`${evaluationStartMoment.format("MM DD,YYYY")} = ${evaluationEndMoment.format("MM DD,YYYY")}`);
      }else{
        evaluationStartMoment = moment().month(StartMonth-1).startOf('month');
        evaluationEndMoment = moment().month(StartMonth-2).endOf('month').add(1, 'years');
        console.log(`${evaluationStartMoment.format("MM DD,YYYY")} = ${evaluationEndMoment.format("MM DD,YYYY")}`);
      }
    }else if(EvaluationPeriod === "CalendarYear"){
      evaluationStartMoment = moment().startOf('month');
      evaluationEndMoment = moment().month(0).endOf('month').add(1, 'years');
    }
    return {
      start:evaluationStartMoment,
      end:evaluationEndMoment
    }
  }

  getClientConfiguation(){
    let {Organization} = this.loginUser;
    let orgStartEnd = this.getOrganizationStartAndEndDates();
    let evaluationStartMoment = orgStartEnd.start;
    let evaluationEndMoment = orgStartEnd.end;
    let currentMoment = moment();
    this.isSignOffDisabled=true;
    
    this.perfApp.route = "clientconfig";
    this.perfApp.method = "organization";
    this.perfApp.requestBody = {};
    this.perfApp.requestBody.Organization = Organization._id;
    this.perfApp.requestBody.ConfigKey = "PG-SIGNOFF";
    this.perfApp.CallAPI().subscribe(result => {
      if (result) {
        let {ActivateWithin,onBeforeAfter,TimeUnit} = result;
        if(onBeforeAfter === "After"){
          if(TimeUnit === "DAYS"){
            let duration = currentMoment.diff(evaluationStartMoment,'days');
            console.log(`duration: ${duration} >= ${ActivateWithin}`);
            if(duration>=ActivateWithin)
              this.isSignOffDisabled=false;
            else
              this.isSignOffDisabled=true;
          }
        }
      }else{
        this.isSignOffDisabled=true;
      }
    });
  }

  
  openConfirmSignoffKpisDialog() {
    this.alert.Title = "Alert";
    this.alert.Content = "This will confirm your sign-off. Are you sure you want to continue?";
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
      
      this.managerSignoff();
     } else {
       
     }
    })
  }

  singoffPG(){
    if(this.unSubmitedCount>0 || this.submitedCount>0){
      this.openConfirmSignoffKpisDialog();
      
    }else{
      this.snack.error("Please add and submit performance Goals before sign-off.");
    }
  }

  managerSignoff(){
    this.isSignOffDisabled=true;
    let orgStartEnd = this.getOrganizationStartAndEndDates();
    let EvaluationYear = orgStartEnd.start.format("YYYY");
    let {Manager,Organization,} = this.loginUser;
    let options = {
      Owner:this.currentEmpId,
      EvaluationYear,
      Manager:this.loginUser._id,
      submittedBy:"Manager"
    };
    console.log(options);

    this.perfApp.route = "app";
    this.perfApp.method = "/PG/Signoff";
    this.perfApp.requestBody = options;
    this.perfApp.CallAPI().subscribe(result => {
      console.log(result);
      if (result) {
        this.snack.success(this.translate.instant(`The performance goals have been submitted successfully and your sign-off registered.`));
      }
      if(this.unSubmitedCount!=0){
        this.submitAllKPIs(false)
      }
    });

  }


  async initApicallsForKpi() {

    await this.getAllKpiBasicData();
    await this.getAllKPIs()

  }

  ngOnInit(): void {
    this.index1=0;
    this.initApicallsForKpi();

    this.initKPIForm()

    this.alert = new AlertDialog();
  }





  initKPIForm() {
    debugger
    this.kpiForm = this.fb.group({

      MeasurementCriteria: [this.kpiDetails.MeasurementCriteria ? this.kpiDetails.MeasurementCriteria : '',
        // Validators.compose([
        // Validators.required,
        // Validators.minLength(2)])
      ],

      Kpi: [this.kpiDetails.Kpi ? this.kpiDetails : '', Validators.compose([
        Validators.required, Validators.minLength(2),
        CustomValidators.patternValidator(/(?=.*[#)&.(-:/?])/, { hasKPISplChars: true }, 'hasKPISplChars'),
      ])
      ],
      TargetCompletionDate: [this.kpiDetails.TargetCompletionDate ? new Date(this.kpiDetails.TargetCompletionDate) : '', [Validators.required]],
      YearEndComments: [this.kpiDetails.YearEndComments ? this.kpiDetails.YearEndComments : ''],
      YECommManager: [this.kpiDetails.YECommManager ? this.kpiDetails.YECommManager : ''],
      ManagerComments: [this.kpiDetails.ManagerComments ? this.kpiDetails.ManagerComments :''], 
      Weighting: [this.kpiDetails.Weighting ? this.kpiDetails.Weighting : ""],
     // Signoff: [this.kpiDetails.Signoff.SignOffBy?this.kpiDetails.Signoff.SignOffBy:""],
    
      ManagerSignOff:  [ this.kpiDetails.ManagerSignOff?
        this.kpiDetails.ManagerSignOff.submited==false?  "" : this.kpiDetails.ManagerSignOff.SignOffBy
      :""],
      CoachingReminder: [this.kpiDetails.CoachingReminder ? this.kpiDetails.CoachingReminder :this.loginUser.Organization.CoachingReminder],

      IsSubmit: ['false'],
      IsDraft: [''],
      Score: [this.kpiDetails.Score ? this.kpiDetails.Score : ''],
      ManagerScore: [this.kpiDetails.ManagerScore ? this.kpiDetails.ManagerScore : ''],
      IsActive: [this.kpiDetails.IsActive+'' ],
      ManagerFTSubmitedOn: [this.kpiDetails.ManagerFTSubmitedOn ],
      Status: [this.kpiDetails.Status ? this.kpiDetails.Status : '', [Validators.required]],

    });

   
    this.selectedItems=[];
    this.kpiDetails.MeasurementCriteria.forEach(e => {
      this.toggleSelection(e.measureId);
    });

  }




  
getBase64(){

  this.http.get('/assets/img/_pdf_generate.pdf', { responseType: 'blob' })
  .subscribe(res => {
    const reader = new FileReader();
    reader.onloadend = () => {
      this. base64data = reader.result;                
          console.log("sgsggjsr onsonsnos ykvvrsgsggjsr",this.base64data);
    }

    reader.readAsDataURL(res); 
   // this. base64data = res;   
    console.log("sgsggjsr onsonsnos",res);
  });

}


  async convertPage() {
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
      output: './pdf/generate.pdf',
    });
  }


  get f() {
    return this.kpiForm.controls;
  }


  onCancle() {
    if(this.accessingFrom=='kpiReview'){
    
    this.router.navigate(['employee/review-perf-goals-list']);
    }else{
      this.router.navigate(['employee/review-evaluation-list']);
    }
  }

  submitKpi() {

    if (!this.kpiForm.valid) {
      return;
    }
    else {
      // if (!this.kpiForm.get('PhoneNumber').value &&  !this.kpiForm.get('AltPhoneNumber').value
      //  && !this.kpiForm.get('MobileNumber').value) {
      //   this.snack.error(this.translate.instant('Please provide at least one contact (PhoneNumber, AltPhoneNumber, MobileNumber )'));
      //   return;    
      // }
    }

    this.kpiForm.patchValue({ IsSubmit: 'true' });
    this.kpiForm.patchValue({ IsDraft: 'false' });
    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to update performance goal?";
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
      this.submitReview();

     } else {
       
     }
    })
    
  }

  submitSignoffAllKpiById() {

    this.perfApp.route = "app";
    this.perfApp.method = "SubmitSignoffKpisByManager",
    this.perfApp.requestBody.empId = this.currentEmpId;
    this.perfApp.CallAPI().subscribe(c => {

     if (c) {
      this.snack.success(c.message);
      this.onCancle();

     } else {
       
     }

    }
    
    , error => {

      this.snack.error(error.error.message);

    }
    
    )
  }

  submitKpiById() {

    this.perfApp.route = "app";
    this.perfApp.method = "SubmitKpisByManager",
    this.perfApp.requestBody.kpi = this.currentKpiId;
    this.perfApp.requestBody.empId = this.currentEmpId;
    this.perfApp.CallAPI().subscribe(c => {

     if (c) {
      this.snack.success(c.message);
      this.onCancle();

     } else {
       
     }

    }
    
    , error => {

      this.snack.error(error.error.message);

    }
    
    )
  }

  denyAllPg(){
    let isActive=false;
    this.perfApp.route = "app";
    this.perfApp.method = "DenyAllSignoffKpis";
    this.perfApp.requestBody = {};
    this.perfApp.requestBody.empId = this.currentEmpId;
    this.perfApp.CallAPI().subscribe(c => {

      if (c) {

        this.onCancle();
        this.snack.success(this.translate.instant(`Performance Goal Denied`));
          
      }
    })
  }


  denyKPI() {
    this.perfApp.route = "app";
    this.perfApp.method = "UpdateKpiDataById";
    this.perfApp.requestBody = {};
    this.perfApp.requestBody.kpiId = this.currentKpiId;
    this.perfApp.requestBody.IsActive = false;
    this.perfApp.requestBody.Action='DeActive' ;
    this.perfApp.requestBody.UpdatedBy = this.loginUser._id;
    console.log(this.perfApp.requestBody);
    this.perfApp.CallAPI().subscribe(c => {

      if (c) {

      this.onCancle();
      this.snack.success(this.translate.instant(`Performance Goal Denied Successfully`));
        
      }
    })

  }



  


  
  submitReview() {
if(this.accessingFrom=="reviewEvaluation" && this.unSubmitedCount>0){
this.snack.error("Please submit performance goals")
return
}

if (this.accessingFrom == "reviewEvaluation"  && this.kpiForm.get('ManagerScore').value=='') {
  this.snack.error("Score is mandatory.")
  return;
}

// this.convertPage();
// this.getBase64();

    this.perfApp.route = "app";
    this.perfApp.method = "UpdateKpiDataById";
    this.perfApp.requestBody = {};
    this.perfApp.requestBody.kpiId = this.currentKpiId;
    this.perfApp.requestBody.IsActive = this.kpiForm.get('IsActive').value;
    this.perfApp.requestBody.ManagerScore = this.kpiForm.get('ManagerScore').value;
    this.perfApp.requestBody.YECommManager = this.kpiForm.get('YECommManager').value;
    this.perfApp.requestBody.ManagerComments = this.kpiForm.get('ManagerComments').value;
    this.perfApp.requestBody.CoachingReminder = this.kpiForm.get('CoachingReminder').value;
    //this.perfApp.requestBody.IsManaFTSubmited = this.kpiForm.get('ManagerFTSubmitedOn').value ? false:true;
    this.perfApp.requestBody.Action='Review' ;
    this.perfApp.requestBody.UpdatedBy = this.loginUser._id;
    this.perfApp.requestBody.KpiBase64data = this.base64data;
    this.perfApp.CallAPI().subscribe(c => {

      if (c) {

      this.getAllKPIs();
    this.snack.success(this.translate.instant(`Performance Goal Updated Successfully`));
        
      }
    })

  }


  saveKpi() {
    this.perfApp.route = "app";
    this.perfApp.method = this.currentAction == 'create' ? "AddKpi" : "UpdateKpiDataById",


      this.perfApp.requestBody = this.kpiForm.value; //fill body object with form 

      let Measurements = [];
   
  
    this.selectedItems.forEach(x => {
      Measurements.push({ measureId: x._id })
     
    })

    this.perfApp.requestBody.Kpi = this.perfApp.requestBody.Kpi.Kpi?
                                    this.perfApp.requestBody.Kpi.Kpi :this.perfApp.requestBody.Kpi;
    // this.perfApp.requestBody.MeasurementCriteria = this.selectedItems.map(e => { e.measureId=e._id});
    this.perfApp.requestBody.kpiId = this.kpiDetails._id?  this.kpiDetails._id : '';
    this.perfApp.requestBody.MeasurementCriteria = Measurements;
    this.perfApp.requestBody.Weighting = this.weight;
    this.perfApp.requestBody.Signoff = this.loginUser._id;
    this.perfApp.requestBody.CreatedBy = this.loginUser._id;
    this.perfApp.requestBody.Owner = this.loginUser._id;
    this.perfApp.requestBody.UpdatedBy = this.loginUser._id;
    this.perfApp.requestBody.ManagerId = '';//this.loginUser.ParentUser?this.loginUser.ParentUser:this.loginUser._id;


    this.callKpiApi();

  }

  callKpiApi() {

    this.perfApp.CallAPI().subscribe(c => {

      if (c.message == Constants.SuccessText) {

        this.snack.success(this.translate.instant(`Performance Goal ${this.currentAction == 'create' ? 'Added' : 'Updated'}  Successfully`));

        this.router.navigate(['employee/kpi-setup']);
      }

    }, error => {
      if (error.error.message === Constants.EvaluationAdminNotFound) {
        //  this.openEvaluationAdminNotFoundDialog()
      } else {
        this.snack.error(this.translate.instant(error.error.message));

      }


    });

  }



  addMesurment() {
    this.perfApp.route = "app";
    this.perfApp.method = "CreateMeasurementCriteria";
    this.perfApp.requestBody = {};
    this.perfApp.requestBody.Name = this.kpiForm.get('MeasurementCriteria').value;
    this.perfApp.requestBody.CreatedBy = this.loginUser._id;
    this.perfApp.requestBody.UpdatedBy = this.loginUser._id;
    this.perfApp.CallAPI().subscribe(c => {

      if (c) {

        this.getMeasurementCriterias();
this.snack.success(this.translate.instant(`KPI added Successfully`));
        
      }
    })
  }



  getAllKpiBasicData() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetKpiSetupBasicData",
    this.perfApp.requestBody = { 'empId': this.currentEmpId,
    'orgId':this.authService.getOrganization()._id
   }
      this.perfApp.CallAPI().subscribe(c => {

        if (c) {

          this.appScores = c.KpiScore;
          this.kpiStatus = c.KpiStatus;
          this.coachingRemDays = c.coachingRem;
          this.currEvaluation = c.evaluation;
          if(c.evaluation){
            //this.currentEmpId;
            let employee = c.evaluation.Employees.find(emp=>emp._id==this.currentEmpId);
            this.isManagerFRSignOff=employee.FinalRating.Manager.SignOff.length>0;
          }
          
        }
      })
  }



  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }


  displayFn(user: any): string {
    return user && user.Name ? user.Name : '';
  }



  private _filterTD(name: string): any[] {
    const filterValue = this._normalizeValue(name);

    return this.empMeasuCriData.filter(option => this._normalizeValue(option.Name).includes(filterValue));
  }




  getMeasurementCriterias() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllMeasurementCriterias",
      this.perfApp.requestBody = { 'empId':this.currentEmpId }
    this.perfApp.CallAPI().subscribe(c => {

      if (c && c.length > 0) {
        this.empMeasuCriData = c;
        this.addMCSwitch=false;

      
        this.filteredOptionsTS = this.kpiForm.controls['MeasurementCriteria'].valueChanges
          .pipe(
            startWith(''),
            map(value => typeof value === 'string' ? value : value ? value.Name : ""),
            map(name => name ? this._filterTD(name) : this.empMeasuCriData.slice())
          );

          if (this.selectedItems.length>0) {
            this.filteredOptionsTS.forEach(e => {
              e.map(m => {
        
                if (this.selectedItems.find(f=>m._id==f._id))
                  m.selected = true
              })
        
            });
          }

          if (this.currentAction!='create') {
            this.initKPIForm();
          }



      }

    })
  }









  displayKPIFn(user: any): string {
    return user && user.Kpi ? user.Kpi : '';
  }



  private _filterKPI(name: string): any[] {
    const filterValue = this._normalizeValue(name);

    return this.empKPIData.filter(option => this._normalizeValue(option.Kpi).includes(filterValue));
  }





  
  submitAllKPIs(showMsg) {

    this.perfApp.route = "app";
    this.perfApp.method = "SubmitAllKpisByManager",
      this.perfApp.requestBody = { 'empId': this.currentEmpId,currentEvaluation:this.currentEvaluationYear }
    this.perfApp.CallAPI().subscribe(c => {

     if (c) {
       if(showMsg)
      this.snack.success("The performance goals have been submitted successfully");
      this.onCancle();

     } else {
       
     }

    }
    
    , error => {

      this.snack.error(error.error.message);

    }
    
    )
  }

   async  getAllKPIs() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetKpisByManager",
    this.perfApp.requestBody = { 'managerId': this.currentEmpManagerId,
        'empId': this.currentEmpId,draftSignoff:this.draftGoals,currentEvaluation:this.currentEvaluationYear}
    // this.perfApp.method = "GetAllKpis",
      // this.perfApp.requestBody = {
      //    'empId': this.currentEmpId,
      //   'orgId':this.authService.getOrganization()._id}
      debugger

      await this.perfApp.CallAPI().subscribe(c => {
      

      this.setWeighting(c.filter(item => item.IsDraft === false).length);
      if (c && c.length > 0) {
        this.unSubmitedCount=c.filter(e=>e.ManagerSignOff && e.ManagerSignOff.submited ==false).length;
        this.submitedCount=c.filter(e=>e.ManagerSignOff && e.ManagerSignOff.submited ==true).length;
        this.scoreUnSubmitedCount=c.filter(e=>e.ManagerScore=="" && e.IsDraft==false && e.IsActive==true ).length;
        if(this.scoreUnSubmitedCount==0)
        this.authService.setManagerPGSubmitStatus("true");
        this.empKPIData = c;

        if (this.accessingFrom=='reviewEvaluation') {
          if (c.filter(e=>e.ManagerSignOff && e.ManagerSignOff.submited ==true).length==0) {
            this.showKpiForm  =false;
            return
          }
          this.empKPIData = c.filter(e=> this.isFinalSignoffDone && e.IsActive==true && e.ManagerSignOff && e.ManagerSignOff.submited ==true   );
        }
        



        this.filteredOptionsKPI = this.kpiForm.controls['Kpi'].valueChanges
          .pipe(
            startWith(''),
            map(value => typeof value === 'string' ? value : value ? value.Kpi : ""),
            map(name => name ? this._filterKPI(name) : this.empKPIData.slice())
          );

  
          if (this.currentAction !='create') {
                this.currentKpiId=this.currentKpiId ? this.currentKpiId:this.empKPIData[0]._id;
             this.kpiDetails=  this.empKPIData.filter(e=> e._id== this.currentKpiId)[0];
            this.selIndex=  this.empKPIData.findIndex(e=> e._id== this.currentKpiId);
          }

          
          this.getMeasurementCriterias();
          this.showKpiForm=true;

      }else{
        
        if (this.accessingFrom=='reviewEvaluation' || this.accessingFrom=='kpiReview') {
          this.showKpiForm=false;
        }
      }

    }
    
    , error => {
      
      if (error.error.message === Constants.KpiNotActivated) {
        this.isKpiActivated=false;
        this.onCancle();
        this.snack.error(error.error.message);
      } else {

      this.snack.error(error.error.message);

       }
    }
    
    )
  }
  setWeighting(length: any) {
    
    this.weight = length==0? 100 :  Math.round( 100/length);

    this.kpiForm.patchValue({ Weighting: this.weight });

   
  }

  


  onKpiAutoSelected(event) {
    this.selectedItems=[];
    var selkpi = event.option.value;

    selkpi.MeasurementCriteria.forEach(e => {
      this.toggleSelection(e.measureId);
    });



    this.kpiForm.patchValue({
      TargetCompletionDate: selkpi.TargetCompletionDate,
      Score: selkpi.Score,
      Status: selkpi.Status,
      YearEndComments: selkpi.YearEndComments
    });


  }










  showSelectedItems() {
    this.kpiForm.patchValue({ MeasurementCriteria: '' });
     this.msSelText= this.selectedItems.map(m=>m.Name).join(', ')
     return this.msSelText;
  }

  

  foucuout() {
    this.msSelText= "";
  }


  optionClicked(event: Event, item) {
    event.stopPropagation();
    this.toggleSelection(item);
  }

  toggleSelection(item) {
    item.selected = true;
    if (item.selected) {
      this.selectedItems.push(item);
      // this.changeCallback( this.selectedItems );
    } else {
      const i = this.selectedItems.findIndex(value => value.item === item.item);
      this.selectedItems.splice(i, 1);
      //this.changeCallback( this.selectedItems );
    }
    this.showSelectedItems()
    this.filteredOptionsTS.forEach(e => {
      e.map(m => {

        if (m._id == item._id)
          m.selected = item.selected;
      })

    });

    if (this.selectedItems.length > 0) {
      this.kpiForm.get('MeasurementCriteria').clearValidators();
    } else {
      this.kpiForm.controls['MeasurementCriteria'].setValidators([Validators.required])
    }

  }
  async toggleSwitch(){
    this.addMCSwitch = !this.addMCSwitch;
    if (this.addMCSwitch) {
      
    } else {
      this.showSelectedItems();
    }
  }
  


  onFocusOut(){

this.msSelText="";
  }

  currentKpi(index){

    this.index1=index
     this.kpiDetails=  this.empKPIData[this.index1];
     this.initKPIForm();
     this.currentKpiId=this.kpiDetails._id;
     
   }
  nextKpi(){

   this.selIndex=this.selIndex+1;
    this.kpiDetails=  this.empKPIData[this.selIndex];
    this.initKPIForm();
    this.currentKpiId=this.kpiDetails._id;
  }

  priKpi(){

    this.selIndex=this.selIndex-1;
    this.kpiDetails=  this.empKPIData[this.selIndex];
    this.initKPIForm();
    this.currentKpiId=this.kpiDetails._id;
  }

  
   /**To alert user for submit kpis */
   openConfirmSubmitKpisDialog() {
    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to submit?";
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
      this.perfApp.requestBody.IgnoreEvalAdminCreated=true;
      this.submitAllKPIs(true);
     } else {
       
     }
    })
  }


  
  confirmActiveDeActiveKPI(isActive){

    
    this.alert.Title = "Alert";
    this.alert.Content = isActive? "Are you sure you want to activate the performance goal?"
    :"Are you sure you want to deactivate the performance goal?"
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
      this.perfApp.requestBody.IgnoreEvalAdminCreated=true;
      this.activeDeActiveKPI(isActive);
     } else {
       
     }
    })


  }

  activeDeActiveKPI(isActive) {
    this.perfApp.route = "app";
    this.perfApp.method = "UpdateKpiDataById";
    this.perfApp.requestBody = {};
    this.perfApp.requestBody.kpiId = this.currentKpiId;
    this.perfApp.requestBody.IsActive = isActive;
    this.perfApp.requestBody.Action=isActive?'Active': 'DeActive' ;
    this.perfApp.requestBody.UpdatedBy = this.loginUser._id;
    this.perfApp.CallAPI().subscribe(c => {

      if (c) {

      
this.snack.success(this.translate.instant(`Performance Goal ${isActive?'Activated':'Deactivated'} Successfully`));
this.onCancle();
      }
    })

  }

  
  
trackKpi() {

  this.trackViewRef = this.modalService.show(this.kpiTrackView, this.config);
}

editDraftKpi(){

  this.router.navigate(['em/add-kpi',{action:'edit',
  ownerId:this.kpiDetails.Owner._id,
  id:this.currentKpiId}],{ skipLocationChange: true });
}

public monthList = ["","January", "February", "March", "April", "May", "June", "July",
"August", "September", "October", "November", "December"];
  
getEVPeriod(){
  return ReportTemplates.getEvaluationPeriod(this.currentOrganization.StartMonth, this.currentOrganization.EndMonth);
    }
    
  printPage() {
    window.print();
  }

}

