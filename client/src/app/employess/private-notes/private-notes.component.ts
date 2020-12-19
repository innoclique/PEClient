
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import html2canvas from 'html2canvas';
import  {jsPDF}  from "jspdf"; 

// import * as jsPDF from 'jspdf';

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
  selector: 'app-private-notes',
  templateUrl: './private-notes.component.html',
  styleUrls: ['./private-notes.component.css']
})
export class PrivateNotesComponent implements OnInit {


  public kpiForm: FormGroup;
  kpiDetails: any = { ShowToManager:false, IsActive: 'true',MeasurementCriteria:[] }
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
  isEmpFRSignOff=false;
  isFirstTimeCreateing=false;

  
  currentOrganization: any;
  filteredOptionsDR: Observable<any[]>;
  public employeeDirReportData :any[]=[]


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
    await this.GetAllNotesDetails();
    

  }

  ngOnInit(): void {



    this.initKPIForm()
    this.GetImmediateApprCircleDetails();


    this.alert = new AlertDialog();
  }





  initKPIForm() {
    this.kpiForm = this.fb.group({

    

     
     
      Note: [this.kpiDetails.Note ? this.kpiDetails.Note :'',
      Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/(?=.*[#)&.(-:/?])/, { hasKPISplChars: true }, 'hasKPISplChars'),
      ])
      
    ],
      DiscussedWith: [this.kpiDetails.DiscussedWith?this.kpiDetails.DiscussedWith:null],
      IsDraft: [this.kpiDetails.IsDraft ? 'true' : 'false'],
     

    });

    

  

  }





  get f() {
    return this.kpiForm.controls;
  }


  onCancle() {
    this.router.navigate(['employee/private-notes-list']);
  }

  submitKpi() {
    
    if (!this.kpiForm.valid) {
      this.kpiForm.markAllAsTouched();
      return;
    }
    else {
    }

    if(this.kpiForm.get('IsDraft').value=='true'){
      this.isFirstTimeCreateing=true;
    }

    this.kpiForm.patchValue({ IsDraft: 'false' });

  
    this.saveKpi();
  }


  draftKpi(){
    this.kpiForm.patchValue({ IsDraft: 'true' });
    this.saveKpi();
  }


  saveKpi() {

if (!this.kpiForm.get('Note').value) {
  this.snack.error('Note is required');
  return
}




    this.perfApp.route = "app";
    this.perfApp.method = this.currentAction == 'create' ? "AddNote" : "UpdateNoteDataById",


      this.perfApp.requestBody = this.kpiForm.value; //fill body object with form 

     
      if(this.perfApp.requestBody.DiscussedWith)  this.perfApp.requestBody.DiscussedWith=this.perfApp.requestBody.DiscussedWith._id;
    this.perfApp.requestBody.Note = this.perfApp.requestBody.Note.Note?
                                    this.perfApp.requestBody.Note.Note :this.perfApp.requestBody.Note;
    // this.perfApp.requestBody.MeasurementCriteria = this.selectedItems.map(e => { e.measureId=e._id});
    this.perfApp.requestBody.NoteId = this.kpiDetails._id?  this.kpiDetails._id : '';
    this.perfApp.requestBody.UpdatedBy = this.loginUser._id;

    if (this.currentAction=='create'){
    this.perfApp.requestBody.CreatedBy = this.loginUser._id;
    this.perfApp.requestBody.Owner = this.loginUser._id;
    // this.perfApp.requestBody.ManagerId = this.loginUser.Manager._id;
    
    }else if (this.currentAction=='edit'){
      this.perfApp.requestBody.isFirstTimeCreateing = this.isFirstTimeCreateing;
      this.perfApp.requestBody.Action = 'Update';
    }

   

    if (this.kpiForm.get('IsDraft').value=='true' && this.currentAction=='create') {
      this.perfApp.requestBody.Action = 'Draft';
    }

    if (this.currentAction=='create' && this.kpiForm.get('IsDraft').value=='false') {
      this.openConfirmSubmitKpisDialog();
    }else{
    this.callKpiApi();
    }
  }

  callKpiApi() {

    this.perfApp.CallAPI().subscribe(c => {

      if (c.message == Constants.SuccessText) {

        if(!this.perfApp.requestBody.DiscussedWith) delete this.perfApp.requestBody.DiscussedWith;

        this.snack.success(this.translate.instant(` The note has been  ${ this.getActionString(this.currentAction,this.perfApp.requestBody.Action)}  successfully.`));
       this.selectedItems=[];
       // this.GetAllNotesDetails();
        if (this.accessingFrom=='currEvaluation') {
          
          this.router.navigate(['employee/current-evaluation']);
        } else {         
        this.router.navigate(['employee/private-notes-list']);
        }
      }

    }, error => {
      this.snack.error(this.translate.instant(`Note not  ${ this.getActionString(this.currentAction,this.perfApp.requestBody.Action)}, please try again.`));


    });

  }




  getActionString(currentAction,subAction) {
    if (currentAction=='create' && subAction=='Draft') {
      return 'saved'
    } else  if (currentAction=='create') {
      return 'added '
    }else  if (currentAction=='edit') { //to do eding draft
      return 'updated'
    }
    
   
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
          
          if(c.evaluation)
          this.isEmpFRSignOff=c.evaluation.Employees[0].FinalRating.Self.SignOff.length>0;
        }
      })
  }



  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }


  GetAllNotesDetails() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllNotes",
      this.perfApp.requestBody = { 'empId': this.loginUser._id,'orgId':this.authService.getOrganization()._id}
    this.perfApp.CallAPI().subscribe(c => {

     
      if (c && c.length > 0) {
       
        this.empKPIData = c;
      



      


          if (this.currentAction !='create') {
            this.currentKpiId=this.currentKpiId ? this.currentKpiId:this.empKPIData[0]._id;
            this.kpiDetails=  this.empKPIData.filter(e=> e._id== this.currentKpiId)[0];
            this.selIndex=  this.empKPIData.findIndex(e=> e._id== this.currentKpiId);


          this.initKPIForm();

          }

          

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


  
  private _filterDR(name: string): any[] {
    const filterValue = this._normalizeValue(name);
  
    return this.employeeDirReportData.filter(option => this._normalizeValue(option.FirstName).includes(filterValue) );
  } 

  displayFn(user: any): string {
    return user && user.FirstName ? user.FirstName : '';
  }


  GetImmediateApprCircleDetails(){
    this.perfApp.route="app";
    this.perfApp.method="GetImmediateApprCircle",
    this.perfApp.requestBody = { companyId: this.currentOrganization._id,
    empId: this.loginUser._id }
    // this.perfApp.requestBody={'parentId':this.loginUser.ParentUser?this.loginUser.ParentUser:this.loginUser._id}
    this.perfApp.CallAPI().subscribe(c=>{
      
      console.log('lients data',c);
      if(c && c.length>0){
        
        this.employeeDirReportData=c;
        this.filteredOptionsDR = this.kpiForm.controls['DiscussedWith'].valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value :  value? value.FirstName:""),
          map(name => name ? this._filterDR(name) : this.employeeDirReportData.slice())
        );
      }
     
       
    })

  }





  




  
   /**To alert user for submit kpis */
   openConfirmSubmitKpisDialog() {
    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to add the note?";
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
      this.callKpiApi();
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

  printPage() {
    window.print();
  }



}

