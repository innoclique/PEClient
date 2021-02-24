
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
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public empForm: FormGroup;
  empDetails: any = { IsActive: 'true' }
  currentAction = 'create';
  cscData: any = undefined;
  departments = [];
  jobRoles = [];
  appRoles: any = [];
  jobLevels: any;
  loginUser: any;
  countyFormReset: boolean;
  isRoleChanged: boolean;
  public alert: AlertDialog;
  isDraftEmployee: boolean;
  coachingRemDays: any = [];

  filteredOptions: Observable<any[]>;
  filteredOptionsTS: Observable<any[]>;
  filteredOptionsDR: Observable<any[]>;
  public currentOrganization: any = {}
  submitClicked = false;
  show = true;

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

  get f() {
    return this.empForm.controls;
  }

  ngOnInit(): void {
    this.currentOrganization = this.authService.getOrganization();
    this.loginUser = this.authService.getCurrentUser();
    this.getEmployees();
    this.getManagersEmps();
    this.getThirdSignatoryEmps();
    this.initEmpForm();
    this.getAllDepartments();

    
  //  this.getUserProfile();
    this.getAllBasicData();
    this.alert = new AlertDialog();

  }

  initEmpForm() {
    this.empForm = this.fb.group({
      Email: [this.empDetails.Email ? this.empDetails.Email : '', [Validators.required, Validators.email]],
      LastName: [this.empDetails.LastName ? this.empDetails.LastName : '', Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
        Validators.minLength(1)])
      ],
      MiddleName: [this.empDetails.MiddleName ? this.empDetails.MiddleName : '', Validators.compose([
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
      ])
      ],
      EmployeeId: [this.empDetails.EmployeeId ? this.empDetails.EmployeeId : '', Validators.compose([
        CustomValidators.patternValidator(/(?=.*[()#-])/, { hasEmpIdSplChars: true }, 'hasEmpIdSplChars')

      ])
      ],
      FirstName: [this.empDetails.FirstName ? this.empDetails.FirstName : '', Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),

        Validators.minLength(2)])
      ],

      Title: [{ value: this.empDetails.Title ? this.empDetails.Title : '', disabled: true }, Validators.compose([
        Validators.required,
        Validators.minLength(2)])
      ],


      Address: [this.empDetails.Address ? this.empDetails.Address : '', Validators.compose([
        Validators.required, Validators.minLength(4),
        CustomValidators.patternValidator(/(?=.*[#)&.(-:/])/, { hasAddressSplChars: true }, 'hasAddressSplChars'),
      ])
      ],

      PhoneNumber: [this.empDetails.PhoneNumber ? this.empDetails.PhoneNumber : '', Validators.compose([
        Validators.minLength(10),
        // CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      ExtNumber: [this.empDetails.ExtNumber ? this.empDetails.ExtNumber : '', Validators.compose([
        Validators.minLength(2),
        // CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      AltPhoneNumber: [this.empDetails.AltPhoneNumber ? this.empDetails.AltPhoneNumber : '', Validators.compose([
        Validators.minLength(10),
        //  CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      MobileNumber: [this.empDetails.MobileNumber ? this.empDetails.MobileNumber : '', Validators.compose([
        Validators.minLength(10),
        // CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      IsActive: [this.empDetails.IsActive + '', [Validators.required]],
      IsSubmit: ['false'],
      IsDraft: ['false'],
      JobLevel: [this.empDetails.JobLevel ? this.empDetails.JobLevel : null, []],
      JobRole: [{ value: this.empDetails.JobRole ? this.empDetails.JobRole : '', disabled: true }, []],
      Department: [this.empDetails.Department ? this.empDetails.Department : '', []],
      ApplicationRole: [{ value: this.empDetails.ApplicationRole ? this.empDetails.ApplicationRole : null, disabled: true }, []],
      ThirdSignatory: [{ value: this.empDetails.ThirdSignatory ? this.empDetails.ThirdSignatory : '', disabled: true },],
      CopiesTo: [this.empDetails.CopiesTo ? this.empDetails.CopiesTo : '',],
      Manager: [{ value: this.empDetails.Manager ? this.empDetails.Manager : '', disabled: true }, []],
      Country: [this.empDetails.Country ? this.empDetails.Country : 'Not Applicable',],
      State: [this.empDetails.State ? this.empDetails.State : 'Not Applicable',],
      City: [this.empDetails.City ? this.empDetails.City : 'Not Applicable',],
      JoiningDate: [{ value: this.empDetails.JoiningDate ? new Date(this.empDetails.JoiningDate) : '', disabled: true }, []],
      RoleEffFrom: [''],
      ZipCode: [this.empDetails.ZipCode ? this.empDetails.ZipCode : 'Not Applicable', Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/[^A-Za-z0-9\s]+/g, { isInValidZip: true }, 'isInValidZip'),
        Validators.minLength(5)
      ])
      ],
      CoachingReminder: [this.empDetails.CoachingReminder, []]

    });
  }
  saveCreateEmployee() {

    if (this.empForm.get('FirstName').value == "") {
      this.snack.error(this.translate.instant('First Name is mandatory'));
      return
    }

    this.empForm.patchValue({ IsDraft: true });
    this.isDraftEmployee = true;
    this.saveEmployee();
  }

  onCancle() {
    this.router.navigate(['dashboard']);
  }

  submitCreateEmployee() {
    this.submitClicked = true;
    if (!this.empForm.valid) {
      return;
    } else {
      if (!this.empForm.get('PhoneNumber').value && !this.empForm.get('AltPhoneNumber').value) {
        this.snack.error(this.translate.instant('Please provide at least one contact (PhoneNumber, AltPhoneNumber )'));
        return;
      }
    }

    this.empForm.patchValue({ IsSubmit: true });
    this.empForm.patchValue({ IsDraft: false });
    this.isDraftEmployee = false;
    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to update your profile?"
    this.alert.ShowCancelButton = true;
    this.alert.ShowConfirmButton = true;
    this.alert.CancelButtonText = "Cancel";
    this.alert.ConfirmButtonText = "Continue";

    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = this.alert;
    dialogConfig.height = "300px";
    dialogConfig.maxWidth = '100%';
    dialogConfig.minWidth = '40%';

    var dialogRef = this.dialog.open(AlertComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(resp => {
      if (resp == 'yes') {
        this.saveEmployee();
      }
      else {

      }
    })
  }


  saveEmployee() {
    this.perfApp.route = "app";
    this.perfApp.method = "UpdateEmployeeProfile";

    let updateProfile = {
      "_id": this.loginUser._id,
      "FirstName": this.empForm.value.FirstName,
      "LastName": this.empForm.value.LastName,
      "MiddleName": this.empForm.value.MiddleName,
      "Address": this.empForm.value.Address,
      "PhoneNumber": this.empForm.value.PhoneNumber,
      "ExtNumber": this.empForm.value.ExtNumber,
      "AltPhoneNumber": this.empForm.value.AltPhoneNumber,
      "CoachingReminder": this.empForm.value.CoachingReminder,
      "IsDraft": this.empForm.value.IsDraft,
      //"Email": this.empForm.value.Email
    }

    this.perfApp.requestBody = updateProfile; //fill body object with form

    this.callEmpApi();
  }

  callEmpApi() {

    this.perfApp.CallAPI().subscribe(c => {

      if (c.message == Constants.SuccessText) {
        this.submitClicked = false;

        if (this.isDraftEmployee) {
          this.snack.success(this.translate.instant(`Profile has been successfully saved`));
        } else {
          //update firstName and lastname in localstorag after submit
          var userFromLocalStorage = JSON.parse(localStorage.getItem("User"));
          userFromLocalStorage.FirstName = this.empForm.value.FirstName;
          userFromLocalStorage.LastName = this.empForm.value.LastName;
          this.authService.setLSObject('User', userFromLocalStorage);
          this.snack.success(this.translate.instant(`Profile has been successfully updated`));
        }

        this.router.navigate(['dashboard']);
      }

    }, error => {
      if (error.error.message === Constants.EvaluationAdminNotFound) {
        this.openEvaluationAdminNotFoundDialog()
      } else {
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
      if (resp == 'yes') {
        this.perfApp.requestBody.IgnoreEvalAdminCreated = true;
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

    return this.employeeDropDownData.filter(option => this._normalizeValue(option.FirstName).includes(filterValue));
  }

  private _filterDR(name: string): any[] {
    const filterValue = this._normalizeValue(name);

    return this.employeeDirReportData.filter(option => this._normalizeValue(option.FirstName).includes(filterValue));
  }
  private _filterTD(name: string): any[] {
    const filterValue = this._normalizeValue(name);

    return this.employeeThirdSigData.filter(option => this._normalizeValue(option.FirstName).includes(filterValue));
  }

  onCSCSelect(data) {
    this.empForm.patchValue({ City: data.City.name });
    this.empForm.patchValue({ Country: data.Country.name });
    this.empForm.patchValue({ State: data.State.name });
    var add = ""
    add = `${data.City.name ? data.City.name + "," : ""}
   ${data.State.name ? data.State.name + "," : ""}
    ${data.Country.name ? data.Country.name : ""}
   `
    //  if(data.City.name)

  }

  public employeeData: any
  public employeeDropDownData: any[] = []
  public employeeThirdSigData: any[] = []
  public employeeDirReportData: any[] = []
  getManagersEmps() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetManagers",
      this.perfApp.requestBody = { companyId: this.currentOrganization._id }
    // this.perfApp.requestBody={'parentId':this.loginUser.ParentUser?this.loginUser.ParentUser:this.loginUser._id}
    this.perfApp.CallAPI().subscribe(c => {

      console.log('lients data', c);
      if (c && c.length > 0) {

        this.employeeDirReportData = c;
        this.filteredOptionsDR = this.empForm.controls['Manager'].valueChanges
          .pipe(
            startWith(''),
            map(value => typeof value === 'string' ? value : value ? value.FirstName : ""),
            map(name => name ? this._filterDR(name) : this.employeeDirReportData.slice())
          );
      }
    })
  }

  getThirdSignatoryEmps() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetThirdSignatorys",
      this.perfApp.requestBody = { companyId: this.currentOrganization._id }

    this.perfApp.CallAPI().subscribe(c => {

      console.log('lients data', c);
      if (c && c.length > 0) {
        this.employeeThirdSigData = c;
        this.filteredOptionsTS = this.empForm.controls['ThirdSignatory'].valueChanges
          .pipe(
            startWith(''),
            map(value => typeof value === 'string' ? value : value ? value.FirstName : ""),
            map(name => name ? this._filterTD(name) : this.employeeThirdSigData.slice())
          );
      }
    })
  }

  getEmployees() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllEmployees",
      // this.perfApp.requestBody={'parentId':this.loginUser.ParentUser?this.loginUser.ParentUser:this.loginUser._id}
      this.perfApp.requestBody = { companyId: this.currentOrganization._id }
    this.perfApp.CallAPI().subscribe(c => {

      console.log('lients data', c);
      if (c && c.length > 0) {

      }
      // if(!row.isDraft)
      this.employeeDropDownData = c;

      this.filteredOptions = this.empForm.controls['CopiesTo'].valueChanges
        .pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : value ? value.FirstName : ""),
          map(name => name ? this._filter(name) : this.employeeDropDownData.slice())
        );

      this.employeeData = c.map(function (row) {
        return {
          Name: row.FirstName + ' ' + row.LastName
          , Title: row.Title
          , PhoneNumber: row.PhoneNumber
          , IsActive: row.IsActive == true ? "Yes" : "No"
          , IsDraft: row.IsSubmit == false ? "Yes" : "No"
          , RowData: row
        }
      }
      )
    })
  }

  onDepartmentChange(event) {
    var depts = this.departments.filter(f => f.DeptName == event.target.value)[0];
    this.jobRoles = depts.JobRoles;
  }

  getAllDepartments() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetEmpSetupBasicData",
      this.perfApp.requestBody = { industry: this.authService.getOrganization().Industry }
    this.perfApp.CallAPI().subscribe(c => {

      console.log('CLIENTS DATA', c);
      if (c) {
        this.departments = c.Industries[0].Department;
        this.jobRoles = this.departments[0].JobRoles;
        this.appRoles = c.AppRoles;
        this.jobLevels = c.JobLevels;
        console.log('CLIENT JOB ROLES', this.appRoles);

        this.appRoles.filter(e => {
          if (e.RoleName == "ClientSuperAdmin") {
            e.RoleName = "Client Super Admin"
          }
        })

        this.appRoles.filter(e => {
          if (e.RoleName == "Employee") {
            this.empForm.patchValue({ ApplicationRole: [e._id] });
          }

        })
      }

      this.getUserProfile();
    })
  }

  keyPressNumbersDecimal(event) {
    var charCode = (event.which) ? event.which : event.keyCode;
    if (charCode >= 48 && charCode <= 57) {
      return true

    } else if (charCode == 45) {
      return true;
    }

    else {
      event.preventDefault();
      return false;
    }
    return true;
  }

  keyPressNumbers(event) {
    var charCode = (event.which) ? event.which : event.keyCode;
    if (charCode >= 48 && charCode <= 57) {
      return true

    } else {
      event.preventDefault();
      return false;
    }
    return true;
  }

  keyPressNumbersZip(event) {
    var charCode = (event.which) ? event.which : event.keyCode;
    console.log(charCode)
    if (charCode >= 48 && charCode <= 57) {
      return true

    }
    else if (charCode >= 97 && charCode <= 122) {
      return true
    }
    else if (charCode >= 65 && charCode <= 90) {
      return true
    }
    else {
      event.preventDefault();
      return false;
    }
    return true;
  }

  keyPressEmail(event) {
    var charCode = (event.which) ? event.which : event.keyCode;
    if (charCode >= 97 && charCode <= 122) {
      return true;

    } else if (charCode >= 65 && charCode <= 90) {
      return true;

    } if (charCode >= 48 && charCode <= 57) {
      return true

    } else if (charCode == 46 || charCode == 64) {
      return true;
    }
    else {
      event.preventDefault();
      return false;
    }
    return true;
  }

  keyPressAlphaAndPeriod(event) {
    debugger
    var charCode = (event.which) ? event.which : event.keyCode;
    if (charCode >= 97 && charCode <= 122) {
      return true;

    } else if (charCode >= 65 && charCode <= 90) {
      return true;

    } else if (charCode == 46) {
      return true;
    }
    else {
      event.preventDefault();
      return false;
    }
    return true;
  }

  getAllBasicData() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetSetupBasicData",
      this.perfApp.requestBody = {}
    this.perfApp.CallAPI().subscribe(c => {
      if (c) {
        this.coachingRemDays = c.coachingRem;
      }
    })
  }

  selectedApplicationRoles = [];
  getUserProfile() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetEmployeeProfile",
      this.perfApp.requestBody = { empId: this.loginUser._id }
    this.perfApp.CallAPI().subscribe(c => {
      if (c) {
        this.empDetails = c;
        if (c.IsDraft && c.profile != null) {
          this.empDetails.FirstName = c.profile.FirstName;
          this.empDetails.LastName = c.profile.LastName;
          this.empDetails.MiddleName = c.profile.MiddleName;
          this.empDetails.Address = c.profile.Address;
          this.empDetails.PhoneNumber = c.profile.PhoneNumber;
          this.empDetails.ExtNumber = c.profile.ExtNumber;
          this.empDetails.AltPhoneNumber = c.profile.AltPhoneNumber;
          this.empDetails.CoachingReminder = c.profile.CoachingReminder;
        }

        c.ApplicationRole.forEach(element => {
           this.selectedApplicationRoles.push(element._id)
        });

        this.empDetails.ApplicationRole = this.selectedApplicationRoles;
        let managerName = this.employeeDirReportData.find(man => c.Manager == man._id);
        if (managerName) {
          this.empDetails.Manager = managerName.FirstName;
        }
        this.initEmpForm();
      }
    })
  }

}

