
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ThemeService } from '../../../services/theme.service';
import { NotificationService } from '../../../services/notification.service';
import { PerfAppService } from '../../../services/perf-app.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomValidators } from '../../../shared/custom-validators';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AlertDialog } from '../../../Models/AlertDialog';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { Constants } from '../../../shared/AppConstants';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.css']
})
export class CreateEmployeeComponent implements OnInit {

  


  public empForm: FormGroup;
  empDetails: any={IsActive:'true'}
  currentAction='create';
  cscData:any=undefined;
  departments=[];
  jobRoles=[];
  appRoles: any=[];
  jobLevels: any;
  loginUser: any;
  countyFormReset: boolean;
  isRoleChanged: boolean;
  public alert: AlertDialog;
  
  filteredOptions: Observable<any[]>;
  filteredOptionsTS: Observable<any[]>;
  filteredOptionsDR: Observable<any[]>;
public currentOrganization:any={}
  submitClicked=false;

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    public themeService: ThemeService,
    private modalService: BsModalService,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService) {
      
     }



 

    get f(){
      return this.empForm.controls;
    }

  ngOnInit(): void {
    this.currentOrganization = this.authService.getOrganization();
    this.loginUser=this.authService.getCurrentUser();
    this.getEmployees();
    this.getManagersEmps();
    this.getThirdSignatoryEmps();
   this.getAllDepartments();

   this.initEmpForm()

   this.alert = new AlertDialog();
  
  }



  
  initEmpForm() {
    this.empForm = this.fb.group({
      Email: [this.empDetails.Email?this.empDetails.Email:'', [Validators.required, 
        Validators.email]],
      LastName: [this.empDetails.LastName?this.empDetails.LastName:'', Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
        Validators.minLength(1)])
      ],
      MiddleName: [this.empDetails.MiddleName?this.empDetails.MiddleName:'', Validators.compose([
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
      ])
      ],
      FirstName: [this.empDetails.FirstName?this.empDetails.FirstName:'', Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),

        Validators.minLength(2)])
      ],

      Title: [this.empDetails.Title?this.empDetails.Title:'', Validators.compose([
        Validators.required,
        Validators.minLength(2)])
      ],


      Address: [this.empDetails.Address?this.empDetails.Address:'', Validators.compose([
        Validators.required, Validators.minLength(4),
        CustomValidators.patternValidator(/(?=.*[#)&.(-:/])/, { hasAddressSplChars: true }, 'hasAddressSplChars'),
      ])
      ],

      PhoneNumber: [this.empDetails.PhoneNumber?this.empDetails.PhoneNumber:'', Validators.compose([
         Validators.minLength(10),
        CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      ExtNumber: [null, Validators.compose([
        Validators.maxLength(5),
       Validators.pattern("^((\d{1}-\d{5}-?)|0)?[0-9]{5}$")

     ])],
      AltPhoneNumber: [this.empDetails.AltPhoneNumber?this.empDetails.AltPhoneNumber:'', Validators.compose([
        Validators.minLength(10),
        CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      MobileNumber: [this.empDetails.MobileNumber?this.empDetails.MobileNumber:'', Validators.compose([
        Validators.minLength(10),
        CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      IsActive: [this.empDetails.IsActive+'',[Validators.required] ],
      IsSubmit: ['false'],
      IsDraft: ['false'],
      JobLevel: [this.empDetails.JobLevel?this.empDetails.JobLevel:null,[Validators.required] ],
      JobRole: [this.empDetails.JobRole?this.empDetails.JobRole:'',[Validators.required] ],
      Department: [this.empDetails.Department?this.empDetails.Department:'',[Validators.required] ],
      ApplicationRole: [this.empDetails.ApplicationRole?this.empDetails.ApplicationRole:null,[Validators.required] ],
      ThirdSignatory: [this.empDetails.ThirdSignatory?this.empDetails.ThirdSignatory:'',],
      CopiesTo: [this.empDetails.CopiesTo?this.empDetails.CopiesTo:'', ],
      Manager: [this.empDetails.Manager?this.empDetails.Manager:'',[Validators.required]],
      Country: [this.empDetails.Country?this.empDetails.Country:'',],
      State: [this.empDetails.State?this.empDetails.State:'',],
      City: [this.empDetails.City?this.empDetails.City:'',],
      JoiningDate: [this.empDetails.JoiningDate?new Date (this.empDetails.JoiningDate):'',[Validators.required]],
      RoleEffFrom: [''],
      ZipCode: [this.empDetails.ZipCode?this.empDetails.ZipCode:'', Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/[^A-Za-z0-9\s]+/g, { isInValidZip: true }, 'isInValidZip'),
        Validators.minLength(5)
      ])
      ],


    });
  }
  // Only Numbers with Decimals
  keyPressNumbersDecimal(event) {
    var charCode = (event.which) ? event.which : event.keyCode;
    if (charCode != 46 && charCode > 31
      && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  // for email
    // Only Numbers with Decimals
    keyPressEmail(event) {
      var charCode = (event.which) ? event.which : event.keyCode;
      console.log("------------->", charCode)
      if (charCode >= 97 && charCode <= 122){
        return true;
   
      } else if(charCode>=65 && charCode<=90){
        return true;

      }    if(charCode >= 48 && charCode <= 57) {
        return true
        
      }else if(charCode == 46 || charCode == 64){
return true;
      }
      else 
      
      {
        event.preventDefault();
        return false;
      }
      return true;
    }

  saveCreateEmployee(){
    if(this.empForm.get('FirstName').value=="" || this.empForm.get('Email').value==""){
    if(this.empForm.get('FirstName').value=="" && this.empForm.get('Email').value==""){

      this.snack.error(this.translate.instant('First Name, Email is required'));
      return
    }
    if(this.empForm.get('FirstName').value==""){
      this.snack.error(this.translate.instant('First Name is required'));
      return
    }
    if(this.empForm.get('Email').value==""){
      this.snack.error(this.translate.instant('Email is required'));
      return
    }
    
  }

    this.empForm.patchValue({IsDraft: 'true' });
    this.saveEmployee();
  }

  onCancle(){
    this.router.navigate(['ea/setup-employee']);
  }

  submitCreateEmployee(){
this.submitClicked=true;
    if (!this.empForm.valid) {
        return;    
      }else{
        if (!this.empForm.get('PhoneNumber').value &&  !this.empForm.get('AltPhoneNumber').value
         && !this.empForm.get('MobileNumber').value) {
          this.snack.error(this.translate.instant('Please provide at least one contact (PhoneNumber, AltPhoneNumber, MobileNumber )'));
          return;    
        }
      }
  
    this.empForm.patchValue({IsSubmit: 'true' });
    this.empForm.patchValue({IsDraft: 'false' });
    this.saveEmployee();
  }
  
  
  saveEmployee(){
    this.perfApp.route="app";
    this.perfApp.method= this.currentAction=='create'?"CreateEmployee":"UpdateEmployee",
    
    // this.empForm.patchValue({ThirdSignatory: this.empForm.get('ThirdSignatory').value?
    //   this.empForm.get('ThirdSignatory').value._id : ''});
    //   this.empForm.patchValue({CopiesTo: this.empForm.get('CopiesTo').value?
    //   this.empForm.get('CopiesTo').value._id : ''});
    //   this.empForm.patchValue({Manager: this.empForm.get('Manager').value?
    //   this.empForm.get('Manager').value._id : ''});
  
   
    
    this.perfApp.requestBody=this.empForm.value; //fill body object with form 
    
    // if (this.currentAction=='edit') {
    //   this.perfApp.requestBody._id=this.currentRowItem._id; 
    //   this.perfApp.requestBody.UpdatedBy=this.loginUser._id;
    // }else{


      if(this.perfApp.requestBody.ThirdSignatory)  this.perfApp.requestBody.ThirdSignatory = this.perfApp.requestBody.ThirdSignatory._id;
      if(this.perfApp.requestBody.CopiesTo)  this.perfApp.requestBody.CopiesTo=this.perfApp.requestBody.CopiesTo._id;
      if(this.perfApp.requestBody.Manager)  this.perfApp.requestBody.Manager=this.perfApp.requestBody.Manager._id;

      this.perfApp.requestBody.CreatedBy=this.loginUser._id;
      this.perfApp.requestBody.Organization=this.loginUser.Organization?this.loginUser.Organization._id:null ;
      this.perfApp.requestBody.UpdatedBy=this.loginUser._id;
      this.perfApp.requestBody.ParentUser=this.loginUser.ParentUser?this.loginUser.ParentUser:this.loginUser._id;
      this.perfApp.requestBody.IgnoreEvalAdminCreated=false;
     // let roleCode= this.appRoles.filter(e=>e._id==this.perfApp.requestBody.ApplicationRole[0])[0];
      let selectedRoles= [];
     if( this.perfApp.requestBody.ApplicationRole){
      this.perfApp.requestBody.ApplicationRole.forEach(element => {
            this.appRoles.filter(e=>
          {if (e._id==element)  selectedRoles.push( e.RoleCode)} )
            
      });
    }
      this.perfApp.requestBody.Role='EO';
      this.perfApp.requestBody.SelectedRoles=selectedRoles;
      this.perfApp.requestBody.RoleEffFrom= this.perfApp.requestBody.JoiningDate;
    // }
    
    this.callEmpApi();
   
  }
  
  callEmpApi(){
  
  if(!this.perfApp.requestBody.ThirdSignatory) delete this.perfApp.requestBody.ThirdSignatory;
  if(!this.perfApp.requestBody.CopiesTo) delete this.perfApp.requestBody.CopiesTo;
  if(!this.perfApp.requestBody.Manager) delete this.perfApp.requestBody.Manager;
  
    this.perfApp.CallAPI().subscribe(c=>{
  
      if (c.message==Constants.SuccessText) {
        this.submitClicked=false;
        
        this.snack.success(this.translate.instant(`Employee ${this.currentAction=='create'?'Added':'Updated'}  Successfully`));
        // this.getEmployees();
        // this.closeForm();
        // this.showSpinner = false;

        this.router.navigate(['ea/setup-employee']);
      }
      
        }, error => {
          if (error.error.message === Constants.EvaluationAdminNotFound) {
            this.openEvaluationAdminNotFoundDialog()
          }else{
            this.snack.error(this.translate.instant(error.error.message));
      
          } 
      
      
        });  
  
  }
  
  
   /**To alert user for duplicate sessions */
   openEvaluationAdminNotFoundDialog() {
    this.alert.Title = "Alert";
    this.alert.Content = "We found that Evaluation Administrator not created. Do you want to continue ?";
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
      this.callEmpApi();
     } else {
       
     }
    })
  }






  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }
  
  
  displayFn(user: any): string {
    return user && user.FirstName ? user.FirstName : '';
  }
  
  private _filter(name: string): any[] {
    const filterValue = this._normalizeValue(name);
  
    return this.employeeDropDownData.filter(option => this._normalizeValue(option.FirstName).includes(filterValue) );
  }
  
  private _filterDR(name: string): any[] {
    const filterValue = this._normalizeValue(name);
  
    return this.employeeDirReportData.filter(option => this._normalizeValue(option.FirstName).includes(filterValue) );
  } 
  private _filterTD(name: string): any[] {
    const filterValue = this._normalizeValue(name);
  
    return this.employeeThirdSigData.filter(option => this._normalizeValue(option.FirstName).includes(filterValue) );
  }
  
  
  
  onCSCSelect(data){
  this.empForm.patchValue({City:data.City.name});
  this.empForm.patchValue({Country:data.Country.name});
  this.empForm.patchValue({State:data.State.name});
  var add=""
   add= `${data.City.name?data.City.name+",":""}
   ${data.State.name?data.State.name+",":""}
    ${data.Country.name?data.Country.name:""}
   `
  //  if(data.City.name)
  
  }

  public employeeData :any
  public employeeDropDownData :any[]=[]
  public employeeThirdSigData :any[]=[]
  public employeeDirReportData :any[]=[]
  getManagersEmps(){
    this.perfApp.route="app";
    this.perfApp.method="GetManagers",
    this.perfApp.requestBody = { companyId: this.currentOrganization._id }
    // this.perfApp.requestBody={'parentId':this.loginUser.ParentUser?this.loginUser.ParentUser:this.loginUser._id}
    this.perfApp.CallAPI().subscribe(c=>{
      
      console.log('lients data',c);
      if(c && c.length>0){
        
        this.employeeDirReportData=c;
        this.filteredOptionsDR = this.empForm.controls['Manager'].valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value :  value? value.FirstName:""),
          map(name => name ? this._filterDR(name) : this.employeeDirReportData.slice())
        );
      }
     
       
    })

  }



  getThirdSignatoryEmps(){
    this.perfApp.route="app";
    this.perfApp.method="GetThirdSignatorys",
    this.perfApp.requestBody = { companyId: this.currentOrganization._id }

    this.perfApp.CallAPI().subscribe(c=>{
      
      console.log('lients data',c);
      if(c && c.length>0){


        this.employeeThirdSigData=c;
       
      
        this.filteredOptionsTS = this.empForm.controls['ThirdSignatory'].valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : value? value.FirstName:""),
          map(name => name ? this._filterTD(name) : this.employeeThirdSigData.slice())
        );

      }
     
       
    })

  }



  getEmployees(){
    this.perfApp.route="app";
    this.perfApp.method="GetAllEmployees",
   // this.perfApp.requestBody={'parentId':this.loginUser.ParentUser?this.loginUser.ParentUser:this.loginUser._id}
   this.perfApp.requestBody = { companyId: this.currentOrganization._id }
    this.perfApp.CallAPI().subscribe(c=>{
      
      console.log('lients data',c);
      if(c && c.length>0){
        
      }
       // if(!row.isDraft)
       this.employeeDropDownData=c;
      
  
      
  
       this.filteredOptions = this.empForm.controls['CopiesTo'].valueChanges
       .pipe(
         startWith(''),
         map(value => typeof value === 'string' ? value :  value? value.FirstName:""),
         map(name => name ? this._filter(name) : this.employeeDropDownData.slice())
       );
      
      this.employeeData=c.map(function (row) {
        
       
       return  {Name:row.FirstName+' '+row.LastName
          ,Title:row.Title
          ,PhoneNumber:row.PhoneNumber
          ,IsActive:row.IsActive==true?"Yes":"No"
          ,IsDraft:row.IsSubmit==false?"Yes":"No"
          ,RowData:row
        }
      }
      )
    })
  }

  
  onDepartmentChange(event){

    var depts= this.departments.filter(f=>f.DeptName== event.target.value)[0];
 this.jobRoles=depts.JobRoles;
}
  
getAllDepartments(){
  this.perfApp.route="app";
  this.perfApp.method="GetEmpSetupBasicData",
  this.perfApp.requestBody={industry:this.authService.getOrganization().Industry}
  this.perfApp.CallAPI().subscribe(c=>{
    
    console.log('lients data',c);
    if(c){
      this.departments=c.Industries[0].Department;
    //  this.jobRoles=c.JobRoles;
      this.appRoles=c.AppRoles;
      this.jobLevels=c.JobLevels;
      console.log('lients data snnn',this.jobRoles);

      this.appRoles.filter(e=>{ 
        debugger
        if (e.RoleName=="Employee") {
          this.empForm.patchValue({ApplicationRole: [e._id] });
        }   
        
      } )
    }
  })
}


}
