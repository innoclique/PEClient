
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
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

@Component({
  selector: 'app-strength-review',
  templateUrl: './strength-review.component.html',
  styleUrls: ['./strength-review.component.css']
})
export class StrengthReviewComponent implements OnInit {

  @Input()
  actor:any;
  @Input()
  accessingFrom:any;
  showDevGoalForm=true;
  currentDevGoalId: any;
  currentEmpId: any;
  currentEmpName: any;
  selIndex: any;

  public alert: AlertDialog;
  goalsItemRows = [];
  goalsActionItemsForm: FormGroup;
  strengthBuildForm: FormGroup;
  @Input()
  currentAction='create'

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
    
   
    
   
    
    this.activatedRoute.params.subscribe(params => {
      debugger
       if (params['action']) {
        this.currentDevGoalId = params['id'];
        this.currentEmpId = params['empId'];
        this.currentEmpName = params['empName'];
        this.currentAction = params['action'];
       }
       
      });   

   }

  ngOnInit(): void {

    this.getAllStrengthDetails();

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
        ManagerComments: [''],
        IsDraft: [this.goalDetails.IsDraft ? 'true' : 'false'],
        IsDraftByManager: [this.goalDetails.IsDraftByManager ? 'true' : 'false'],
        ManagerFTSubmitedOn: [this.goalDetails.ManagerFTSubmitedOn?this.goalDetails.ManagerFTSubmitedOn:"" ],
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
  this.perfApp.method = "GetAllStrengthsByManger",
    this.perfApp.requestBody = { 'empId': this.currentEmpId,
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
          
          if (!this.goalDetails.ViewedByManagerOn) {
            this.updateStrengthsAsViewed();
          }

        }
       

    }
    else{
        
      if (this.accessingFrom=='reviewEvaluation' || this.accessingFrom=='reviewActionPlan') {
        this.showDevGoalsForm=false;
      }
    }

  }
  
  , error => {
   

    this.snack.error(error.error.message);

  }
  
  )
}



updateStrengthsAsViewed() {
  debugger
this.perfApp.route = "app";
this.perfApp.method = this.currentAction ="UpdateStrengthById";


  this.perfApp.requestBody = {} //fill body object with form    
this.perfApp.requestBody.devGoalId = this.currentDevGoalId;
this.perfApp.requestBody.UpdatedBy = this.loginUser._id;
this.perfApp.requestBody.empId = this.currentEmpId;
this.perfApp.requestBody.ViewedByManagerOn = true;
  this.perfApp.requestBody.Action = 'Viewed';  
  this.perfApp.CallAPI().subscribe(c => {
    if (c.message == Constants.SuccessText) {
     console.log(c)
    } 
  }, error => {

  });

}


navToStrengthList() {
  if(this.accessingFrom=='reviewActionPlan'){
  
  this.router.navigate(['employee/review-action-plan-list']);
  }else{
    this.router.navigate(['employee/review-evaluation-list']);
  }
}


submitGoal() {

  // if (!this.strengthBuildForm.valid) {
  //   return;
  // }
   this.strengthBuildForm.patchValue({ IsDraftByManager: 'false' });
  this.saveStrength();
}


draftStrength(){
  console.log("inside:draftStrength");
  this.strengthBuildForm.patchValue({ IsDraftByManager: 'true' });
  this.saveStrength();
}


saveStrength() {
  console.log("inside:draftStrength")
if (!this.strengthBuildForm.get('Strength').value) {
this.snack.error('Strength is required');
return
}

  this.perfApp.route = "app";
  this.perfApp.method = 'UpdateStrengthById' ;
  this.perfApp.requestBody = {};
  if(this.strengthId){
    this.perfApp.requestBody.StrengthId=this.strengthId;
  }


  this.perfApp.requestBody.ManagerComments = this.strengthBuildForm.get('ManagerComments').value ;
  this.perfApp.requestBody.IsDraftByManager = this.strengthBuildForm.get('IsDraftByManager').value ;
  this.perfApp.requestBody.IsManaFTSubmited = this.strengthBuildForm.get('ManagerFTSubmitedOn').value ? false:true;
 

  
  this.perfApp.requestBody.UpdatedBy = this.loginUser._id;
  this.perfApp.requestBody.empId = this.currentEmpId;
  this.perfApp.requestBody.Action = 'Review';


  console.log(this.perfApp.requestBody)
  this.callStregnthApi();
  

}




callStregnthApi() {

  this.perfApp.CallAPI().subscribe(c => {

    if (c.message == Constants.SuccessText) {

      this.snack.success(this.translate.instant(` Strength has been ${ this.getActionString(this.currentAction,this.perfApp.requestBody.Action)} successfully`       ));

  this.navToStrengthList();
     

    }

  }, error => {
         this.snack.error(error.error.message);

      });

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
    if (currentAction=='create' && subAction=='Draft') {
      return 'saved'
    } else  if (currentAction=='create') {
      return 'created '
    }else  if (currentAction=='edit') {
      return 'updated'
    }
    
   
  }


















}

