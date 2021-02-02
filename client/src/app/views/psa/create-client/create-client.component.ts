import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

import { NotificationService } from '../../../services/notification.service';
import { PerfAppService } from '../../../services/perf-app.service';
import { CustomValidators } from '../../../shared/custom-validators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AlertComponent } from '../../../shared/alert/alert.component';
import { AlertDialog } from '../../../Models/AlertDialog';

@Component({
  selector: 'app-create-client',
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.css']
})
export class CreateClientComponent implements OnInit {
  public alert: AlertDialog;
  public clientForm: FormGroup;
  public contactPersonForm: FormGroup;
  public isFormSubmitted = false;
  isSaveAsDraftClicked=false;
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
  constructor(
    private dialog: MatDialog,
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

  }
  public monthList = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"]
  countyFormReset: boolean;
  cscData: any = null;
  currentUser: any;
  subscription: Subscription = new Subscription();
  currentRecord: any = {};
  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  rangeList:any=[];
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
  ngOnInit(): void {
    this.subscription.add(this.activatedRoute.params.subscribe(params => {
      
      if(params['id']){
        this.currentRecord.id = params['id'];
      this.getClientDataById();
      this.isCreate=false;
      
      }

    }));

    this.initForm();
    this.getAllBasicData();
    // this.getIndustries();
    this.sameAsContactChange();
    this.mandateStartMonth();
    this.setEndMonth();
    this.currentUser = this.authService.getCurrentUser();
    this.mandateUsageCount()
    this.getEvaluationCategories();

    let rangeOptions={
      UsageType:"License",
      "Type" : "Range"
    }

    this.getRangeList(rangeOptions);
    this.alert = new AlertDialog();
  }
  getClientDataById() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetOrganizationDataById",
      this.perfApp.requestBody = { id: this.currentRecord.id }; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
      this.currentRecord = c;
      debugger
      this.isDraft=c.IsDraft;
      this.countyFormReset=true; 
      this.cscData={Country:c.Country,State:c.State,City:c.City};
      console.info('client record', c);
      try{
        this.setValues(this.clientForm, c);
      }catch(e){
        console.info('error', e);
      } 
      this.models=c.EvaluationModels
      if(c.EvaluationModels[0] =="")
      this.getModels();
    }, error => {
      this.notification.error('something went wrong')
      console.error(error);

      //this.notification.error(error.error.message)
    });
  }
  navToList() {
    this.router.navigate(['psa/list',{'activeTab':0}]);
  }
  initForm() {
    this.clientForm = this.formBuilder.group({
      Name: [null, Validators.compose([
        Validators.required,
        Validators.pattern("^[a-zA-Z0-9#\\&\\-()/._,: ]+$"),
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
        Validators.minLength(2),
        Validators.maxLength(500)])
      ],
      Industry: ['', [Validators.required]],
      Address: [null, Validators.compose([
        Validators.required, Validators.minLength(4),
        CustomValidators.patternValidator(/(?=.*[#)&.(-:/])/, { hasAddressSplChars: true }, 'hasAddressSplChars'),
      ])],
      Phone: [null, Validators.compose([
        Validators.required, Validators.maxLength(13),Validators.minLength(10),
      //  Validators.pattern("^[0-9]{2}-[0-9]{10}$")
      ])],
      PhoneExt: [null, Validators.compose([
         Validators.maxLength(5),
        Validators.pattern("^((\d{1}-\d{5}-?)|0)?[0-9]{5}$")

      ])],
      Email: [null, Validators.compose([
        Validators.required,
        Validators.email, Validators.maxLength(500),
        //Validators.pattern("^[a-zA-Z0-9\@/.-]+$")

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
      UsageType: ['License', [Validators.required]],
      Range:[null,[]],
      UsageCount: [1, []],
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
        Validators.required, Validators.maxLength(13),Validators.minLength(10),
        //Validators.pattern("^[0-9]{2}-[0-9]{10}$")
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
          Validators.required, Validators.minLength(10),
         // Validators.pattern("^((\\+91-?)|0)?[0-9]{12}$")
        ])]
      }),
      CoachingReminder: ['', []],
      EvaluationModels: ['', [Validators.required]],
      EvaluationPeriod: ['', [Validators.required]],

      EmployeeBufferCount: ['', []],
      DownloadBufferDays: ['', []],
      IsActive: ['', []],
      StartMonth: ['', []],
      EndMonth: ['', []]

    });
  }

  getRangeList(options){
    let ClientType = this.clientForm.get("ClientType").value;
    options['ClientType'] = ClientType;

    this.perfApp.route = "payments";
    this.perfApp.method = "range/list";
    this.perfApp.requestBody = options;
    this.perfApp.CallAPI().subscribe(_rangeList => {
      this.rangeList = _rangeList;
    });
}

  onCheckEmployee(){
    console.log("Employee checked");
    this.clientForm.get('Range').setValidators(null); 
    this.clientForm.get('Range').setErrors(null);
    this.clientForm.controls['Range'].setValue(null);
  }
  requiredIfValidator(predicate) {
    return (formControl => {
      if (!formControl.parent) {
        return null;
      }
      if (predicate()) {
        return Validators.required(formControl); 
      }
      return null;
    })
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
    
    this.clientFormData.IsDraft = false;
    this.isFormSubmitted = true;
    console.log(this.clientForm.valid);
    console.log(this.clientForm);
    if (!this.clientForm.valid) {
      return;
    }
    if(this.clientForm.get("UsageType").value==="License"){
      let range = this.clientForm.get("Range").value;
      let rangeObj = this.rangeList.find(rangObj=>rangObj._id==range);
      this.clientForm.controls['UsageCount'].setValue(rangeObj.RangeTo);
    }
    
    if(this.currentRecord && this.currentRecord._id){
      this.updateClient();
    }else{

      this.alert.Title = "Alert";
      this.alert.Content = "Are you sure you want to add this client?";
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
      this.notification.success('Organization Added Successfully.')
      this.errorOnSave = false;
      this.errorMessage = "";
      if (!this.clientFormData.IsDraft) {
        this.router.navigate(['psa/payment-release', { email: this.clientFormData.Email }], { skipLocationChange: true });
      } else {
        this.router.navigate(['psa/list']);
      }
      
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

  public onSameAsAdminChange(value): void {
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
        } else {         
          this.clientForm.controls['UsageCount'].setValidators(Validators.required);
          this.clientForm.controls['UsageCount'].setValue(1);
        }


      });
  }
  public removeValidators(form: FormGroup) {
    for (const key in form.controls) {
      form.get(key).clearValidators();
      form.get(key).updateValueAndValidity();
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
        if((key === "EmployeeBufferCount" || key === "DownloadBufferDays") && !rowdata[key]){
          form.get(key).setValue("0");
        }

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
      Validators.required, Validators.minLength(10),
      CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
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
      this.models = c;
      //this.models=c.map(x=>x.Name)
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
    if (this.clientForm.invalid  && this.isSaveAsDraftClicked==false ) {
      return;
    }
    const organization = this.prepareOrgData();
    console.log('updating client',organization)
    this.perfApp.route = "app";
    this.perfApp.method = "UpdateOrganization",
      this.perfApp.requestBody = organization; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {      
      console.log('updated', c)
      this.notification.success('Client details updated successfully')
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
      //organization.UsageCount= organization.UsageType=='License'?0:organization.UsageCount;
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
      organization.ContactPersonFirstName = organization.contactPersonForm.ContactPersonFirstName;
      organization.ContactPersonMiddleName = organization.contactPersonForm.ContactPersonMiddleName;
      organization.ContactPersonLastName = organization.contactPersonForm.ContactPersonLastName;
      organization.ContactPersonPhone = organization.contactPersonForm.ContactPersonPhone;
      organization.ContactPersonEmail = organization.contactPersonForm.ContactPersonEmail;
    }
    return organization;
  }
  saveAsDraft() {
    this.isSaveAsDraftClicked=true;
    this.clientFormData.IsDraft = true;
    //this.isFormSubmitted = true;
    // if (!this.clientForm.valid) {
    //   return;
    // }
   debugger
    if(this.clientForm.value.Name===""){
     this.notification.error('Organization Name is mandatory')
      return;
    }
    if(!this.clientForm.value.Industry){
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


  
  printPage() {
    window.print();
  }
  keyPressNumbersDecimal(event) {
    var charCode = (event.which) ? event.which : event.keyCode;
   if(charCode >= 48 && charCode <= 57) {
      return true
      
    }else if(charCode == 45){
  return true;
    }
    else 
    
    {
      event.preventDefault();
      return false;
    }
    return true;
  }
  
  keyPressNumbers(event) {
    var charCode = (event.which) ? event.which : event.keyCode;
   if(charCode >= 48 && charCode <= 57) {
      return true
      
    }else 
    
    {
      event.preventDefault();
      return false;
    }
    return true;
  }
  keyPressEmail(event) {
    var charCode = (event.which) ? event.which : event.keyCode;
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

}
