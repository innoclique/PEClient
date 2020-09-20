import { Component, OnInit } from '@angular/core';
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
  

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    public themeService: ThemeService,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService) { }



    get f(){
      return this.empForm.controls;
    }


  ngOnInit(): void {

   this.getAllDepartments();
   this.getEmployees();

    this.empForm = this.fb.group({
      Email: ['', [Validators.required, Validators.email]],
      LastName: ['', Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
        Validators.minLength(1)])
      ],
      MiddleName: ['', Validators.compose([
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
      ])
      ],
      FirstName: ['', Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),

        Validators.minLength(2)])
      ],

      Title: ['', Validators.compose([
        Validators.required,
        Validators.minLength(2)])
      ],


      Address: ['', Validators.compose([
        Validators.required, Validators.minLength(4),
        CustomValidators.patternValidator(/(?=.*[#)&.(-:/])/, { hasAddressSplChars: true }, 'hasAddressSplChars'),
      ])
      ],

      PhoneNumber: ['', Validators.compose([
        Validators.required, Validators.minLength(6),
        CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      ExtNumber: ['', Validators.compose([
        Validators.minLength(2),
        CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      AltPhoneNumber: ['', Validators.compose([
        Validators.minLength(6),
        CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      MobileNumber: ['', Validators.compose([
        Validators.minLength(10),
        CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      IsActive: ['yes',[Validators.required] ],
      JobLevel: ['',[Validators.required] ],
      JobRole: ['',[Validators.required] ],
      Department: ['',[Validators.required] ],
      ApplicationRole: ['',[Validators.required] ],
      ThirdSignatory: [''],
      CopiesTo: ['' ],
      DirectReports: [''],
      Country: [''],
      State: [''],
      City: [''],
      ZipCode: ['', Validators.compose([
        Validators.required,
        // CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        // CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),

        Validators.minLength(6)
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

  }

  public columnDefs = [
    {headerName: 'Employee', field: 'Name', sortable: true, filter: true},
    {headerName: 'Title', field: 'Title', sortable: true, filter: true },
    {headerName: 'Department', field: 'Department', sortable: true, filter: true },
    {headerName: 'Phone', field: 'PhoneNumber', sortable: true, filter: true },
    {headerName: 'IsActive', field: 'IsActive', sortable: true, filter: true },
];

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
       map(value => typeof value === 'string' ? value : value.UserName),
       map(name => name ? this._filterTD(name) : this.employeeThirdSigData.slice())
     );

     this.filteredOptionsDR = this.empForm.controls['DirectReports'].valueChanges
     .pipe(
       startWith(''),
       map(value => typeof value === 'string' ? value : value.UserName),
       map(name => name ? this._filterDR(name) : this.employeeDirReportData.slice())
     );

     this.filteredOptions = this.empForm.controls['CopiesTo'].valueChanges
     .pipe(
       startWith(''),
       map(value => typeof value === 'string' ? value : value.UserName),
       map(name => name ? this._filter(name) : this.employeeDropDownData.slice())
     );
    
    this.employeeData=c.map(function (row) {
      
     
     return  {Name:row.UserName
        ,Title:row.Title
        ,PhoneNumber:row.PhoneNumber
        ,IsActive:row.IsActive==true?"Yes":"No"
        ,RowData:row
      }
    }
    )
  })
}
saveEmployee(){
  this.perfApp.route="app";
  this.perfApp.method="CreateEmployee",
  
  this.empForm.patchValue({ThirdSignatory:this.empForm.get('ThirdSignatory').value._id});
  this.empForm.patchValue({CopiesTo: this.empForm.get('CopiesTo').value._id });
  this.empForm.patchValue({DirectReports: this.empForm.get('DirectReports').value._id });
  
  this.perfApp.requestBody=this.empForm.value; //fill body object with form 
  this.perfApp.CallAPI().subscribe(c=>{});  
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
