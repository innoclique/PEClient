import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { GridOptions } from 'ag-grid-community';
import { ModalDirective, BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
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
  selector: 'app-setup-employee',
  templateUrl: './setup-employee.component.html',
  styleUrls: ['./setup-employee.component.css']
})
export class SetupEmployeeComponent implements OnInit {

 

  public empForm: FormGroup;
  departments=[];
  jobRoles=[];
  appRoles: any;
  jobLevels: any;
  loginUser: any;
  today = new Date();
  jd=new Date()

  filteredOptions: Observable<any[]>;
  filteredOptionsTS: Observable<any[]>;
  filteredOptionsDR: Observable<any[]>;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: 'gray modal-lg'
  };
  currentRowItem: any;
  // @ViewChild('addEmployee', { static: true }) addEmployeeView: TemplateRef<any>;
  @ViewChild("addEmployee", { static: true }) emoModal: ModalDirective;
  
  viewEmpFormRef: BsModalRef;
  countyFormReset: boolean;
  isRoleChanged=false;
  show=false;
  empDetails: any={}
  currentAction='create';
  cscData: any = undefined;
  isDraftEmployee: boolean;

  public alert: AlertDialog;
  public currentOrganization:any={};

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
   this.getAllDepartments();
   this.getEmployees();
   this.getManagersEmps();
    this.getThirdSignatoryEmps();

   this.initEmpForm()

    this.alert = new AlertDialog();
   
  }



  
  initEmpForm() {
    this.empForm = this.fb.group({
      Email: [this.empDetails.Email?this.empDetails.Email:'', [Validators.required, Validators.email]],
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
      EmployeeId: [this.empDetails.EmployeeId?this.empDetails.EmployeeId:'', Validators.compose([
        CustomValidators.patternValidator(/(?=.*[#()-])/, { hasEmpIdSplChars: true }, 'hasEmpIdSplChars')
      
      ])      ],
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
      //  CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      ExtNumber: [this.empDetails.ExtNumber?this.empDetails.ExtNumber:'', Validators.compose([
        Validators.minLength(2),
       // CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      AltPhoneNumber: [this.empDetails.AltPhoneNumber?this.empDetails.AltPhoneNumber:'', Validators.compose([
        Validators.minLength(10),
       // CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      MobileNumber: [this.empDetails.MobileNumber?this.empDetails.MobileNumber:'', Validators.compose([
        Validators.minLength(10),
       // CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      IsActive: [this.empDetails.IsActive+'',[Validators.required] ],
      IsSubmit: ['false'],
      IsDraft: [this.empDetails.IsDraft?this.empDetails.IsDraft:'false'],
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
      RoleEffFrom: [this.empDetails.RoleEffFrom?new Date (this.empDetails.RoleEffFrom):''],
      ZipCode: [this.empDetails.ZipCode?this.empDetails.ZipCode:'', Validators.compose([
       // Validators.required,
        CustomValidators.patternValidator(/[^A-Za-z0-9\s]+/g, { isInValidZip: true }, 'isInValidZip'),
        Validators.minLength(5)
      ])
      ],


    });
    this.jd=this.empDetails.JoiningDate?new Date (this.empDetails.JoiningDate):new Date();
  }

  dateChanged(event){
    this.jd=new Date(event.value);
    this.empDetails.RoleEffFrom= new Date(event.value)
  }
  
  public hasError = (controlName: string, errorName: string) =>{
    return this.empForm.controls[controlName].hasError(errorName);
  }

  public createEmployee = () => {
    if (!this.empForm.valid) {
    //  return;    
    }
    this.saveEmployee();
  }
  closeForm(){
  this.countyFormReset=false;
  this.isRoleChanged=false;
  this.emoModal.hide();
  }

  public gridOptions: GridOptions = {
    columnDefs: this.columnDefs()
  }

  public columnDefs (){ return [
    {headerName: 'Employee',  field: 'Name',suppressSizeToFit: true,   sortable: true, filter: true,tooltipField: 'Name',
    cellRenderer: (data) => {
      return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
    }},
    {headerName: 'Title', field: 'Title',suppressSizeToFit: true, sortable: true, tooltipField: 'Title', filter: true },
    // {headerName: 'Department', field: 'Department', sortable: true, filter: true },
    {headerName: 'Phone', field: 'PhoneNumber',  sortable: true, filter: true,hide: true },
    {headerName: 'Draft', field: 'IsDraft',   sortable: true, filter: true },
    {headerName: 'Active', field: 'IsActive',   sortable: true, filter: true },
    {
      headerName: 'Review/Modify', field: '', suppressSizeToFit: true, 
      cellRenderer: (data) => {

        var returnString = '';
        returnString += `<i class="cui-pencil" style="cursor:pointer; padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="EF" title="Edit"></i>`;
        return returnString;
      }
    }
];
  }



public onEmpGridRowClick(e) {
  if (e.event.target !== undefined) {
    this.currentRowItem = e.data.RowData;;
  
    let actionType = e.event.target.getAttribute("data-action-type");
    switch (actionType) {
    
      case "VF":
        this.viewEmpForm(this.currentRowItem);
        break;
        case "EF":
          this.editEmpForm(this.currentRowItem);
          break;
     
      default:
    }
  }
}

openEmpForm() {
  // this.empForm.reset();
  // this.countyFormReset=true;
  // this.isRoleChanged=false;
  // this.currentAction='create'
  // this.currentRowItem={IsSubmit:false}
  // this.empDetails={IsActive:'true'};
  // this.initEmpForm();
  //   this.emoModal.show();

    this.router.navigate(['ea/create-employee']);
}

  editEmpForm(data) {
//debugger
    this.empForm.reset();
    this.countyFormReset=true;
    this.currentAction='edit'
    this.cscData={Country:data.Country,State:data.State,City:data.City};
    this.empDetails=data;

    var depts= this.departments.filter(f=>f.DeptName==data.Department )[0];
    if(depts)
    this.jobRoles=depts.JobRoles;
    
    this.getManagersEmps();


    this.initEmpForm();
      this.emoModal.show();
  }


  onGridReady(params) {
   // debugger
    params.api.sizeColumnsToFit();
	     this.gridOptions.api = params.api; // To access the grids API
        this.gridOptions.rowHeight = 34;
  }

  
  onGridSizeChanged(params) {
    params.api.sizeColumnsToFit();
}

  viewEmpForm(data) {

    this.empForm.reset();
    this.countyFormReset=true;
    this.currentAction='view'
    this.cscData={Country:data.Country,State:data.State,City:data.City};
    this.empDetails=data;
    var depts= this.departments.filter(f=>f.DeptName==data.Department )[0];
    if(depts)
    this.jobRoles=depts.JobRoles;

    this.initEmpForm();
    // this.empForm.disable();
      this.emoModal.show();
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

}



getManagersEmps(){
  this.perfApp.route="app";
  this.perfApp.method="GetManagers",
  this.perfApp.requestBody = { companyId: this.currentOrganization._id }
  // this.perfApp.requestBody={'parentId':this.loginUser.ParentUser?this.loginUser.ParentUser:this.loginUser._id}
  this.perfApp.CallAPI().subscribe(c=>{
    
    console.log('lients data',c);
    if(c && c.length>0){
      if(this.currentRowItem){
      this.employeeDirReportData=c.filter(e=>e._id != this.currentRowItem._id);
      }else{
        this.employeeDirReportData=c;
      }
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


public employeeData :any
public employeeDropDownData :any[]=[]
public employeeThirdSigData :any[]=[]
public employeeDirReportData :any[]=[]
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
        ,IsDraft:row.IsDraft==true?"Yes":"No"
        ,RowData:row
      }
    }
    )
  })
}



saveCreateEmployee(){
  this.empForm.patchValue({ IsDraft: 'true' });
  this.isDraftEmployee = true;
if(this.isRoleChanged){
this.snack.error("Role Effective From is mandatory")
return
}

  this.saveEmployee();
}


submitCreateEmployee(){
  

  if (!this.empForm.valid) {
    this.empForm.markAllAsTouched();
      return;    
    }
    else{
      
      if (!this.empForm.get('PhoneNumber').value &&  !this.empForm.get('AltPhoneNumber').value
       && !this.empForm.get('MobileNumber').value) {
        this.snack.error(this.translate.instant('Please provide at least one contact (PhoneNumber, AltPhoneNumber, MobileNumber )'));
        return;    
      }
    }

  this.empForm.patchValue({IsSubmit: 'true' });
  this.empForm.patchValue({ IsDraft: 'false' });
  this.isDraftEmployee = false;



  this.alert.Title = "Alert";
  this.alert.Content = "Are you sure you want to update this employee?"
  this.alert.ShowCancelButton = true;
  this.alert.ShowConfirmButton = true;
  this.alert.CancelButtonText = "Cancel";
  this.alert.ConfirmButtonText = "Ok";

  const dialogConfig = new MatDialogConfig()
  dialogConfig.disableClose = true;
  dialogConfig.autoFocus = true;
  dialogConfig.data = this.alert;
  dialogConfig.height = "300px";
  dialogConfig.maxWidth = '100%';
  dialogConfig.minWidth = '40%';

  var dialogRef = this.dialog.open(AlertComponent, dialogConfig);
  dialogRef.afterClosed().subscribe(resp => {
    if (resp=='yes') {
      this.saveEmployee();
    }
    else{

    }
  })
//  this.saveEmployee();
}


saveEmployee(){
  this.perfApp.route="app";
  this.perfApp.method= this.currentAction=='create'?"CreateEmployee":"UpdateEmployee",
  
  this.empForm.patchValue({ThirdSignatory: this.empForm.get('ThirdSignatory').value?
    this.empForm.get('ThirdSignatory').value._id : ''});
    this.empForm.patchValue({CopiesTo: this.empForm.get('CopiesTo').value?
    this.empForm.get('CopiesTo').value._id : ''});
    this.empForm.patchValue({Manager: this.empForm.get('Manager').value?
    this.empForm.get('Manager').value._id : ''});

 
  
  this.perfApp.requestBody=this.empForm.value; //fill body object with form 
  
  if (this.currentAction=='edit') {
    this.perfApp.requestBody._id=this.currentRowItem._id; 
    this.perfApp.requestBody.UpdatedBy=this.loginUser._id;
    if( this.perfApp.requestBody.RoleEffFrom =="" && this.perfApp.requestBody.JoiningDate !="")
    this.perfApp.requestBody.RoleEffFrom= this.perfApp.requestBody.JoiningDate;
  }else{
    this.perfApp.requestBody.CreatedBy=this.loginUser._id;
    this.perfApp.requestBody.UpdatedBy=this.loginUser._id;
    this.perfApp.requestBody.ParentUser=this.loginUser.ParentUser?this.loginUser.ParentUser:this.loginUser._id;
    this.perfApp.requestBody.IgnoreEvalAdminCreated=false;
    this.perfApp.requestBody.RoleEffFrom= this.perfApp.requestBody.JoiningDate;
  }

  //let roleCode= this.appRoles.filter(e=>e._id==this.perfApp.requestBody.ApplicationRole[0])[0];
  let selectedRoles= [];
  if( this.perfApp.requestBody.ApplicationRole){
  this.perfApp.requestBody.ApplicationRole.forEach(element => {
        this.appRoles.filter(e=>
      {if (e._id==element)  selectedRoles.push( e.RoleCode)} )
        
  });
}
  //this.perfApp.requestBody.Role=roleCode.RoleCode;
  this.perfApp.requestBody.SelectedRoles=selectedRoles;
  
  this.callEmpApi();
 
}

callEmpApi(){

  let manager = this.perfApp.requestBody.Manager;
if(!this.perfApp.requestBody.ThirdSignatory) delete this.perfApp.requestBody.ThirdSignatory;
if(!this.perfApp.requestBody.CopiesTo) delete this.perfApp.requestBody.CopiesTo;
if(!this.perfApp.requestBody.Manager) delete this.perfApp.requestBody.Manager;
  let empFirstName = this.empForm.value.FirstName;
  let empLastName = this.empForm.value.LastName;
  this.perfApp.CallAPI().subscribe(c=>{

    if (c.message==Constants.SuccessText) {

      if (this.isDraftEmployee) {
        this.snack.success(this.translate.instant(`The employee has been successfully saved.`));
      } else {
        if (this.loginUser._id == this.currentRowItem._id) {
          //update firstName and lastname in localstorage after submit
          // var userFromLocalStorage = JSON.parse(localStorage.getItem("User"));
          // userFromLocalStorage.FirstName = empFirstName;
          // userFromLocalStorage.LastName = empLastName;
          // if(userFromLocalStorage.Manager !== manager) userFromLocalStorage.Manager= manager;
          // this.authService.setLSObject('User', userFromLocalStorage);

          this.GetEmployeeDetailsByIdOnEmpUpdate();

        }
        this.snack.success(this.translate.instant(`The employee has been successfully ${this.currentAction == 'create' ? 'added' : 'updated'}.`));
      }
      this.getEmployees();
      this.closeForm();
      // this.showSpinner = false;
    }
    
      }, error => {
        if (error.error.message === Constants.EvaluationAdminNotFound) {
          this.openEvaluationAdminNotFoundDialog()
        }else{
          this.snack.error(this.translate.instant(error.error.message));
    
        } 
    
    
      });  

}



async GetEmployeeDetailsByIdOnEmpUpdate() {
  this.perfApp.route = "app";
  this.perfApp.method = "GetEmployeeDataByIdOnEmpUpdate",
    this.perfApp.requestBody = { id:  this.loginUser._id }
    this.perfApp.CallAPI().subscribe(x => {

      this.authService.setLSObject('User', x);

    }, error => {
      console.log('error', error)
    this.snack.error('something went wrong')
    })
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


onJobRole(event){
  //debugger

  if (this.currentAction=='create') return;
  let val = event.target.value;
  if (this.currentRowItem.JobRole !="" && this.currentRowItem.JobRole !=val) {
    this.isRoleChanged=true;
    this.empForm.controls['RoleEffFrom'].setValidators([Validators.required])
  }else{
    
    this.empForm.controls['RoleEffFrom'].clearValidators()
    this.isRoleChanged=false;
  }
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
      this.appRoles=c.AppRoles;
      this.jobLevels=c.JobLevels;
      console.log('lients data snnn',this.jobRoles);
    }
  })
}


keyPressAlphaAndPeriod(event) {
 //  debugger
  var charCode = (event.which) ? event.which : event.keyCode;
  if (charCode >= 97 && charCode <= 122){
    return true;

  } else if(charCode>=65 && charCode<=90){
    return true;

  }  else if(charCode == 46){
return true;
  }
  else 
  
  {
    event.preventDefault();
    return false;
  }
  return true;
}


printPage() {
  window.print();
}


}
