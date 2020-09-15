import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ThemeService } from '../../services/theme.service';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service';
import { TranslateService } from '@ngx-translate/core';
import { CustomValidators } from '../../shared/custom-validators';

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
        Validators.minLength(6),
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

public employeeData :any
getEmployees(){
  this.perfApp.route="app";
  this.perfApp.method="GetAllEmployees",
  this.perfApp.requestBody={'id':'5f5929f56c16e542d823247b'}
  this.perfApp.CallAPI().subscribe(c=>{
    
    console.log('lients data',c);
    if(c && c.length>0){
      
    }
    //this.employeeData=c;
    //this.employeeData.push()
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
