import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ThemeService } from '../../services/theme.service';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomValidators } from '../../shared/custom-validators';
import { Observable } from 'rxjs';
import {startWith, map} from 'rxjs/operators';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Constants } from '../../shared/AppConstants';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {

  public empForm: FormGroup;
  departments=[];
  jobRoles=[];
  appRoles: any;
  jobLevels: any;

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
  empDetails: any={}
  currentAction='create';
  cscData:any=undefined;
  

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    public themeService: ThemeService,
    private modalService: BsModalService,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService) { }



    get f(){
      return this.empForm.controls;
    }


  ngOnInit(): void {

   this.getAllDepartments();
   this.getEmployees();

   this.initEmpForm()

  
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
        Validators.required, Validators.minLength(6),
        CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      ExtNumber: [this.empDetails.ExtNumber?this.empDetails.ExtNumber:'', Validators.compose([
        Validators.minLength(2),
        CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      AltPhoneNumber: [this.empDetails.AltPhoneNumber?this.empDetails.AltPhoneNumber:'', Validators.compose([
        Validators.minLength(6),
        CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      MobileNumber: [this.empDetails.MobileNumber?this.empDetails.MobileNumber:'', Validators.compose([
        Validators.minLength(10),
        CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      IsActive: [this.empDetails.IsActive+'',[Validators.required] ],
      IsSubmit: ['false'],
      JobLevel: [this.empDetails.JobLevel?this.empDetails.JobLevel:'',[Validators.required] ],
      JobRole: [this.empDetails.JobRole?this.empDetails.JobRole:'',[Validators.required] ],
      Department: [this.empDetails.Department?this.empDetails.Department:'',[Validators.required] ],
      ApplicationRole: [this.empDetails.ApplicationRole?this.empDetails.ApplicationRole:'',[Validators.required] ],
      ThirdSignatory: [this.empDetails.ThirdSignatory?this.empDetails.ThirdSignatory:'',],
      CopiesTo: [this.empDetails.CopiesTo?this.empDetails.CopiesTo:'', ],
      DirectReports: [this.empDetails.DirectReports?this.empDetails.DirectReports:'',],
      Country: [this.empDetails.Country?this.empDetails.Country:'',],
      State: [this.empDetails.State?this.empDetails.State:'',],
      City: [this.empDetails.City?this.empDetails.City:'',],
      JoiningDate: [this.empDetails.JoiningDate?new Date (this.empDetails.JoiningDate):'',[Validators.required]],
      ZipCode: [this.empDetails.ZipCode?this.empDetails.ZipCode:'', Validators.compose([
        Validators.required,
        // CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        // CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),

        Validators.minLength(5)
      ])
      ],


    });
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
  this.emoModal.hide();
  }

  public columnDefs = [
    {headerName: 'Employee', field: 'Name', width: 320, sortable: true, filter: true,
    cellRenderer: (data) => {
      return `<a href="/" onclick="return false;"   data-action-type="VF">${data.value}</a>`
    }},
    {headerName: 'Title', field: 'Title', sortable: true, filter: true },
    // {headerName: 'Department', field: 'Department', sortable: true, filter: true },
    {headerName: 'Phone', field: 'PhoneNumber', sortable: true, filter: true },
    {headerName: 'IsDraft', field: 'IsDraft',  width: 120, sortable: true, filter: true },
    {headerName: 'IsActive', field: 'IsActive',  width: 120, sortable: true, filter: true },
    {
      headerName: 'Action', field: '', width: 80, autoHeight: true, suppressSizeToFit: true,
      cellRenderer: (data) => {

        var returnString = '';
        returnString += `<i class="fa fa-edit" style="cursor:pointer; padding: 7px 20px 0 0;
        font-size: 17px;"   data-action-type="EF" title="Edit"></i>`;
        return returnString;
      }
    }
];



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
  this.empForm.reset();
  this.countyFormReset=true;
  this.currentAction='create'
  this.currentRowItem.IsSubmit=false;
  this.empDetails={IsActive:'true'};
  this.initEmpForm();
    this.emoModal.show();
}

  editEmpForm(data) {

    this.empForm.reset();
    this.countyFormReset=true;
    this.currentAction='edit'
    this.cscData={Country:data.Country,State:data.State,City:data.City};
    this.empDetails=data;
    this.initEmpForm();
      this.emoModal.show();
  }

  viewEmpForm(data) {

    this.empForm.reset();
    this.countyFormReset=true;
    this.currentAction='view'
    this.cscData={Country:data.Country,State:data.State,City:data.City};
    this.empDetails=data;
    this.initEmpForm();
    // this.empForm.disable();
      this.emoModal.show();
  }

private _normalizeValue(value: string): string {
  return value.toLowerCase().replace(/\s/g, '');
}


displayFn(user: any): string {
  return user && user.UserName ? user.UserName : '';
}

private _filter(name: string): any[] {
  const filterValue = this._normalizeValue(name);

  return this.employeeDropDownData.filter(option => this._normalizeValue(option.UserName).includes(filterValue) );
}

private _filterDR(name: string): any[] {
  const filterValue = this._normalizeValue(name);

  return this.employeeDirReportData.filter(option => this._normalizeValue(option.UserName).includes(filterValue) );
} 
private _filterTD(name: string): any[] {
  const filterValue = this._normalizeValue(name);

  return this.employeeThirdSigData.filter(option => this._normalizeValue(option.UserName).includes(filterValue) );
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
this.empForm.patchValue({Address:add});

}



public employeeData :any
public employeeDropDownData :any[]=[]
public employeeThirdSigData :any[]=[]
public employeeDirReportData :any[]=[]
getEmployees(){
  this.perfApp.route="app";
  this.perfApp.method="GetAllEmployees",
  this.perfApp.requestBody={'id':'5f5929f56c16e542d823247b'}
  this.perfApp.CallAPI().subscribe(c=>{
    
    console.log('lients data',c);
    if(c && c.length>0){
      
    }
     // if(!row.isDraft)
     this.employeeDropDownData=c;
     this.employeeThirdSigData=c;
     this.employeeDirReportData=c;
     
    
     this.filteredOptionsTS = this.empForm.controls['ThirdSignatory'].valueChanges
     .pipe(
       startWith(''),
       map(value => typeof value === 'string' ? value : value? value.UserName:""),
       map(name => name ? this._filterTD(name) : this.employeeThirdSigData.slice())
     );

     this.filteredOptionsDR = this.empForm.controls['DirectReports'].valueChanges
     .pipe(
       startWith(''),
       map(value => typeof value === 'string' ? value :  value? value.UserName:""),
       map(name => name ? this._filterDR(name) : this.employeeDirReportData.slice())
     );

     this.filteredOptions = this.empForm.controls['CopiesTo'].valueChanges
     .pipe(
       startWith(''),
       map(value => typeof value === 'string' ? value :  value? value.UserName:""),
       map(name => name ? this._filter(name) : this.employeeDropDownData.slice())
     );
    
    this.employeeData=c.map(function (row) {
      
     
     return  {Name:row.UserName
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



submitCreateEmployee(){

  this.empForm.patchValue({IsSubmit: 'true' });
  this.saveEmployee();
}


saveEmployee(){
  this.perfApp.route="app";
  this.perfApp.method= this.currentAction=='create'?"CreateEmployee":"UpdateEmployee",
  
  this.empForm.patchValue({ThirdSignatory: this.empForm.get('ThirdSignatory').value?
    this.empForm.get('ThirdSignatory').value._id : ''});
    this.empForm.patchValue({CopiesTo: this.empForm.get('CopiesTo').value?
    this.empForm.get('CopiesTo').value._id : ''});
    this.empForm.patchValue({DirectReports: this.empForm.get('DirectReports').value?
    this.empForm.get('DirectReports').value._id : ''});

 
  
  this.perfApp.requestBody=this.empForm.value; //fill body object with form 
  
  if (this.currentAction=='edit') {
    this.perfApp.requestBody._id=this.currentRowItem._id; 
    this.perfApp.requestBody.UpdatedBy='5f5929f56c16e542d823247b'
  }else{
    this.perfApp.requestBody.CreatedBy='5f5929f56c16e542d823247b'
    this.perfApp.requestBody.UpdatedBy='5f5929f56c16e542d823247b'
    this.perfApp.requestBody.ParentUser='5f5929f56c16e542d823247b'
  }
  
  
  this.perfApp.CallAPI().subscribe(c=>{

if (c.message==Constants.SuccessText) {
  
  this.snack.success(this.translate.instant(`Employee ${this.currentAction=='create'?'Added':'Updated'}  Succeesfully`));
  this.getEmployees();
  this.closeForm();
  // this.showSpinner = false;
}

  }, error => {
    if (error.error.message === Constants.PhoneAlreadyExist) {
      this.snack.error(this.translate.instant(Constants.PhoneAlreadyExist));
     // this.openDuplicateSessionDialog()
    } 
  });  
}


getAllDepartments(){
  this.perfApp.route="app";
  this.perfApp.method="GetEmpSetupBasicData",
  this.perfApp.requestBody={'empId':'5f5929f56c16e542d823247b'}
  this.perfApp.CallAPI().subscribe(c=>{
    
    console.log('lients data',c);
    if(c){
      this.departments=c.Departments;
      this.jobRoles=c.JobRoles;
      this.appRoles=c.AppRoles;
      this.jobLevels=c.JobLevels;
      console.log('lients data snnn',this.jobRoles);
    }
  })
}

}
