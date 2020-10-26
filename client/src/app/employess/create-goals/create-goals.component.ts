import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { GridOptions } from 'ag-grid-community';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';
import { ThemeService } from '../../services/theme.service';
import { Constants } from '../../shared/AppConstants';
import { CustomValidators } from '../../shared/custom-validators';

@Component({
  selector: 'app-create-goals',
  templateUrl: './create-goals.component.html',
  styleUrls: ['./create-goals.component.css']
})
export class CreateGoalsComponent implements OnInit {


  goalsItemRows = [];
  goalsActionItemsForm: FormGroup;
  goalsBuildForm: FormGroup;
  currentAction='create'
  goalDetails: any = { }

  filteredOptionsOP: Observable<any[]>;
  public employeeOtherPatData :any[]=[]



  public goalsItemColumns: GridOptions = {
    columnDefs: this.getColDef()      
  }
  rowItemSubmitted=false;
  gridApi: any;
  loginUser: any;
  devGoalsStatus=[];


  filteredOptionsKPI: Observable<any[]>;
  filteredOptionsDevGoals: Observable<any[]>;
  public empKPIData: any[] = []
  public empDevGoalsData: any[] = []
  currEvaluation: any;
  
 
  constructor(private formBuilder: FormBuilder,
    private authService: AuthService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    public themeService: ThemeService,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService) {

    this.loginUser = this.authService.getCurrentUser();
    

    this.getAllKPIs();
    this.getAllDevGoalsDetails();
    this.getAllDevGoalsBasicData();
    this.getOtherParticipantsEmps();
   }

  ngOnInit(): void {

this.initDevGoalForm();
  }


  initDevGoalForm(){

    this.goalsBuildForm = this.formBuilder.group({
      DesiredOutcomes: ['', [Validators.required]],
      DevGoal: ['',  Validators.compose([
        Validators.required, Validators.minLength(2),
        CustomValidators.patternValidator(/(?=.*[#)&.(-:/?])/, { hasKPISplChars: true }, 'hasKPISplChars'),
      ])],
      Kpi: [null],
      MakePrivate: [''],
      IsDraft: [this.goalDetails.IsDraft ? 'true' : 'false'],
     
      GoalActionItems: this.formBuilder.group({
        ActionStep: ['', [Validators.required]],
        ProgressIndicators: ['', [Validators.required]],
        TargetDate: ['', [Validators.required]],
        Status : ['', [Validators.required]],
        Barriers: ['',],
        OtherParticipants: [null,],
       
      })
    })
    this.goalsActionItemsForm = this.goalsBuildForm.get('GoalActionItems') as FormGroup;
  }




  get f(){

    return this.goalsBuildForm.controls;
  }

get k (){

  return this.goalsActionItemsForm.controls;
}


  getColDef(){
 return [
    { headerName: 'ActionStep', field: 'ActionStep', width: 150, autoHeight: true },
    { headerName: 'Progress Indicators', field: 'ProgressIndicators', width: 170, autoHeight: true },
    { headerName: 'Barriers', field: 'Barriers', width: 100, autoHeight: true },
    { headerName: 'Target Date', field: 'TargetDate', width: 120, autoHeight: true },
    { headerName: 'Other Participants', field: 'OtherParticipants', width: 170, autoHeight: true },
    { headerName: 'Status', field: 'Status', width: 120, autoHeight: true },
    {
      headerName: "Action",
      suppressMenu: true,
      Sorting: false,
      width: 120,
      template: `
      
      <i class="cui-trash icons font-1xl" style="cursor:pointer ;padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="remove"  ></i>  `

    }


  ];
}


onActionItemsGridReady(params) {
  this.goalsItemColumns.api = params.api; // To access the grids API
  this.gridApi = params.api;
}
redrawAllRows() {
  this.gridApi.setRowData(this.goalsItemRows);
  this.gridApi.resetRowHeights()
}
public onRowActionItemsClicked(e) {
  
}

addItemRow() {

  this.rowItemSubmitted = true;
  if (this.goalsActionItemsForm.invalid)
    return;
    this.goalsActionItemsForm.patchValue({OtherParticipants: 
      this.goalsActionItemsForm.get('OtherParticipants').value?
    this.goalsActionItemsForm.get('OtherParticipants').value._id : null});
  this.goalsItemRows.push(this.goalsActionItemsForm.value);
  this.redrawAllRows();
  this.goalsActionItemsForm.reset();
  this.rowItemSubmitted = false;
}






private _normalizeValue(value: string): string {
  return value.toLowerCase().replace(/\s/g, '');
}

displayKPIFn(user: any): string {
  return user && user.Kpi ? user.Kpi : '';
}



displayDevGoalFn(user: any): string {
  return user && user.DevGoal ? user.DevGoal : '';
}



private _filterKPI(name: string): any[] {
  const filterValue = this._normalizeValue(name);

  return this.empKPIData.filter(option => this._normalizeValue(option.Kpi).includes(filterValue));
}

getAllKPIs() {
  this.perfApp.route = "app";
  this.perfApp.method = "GetKpisForDevGoals",
    this.perfApp.requestBody = { 'empId': this.loginUser._id,'orgId':this.authService.getOrganization()._id}
  this.perfApp.CallAPI().subscribe(c => {

    if (c && c.length > 0) {
      this.empKPIData = c;



      this.filteredOptionsKPI = this.goalsBuildForm.controls['Kpi'].valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : value ? value.Kpi : ""),
          map(name => name ? this._filterKPI(name) : this.empKPIData.slice())
        );


       

    }

  }
  
  , error => {
   

    this.snack.error(error.error.message);

  }
  
  )
}




onKpiAutoSelected(event) {
  // let selkpi = event.option.value;
  // this.goalsBuildForm.patchValue({
  //   Kpi: selkpi._id,
  // });
}

onDevGoalsAutoSelected(event) {

  var selDevGoal = event.option.value;



  // this.goalsBuildForm.patchValue({
  //   TargetCompletionDate: selDevGoal.TargetCompletionDate,
  //   Score: selDevGoal.Score,
  //   Status: selDevGoal.Status,
  //   YearEndComments: selDevGoal.YearEndComments
  // });


}


private _filterDevGoals(name: string): any[] {
  const filterValue = this._normalizeValue(name);

  return this.empDevGoalsData.filter(option => this._normalizeValue(option.DevGoal).includes(filterValue));
}


getAllDevGoalsDetails() {
  this.perfApp.route = "app";
  this.perfApp.method = "GetAllDevGoals",
    this.perfApp.requestBody = { 'empId': this.loginUser._id,'orgId':this.authService.getOrganization()._id}
  this.perfApp.CallAPI().subscribe(c => {

    if (c && c.length > 0) {
      this.empDevGoalsData = c;



      this.filteredOptionsDevGoals = this.goalsBuildForm.controls['DevGoal'].valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : value ? value.DevGoal : ""),
          map(name => name ? this._filterDevGoals(name) : this.empDevGoalsData.slice())
        );


       

    }

  }
  
  , error => {
   

    this.snack.error(error.error.message);

  }
  
  )
}


navToGoalsList() {
  this.router.navigate(['employee/kpi-setup']);
}

submitGoal() {

  if (!this.goalsBuildForm.valid) {
    return;
  }
   this.goalsBuildForm.patchValue({ IsDraft: 'false' });
  this.saveDevGoal();
}


draftDevGoal(){
  this.goalsBuildForm.patchValue({ IsDraft: 'true' });
  this.saveDevGoal();
}


saveDevGoal() {

if (!this.goalsBuildForm.get('DevGoal').value) {
this.snack.error('Developmental Goal is required');
return
}

  this.perfApp.route = "app";
  this.perfApp.method = this.currentAction == 'create' ? "AddDevGoal" : "UpdateKpiDataById",


    this.perfApp.requestBody = this.goalsBuildForm.value; //fill body object with form 

  

  this.perfApp.requestBody.DevGoal = this.perfApp.requestBody.DevGoal.DevGoal?
                                  this.perfApp.requestBody.DevGoal.DevGoal :this.perfApp.requestBody.DevGoal;
  this.perfApp.requestBody.devGoalId = this.goalDetails._id?  this.goalDetails._id : '';
 // sg todo
  //this.perfApp.requestBody.EvaluationId = this.currEvaluation._id;



  this.perfApp.requestBody.Kpi = this.perfApp.requestBody.Kpi?  this.perfApp.requestBody.Kpi._id :null;
  this.perfApp.requestBody.GoalActionItems = this.goalsItemRows.length>0? this.goalsItemRows :null;
  this.perfApp.requestBody.CreatedBy = this.loginUser._id;
  this.perfApp.requestBody.Owner = this.loginUser._id;
  this.perfApp.requestBody.UpdatedBy = this.loginUser._id;
  // this.perfApp.requestBody.ManagerId = this.loginUser.Manager._id; sg todo

  if (this.goalsBuildForm.get('IsDraft').value=='true') {
    this.perfApp.requestBody.Action = 'Draft';
  }

  this.callKpiApi();

}

callKpiApi() {

  this.perfApp.CallAPI().subscribe(c => {

    if (c.message == Constants.SuccessText) {

      this.snack.success(this.translate.instant(` ${this.currentAction == 'create' ? 'Added' : 'Updated'}  Succeesfully`));

      this.router.navigate(['employee/goals']);
    }

  }, error => {
         this.snack.error(this.translate.instant(error.error.message));

      });

}









getAllDevGoalsBasicData() {
  this.perfApp.route = "app";
  this.perfApp.method = "GetKpiSetupBasicData";
  this.perfApp.requestBody = { 'empId': this.loginUser._id ,
  'orgId':this.authService.getOrganization()._id
}
    this.perfApp.CallAPI().subscribe(c => {

      if (c) {

       
        this.devGoalsStatus = c.KpiStatus;
        this.currEvaluation = c.evaluation;
       
      }
    })
}



displayFn(user: any): string {
  return user && user.FirstName ? user.FirstName : '';
}
private _filterOP(name: string): any[] {
  const filterValue = this._normalizeValue(name);

  return this.employeeOtherPatData.filter(option => this._normalizeValue(option.FirstName).includes(filterValue) );
}

getOtherParticipantsEmps(){
  this.perfApp.route="app";
  this.perfApp.method="GetManagers",
  this.perfApp.requestBody={'parentId':this.loginUser.ParentUser?this.loginUser.ParentUser:this.loginUser._id}
  this.perfApp.CallAPI().subscribe(c=>{
    
    console.log('lients data',c);
    if(c && c.length>0){


      this.employeeOtherPatData=c;
     
    
      this.filteredOptionsOP = this.goalsActionItemsForm.controls['OtherParticipants'].valueChanges
      .pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value? value.FirstName:""),
        map(name => name ? this._filterOP(name) : this.employeeOtherPatData.slice())
      );

    }
   
     
  })

}

}
