import { Component, DoCheck, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { AlertDialog } from '../../../Models/AlertDialog';
import { AuthService } from '../../../services/auth.service';

import { NotificationService } from '../../../services/notification.service';
import { PerfAppService } from '../../../services/perf-app.service';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { CustomValidators } from '../../../shared/custom-validators';


@Component({
  selector: 'app-setupclient',
  templateUrl: './setupclient.component.html',
  styleUrls: ['./setupclient.component.css']
})
export class SetupclientComponent implements OnInit,DoCheck {
  public clientForm: FormGroup;
  public contactPersonForm: FormGroup;
  public isFormSubmitted = false;
  public alert: AlertDialog;
  errorOnSave = false;
  errorMessage: string = "";
  @ViewChild('closeModal') closeModal: ElementRef
  currentRowItem: any;
  orgViewRef: BsModalRef;
  @ViewChild('orgView') orgView: TemplateRef<any>;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,

  };
  industries: any;
  appScores: any = [];
  kpiStatus: any = [];
  coachingRemDays: any = [];
  evaluationPeriods: any;
  clientFormData: any = {};
  isCreate:Boolean=true;
  models:any=[];
  currentOrganization:any;
  isDraft=false;
  isSaveAsDraftClicked=false;
  accountsList:any = [];
  accountsInfo:any={
    LicenceCount:0,
    EmployeesCount:0
  };
  usageCount:any=0;
  rangeLicenseList:any=[];
  rangeEmployeeList:any=[];
  PurchasedLicenseList:any=[];
  constructor(private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private perfApp: PerfAppService,
    private notification: NotificationService,
    private modalService: BsModalService,
    public authService: AuthService,
    public router: Router,
    public activatedRoute: ActivatedRoute
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
    this.fetchAccountDetails();
  }
  getRangeLicenseList(options){
    //let ClientType = this.clientForm.get("ClientType").value;
   // options['ClientType'] = ClientType;

    this.perfApp.route = "payments";
    this.perfApp.method = "range/list";
    this.perfApp.requestBody = options;
    this.perfApp.CallAPI().subscribe(_rangeList => {
      this.rangeLicenseList = _rangeList;
    });
}
  getRangeEmployeeList(options){
    //let ClientType = this.clientForm.get("ClientType").value;
   // options['ClientType'] = ClientType;

    this.perfApp.route = "payments";
    this.perfApp.method = "range/list";
    this.perfApp.requestBody = options;
    this.perfApp.CallAPI().subscribe(_rangeList => {
      this.rangeEmployeeList = _rangeList;
    });
}


  fetchAccountDetails(){
    console.log("Inside:fetchAccountDetails")
    this.perfApp.route = "rsa";
    this.perfApp.method = "account/details",
      this.perfApp.requestBody = { orgId: this.currentOrganization._id}; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
      this.accountsList = c;
      this.fetchAccountsInfo();
      //this.usageCount = this.accountsInfo.LicenceCount;
    }, error => {
      this.notification.error('something went wrong')
      console.error(error);

      //this.notification.error(error.error.message)
    });
  }
  fetchAccountsInfo(){
    let _accountsList = this.accountsList;
    let LicenceList = _accountsList.filter((account:any)=>account.UsageType=="License");
    let EmployeesList = _accountsList.filter((account:any)=>account.UsageType=="Employees");
    this.accountsInfo.LicenceList = [];
    this.accountsInfo.EmployeesList = [];
    if(LicenceList){
      this.accountsInfo.LicenceCount = LicenceList.map((account)=>account.Balance).reduce(function(acc, val) { return acc + val; }, 0);
      this.accountsInfo.LicenceList = LicenceList;
    }
    if(EmployeesList){
      this.accountsInfo.EmployeesCount = EmployeesList.map((account)=>account.Balance).reduce(function(acc, val) { return acc + val; }, 0);
      this.accountsInfo.EmployeesList = EmployeesList;
    }
    
    console.log(this.accountsInfo)
  }
  onSelectRange(selectedRange){
    if(selectedRange){
      let selectedRangeObj = this.accountsInfo.LicenceList.find((licenseRange)=>licenseRange.RangeId._id==selectedRange);
      if(selectedRangeObj){
        this.usageCount = selectedRangeObj.Balance;
      }else{
        this.usageCount=0;
      }
    }else{
      this.usageCount=0;
    }
    
  }
  
  handleChangeLicense(evt) {
    let target = evt.target;
    console.log(target.checked);
    if(target.checked){
      this.usageCount = this.accountsInfo.LicenceCount;
      this.PurchasedLicenseList = this.getPurchasedRangeList(this.accountsInfo.LicenceList,this.rangeLicenseList);
    }
  }
  handleChangeEmployee(evt) {
    let target = evt.target;
    if(target.checked){
      this.usageCount = this.accountsInfo.EmployeesCount;
    }
  }

  getPurchasedRangeList(_list,purchasedList){
    let filterList = [];
    for(var index in _list){
      let {RangeId} = _list[index];
      let _licenseObj = purchasedList.find((rang)=>rang._id == RangeId._id);
      if(_licenseObj){
        console.log(_licenseObj)
        filterList.push(_licenseObj)
      }
      
    }
    return filterList;
  }

  onChangeEmployee(count){
    console.log(count);
    let matchedRange = null;
    if(count && !isNaN(count)){
      count = Number(count);
      let {EmployeesList} = this.accountsInfo;
      
      for(let i in EmployeesList){
        let {RangeId} = EmployeesList[i];
        let {RangeFrom,RangeTo} = RangeId;
        if(count>RangeFrom && count<=RangeTo){
          matchedRange = RangeId;
          this.clientForm.patchValue({
            Range: RangeId._id, 
            // formControlName2: myValue2 (can be omitted)
          });
          break;
        }
      }
    }
    console.log(matchedRange);
    if(!matchedRange){
      console.log("inside error")
      this.clientForm.controls['UsageCount'].setErrors({'required': true});
      this.clientForm.patchValue({
        Range: null, 
        // formControlName2: myValue2 (can be omitted)
      });
    }else{
      this.clientForm.controls['UsageCount'].setErrors(null);
    }
    
  }
  
  public monthList = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"]
  countyFormReset: boolean;
  cscData: any = null;
  currentUser: any;
  subscription: Subscription = new Subscription();
  currentRecord: any = {};
  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  onCSCSelect(data) {
    this.clientForm.patchValue({ City: data.City.name });
    this.clientForm.patchValue({ Country: data.Country.name });
    this.clientForm.patchValue({ State: data.State.name });
    var add = ""
    add = `${data.City.name ? data.City.name + "," : ""}
     ${data.State.name ? data.State.name + "," : ""}
      ${data.Country.name ? data.Country.name : ""}
     `
    //  if(data.City.name)
   // this.clientForm.patchValue({ Address: add });

  }

  ngDoCheck(): void {
    if(this.clientForm.get("SameAsAdmin").value==true)
  this.onSameAsContactChange({target:{checked:true}});
  }

  ngOnInit(): void {
    this.subscription.add(this.activatedRoute.params.subscribe(params => {
      
      if(params['id']){
        this.currentRecord.id = params['id'];
      this.getClientDataById();
      this.isCreate=false;
      
      }

    }));

    let rangeLicenseOptions={
      UsageType:"License",
      "Type" : "Range",
      'ClientType': "Reseller"
    }
    this.getRangeLicenseList(rangeLicenseOptions);

    let rangeEmployeeOptions={
      UsageType:"Employees",
      "Type" : "Range",
      'ClientType': "Reseller"
    }
    this.getRangeEmployeeList(rangeEmployeeOptions);

    this.isSaveAsDraftClicked=false;
    this.alert = new AlertDialog();
    this.initForm();
    this.getAllBasicData();
    // this.getIndustries();
    this.sameAsContactChange();
    this.mandateStartMonth();
    this.setEndMonth();
    this.currentUser = this.authService.getCurrentUser();
    this.mandateUsageCount()
    this.getEvaluationCategories();
  }
  getClientDataById() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetOrganizationDataById",
      this.perfApp.requestBody = { id: this.currentRecord.id }; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
      this.currentRecord = c;
      this.isDraft=c.IsDraft;
      this.countyFormReset=true; 
      this.cscData={Country:c.Country,State:c.State,City:c.City};
      console.info('client record', c);
      this.setValues(this.clientForm, c);
      this.models=c.EvaluationModels
    }, error => {
      this.notification.error('something went wrong')
      console.error(error);

      //this.notification.error(error.error.message)
    });
  }
  navToList() {
    this.router.navigate(['rsa/list',{'activeTab':0}]);
  }
  initForm() {
    this.clientForm = this.formBuilder.group({
      Name: [null, Validators.compose([
        Validators.required,
        Validators.pattern("^[a-zA-Z0-9#\\&\\-()/._,: ]+$"),
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        Validators.minLength(2),
        Validators.maxLength(500)])
      ],
      Industry: ['', [Validators.required]],
      Address: [null, Validators.compose([
        Validators.required, Validators.minLength(4),
        CustomValidators.patternValidator(/(?=.*[#)&.(-:/])/, { hasAddressSplChars: true }, 'hasAddressSplChars'),
      ])],
      Phone: [null, Validators.compose([
        Validators.required, Validators.maxLength(13),
        //Validators.pattern("^[0-9]{2}-[0-9]{10}$")
      ])],
      PhoneExt: [null, Validators.compose([
         Validators.maxLength(5),
        Validators.pattern("^((\d{1}-\d{5}-?)|0)?[0-9]{5}$")

      ])],
      Email: [null, Validators.compose([
        Validators.required, Validators.maxLength(500),
        Validators.pattern("^[a-zA-Z0-9\@/.-]+$")

      ])],
      Country: ['', [Validators.required]],
      State: ['', [Validators.required]],
      City: ['', [Validators.required]],
      ZipCode: ['', Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/[^A-Za-z0-9\s]+/g, { isInValidZip: true }, 'isInValidZip'),
      ])
      ],
      ClientType: ['Client',[]],
      UsageType: ['', [Validators.required]],
      UsageCount: [1, [Validators.required]],
      AdminFirstName: ['', Validators.compose([
        Validators.required,                
        Validators.pattern("^[a-zA-Z0-9.,-:() ]+$"),        
        Validators.maxLength(200)])
      ],
      AdminLastName: ['', Validators.compose([
        Validators.required,
        Validators.pattern("^[a-zA-Z0-9-().,: ]+$")
        ])
      ],
      AdminMiddleName: ['', Validators.compose([    
        Validators.pattern("^[a-zA-Z0-9-().,: ]+$"),                 
        ])],
      AdminEmail: ['', [Validators.required, Validators.email]],
      AdminPhone: [null, Validators.compose([
        Validators.required, Validators.maxLength(13),
        Validators.minLength(10),
       // Validators.pattern("^[0-9]{2}-[0-9]{10}$")
      ])],
      SameAsAdmin: [false, []],
      contactPersonForm: this.formBuilder.group({
        ContactPersonFirstName: ['', Validators.compose([
          Validators.required,                
          Validators.pattern("^[a-zA-Z0-9.,-:() ]+$"),        
          Validators.maxLength(200)])
        ],
        ContactPersonLastName: ['', Validators.compose([
          Validators.required,
          Validators.pattern("^[a-zA-Z0-9-().,: ]+$")
          ])
        ],
        ContactPersonMiddleName: ['', Validators.compose([    
          Validators.pattern("^[a-zA-Z0-9-().,: ]+$"),                 
          ])],
        ContactPersonEmail: ['', [Validators.required, Validators.email]],
        ContactPersonPhone: [null, Validators.compose([
          Validators.required, Validators.maxLength(13),
          Validators.minLength(10),
          // Validators.pattern("^[0-9]{2}-[0-9]{10}$")
        ])]
      }),
      CoachingReminder: ['', []],
      EvaluationModels: ['', [Validators.required]],
      EvaluationPeriod: ['', [Validators.required]],

      EmployeeBufferCount: ['', []],
      DownloadBufferDays: ['', []],
      IsActive: ['', []],
      StartMonth: ['', []],
      EndMonth: ['', []],
      Range:[null,[]]

    });
  }

  get f() {
    return this.clientForm.controls;
  }
  get a() {
    return (this.clientForm.controls['contactPersonForm'] as FormGroup).controls;
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.clientForm.controls[controlName].hasError(errorName);
  }

  public createClient = () => {
    debugger
    this.clientFormData.IsDraft = false;
    this.isFormSubmitted = true;
    console.log(this.clientForm.valid);
    console.log(this.clientForm);
    if (!this.clientForm.valid) {
      return;
    }
    if(this.currentRecord && this.currentRecord._id){
      this.alert.Title = "Alert";
      this.alert.Content = "Are you sure you want to update this client?";
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
      if (resp=='yes') {
        this.updateClient();
      }
      else{

      }
    })
    }else{
      this.alert.Title = "Alert";
      this.alert.Content = "Are you sure you want to add this client?";
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
      if (resp=='yes') {
        this.saveClient();
      }
      else{

      }
    })
    }
    
  }


  saveClient() {
    this.clientFormData = Object.assign(this.clientFormData, this.prepareOrgData());
    this.perfApp.route = "app";
    this.perfApp.method = "AddOrganization",
      this.perfApp.requestBody = this.clientFormData; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
      this.resetForm();
      // this.notification.success('Organization Added Successfully.')
      if (this.clientFormData.IsDraft) {
        this.notification.success('The client has been successfully saved.')
      } else {
        this.notification.success('The client has been successfully added.')
      }
      this.navToList();
      this.errorOnSave = false;
      this.errorMessage = "";
    }, error => {
      this.errorOnSave = true;
      this.errorMessage = error.error ? error.error.message : error.message;
      //this.notification.error(error.error.message)
    });
  }

  sameAsContactChange() {
    this.clientForm.get('SameAsAdmin').valueChanges
      .subscribe(value => {
        debugger
        if (value === null || value === undefined) {
          return;
        }
        var contactForm = (this.clientForm.controls['contactPersonForm'] as FormGroup)
        if (value) {
          this.removeValidators(contactForm);
          this.disableFields(contactForm);
          this.setContactPersonFields(contactForm)
        }
        else {
          // this.enableFields(contactForm);
          // this.addValidators(contactForm);
        }
      });
  }


  
  public onSameAsContactChange(value): void {
    var contactForm = (this.clientForm.controls['contactPersonForm'] as FormGroup)
    if (value.target.checked) {
      this.removeValidators(contactForm);
      this.disableFields(contactForm);
      this.setContactPersonFields(contactForm)
    }
    else {
      this.enableFields(contactForm);
      this.addValidators(contactForm);
    }
  }

  mandateStartMonth() {
    this.clientForm.get('EvaluationPeriod').valueChanges
      .subscribe(value => {
        debugger
        if (value === null || value === undefined) {
          return;
        }

        if (value === 'FiscalYear') {
          this.clientForm.controls['StartMonth'].setValidators(Validators.required)

          this.clientForm.controls['EndMonth'].setValue('')
          this.clientForm.controls['StartMonth'].enable()
        }
        else {
          this.clientForm.controls['StartMonth'].setValidators(null)
          this.clientForm.controls['StartMonth'].disable()
          this.clientForm.controls['StartMonth'].patchValue('1')
          this.clientForm.controls['StartMonth'].setValue('1')

          this.clientForm.controls['EndMonth'].setValue('December')
        }
      });
  }
  setEndMonth() {
    this.clientForm.get('StartMonth').valueChanges
      .subscribe(value => {
        if (value === null || value === undefined) {
          return;
        }
        if (value === "1") {
          const monthName = this.monthList[11];
          this.clientForm.controls['EndMonth'].setValue(monthName);
        } else {
          const monthName = this.monthList[value - 2];
          this.clientForm.controls['EndMonth'].setValue(monthName);
        }


      });
  }
  mandateUsageCount() {
    this.clientForm.get('UsageType').valueChanges
      .subscribe(value => {
        if (value === null || value === undefined) {
          return;
        }
        if (value==='License') {
          this.clientForm.controls['UsageCount'].reset();
          this.clientForm.controls['UsageCount'].clearValidators();
          this.clientForm.controls['UsageCount'].setValue(0);

          this.clientForm.controls['Range'].setValidators(Validators.required);
          this.clientForm.controls['Range'].setValue(0);
        } else {         
          this.clientForm.controls['UsageCount'].setValidators(Validators.required);
          this.clientForm.controls['UsageCount'].setValue("");

          //this.clientForm.controls['Range'].reset();
          this.clientForm.controls['Range'].clearValidators();
        }


      });
  }
  public removeValidators(form: FormGroup) {
    for (const key in form.controls) {
      // form.get(key).clearValidators();
      // form.get(key).updateValueAndValidity();
      form.get(key).setErrors(null); 
    }
  }
  public addValidators(form: FormGroup) {
    for (const key in form.controls) {
      form.get(key).setValidators(this.validationType[key]);
    }
  }
  public disableFields(form: FormGroup) {
    for (const key in form.controls) {
      form.get(key).reset();
      form.get(key).disable();
    }
  }
  public enableFields(form: FormGroup) {
    for (const key in form.controls) {
      form.get(key).reset();
      form.get(key).enable();
    }
  }
  public setValues(form: FormGroup, rowdata: any) {
    for (const key in form.controls) {
      const f = form.controls[key];
      //for child forms
      if (f && f instanceof FormGroup) {
        this.setValues(f, rowdata);
      } else {
        form.get(key).setValue(rowdata[key]);
        // if((key === "EmployeeBufferCount" || key === "DownloadBufferDays") && !rowdata[key]){
        //   form.get(key).setValue("");
        // }

      }

    }
  }
  public setContactPersonFields(form: FormGroup) {
    form.controls["ContactPersonFirstName"].setValue(""+this.clientForm.get('AdminFirstName').value)
    form.controls["ContactPersonMiddleName"].setValue(this.clientForm.get('AdminMiddleName').value)
    form.controls["ContactPersonLastName"].setValue(this.clientForm.get('AdminLastName').value)
    form.controls["ContactPersonPhone"].setValue(this.clientForm.get('AdminPhone').value)
    form.controls["ContactPersonEmail"].setValue(this.clientForm.get('AdminEmail').value)
  }



  validationType = {
    ContactPersonFirstName: ['', Validators.compose([
      Validators.required,                
      Validators.pattern("^[a-zA-Z0-9.,-:()]+$"),        
      Validators.maxLength(200)])
    ],
    ContactPersonLastName: ['', Validators.compose([
      Validators.required,
      Validators.pattern("^[a-zA-Z0-9-().,:]+$")
      ])
    ],
    ContactPersonMiddleName: ['', Validators.compose([    
      Validators.pattern("^[a-zA-Z0-9-().,:]+$"),                 
      ])],
    ContactPersonEmail: ['', [Validators.required, Validators.email]],
    ContactPersonPhone: ['', Validators.compose([
      Validators.required, Validators.maxLength(13),
      Validators.minLength(10),
      // Validators.pattern("^[0-9]{2}-[0-9]{10}$")
    ])]
  }
  resetForm() {
    this.isFormSubmitted = false;
    this.clientForm.reset();
    this.clientForm.setErrors(null);
    this.emptyForm(this.clientForm)

  }
  public emptyForm(form: FormGroup) {
    for (const key in form.controls) {
      const f = form.controls[key];
      //for child forms
      if (f && f instanceof FormGroup) {
        this.emptyForm(f);
      } else {
        form.get(key).setValue(null);

      }

    }
  }
  getModels(){
    this.perfApp.route = "shared";
    this.perfApp.method = "GetModelsByIndustry",
      this.perfApp.requestBody ={id: this.clientForm.controls["Industry"].value}; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
      this.models=c;
    }, error => {
      debugger
      console.log('models error ',error)
      this.notification.error(error.error.message)
    });
  }
  onIndustryChange(value){
    
    console.log('industru chamhe',value);
    this.getModels()
  }
  getIndustries() {
    this.perfApp.route = "shared";
    this.perfApp.method = "GetIndustries",
      this.perfApp.requestBody = {}; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
      this.industries = c;
      console.table(c);
    }, error => {


      //this.notification.error(error.error.message)
    });
  }

  getEvaluationCategories() {
    this.perfApp.route = "shared";
    this.perfApp.method = "GetEvaluationCategories",
      this.perfApp.requestBody = {}; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
      this.evaluationPeriods = c;
      console.table('eval periods', c);
    }, error => {


      //this.notification.error(error.error.message)
    });
  }

  //#region  update client related
  public updateClient() {
    if (this.clientForm.invalid && this.isSaveAsDraftClicked==false ) {
      return;
    }
    const organization = this.prepareOrgData();
    console.log('updating client',organization)
    this.perfApp.route = "app";
    this.perfApp.method = "UpdateOrganization",
      this.perfApp.requestBody = organization; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {      
      console.log('updated', c)
      // this.notification.success('Client details updated successfully') 
      if (this.currentRecord.IsDraft &&!this.clientFormData.IsDraft) {
        this.notification.success('The client has been successfully added.')
      } else {
        this.notification.success('The client has been successfully updated.')
      }
      this.navToList();

    }, error => {      
      console.log('eror while updating orgnaizartion :', error)
      this.notification.error(error.error.message)
    });
  }
  //#endregion

  prepareOrgData() {
    var organization = this.clientForm.getRawValue();
    var action='Create';
    if(this.currentRecord && this.currentRecord._id){
action='Update'
    }
    if (action === 'Create') {
      organization.IsActive = true;
      organization.UsageCount= organization.UsageType=='License'?0:organization.UsageCount;
      organization.CreatedBy = this.authService.getCurrentUser()._id;
      organization.CreatedOn = new Date();
    } else {      
      organization.id = this.currentRecord._id;
      organization.UpdatedBy = this.authService.getCurrentUser()._id;
      organization.UpdatedOn = new Date();
      organization.IsDraft=false;
      if(this.isSaveAsDraftClicked)
      organization.IsDraft=true;
    }
    organization = this.setContactPersonData(organization);
    organization.ParentOrganization=this.currentOrganization._id;
    delete organization.contactPersonForm;
    if(organization.UsageType==="License"){
      if(!isNaN(organization.UsageType.UsageCount)){
        organization.UsageType.UsageCount = Number(organization.UsageType.UsageCount);
      }
      
    }
    return organization;
  }

  setContactPersonData(organization) {
    if (this.clientForm.get('SameAsAdmin').value) {
      organization.ContactPersonFirstName = organization.AdminFirstName;
      organization.ContactPersonMiddleName = organization.AdminMiddleName;
      organization.ContactPersonLastName = organization.AdminLastName;
      organization.ContactPersonPhone = organization.AdminPhone;
      organization.ContactPersonEmail = organization.AdminEmail;
    } else {
      organization.ContactPersonFirstName = organization.ContactPersonFirstName;
      organization.ContactPersonMiddleName = organization.ContactPersonMiddleName;
      organization.ContactPersonLastName = organization.ContactPersonLastName;
      organization.ContactPersonPhone = organization.ContactPersonPhone;
      organization.ContactPersonEmail = organization.ContactPersonEmail;
    }
    return organization;
  }
  saveAsDraft() {
    this.clientFormData.IsDraft = true;
    this.isSaveAsDraftClicked=true;
    //this.isFormSubmitted = true;
    // if (!this.clientForm.valid) {
    //   return;
    // }
    debugger
    if(this.clientForm.value.Name===""){
      this.notification.error('Organization Name is mandatory')
      return;
    }
    if( this.clientForm.value.Industry===""){
      this.notification.error('Industry is mandatory')
      return;
    }
    if(!this.clientForm.value.Email){
      this.notification.error('Email is mandatory')
      return;
    }
    if(!this.clientForm.value.AdminEmail){
      this.notification.error('Admin Email is mandatory')
      return;
    }

    if(this.currentRecord && this.currentRecord._id){
      this.updateClient();
    }else{
      this.saveClient();
    }
  }





  
  getAllBasicData() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetSetupBasicData",
    this.perfApp.requestBody = {}
      this.perfApp.CallAPI().subscribe(c => {

        if (c) {

          this.industries = c.Industries;
          this.appScores = c.KpiScore;
          this.kpiStatus = c.KpiStatus;
          this.coachingRemDays = c.coachingRem;
          
        }
      })
  }



  
keyPressAlphaAndPeriod(event) {
  debugger
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
