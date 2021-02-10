
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AlertDialog } from '../../../Models/AlertDialog';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { PerfAppService } from '../../../services/perf-app.service';
import { ThemeService } from '../../../services/theme.service';
import { Constants } from '../../../shared/AppConstants';
import { CustomValidators } from '../../../shared/custom-validators';
import ReportTemplates from '../../../views/psa/reports/data/reports-templates';
import * as moment from 'moment';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AlertComponent } from '../../../shared/alert/alert.component';

@Component({
  selector: 'app-kpi-add',
  templateUrl: './kpi-add.component.html',
  styleUrls: ['./kpi-add.component.css']
})
export class KpiAddComponent implements OnInit {


  public kpiForm: FormGroup;
  kpiDetails: any = { IsActive: 'true',MeasurementCriteria:[] }
  loginUser: any;
  public alert: AlertDialog;
  appScores: any = [];
  kpiStatus: any = [];
  coachingRemDays: any = [];
  currentAction = 'create';
  currentKpiId: any;
  isAllSelected = false;
  disabledAddKpiBtn = false;
  addMCSwitch = true;

  filteredOptionsKPI: Observable<any[]>;
  public empKPIData: any[] = []
  // public selectedKPIItems :any[]=[]




  filteredOptionsTS: Observable<any[]>;
  public empMeasuCriData: any[] = []
  public selectedItems: any[] = []
  weight:any;
  currentOwnerId: any;
  selIndex: any;
  isKpiActivated: boolean;
  msSelText="";
  msSelVal="";
  ownerInfo: any;
  currEvaluation: any;
  currentOrganization: any;
  selectedUser: any;
  isFinalSignoff=false;
  currentEvaluationYear:any;


  constructor(private fb: FormBuilder,
    private authService: AuthService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    public themeService: ThemeService,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService) {
    this.loginUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();

    

    this.activatedRoute.params.subscribe(params => {
      if (params['currentEvaluationYear']) {
        this.currentEvaluationYear = params['currentEvaluationYear'];
      }
     if (params['action']) {
      this.currentOwnerId = params['ownerId'];
      this.currentKpiId = params['id'];
      this.currentAction = params['action'];
      this.findPgSignoff();
     }
     this.GetEmployeeDetailsById();

     this.initApicallsForKpi();
     
    });   

    

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
    let EvaluationYear = orgStartEnd.start.format("YYYY");
    let options = {
      EvaluationYear,
      Owner:this.currentOwnerId,
      
    };
    console.log(options);
    this.perfApp.route = "app";
    this.perfApp.method = "Find/PG/Signoff";
    this.perfApp.requestBody = options;
    this.perfApp.CallAPI().subscribe(result => {
      if(!result){
        this.isFinalSignoff = false;
      }else{
        let {FinalSignoff}  = result;
        this.isFinalSignoff = FinalSignoff;
      }
    })
  }


  async initApicallsForKpi() {

    await this.getAllKPIs()
    await this.getAllKpiBasicData();
    await this.getMeasurementCriterias();

  }

  ngOnInit(): void {



    this.initKPIForm()

    this.alert = new AlertDialog();
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
      YearEndComments: [''],
      YECommManager: [''],
      Weighting: [this.kpiDetails.Weighting ? this.kpiDetails.Weighting : ""],
      

      IsDraftByManager: [''],
      IsDraft: ['false'],
      Score: [this.kpiDetails.Score ? this.kpiDetails.Score : ''],
      Status: [this.kpiDetails.Status ? this.kpiDetails.Status : '', [Validators.required]],

    });

    this.selectedItems=[];
    this.kpiDetails.MeasurementCriteria.forEach(e => {
      this.toggleSelection(e.measureId);
    });

  }





  get f() {
    return this.kpiForm.controls;
  }


  onCancle() {
    this.router.navigate(['employee/review-perf-goals-list']);
  }

  submitKpi() {

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

    this.kpiForm.patchValue({ IsDraftByManager: 'false' });
    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to create performance goal?";
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
      this.saveKpi();

     } else {
       
     }
    })
    
  }


  
  draftKpiByManager(){
    this.kpiForm.patchValue({ IsDraftByManager: 'true' });
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
    this.perfApp.method = this.currentAction == 'add' ? "AddKpi" : "UpdateKpiDataById",


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
    if(this.currEvaluation)
    this.perfApp.requestBody.EvaluationId = this.currEvaluation._id;
    //this.perfApp.requestBody.Signoff = this.loginUser._id;
    this.perfApp.requestBody.CreatedBy = this.loginUser._id;
    this.perfApp.requestBody.Owner = this.ownerInfo._id;
    this.perfApp.requestBody.UpdatedBy = this.loginUser._id;
    this.perfApp.requestBody.EvaluationYear = this.currentEvaluationYear;
    this.perfApp.requestBody.ManagerId = this.loginUser._id;//this.loginUser.ParentUser?this.loginUser.ParentUser:this.loginUser._id;


    
    if (this.kpiForm.get('IsDraftByManager').value=='true') {
      this.perfApp.requestBody.Action = 'Draft';
    }
    this.perfApp.requestBody.isFinalSignoff = this.isFinalSignoff;
    this.perfApp.requestBody.isManagerSubmitted = true;
    this.callKpiApi();

  }

  callKpiApi() {

    this.perfApp.CallAPI().subscribe(c => {

      if (c.message == Constants.SuccessText) {

        this.snack.success(this.translate.instant(`Performance Goal ${this.currentAction == 'add' ? 'Added' : 'Updated'}  Successfully`));

        this.router.navigate(['employee/review-perf-goals-list']);
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


if(this.kpiForm.get('MeasurementCriteria').value.length==0) {

  this.snack.error('KPI is mandatory');
  return;
}

    this.perfApp.route = "app";
    this.perfApp.method = "CreateMeasurementCriteria";
    this.perfApp.requestBody = {};
    this.perfApp.requestBody.Name = this.kpiForm.get('MeasurementCriteria').value;
    this.perfApp.requestBody.CreatedBy = this.ownerInfo._id;
    this.perfApp.requestBody.UpdatedBy = this.loginUser._id;
    this.disabledAddKpiBtn=true;
    this.perfApp.CallAPI().subscribe(c => {

      if (c) {

        this.getMeasurementCriterias();
this.snack.success(this.translate.instant(`KPI added Successfully`));
c.selected=false;
this.toggleSelection(c);

this.disabledAddKpiBtn=false;
        
      }
    })
  }



  getAllKpiBasicData() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetKpiSetupBasicData";
    this.perfApp.requestBody = { 'empId': this.currentOwnerId,
    'orgId':this.authService.getOrganization()._id,
    currentEvaluation:this.currentEvaluationYear
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
      this.perfApp.requestBody = { 'empId': this.currentOwnerId }
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

          // if (this.currentAction!='add') {
          //   this.initKPIForm();
          // }



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





  getAllKPIs() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllKpis",
      this.perfApp.requestBody = { 'empId': this.currentOwnerId ,
      'orgId':this.authService.getOrganization()._id,evaluationYear:this.currentEvaluationYear }
    this.perfApp.CallAPI().subscribe(c => {

      this.setWeighting(c.length);
      if (c && c.length > 0) {
        this.empKPIData = c;
        this.ownerInfo=c[0].Owner;



        this.filteredOptionsKPI = this.kpiForm.controls['Kpi'].valueChanges
          .pipe(
            startWith(''),
            map(value => typeof value === 'string' ? value : value ? value.Kpi : ""),
            map(name => name ? this._filterKPI(name) : this.empKPIData.slice())
          );


          if (this.currentAction !='create') {
           this.getKpiById();
          }

      }
      else{

        this.ownerInfo=this.selectedUser;

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
    
    this.weight = length==0? 100 :  Math.round( 100/(length+1));

    this.kpiForm.patchValue({ Weighting: this.weight });

   
  }

  
 async GetEmployeeDetailsById() {
  this.perfApp.route = "app";
  this.perfApp.method = "GetEmployeeDataById",
    this.perfApp.requestBody = { id: this.currentOwnerId }
    this.perfApp.CallAPI().subscribe(x => {
    this.selectedUser =x;

    }, error => {
      console.log('error', error)
    
    })
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
    this.msSelText="";
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
    let f=!item.selected;
    item.selected = !item.selected;
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
          m.selected = f;
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

  nextKpi(){

   this.selIndex=this.selIndex+1;
    this.kpiDetails=  this.empKPIData[this.selIndex];
    this.initKPIForm();
    // this.currentKpiId=this.kpiDetails._id;
  }

  priKpi(){

    this.selIndex=this.selIndex-1;
    this.kpiDetails=  this.empKPIData[this.selIndex];
    this.initKPIForm();
    // this.currentKpiId=this.kpiDetails._id;
  }


  

  getKpiById() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetKpiDataById",
      this.perfApp.requestBody = { 'id': this.currentKpiId }
    this.perfApp.CallAPI().subscribe(c => {
if (c) {
  this.kpiDetails=c;
  this.initKPIForm();
  return c;
}



    })
  }




  public monthList = ["","January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];
  
  getEVPeriod(){
    return ReportTemplates.getEvaluationPeriod(this.currentOrganization.StartMonth, this.currentOrganization.EndMonth);
      }







}

