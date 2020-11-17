
import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { GridOptions } from 'ag-grid-community';
import { timeStamp } from 'console';
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


@Component({
  selector: 'app-devgoal-review',
  templateUrl: './devgoal-review.component.html',
  styleUrls: ['./devgoal-review.component.css']
})
export class DevgoalReviewComponent implements OnInit {



  @Input()
  actor:any;
  @Input()
  accessingFrom:any;
  showDevGoalForm=true;
  currentDevGoalId: any;
  currentEmpId: any;
  selIndex: any;

  public alert: AlertDialog;
  goalsItemRows = [];
  goalsActionItemsForm: FormGroup;
  goalsBuildForm: FormGroup;
  @Input()
  currentAction='create'

  goalDetails: any = { MakePrivate:false}

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
  submitClicked=false;

  currentRowItem: any;
  currentOrganization: any={};
  showDevGoalsForm=true;
  
 
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
    this.currentOrganization = this.authService.getOrganization();
    

    
    this.activatedRoute.params.subscribe(params => {
     debugger
      if (params['action']) {
       this.currentDevGoalId = params['id'];
       this.currentEmpId = params['empId'];
       this.currentAction = params['action'];
      }
      
     });   

 
    
   }

   async initApicallsForDevGoals() {
    this.getAllKPIs();
    this.getAllDevGoalsDetails();
    this.getAllDevGoalsBasicData();
    this.getOtherParticipantsEmps();

  }

  ngOnInit(): void {

    this.initApicallsForDevGoals();

this.initDevGoalForm();
this.alert = new AlertDialog();
  }


  initDevGoalForm(){

    this.goalsBuildForm = this.formBuilder.group({
      DesiredOutcomes: [this.goalDetails.DesiredOutcomes ? this.goalDetails.DesiredOutcomes :'', 
      Validators.compose([
        Validators.required, Validators.minLength(2),
        CustomValidators.patternValidator(/(?=.*[#)&.(-:/?])/, { hasKPISplChars: true }, 'hasKPISplChars'),
      ])  ],

      ManagerComments: [this.goalDetails.ManagerComments ? this.goalDetails.ManagerComments :'', 
      Validators.compose([
        Validators.required, Validators.minLength(2),
        CustomValidators.patternValidator(/(?=.*[#)&.(-:/?])/, { hasKPISplChars: true }, 'hasKPISplChars'),
      ])  ],

      DevGoal: [this.goalDetails && this.currentAction!='create' ? this.goalDetails :'',  Validators.compose([
        Validators.required, Validators.minLength(2),
        CustomValidators.patternValidator(/(?=.*[#)&.(-:/?])/, { hasKPISplChars: true }, 'hasKPISplChars'),
      ])],
      Kpi: [this.goalDetails.Kpi ? this.goalDetails.Kpi : null],
      MakePrivate: [this.goalDetails.MakePrivate ],
      IsDraft: [this.goalDetails.IsDraft ? 'true' : 'false'],
      IsDraftByManager: [this.goalDetails.IsDraftByManager ? 'true' : 'false'],
       ManagerFTSubmitedOn: [this.goalDetails.ManagerFTSubmitedOn?this.goalDetails.ManagerFTSubmitedOn:"" ],
     
      GoalActionItems: this.formBuilder.group({
        ActionStep: ['',
        Validators.compose([
          Validators.required, Validators.minLength(2),
          CustomValidators.patternValidator(/(?=.*[#)&.(-:/?])/, { hasKPISplChars: true }, 'hasKPISplChars'),
        ])  ],
        ProgressIndicators: ['',
        Validators.compose([
          Validators.required, Validators.minLength(2),
          CustomValidators.patternValidator(/(?=.*[#)&.(-:/?])/, { hasKPISplChars: true }, 'hasKPISplChars'),
        ])
      ],
        TargetDate: ['', [Validators.required]],
        Status : ['', [Validators.required]],
        Barriers: ['',],
        OtherParticipants: [null,],
       
      })
    })
    this.goalsActionItemsForm = this.goalsBuildForm.get('GoalActionItems') as FormGroup;


    if (this.goalDetails.GoalActionItems && this.goalDetails.GoalActionItems.length>0) {
      this.goalsItemRows=this.goalDetails.GoalActionItems;
    }else{
      this.goalsItemRows=[];
    }
  }




  get f(){

    return this.goalsBuildForm.controls;
  }

get k (){

  return this.goalsActionItemsForm.controls;
}


  getColDef(){
 return [
    { headerName: 'Action Step', field: 'ActionStep', width: 160, autoHeight: true },
    { headerName: 'Progress Indicators', field: 'ProgressIndicators', width: 190, autoHeight: true },
    { headerName: 'Barriers', field: 'Barriers', width: 160, autoHeight: true },
    { headerName: 'Target Date', field: 'TargetDate', width: 150, autoHeight: true ,
    cellRenderer: (data) => { return new DatePipe('en-US').transform(data.data.TargetDate, 'MM-dd-yyyy')}
    
  },
    { headerName: 'Other Participants', field: 'OtherParticipants', width: 170, autoHeight: true },
    { headerName: 'Status', field: 'Status', width: 120, autoHeight: true },
    // {
    //   headerName: "Action",
    //   suppressMenu: true,
    //   Sorting: false,
    //   width: 90,
    //   template: `
      
    //   <i class="cui-trash icons font-1xl" style="cursor:pointer ;padding: 7px 20px 0 0;
    //     font-size: 17px;"   data-action-type="remove"  ></i>  `

    // }


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

  if (e.event.target !== undefined) {
    this.currentRowItem = e.data;

    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {

      case "remove":
        this.deleteActionRow(this.currentRowItem);
        break;



      default:
    }
  }
  
}
  deleteActionRow(data) {

    this.goalsItemRows.splice(this.goalsItemRows.indexOf(data), 1);
    this.redrawAllRows();

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
 

goalsActionFormValidTogle(arg0: boolean) {
  if(arg0)
    // this.goalsActionItemsForm.clearValidators
 this.goalsBuildForm.get('GoalActionItems').clearValidators;
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
    this.perfApp.requestBody = { 'empId': this.currentEmpId,'orgId':this.authService.getOrganization()._id}
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
    this.perfApp.requestBody = { 'empId': this.currentEmpId,
    'fetchAll':true,'orgId':this.authService.getOrganization()._id}
  this.perfApp.CallAPI().subscribe(c => {

    if (c && c.length > 0) {
      this.empDevGoalsData = c;



      this.filteredOptionsDevGoals = this.goalsBuildForm.controls['DevGoal'].valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : value ? value.DevGoal : ""),
          map(name => name ? this._filterDevGoals(name) : this.empDevGoalsData.slice())
        );


        if (this.currentAction !='create') {
          this.currentDevGoalId=this.currentDevGoalId ? this.currentDevGoalId:this.empDevGoalsData[0]._id;
          this.goalDetails=  this.empDevGoalsData.filter(e=> e._id== this.currentDevGoalId)[0];
          this.selIndex=  this.empDevGoalsData.findIndex(e=> e._id== this.currentDevGoalId);

       this.initDevGoalForm();
          // if (!this.kpiDetails.ViewedByEmpOn && this.kpiDetails.ManagerSignOff) {
          //   this.updateKpiAsViewed();
          // }

        }
       

    }
    else{
        
      if (this.accessingFrom=='reviewEvaluation') {
        this.showDevGoalsForm=false;
      }
    }

  }
  
  , error => {
   

    this.snack.error(error.error.message);

  }
  
  )
}


navToGoalsList() {
  this.router.navigate(['employee/review-evaluation-list']);
}



submitGoal() {

  // if (!this.goalsBuildForm.valid) {
  //   return;
  // }
   this.goalsBuildForm.patchValue({ IsDraftByManager: 'false' });
  this.saveDevGoal();
}


draftDevGoal(){
  this.goalsBuildForm.patchValue({ IsDraftByManager: 'true' });
  this.saveDevGoal();
}


saveDevGoal() {

if (!this.goalsBuildForm.get('DevGoal').value) {
this.snack.error('Developmental Goal is required');
return
}

  this.perfApp.route = "app";
  this.perfApp.method = this.currentAction == 'create' ? "AddDevGoal" : "UpdateDevGoalById",


    this.perfApp.requestBody = {};

  
this.perfApp.requestBody.ManagerComments = this.goalsBuildForm.get('ManagerComments').value ;
this.perfApp.requestBody.IsDraftByManager = this.goalsBuildForm.get('IsDraftByManager').value ;
  this.perfApp.requestBody.devGoalId = this.goalDetails._id?  this.goalDetails._id : '';
  this.perfApp.requestBody.IsManaFTSubmited = this.goalsBuildForm.get('ManagerFTSubmitedOn').value ? false:true;
 
  this.perfApp.requestBody.UpdatedBy = this.loginUser._id;
  this.perfApp.requestBody.empId = this.currentEmpId;
  // this.perfApp.requestBody.ManagerId = this.loginUser.Manager._id; sg todo 
  this.perfApp.requestBody.Action = 'Review';
  // if (this.goalsBuildForm.get('IsDraft').value=='true') {
  //   this.perfApp.requestBody.Action = 'Draft';
  // }
  if (this.currentAction=='create') {
    this.perfApp.requestBody.CreatedBy = this.loginUser._id;
    this.perfApp.requestBody.Owner = this.loginUser._id;
  }

  this.callKpiApi();

}

callKpiApi() {

  this.perfApp.CallAPI().subscribe(c => {

    if (c.message == Constants.SuccessText) {

      this.snack.success(this.translate.instant(` Comments have been submitted successfully.`       ));

      this.router.navigate(['employee/review-evaluation-list']);
    }

  }, error => {
         this.snack.error(error.error.message);

      });

}


conformSubmitDevGoals(){

  
  this.submitClicked=true;
 


  if(this.goalsItemRows.length==0 && this.goalsActionItemsForm.invalid){
  this.rowItemSubmitted=true
  }

  else if(this.goalsItemRows.length >0){
    this.removeGoalActionValidators(this.goalsActionItemsForm);
  }
  if (!this.goalsBuildForm.valid) {
    this.resetGoalsActionItemsForm();
    return;
  }
  


this.openConfirmSubmitDialog();
 
}



  resetGoalsActionItemsForm() {
    let temp=this.goalsActionItemsForm.value
    this.goalsActionItemsForm.reset();
    this.goalsActionItemsForm.setValue(temp);

  }



   /**To alert user for submit */
   openConfirmSubmitDialog() {
    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to submit the comments?";
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
      this.submitGoal();
     } else {
      this.resetGoalsActionItemsForm()
     }
    })
  }



  getActionString(currentAction,subAction) {
    if (currentAction=='create' && subAction=='Draft') {
      return 'saved'
    } else  if (currentAction=='create') {
      return 'submitted'
    }else  if (currentAction=='edit') {
      return 'updated'
    }else  if (currentAction=='reviewGoals') {
      return 'updated'
    }
    
   
  }









getAllDevGoalsBasicData() {
  this.perfApp.route = "app";
  this.perfApp.method = "GetKpiSetupBasicData";
  this.perfApp.requestBody = { 'empId': this.currentEmpId ,
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
  this.perfApp.requestBody = { companyId: this.currentOrganization._id }
  // this.perfApp.requestBody={'parentId':this.loginUser.ParentUser?this.loginUser.ParentUser:this.loginUser._id}
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


public removeGoalActionValidators(form: FormGroup) {
  for (const key in form.controls) {
    // form.get(key).clearValidators();
    // form.get(key).updateValueAndValidity();
    form.get(key).setErrors(null);
  }
}




nextKpi(){

  this.selIndex=this.selIndex+1;
   this.goalDetails=  this.empDevGoalsData[this.selIndex];
   this.initDevGoalForm();
   this.currentDevGoalId=this.goalDetails._id;
 }

 priKpi(){

   this.selIndex=this.selIndex-1;
   this.goalDetails=  this.empDevGoalsData[this.selIndex];
   this.initDevGoalForm();
   this.currentDevGoalId=this.goalDetails._id;
 }

}

