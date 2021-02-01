import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
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
  selector: 'app-strengths',
  templateUrl: './strengths.component.html',
  styleUrls: ['./strengths.component.css']
})
export class StrengthsComponent implements OnInit {

  

  public alert: AlertDialog;
  goalsItemRows = [];
  goalsActionItemsForm: FormGroup;
  strengthBuildForm: FormGroup;
  @Input()
  currentAction='create'
  @Input()
accessingFrom:any;
  goalDetails: any = { MakePrivate:false}

  filteredOptionsOP: Observable<any[]>;
  public employeeOtherPatData :any[]=[]

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
  currentDevGoalId: any;
  selIndex: number;
  currentRowItem: any;
  currentOrganization: any={};
  showDevGoalsForm=true;
  strengthId:any;
  
 
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
    
    this.getAllStrengthDetails();
    
    this.activatedRoute.params.subscribe(params => {
      if (params['action']) {
       this.currentDevGoalId = params['id'];
       this.currentAction = params['action'];
      }
      
     });   
   }

  ngOnInit(): void {

this.initStrengthGoalForm();
this.alert = new AlertDialog();
  }


  initStrengthGoalForm(){

    this.strengthBuildForm = this.formBuilder.group({
      
      Strength: [this.goalDetails && this.currentAction!='create' ? this.goalDetails :'', 
       Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/(?=.*[#)&.(-:/?])/, { hasKPISplChars: true }, 'hasKPISplChars'),
      ])],
        Leverage: ['',
        Validators.compose([
          Validators.required,
          CustomValidators.patternValidator(/(?=.*[#)&.(-:/?])/, { hasKPISplChars: true }, 'hasKPISplChars'),
        ]) ],
        SelfBenifit: ['',
        Validators.compose([
          Validators.required,
          CustomValidators.patternValidator(/(?=.*[#)&.(-:/?])/, { hasKPISplChars: true }, 'hasKPISplChars'),
        ]) ],
        TeamBenifit: ['',
        Validators.compose([
          Validators.required,
          CustomValidators.patternValidator(/(?=.*[#)&.(-:/?])/, { hasKPISplChars: true }, 'hasKPISplChars'),
        ]) ],
        ProgressComments: ['',
        Validators.compose([
          CustomValidators.patternValidator(/(?=.*[#)&.(-:/?])/, { hasKPISplChars: true }, 'hasKPISplChars'),
        ])],
        ManagerComments: [''],
        IsDraft: ['false'],
        IsStrengthSubmited: ['false'],
    })
    
  }




  get f(){
    return this.strengthBuildForm.controls;
  }

  private _normalizeValue(value: string): string {
  return value.toLowerCase().replace(/\s/g, '');
}


onStrengthAutoSelected(event) {

  var strength = event.option.value;
  console.log("strength: "+JSON.stringify(strength));

 // this.strengthId = strength._id;
   this.strengthBuildForm.patchValue({
     Strength: strength.Strength,
     Leverage: strength.Leverage,
     SelfBenifit: strength.SelfBenifit,
     TeamBenifit: strength.TeamBenifit,
     ProgressComments: strength.ProgressComments,
     ManagerComments: strength.ManagerComments,
     IsDraft: strength.IsDraft,
     
   });


}


private _filterDevGoals(name: string): any[] {
  console.log(`name: ${name}`);
  const filterValue = this._normalizeValue(name);
  return this.empDevGoalsData.filter(option => this._normalizeValue(option.Strength).includes(filterValue));
}


getAllStrengthDetails() {
  this.perfApp.route = "app";
  this.perfApp.method = "GetAllStrengths",
    this.perfApp.requestBody = { 'empId': this.loginUser._id,
    'fetchAll':true,'orgId':this.authService.getOrganization()._id}
  this.perfApp.CallAPI().subscribe(c => {
    if (c && c.length > 0) {
      this.empDevGoalsData = c;

      if (this.accessingFrom=='currEvaluation' && this.empDevGoalsData.filter(e=>e.IsStrengthSubmited).length==0) {
        this.showDevGoalsForm  =false;
        return
      }



      this.filteredOptionsDevGoals = this.strengthBuildForm.controls['Strength'].valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : value ? value.Strength : ""),
          map(name => name ? this._filterDevGoals(name) : this.empDevGoalsData.slice())
        );


        if (this.currentAction !='create') {
          this.currentDevGoalId=this.currentDevGoalId ? this.currentDevGoalId:this.empDevGoalsData[0]._id;
          this.goalDetails=  this.empDevGoalsData.filter(e=> e._id== this.currentDevGoalId)[0];
          this.selIndex=  this.empDevGoalsData.findIndex(e=> e._id== this.currentDevGoalId);
          this.initStrengthGoalForm();
          console.log("View=====");
          console.log(this.goalDetails);
          this.strengthId = this.goalDetails._id;
          this.strengthBuildForm.patchValue({
            Strength: this.goalDetails.Strength,
            Leverage: this.goalDetails.Leverage,
            SelfBenifit: this.goalDetails.SelfBenifit,
            TeamBenifit: this.goalDetails.TeamBenifit,
            ProgressComments: this.goalDetails.ProgressComments,
            ManagerComments: this.goalDetails.ManagerComments,
            IsDraft: this.goalDetails.IsDraft
          });
          
          // if (!this.kpiDetails.ViewedByEmpOn && this.kpiDetails.ManagerSignOff) {
          //   this.updateKpiAsViewed();
          // }

        }
       

    }
    else{
        
      if (this.accessingFrom=='currEvaluation') {
        this.showDevGoalsForm=false;
      }
    }

  }
  
  , error => {
   

    this.snack.error(error.error.message);

  }
  
  )
}


navToStrengthList() {
  this.router.navigate(['employee/action-plan',{'activeTab':1}]);
}


submitGoal() {

  if (!this.strengthBuildForm.valid) {
    this.strengthBuildForm.markAllAsTouched();
    return;
  }
   this.strengthBuildForm.patchValue({ IsDraft: 'false' });
  //  this.strengthBuildForm.patchValue({ IsStrengthSubmited : 'true' });

  //  if (this.currentAction=='create') {
  //   this.openConfirmSubmitDialog();
  
  //   }else  {
    this.saveStrength();
  // }


  
}


draftStrength(){
  console.log("inside:draftStrength");
  this.strengthBuildForm.patchValue({ IsDraft: 'true' });
  this.saveStrength();
}


saveStrength() {
  console.log("inside:draftStrength")
if (!this.strengthBuildForm.get('Strength').value) {
this.snack.error('Strength is required');
return
}

  this.perfApp.route = "app";
  this.perfApp.method = this.currentAction == 'create' ? "AddStrength" : "AddStrength";
 this.perfApp.requestBody = this.strengthBuildForm.value; //fill body object with form 
  if(this.strengthId){
    this.perfApp.requestBody.StrengthId=this.strengthId;
  }
  //this.perfApp.requestBody.Kpi = this.perfApp.requestBody.Kpi?  this.perfApp.requestBody.Kpi._id :null;
  //this.perfApp.requestBody.GoalActionItems = this.goalsItemRows.length>0? this.goalsItemRows :null;
  //this.perfApp.requestBody.UpdatedBy = this.loginUser._id;
  this.perfApp.requestBody.Employee = this.loginUser._id;
   this.perfApp.requestBody.ManagerId = this.loginUser.Manager._id; 
   this.perfApp.requestBody.Owner = this.loginUser._id;

   if (this.strengthBuildForm.get('IsDraft').value=='true' && this.currentAction=='create') {
    this.perfApp.requestBody.Action = 'Draft';
  }
  console.log(this.perfApp.requestBody)
  this.callStregnthApi();
  

}




callStregnthApi() {

  this.perfApp.CallAPI().subscribe(c => {

    if (c.message == Constants.SuccessText) {

      this.snack.success(this.translate.instant(` Strength has been ${ this.getActionString(this.currentAction,this.perfApp.requestBody.Action)} successfully`       ));

      this.router.navigate(['employee/action-plan',{'activeTab':1}]);
    }

  }, error => {
         this.snack.error(error.error.message);

      });

}





   /**To alert user for submit */
   openConfirmSubmitDialog() {
    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to submit the action plan?";
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
      this.saveStrength();
     } else {
     // this.resetGoalsActionItemsForm()
     }
    })
  }



  nextKpi(){

    this.selIndex=this.selIndex+1;
     this.goalDetails=  this.empDevGoalsData[this.selIndex];
    // this.initStrengthGoalForm();
    let event={option:{value:{}}};
     event.option.value=this.goalDetails;
  
     this.onStrengthAutoSelected(event);
     this.currentDevGoalId=this.goalDetails._id;
   }
  
   priKpi(){
  
     this.selIndex=this.selIndex-1;
     this.goalDetails=  this.empDevGoalsData[this.selIndex];
    // this.initStrengthGoalForm();
     let event={option:{value:{}}};
     event.option.value=this.goalDetails;
  
     this.onStrengthAutoSelected(event);
     this.currentDevGoalId=this.goalDetails._id;
   }

  resetGoalsActionItemsForm() {
    let temp=this.goalsActionItemsForm.value
    this.goalsActionItemsForm.reset();
    this.goalsActionItemsForm.setValue(temp);

  }




  getActionString(currentAction,subAction) {
    debugger
    if (currentAction=='create' && subAction=='Draft') {
      return 'saved'
    } else  if (currentAction=='create') {
      return 'created '
    }else  if (currentAction=='edit') {
      return 'updated'
    }
    
   
  }




  printPage() {
    window.print();
  }














}
