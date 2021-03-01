import { isDataSource } from '@angular/cdk/collections';
import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AlertDialog } from '../../Models/AlertDialog';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';
import { ThemeService } from '../../services/theme.service';
import { AlertComponent } from '../../shared/alert/alert.component';
import { Constants } from '../../shared/AppConstants';
import { CustomValidators } from '../../shared/custom-validators';
import ReportTemplates from '../../views/psa/reports/data/reports-templates';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-kpi-settings',
  templateUrl: './kpi-settings.component.html',
  styleUrls: ['./kpi-settings.component.css']
})
export class KpiSettingsComponent implements OnInit {
  @ViewChild('kpiTrack', { static: true }) kpiTrackView: TemplateRef<any>;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,

  };
  trackViewRef: BsModalRef;
  currentRowItem: any;
  public kpiForm: FormGroup;
  kpiDetails: any = { IsActive: 'true',MeasurementCriteria:[] }
  loginUser: any;
  public alert: AlertDialog;
  appScores: any = [];
  kpiStatus: any = [];
  kpiHistoryData: any = [];
  coachingRemDays: any = [];
  @Input()
  currentAction = 'create';
  isAllSelected = false;
  disabledAddKpiBtn = false;
  disabledCreateBtn = false;
  addMCSwitch = true;
  scoreUnSubmitedCount=0;
  unSubmitedCount = 0;
  showManagerScore = false;

  filteredOptionsKPI: Observable<any[]>;
  public empKPIData: any[] = []
  // public selectedKPIItems :any[]=[]
@Input()
accessingFrom:any;



  filteredOptionsTS: Observable<any[]>;
  public empMeasuCriData: any[] = []
  public selectedItems: any[] = []
  weight:any;
  currentKpiId: any;
  selIndex: any;
  isKpiActivated: boolean;
  msSelText="";
  msSelVal="";
  currEvaluation: any;
  showKpiForm=true;
  isEmpFRSignOff=false;
  currentOrganization: any;
  IsDraftDBVal: any;
  isFinalSignoff:Boolean;
  showAllowSignoff:Boolean=false;;
  isFinalSignoffDone=false;

  currentEvaluation:any;
  currentEvaluationPeriod: any;
  isEmployeePgSignoff = false;

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    public themeService: ThemeService,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    private modalService: BsModalService,
    public translate: TranslateService) {
    this.loginUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
    this.activatedRoute.params.subscribe(params => {
     if (params['action']) {
      this.currentKpiId = params['id'];
      this.currentAction = params['action'];
     }

     if (params['isFinalSignoff']) {
      this.isFinalSignoff = params['isFinalSignoff'];
     }
     if (params['showAllowSignoff']) {
      this.showAllowSignoff = params['showAllowSignoff'];
     }
     if (params['currentEvaluation']) {
      this.currentEvaluation = params['currentEvaluation'];
     }
      if (params['currentEvaluationPeriod']) {
        this.currentEvaluationPeriod = params['currentEvaluationPeriod'];
      }
    });
    this.findPgSignoff();
    //this.initApicallsForKpi();

  }


  async initApicallsForKpi() {
    await this.getAllKpiBasicData();
    await this.getAllKPIs();
  }

  ngOnInit(): void {


    if(this.accessingFrom == "currEvaluation") this.showKpiForm=false;
    this.initKPIForm()

    this.alert = new AlertDialog();
  }



async  getKpiHistory() {

    this.perfApp.route = "app";
    this.perfApp.method = "GetKpisHistoryByKpiId",
      this.perfApp.requestBody = { 'kpiId': this.currentKpiId }
  await  this.perfApp.CallAPI().subscribe(c => {
     if (c) {

      const data= c.map(e=>{
        e.formatedValues=` Status: ${e.KpiData.Status || 'N/A' },
        Manager Score: ${e.KpiData.ManagerScore || 'N/A'},
        Target Completion Date: ${new DatePipe('en-US').transform(e.KpiData.TargetCompletionDate, 'MM-dd-yyyy')}`
        return e;
      })
       

        this.kpiHistoryData=data;
     }
  
    }
    
    , error => {
  
      this.snack.error(error.error.message);
  
    }
    
    )
  }

  async  trackKpi() {
    this.kpiHistoryData=[]; 

   await this.getKpiHistory();


    this.trackViewRef = this.modalService.show(this.kpiTrackView, this.config);
  }

  DenyAllSignOffKpis() {

    
    this.alert.Title = "Alert";
    this.alert.Content = `Are you sure you want to deny the performance goals`;
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

      this.perfApp.route = "app";
      this.perfApp.method = "DenyAllEmployeeSignOffKpis",
        this.perfApp.requestBody = { 'empId': this.loginUser._id }
      this.perfApp.CallAPI().subscribe(c => {
       if (c) {
        this.snack.success(c.message);
        this.snack.success(c.message);
        this.router.navigate(['employee/kpi-setup']);
       }
    
      }
      
      , error => {
    
        this.snack.error(error.error.message);
    
      }
      
      )

    } else {
       
     }
    })
  

  
}

  submitAllSignoffKPIs() {

    
    this.alert.Title = "Alert";
    this.alert.Content = `Are you sure you want to allow the performance goals`;
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

    this.perfApp.route = "app";
    this.perfApp.method = "SubmitAllSignOffKpis",
      this.perfApp.requestBody = { 'empId': this.loginUser._id }
    this.perfApp.CallAPI().subscribe(c => {
     if (c) {
      this.snack.success(c.message);
      this.snack.success(c.message);
      this.router.navigate(['employee/kpi-setup']);
     }
  
    }
    
    , error => {
  
      this.snack.error(error.error.message);
  
    }
    
    )


  } else {
       
  }
 })

  }



  initKPIForm() {
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
      YearEndComments: [this.kpiDetails.YearEndComments ? this.kpiDetails.YearEndComments :''],
      YECommManager: [this.kpiDetails.YECommManager ? this.kpiDetails.YECommManager :''],
      ManagerComments: [this.kpiDetails.ManagerComments ? this.kpiDetails.ManagerComments :''],
      Weighting: [this.kpiDetails.Weighting || this.kpiDetails.Weighting==0  ? this.kpiDetails.Weighting : ""],
   

      IsDraft: [this.kpiDetails.IsDraft ? 'true' : 'false'],
      Score: [this.kpiDetails.Score ? this.kpiDetails.Score : '', ],
      Status: [this.kpiDetails.Status ? this.kpiDetails.Status : '', [Validators.required]],

    });

    this.selectedItems=[];
    this.kpiDetails.MeasurementCriteria.forEach(e => {
      e.measureId.selected = true;
      this.toggleSelection(e.measureId,null);
    });

    this.IsDraftDBVal=this.kpiDetails.IsDraft

  }





  get f() {
    return this.kpiForm.controls;
  }


  onCancle() {
    this.router.navigate(['employee/kpi-setup']);
  }

  submitKpi(action) {
    debugger;
    if (!this.kpiForm.valid) {
      this.kpiForm.markAllAsTouched();
      return;
    }
    else {
      // if (!this.kpiForm.get('PhoneNumber').value &&  !this.kpiForm.get('AltPhoneNumber').value
      //  && !this.kpiForm.get('MobileNumber').value) {
      //   this.snack.error(this.translate.instant('Please provide at least one contact (PhoneNumber, AltPhoneNumber, MobileNumber )'));
      //   return;    
      // }
    }

    this.kpiForm.patchValue({ IsDraft: 'false' });

    if (this.accessingFrom == "currEvaluation" && this.currentAction == 'edit' && this.unSubmitedCount > 0) {
      this.snack.error("Please sign-off performance goals")
      return;
    }
    if (this.accessingFrom == "currEvaluation" && this.currentAction == 'edit' && this.kpiForm.get('Score').value=='') {
      this.snack.error("Score is mandatory.")
      return;
    }
    this.alert.Title = "Alert";
    this.alert.Content = action=="c"?"Are you sure you want to create the performance goal?":"Are you sure you want to update the performance goal?";
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
      this.saveKpi();
     } else {
       
     }
    })
    
  }


  draftKpi(){
    this.kpiForm.patchValue({ IsDraft: 'true' });
    this.saveKpi();
  }


  saveKpi() {

if (!this.kpiForm.get('Kpi').value) {
  this.snack.error('Performance Goal is required');
  return
}


if(this.selectedItems.length==0) {

  this.snack.error('Please add and select KPI');
  return;
}

    this.perfApp.route = "app";
    this.perfApp.method = this.currentAction == 'create' ? "AddKpi" : "UpdateKpiDataById",


      this.perfApp.requestBody = this.kpiForm.value; //fill body object with form 
      this.perfApp.requestBody.isFinalSignoff=this.isFinalSignoff;
      let Measurements = [];
   
  
    this.selectedItems.forEach(x => {
      Measurements.push({ measureId: x._id })
     
    })

    this.perfApp.requestBody.Kpi = this.perfApp.requestBody.Kpi.Kpi?
                                    this.perfApp.requestBody.Kpi.Kpi :this.perfApp.requestBody.Kpi;
    // this.perfApp.requestBody.MeasurementCriteria = this.selectedItems.map(e => { e.measureId=e._id});
    this.perfApp.requestBody.kpiId = this.kpiDetails._id?  this.kpiDetails._id : '';
    this.perfApp.requestBody.MeasurementCriteria = Measurements;

    if (this.currentAction =='create') 
    this.perfApp.requestBody.Weighting = this.kpiForm.get('IsDraft').value=='true'? 0: this.weight;
   if(this.currEvaluation)
    this.perfApp.requestBody.EvaluationId = this.currEvaluation._id;

    this.perfApp.requestBody.CreatedBy = this.loginUser._id;
    this.perfApp.requestBody.EvaluationYear = this.currentEvaluation;
    this.perfApp.requestBody.Owner = this.loginUser._id;
    this.perfApp.requestBody.UpdatedBy = this.loginUser._id;
    if(this.loginUser.Manager && this.loginUser.Manager._id){
      this.perfApp.requestBody.ManagerId = this.loginUser.Manager._id
    }else if(this.loginUser.Manager){
      this.perfApp.requestBody.ManagerId = this.loginUser.Manager;
    }
    delete this.perfApp.requestBody.ManagerComments;

    if (this.kpiForm.get('IsDraft').value=='true') {
      this.perfApp.requestBody.Action = 'Draft';
    }

    if (this.currentAction=='edit' && this.kpiForm.get('IsDraft').value=='false'
    && this.perfApp.requestBody.Weighting==0){
      this.perfApp.requestBody.Weighting =this.weight;
    }
    console.log(this.loginUser.Manager);
    console.log(this.perfApp.requestBody.ManagerId)
    this.callKpiApi();

  }

  callKpiApi() {
    this.disabledCreateBtn=true;

    this.perfApp.CallAPI().subscribe(c => {

      if (c.message == Constants.SuccessText) {

        this.snack.success(this.translate.instant(`Performance Goal 
        ${ this.getActionString(this.currentAction,this.perfApp.requestBody.Action,this.IsDraftDBVal)} Successfully`));
       this.selectedItems=[];
        this.getAllKPIs();
        if (this.accessingFrom=='currEvaluation') {
          
          this.router.navigate(['employee/current-evaluation']);
        } else {         
        this.router.navigate(['employee/kpi-setup']);
        }
      }

      this.disabledCreateBtn=false;

    }, error => {
      if (error.error.message === Constants.EvaluationAdminNotFound) {
        //  this.openConfirmSubmitKpisDialog()
      } else {
        this.snack.error(this.translate.instant(error.error.message));

      }
      this.disabledCreateBtn=false;

    });

  }



  addMesurment() {
    
    debugger

if(this.kpiForm.get('MeasurementCriteria').value.length==0) {

  this.snack.error('KPI is mandatory');
  return;
}

    this.perfApp.route = "app";
    this.perfApp.method = "CreateMeasurementCriteria";
    this.perfApp.requestBody = {};
    this.perfApp.requestBody.Name = this.kpiForm.get('MeasurementCriteria').value;
    this.perfApp.requestBody.CreatedBy = this.loginUser._id;
    this.perfApp.requestBody.UpdatedBy = this.loginUser._id;

    this.disabledAddKpiBtn=true;
    this.perfApp.CallAPI().subscribe(c => {

      if (c) {

     
        this.getMeasurementCriterias("KpiAdding");
      
        // this.kpiForm.get('MeasurementCriteria').setErrors(null);
        // this.kpiForm.get('MeasurementCriteria').markAsUntouched;
this.snack.success(this.translate.instant(`KPI added Successfully`));
// if (this.currentAction=='create') {
// c.selected=false;
// }else if (this.currentAction=='edit') {
  c.selected=true;
 // }

 this.disabledAddKpiBtn=false;
this.toggleSelection(c,null);

        
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

  findPgSignoff(){
    console.log(this.loginUser)
    let orgStartEnd = this.getOrganizationStartAndEndDates();
    let EvaluationYear = this.currentEvaluation;
    let {Manager,Organization} = this.loginUser;
    let options = {
      EvaluationYear,
      Owner: this.loginUser._id,
      
    };
    console.log(options);
    this.perfApp.route = "app";
    this.perfApp.method = "Find/PG/Signoff";
    this.perfApp.requestBody = options;
    this.perfApp.CallAPI().subscribe(result => {
     debugger
      if(!result){
        this.isEmployeePgSignoff = false;
      }else{
        let {FinalSignoff, SignOff, ManagerSignOff}  = result;
        this.isFinalSignoffDone=FinalSignoff;
        this.isEmployeePgSignoff = true;
      }

      this.initApicallsForKpi();
      
    })
  }

  getAllKpiBasicData() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetKpiSetupBasicData";
    this.perfApp.requestBody = { 'empId': this.loginUser._id ,
    'orgId':this.authService.getOrganization()._id,
    currentEvaluation:this.currentEvaluation
  }
      this.perfApp.CallAPI().subscribe(c => {

        if (c) {

          this.appScores = c.KpiScore;
          this.kpiStatus = c.KpiStatus;
          this.coachingRemDays = c.coachingRem;
          this.currEvaluation = c.evaluation;
          if(c.evaluation){
            let {Employees} = c.evaluation;
            let empFinalRatingSelfSignoff = Employees.find(employee=>employee._id==this.loginUser._id);
            if(empFinalRatingSelfSignoff)
              this.isEmpFRSignOff = empFinalRatingSelfSignoff.FinalRating.Self.SignOff.length > 0 || empFinalRatingSelfSignoff.FinalRating.Self.IsSubmitted;
            this.showManagerScore = empFinalRatingSelfSignoff.FinalRating.Manager.IsSubmitted;
          }
          debugger
          
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




  getMeasurementCriterias(reqFrom) {
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllMeasurementCriterias",
      this.perfApp.requestBody = { 'empId': this.loginUser._id }
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

          if (this.currentAction!='create' && reqFrom !="KpiAdding") {
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




conformSubmitKpis(){
  this.openConfirmSubmitKpisDialog();
}
  
  submitAllKPIs() {

    this.perfApp.route = "app";
    this.perfApp.method = "SubmitKpisForEvaluation",
      this.perfApp.requestBody = { 'empId': this.loginUser._id,currentEvaluation:this.currentEvaluation }
    this.perfApp.CallAPI().subscribe(c => {

     if (c) {
      this.snack.success(c.message);
      this.router.navigate(['employee/kpi-setup']);
     } else {
       
     }

    }
    
    , error => {

      this.snack.error(error.error.message);

    }
    
    )
  }

  getAllKPIs() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllKpis",
      this.perfApp.requestBody = { 'empId': this.loginUser._id,'orgId':this.authService.getOrganization()._id,evaluationYear:this.currentEvaluation}
    this.perfApp.CallAPI().subscribe(c => {
      console.log(c);
      // this.setWeighting(c.filter(item => item.IsDraft === false).length);
      debugger
     // if (this.currentAction =='create')
      this.setWeighting(c.filter(item => item.IsDraft === false && item.EvaluationYear == this.currentEvaluation ).length, this.currentAction);
      if (c && c.length > 0) {
        if (this.accessingFrom=='currEvaluation') {
          if (c.filter(e=>e.IsSubmitedKPIs).length==0) {
            this.showKpiForm  =false;
            return
          }
          this.empKPIData = c.filter(e=> this.isFinalSignoffDone && e.IsDraft==false && e.IsActive==true && e.IsSubmitedKPIs==true && ( e.ManagerSignOff&& e.ManagerSignOff.submited)   );
        }else{
          this.empKPIData = c;
        }
        this.unSubmitedCount=c.filter(e=>e.IsSubmitedKPIs==false && e.IsDraft==false ).length;
        this.scoreUnSubmitedCount=c.filter(e=>e.Score=="" && e.IsDraft==false && e.IsActive==true ).length;
if(this.scoreUnSubmitedCount==0)
this.authService.setIsPGSubmitStatus("true");



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


            if (!this.kpiDetails.ViewedByEmpOn && this.kpiDetails.ManagerSignOff.SignOffBy) {
              this.updateKpiAsViewed();
            }

          }

           this.getMeasurementCriterias("");
           this.showKpiForm=true;

      }else{
        
        if (this.accessingFrom=='currEvaluation') {
          this.showKpiForm=false;
        }
      }

    }
    
    , error => {
      if (error.error.message === Constants.KpiNotActivated) {
        this.isKpiActivated=false;
       
      } else {

      this.snack.error(error.error.message);

       }
    }
    
    )
  }



  updateKpiAsViewed() {
    
    this.perfApp.route = "app";
    this.perfApp.method  ="UpdateKpiDataById";


      this.perfApp.requestBody = {} //fill body object with form    
    this.perfApp.requestBody.kpiId = this.currentKpiId;
    this.perfApp.requestBody.UpdatedBy = this.loginUser._id; //as a actor for track
    this.perfApp.requestBody.ViewedByEmpOn = true;
      this.perfApp.requestBody.Action = 'Viewed';  
      this.perfApp.CallAPI().subscribe(c => {
        if (c.message == Constants.SuccessText) {
         console.log(c)
        } 
      }, error => {
  
      });
  
  }




  setWeighting(length: any,currentAction) {
    console.log(length +" = "+currentAction);
    debugger
    this.weight = length==0? 100 :  Math.round( 100/(length+1));
    if(currentAction =='create')
    this.kpiForm.patchValue({ Weighting: this.weight });
  }


  onKpiAutoSelected(event) {

    var selkpi = event.option.value;
  this.selectedItems=[]
  this.filteredOptionsTS.forEach(e => {
    e.map(m => {
        m.selected = false;
    })

  });
    selkpi.MeasurementCriteria.forEach(e => {
      e.measureId.selected=false;
      this.toggleSelection(e.measureId,null);
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
    this.msSelText="";
     this.msSelText= this.selectedItems.map(m=>m.Name).join(', ')
     return this.msSelText;
  }

  

  foucuout() {
    this.msSelText= "";
  }


  optionClicked(event, item) {
    event.stopPropagation();
  //  this.toggleSelection(item);
  }

  toggleSelection(item,event) {
    let f;
  if(event)  item.selected=event.checked;
    if(this.currentAction=='create'){
     f=item.selected;
    item.selected = item.selected;
    }
    if ( item.selected==true) {
      this.selectedItems.push(item);
      // this.changeCallback( this.selectedItems );
    } else if (item.selected==false) {
      const i = this.selectedItems.findIndex(value => value._id === item._id);
      this.selectedItems.splice(i, 1);
      //this.changeCallback( this.selectedItems );
    }
    this.showSelectedItems()
    this.filteredOptionsTS.forEach(e => {
      e.map(m => {

        if (m._id == item._id)
          m.selected = f || m._id == item._id;
      })

    });

    if (this.selectedItems.length > 0) {
      this.kpiForm.get('MeasurementCriteria').reset();
      this.kpiForm.get('MeasurementCriteria').clearValidators();
      this.kpiForm.get('MeasurementCriteria').setValue("");
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
  

  async toggleSelectAll(){
    this.isAllSelected = !this.isAllSelected;
  //   let len = this.selectedItems.length;
  //   if ( this.isAllSelected ){
  //         for ( let i=0; i++; i<len )
  //           this.selectedItems[i].selected = true;
  //         // this.selectedItems = data;
  //     this.selectedItems = this.selectedItems;
  //     // for ( let i=0; i++; i<len )
  //     //   this.items[i].selected = true;
  //     // this.selectedItems. = [...this.items];
  // //    this.changeCallback( this.selectedItems );
  // //    this.cd.markForCheck();
  //     // this.itemControl.updateValueAndValidity();
  //   } else {
  //     this.selectedItems = [];
  //     // for ( let i=0; i++; i<len )
  //     // this.items[i].selected = false;

  //   }
  // //  this.changeCallback( this.selectedItems );




this.selectedItems=[];
this.msSelText="";
if ( this.isAllSelected ){
  
 await this.filteredOptionsTS.forEach(e => {
    e.map(m => {

         m.selected =this.isAllSelected;
        this.selectedItems.push(m);
        this.msSelText +=  m.Name+","
    })

  });
 

}else{
  this.msSelText="";
  this.filteredOptionsTS.forEach(e => {
    e.map(m => {

      // if (m._id == item._id)
        m.selected =this.isAllSelected;
    })

  });

}
  }

  onFocusOut(){

this.msSelText="";
  }



  
   /**To alert user for submit kpis */
   openConfirmSubmitKpisDialog() {
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
      this.perfApp.requestBody.IgnoreEvalAdminCreated=true;
      this.submitAllKPIs();
     } else {
       
     }
    })
  }




  nextKpi(){

    debugger
   this.selIndex=this.selIndex+1;
    this.kpiDetails=  this.empKPIData[this.selIndex];
    this.initKPIForm();
    this.currentKpiId=this.kpiDetails._id;
  }

  priKpi(){
debugger
    this.selIndex=this.selIndex-1;
    this.kpiDetails=  this.empKPIData[this.selIndex];
    this.initKPIForm();
    this.currentKpiId=this.kpiDetails._id;
  }


  
  getActionString(currentAction,subAction,IsDraftDBVal) {
    debugger
    if (currentAction=='create' && subAction=='Draft') {
      return 'saved'
    } else  if (currentAction=='create') {
      return 'created '
    }else  if (currentAction=='edit' && IsDraftDBVal==true && subAction=='Draft')  {
      return 'saved'
    }else  if (currentAction=='edit' && IsDraftDBVal==true && subAction!='Draft')  {
      return 'created'
    }else  if (currentAction=='edit') {
      return 'updated'
    }
    
   
  }


  
public monthList = ["","January", "February", "March", "April", "May", "June", "July",
"August", "September", "October", "November", "December"];
  
  getEVPeriod() {
    if (this.currentEvaluationPeriod) {
      return this.currentEvaluationPeriod;
    } else {
      return ReportTemplates.getEvaluationPeriod(this.currentOrganization.StartMonth, this.currentOrganization.EndMonth);
    }
    }


    
  printPage() {
    window.print();
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

}


