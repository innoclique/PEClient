import { Component, Input, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-kpi-settings',
  templateUrl: './kpi-settings.component.html',
  styleUrls: ['./kpi-settings.component.css']
})
export class KpiSettingsComponent implements OnInit {


  public kpiForm: FormGroup;
  kpiDetails: any = { IsActive: 'true',MeasurementCriteria:[] }
  loginUser: any;
  public alert: AlertDialog;
  appScores: any = [];
  kpiStatus: any = [];
  coachingRemDays: any = [];
  @Input()
  currentAction = 'create';
  isAllSelected = false;
  addMCSwitch = true;
  scoreUnSubmitedCount=0;
  unSubmitedCount=0;

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

    this.initApicallsForKpi();

    this.activatedRoute.params.subscribe(params => {
     
     if (params['action']) {
      this.currentKpiId = params['id'];
      this.currentAction = params['action'];
     }
     
    });   

  }


  async initApicallsForKpi() {

    
    await this.getAllKpiBasicData();
    await this.getAllKPIs();
    

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
      YearEndComments: [this.kpiDetails.YearEndComments ? this.kpiDetails.YearEndComments :''],
      YECommManager: [this.kpiDetails.YECommManager ? this.kpiDetails.YECommManager :''],
      Weighting: [this.kpiDetails.Weighting ? this.kpiDetails.Weighting : ""],
      Signoff: [this.kpiDetails.Signoff ? this.kpiDetails.Signoff.SignOffBy : null],

      IsDraft: [this.kpiDetails.IsDraft ? 'true' : 'false'],
      Score: [this.kpiDetails.Score ? this.kpiDetails.Score : '', ],
      Status: [this.kpiDetails.Status ? this.kpiDetails.Status : '', [Validators.required]],

    });

   
    this.kpiDetails.MeasurementCriteria.forEach(e => {
      this.toggleSelection(e.measureId);
    });

  }





  get f() {
    return this.kpiForm.controls;
  }


  onCancle() {
    this.router.navigate(['employee/kpi-setup']);
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

    this.kpiForm.patchValue({ IsDraft: 'false' });

    if (this.accessingFrom == "currEvaluation" && this.currentAction == 'edit' && this.unSubmitedCount > 0) {
      this.snack.error("Please sign-off performance goals")
      return;
    }
    this.saveKpi();
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

    this.perfApp.requestBody.CreatedBy = this.loginUser._id;
    this.perfApp.requestBody.Owner = this.loginUser._id;
    this.perfApp.requestBody.UpdatedBy = this.loginUser._id;
    this.perfApp.requestBody.ManagerId = this.loginUser.Manager._id;

    if (this.kpiForm.get('IsDraft').value=='true') {
      this.perfApp.requestBody.Weighting = '';
      this.perfApp.requestBody.Action = 'Draft';
    }

    this.callKpiApi();

  }

  callKpiApi() {

    this.perfApp.CallAPI().subscribe(c => {

      if (c.message == Constants.SuccessText) {

        this.snack.success(this.translate.instant(`Performance Goal ${this.currentAction == 'create' ? 'Added' : 'Updated'}  Successfully`));

        this.getAllKPIs();
        if (this.accessingFrom=='currEvaluation') {
          
          this.router.navigate(['employee/current-evaluation']);
        } else {         
        this.router.navigate(['employee/kpi-setup']);
        }
      }

    }, error => {
      if (error.error.message === Constants.EvaluationAdminNotFound) {
        //  this.openConfirmSubmitKpisDialog()
      } else {
        this.snack.error(this.translate.instant(error.error.message));

      }


    });

  }



  addMesurment() {

if(this.kpiForm.get('MeasurementCriteria').value.length==0) {

  this.snack.error('KPI is required');
  return;
}

    this.perfApp.route = "app";
    this.perfApp.method = "CreateMeasurementCriteria";
    this.perfApp.requestBody = {};
    this.perfApp.requestBody.Name = this.kpiForm.get('MeasurementCriteria').value;
    this.perfApp.requestBody.CreatedBy = this.loginUser._id;
    this.perfApp.requestBody.UpdatedBy = this.loginUser._id;
    this.perfApp.CallAPI().subscribe(c => {

      if (c) {

     
        this.getMeasurementCriterias();
      
        // this.kpiForm.get('MeasurementCriteria').setErrors(null);
        // this.kpiForm.get('MeasurementCriteria').markAsUntouched;
this.snack.success(this.translate.instant(`KPI Created Successfully`));
c.selected=false;
this.toggleSelection(c);
        
      }
    })
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




conformSubmitKpis(){
  this.openConfirmSubmitKpisDialog();
}
  
  submitAllKPIs() {

    this.perfApp.route = "app";
    this.perfApp.method = "SubmitKpisForEvaluation",
      this.perfApp.requestBody = { 'empId': this.loginUser._id }
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
      this.perfApp.requestBody = { 'empId': this.loginUser._id,'orgId':this.authService.getOrganization()._id}
    this.perfApp.CallAPI().subscribe(c => {

      this.setWeighting(c.filter(item => item.IsDraft === false).length);
      if (c && c.length > 0) {
        this.empKPIData = c;
        this.unSubmitedCount=c.filter(e=>e.IsSubmitedKPIs==false && e.IsDraft==false ).length;
        this.scoreUnSubmitedCount=c.filter(e=>e.Score=="" && e.IsDraft==false ).length;
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


            if (!this.kpiDetails.ViewedByEmpOn && this.kpiDetails.ManagerSignOff) {
              this.updateKpiAsViewed();
            }

          }

           this.getMeasurementCriterias();

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
    this.perfApp.method = this.currentAction ="UpdateKpiDataById";


      this.perfApp.requestBody = {} //fill body object with form    
    this.perfApp.requestBody.kpiId = this.currentKpiId;
    this.perfApp.requestBody.ViewedByEmpOn = true;
      this.perfApp.requestBody.Action = 'Viewed';  
      this.perfApp.CallAPI().subscribe(c => {
        if (c.message == Constants.SuccessText) {
         console.log(c)
        } 
      }, error => {
  
      });
  
  }




  setWeighting(length: any) {
    
    this.weight = length==0? 100 :  Math.round( 100/length);

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
    this.msSelText="";
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



}
