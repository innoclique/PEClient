import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AlertDialog } from '../../Models/AlertDialog';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';
import { ThemeService } from '../../services/theme.service';
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
  currentAction = 'create';


  filteredOptionsKPI: Observable<any[]>;
  public empKPIData: any[] = []
  // public selectedKPIItems :any[]=[]




  filteredOptionsTS: Observable<any[]>;
  public empMeasuCriData: any[] = []
  public selectedItems: any[] = []
  weight:any;
  currentKpiId: any;
  selIndex: any;
  isKpiActivated: boolean;




  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
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
      Signoff: [this.loginUser.FirstName],

      IsSubmit: ['false'],
      IsDraft: [''],
      Score: [this.kpiDetails.Score ? this.kpiDetails.Score : '', [Validators.required]],
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
    this.saveKpi();
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
    this.perfApp.requestBody.UpdatedBy = this.loginUser._id;
    this.perfApp.requestBody.ManagerId = '';//this.loginUser.ParentUser?this.loginUser.ParentUser:this.loginUser._id;


    this.callKpiApi();

  }

  callKpiApi() {

    this.perfApp.CallAPI().subscribe(c => {

      if (c.message == Constants.SuccessText) {

        this.snack.success(this.translate.instant(`KPI ${this.currentAction == 'create' ? 'Added' : 'Updated'}  Succeesfully`));

        this.router.navigate(['employee/setup']);
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
this.snack.success(this.translate.instant(`Measurement Criteria Created Succeesfully`));
        
      }
    })
  }



  getAllKpiBasicData() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetKpiSetupBasicData",
      this.perfApp.CallAPI().subscribe(c => {

        if (c) {

          this.appScores = c.KpiScore;
          this.kpiStatus = c.KpiStatus;
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


        this.filteredOptionsTS = this.kpiForm.controls['MeasurementCriteria'].valueChanges
          .pipe(
            startWith(''),
            map(value => typeof value === 'string' ? value : value ? value.Name : ""),
            map(name => name ? this._filterTD(name) : this.empMeasuCriData.slice())
          );

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





  
  submitAllKPIs() {

    this.perfApp.route = "app";
    this.perfApp.method = "SubmitKpisForEvaluation",
      this.perfApp.requestBody = { 'empId': this.loginUser._id }
    this.perfApp.CallAPI().subscribe(c => {

     if (c) {
      this.snack.success(c.message);
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
      this.perfApp.requestBody = { 'empId': this.loginUser._id }
    this.perfApp.CallAPI().subscribe(c => {

      this.setWeighting(c.filter(item => item.IsDraft === false).length);
      if (c && c.length > 0) {
        this.empKPIData = c;



        this.filteredOptionsKPI = this.kpiForm.controls['Kpi'].valueChanges
          .pipe(
            startWith(''),
            map(value => typeof value === 'string' ? value : value ? value.Kpi : ""),
            map(name => name ? this._filterKPI(name) : this.empKPIData.slice())
          );


          if (this.currentAction !='create') {
            this.kpiDetails=  this.empKPIData.filter(e=> e._id== this.currentKpiId)[0];
            this.selIndex=  this.empKPIData.findIndex(e=> e._id== this.currentKpiId);
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
    return this.selectedItems.map(e => " "+e.Name)
  }


  optionClicked(event: Event, item) {
    event.stopPropagation();
    this.toggleSelection(item);
  }

  toggleSelection(item) {
    item.selected = !item.selected;
    if (item.selected) {
      this.selectedItems.push(item);
      // this.changeCallback( this.selectedItems );
    } else {
      const i = this.selectedItems.findIndex(value => value.item === item.item);
      this.selectedItems.splice(i, 1);
      //this.changeCallback( this.selectedItems );
    }
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
