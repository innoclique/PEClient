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
      
      Strength: [this.goalDetails && this.currentAction!='create' ? this.goalDetails :'',  Validators.compose([
        CustomValidators.patternValidator(/(?=.*[#)&.(-:/?])/, { hasKPISplChars: true }, 'hasKPISplChars'),
      ])],
        Leverage: ['',[Validators.required]],
        SelfBenifit: ['',[Validators.required]],
        TeamBenifit: ['',[Validators.required]],
        ProgressComments: ['',[Validators.required]],
        ManagerComments: ['',[Validators.required]],
        IsDraft: [this.goalDetails.IsDraft ? 'true' : 'false'],
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

  this.strengthId = strength._id;
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
displayDevGoalFn(){}
navToGoalsList(){}
submitGoal() {

  // if (!this.strengthBuildForm.valid) {
  //   return;
  // }
   this.strengthBuildForm.patchValue({ IsDraft: 'false' });
   this.strengthBuildForm.patchValue({ IsStrengthSubmited: 'true' });
  this.saveStrength();
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







  resetGoalsActionItemsForm() {
    let temp=this.goalsActionItemsForm.value
    this.goalsActionItemsForm.reset();
    this.goalsActionItemsForm.setValue(temp);

  }




  getActionString(currentAction,subAction) {
    if (currentAction=='create' && subAction=='Draft') {
      return 'saved'
    } else  if (currentAction=='create') {
      return 'submitted'
    }else  if (currentAction=='edit') {
      return 'updated'
    }
    
   
  }


















}
