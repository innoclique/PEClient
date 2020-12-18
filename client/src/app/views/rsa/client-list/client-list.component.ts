import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { PerfAppService } from '../../../services/perf-app.service';
import { CustomValidators } from '../../../shared/custom-validators';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent implements OnInit {


  public clientForm: FormGroup;
  public contactPersonForm: FormGroup;
  public isFormSubmitted = false;
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
  
  public clientData: any=[]
  public monthList = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"]
    
    public clientGridOptions: GridOptions = {
      columnDefs: this.getColDef()      
    }
    currentUser:any;
  cscData:any=undefined;
  countyFormReset: boolean;
  currentOrganization:any;
  constructor(
    private formBuilder: FormBuilder,
    private perfApp: PerfAppService,
    private notification: NotificationService,
    private modalService: BsModalService,
    public authService: AuthService,
    public router: Router
  ) {


    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
  }
  getColDef(){
    return  [
      {
        headerName: 'Client', field: 'Name', sortable: true, filter: true,  
        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.value}</span>` }
      },      
      { headerName: 'Industry', field: 'Industry', sortable: true, filter: true },
      { headerName: 'Usage Type', field: 'UsageType', sortable: true, filter: true },
      { headerName: 'Contact Person', field: 'ContactName', sortable: true, filter: true },
      {
        headerName: "Actions",
        suppressMenu: true,
        suppressSizeToFit: true,
        Sorting: false,        
        cellRenderer: (data) => {
        console.log('column data', data)
          if(data && data.data && data.data.RowData && data.data.RowData.IsActive){
            return `<i class="icon-ban" style="cursor:pointer ;padding: 7px 20px 0 0;
            font-size: 17px;"   data-action-type="suspendorg" title="Deactivate Client"></i>
            <i class="icon-pencil" style="cursor:pointer ;padding: 7px 20px 0 0;
            font-size: 17px;"   data-action-type="edit" title="Edit Client" ></i>
            `
          }else{
            return `<i class="icon-check" style="cursor:pointer ;padding: 7px 20px 0 0;
    font-size: 17px;"   data-action-type="activateOrg" title="Activate Client"></i>
    <i class="icon-pencil" style="cursor:pointer ;padding: 7px 20px 0 0;
    font-size: 17px;"   data-action-type="edit" title="Edit Client" ></i>
    `
          }
          
          //}
        }
  
  
      }
    ];
  
  }
  gotoCreate() {
    this.router.navigate(['rsa/setup-clients'])
  }
  ngOnInit(): void {
    this.getClients();
    this.initForm();
    this.getIndustries();
    this.sameAsContactChange()
    this.currentUser=this.authService.getCurrentUser();
  }
  initForm() {
    this.clientForm = this.formBuilder.group({
      Name: [null, Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
        Validators.minLength(2)])
      ],
      Industry: ['', [Validators.required]],
      Address: [null, Validators.compose([
        Validators.required, Validators.minLength(4),
        CustomValidators.patternValidator(/(?=.*[#)&.(-:/])/, { hasAddressSplChars: true }, 'hasAddressSplChars'),
      ])],
      Phone: [null, Validators.compose([
        Validators.required, Validators.minLength(10),
        Validators.pattern("^((\\+91-?)|0)?[0-9]{12}$")

      ])],
      PhoneExt: [null, []],
      Email: ['', [Validators.required, Validators.email]],
      Country: ['', [Validators.required]],
      State: ['', [Validators.required]],
      City: ['', [Validators.required]],
      ZipCode: ['', Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/[^A-Za-z0-9\s]+/g, { isInValidZip: true }, 'isInValidZip'),
      ])
      ],
      ClientType: ['', [Validators.required]],
      UsageType: ['', [Validators.required]],
      UsageCount: ['', [Validators.required]],
      AdminFirstName: ['', Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
        Validators.minLength(2)])
      ],
      AdminLastName: ['', Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
        Validators.minLength(2)])
      ],
      AdminMiddleName: ['', []],
      AdminEmail: ['', [Validators.required, Validators.email]],
      AdminPhone: [null, Validators.compose([
        Validators.required, Validators.minLength(10),
        Validators.pattern("^((\\+91-?)|0)?[0-9]{12}$")
      ])],
      SameAsAdmin: [false, []],
      contactPersonForm: this.formBuilder.group({

        ContactPersonFirstName: ['', Validators.compose([
          Validators.required,
          CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
          CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
          Validators.minLength(2)])
        ],
        ContactPersonLastName: [null, Validators.compose([
          Validators.required,
          CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
          CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
          Validators.minLength(2)])
        ],
        ContactPersonMiddleName: ['', []],
        ContactPersonEmail: ['', [Validators.required, Validators.email]],
        ContactPersonPhone: [null, Validators.compose([
          Validators.required, Validators.minLength(10),
          Validators.pattern("^((\\+91-?)|0)?[0-9]{12}$")
        ])]
      }),
      CoachingReminder: ['', []],
      EvaluationModels: ['', [Validators.required]],
      EvaluationPeriod: ['', [Validators.required]],
      EvaluationDuration: ['', [Validators.required]],
      EvaluationMaximumDays: ['', []],
      EmployeeBufferCount: ['', []],
      DownloadBufferDays: ['', []],
      IsActive: ['', []],
      StartMonth: ['', []],
      EndMonth: ['', []]

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
    this.isFormSubmitted = true;
    if (!this.clientForm.valid) {
      return;
    }
    this.saveClient();
  }

  onClientGridReady(params) {
    this.clientGridOptions.api = params.api; // To access the grids API
    params.api.sizeColumnsToFit();
  }



  getClients() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllOrganizationsForReseller",
    this.perfApp.requestBody = { 'companyId': this.currentOrganization._id }
    this.perfApp.CallAPI().subscribe(c => {
      
      console.log('lients data', c);
      if (c && c.length > 0) {
        
        c.map(row=>{
          
          if(row.ClientType==='Client'){
            
            this.clientData.push({
              Name: row.Name
              , OrganizationType: row.OrganizationType
              , Industry: row.Industry
              , UsageType: row.UsageType
              , ContactName: row.ContactName
              , RowData: row
            })
          }
                  
        });
        debugger
        this.clientGridOptions.api.setRowData(this.clientData);
       
      
      
      }
      
    })
  }
  saveClient() {
    const organization = this.prepareOrgData('Create');
    this.perfApp.route = "app";
    this.perfApp.method = "AddOrganization",
      this.perfApp.requestBody = organization; //fill body object with form 
      
    this.perfApp.CallAPI().subscribe(c => {
      this.resetForm();
      this.notification.success('Organization Added Successfully.')
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
          this.enableFields(contactForm);
          this.addValidators(contactForm);
        }
      });
  }
  mandateStartMonth() {
    this.clientForm.get('EvaluationPeriod').valueChanges
      .subscribe(value => {
        
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

      }

    }
  }
  public disableForm(form: FormGroup) {
    
    for (const key in form.controls) {
      
      const f = form.controls[key];
      //for child forms
      if (f && f instanceof FormGroup) {
        this.disableForm(f);
      } else {
        form.controls[key].disable();

      }

    }
  }
  public setContactPersonFields(form: FormGroup) {
    debugger
    form.controls["ContactPersonFirstName"].setValue(this.clientForm.get('AdminFirstName').value)
    form.controls["ContactPersonMiddleName"].setValue(this.clientForm.get('AdminMiddleName').value)
    form.controls["ContactPersonLastName"].setValue(this.clientForm.get('AdminLastName').value)
    form.controls["ContactPersonPhone"].setValue(this.clientForm.get('AdminPhone').value)
    form.controls["ContactPersonEmail"].setValue(this.clientForm.get('AdminEmail').value)
  }



  validationType = {
    ContactPersonFirstName: ['', Validators.compose([
      Validators.required,
      CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
      CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
      Validators.minLength(2)])
    ],
    ContactPersonLastName: ['', Validators.compose([
      Validators.required,
      CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
      CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
      Validators.minLength(2)])
    ],
    ContactPersonMiddleName: ['', []],
    ContactPersonEmail: ['', [Validators.required, Validators.email]],
    ContactPersonPhone: ['', Validators.compose([
      Validators.required, Validators.minLength(10),
      CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
    ])]
  }
  resetForm() {
    this.closeModal.nativeElement.click()
    this.orgViewRef.hide();
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
  public onRowClicked(e) {
    if (e.event.target !== undefined) {
      let data = e.data;
      this.currentRowItem = data.RowData;

      let actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "orgView":
          return this.openOrgView();
        case "suspendorg":
          return this.suspendOrg();
          case "activateOrg":
          return this.activateOrg();
          
        case "edit":
        return this.editClient();
      }
    }
  }
  suspendOrg() {
    debugger
    const cr = this.currentRowItem;
    this.perfApp.route = "app";
    this.perfApp.method = "SuspendOrg",
      this.perfApp.requestBody = {id:cr._id}; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
     this.notification.success('Client Deactivated Successfully.')      
    }, error => {
      this.notification.error(error.error.message||error.message)
    });
  }
  activateOrg() {    
    const cr = this.currentRowItem;
    this.perfApp.route = "app";
    this.perfApp.method = "ActivateOrg",
      this.perfApp.requestBody = {id:cr._id}; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
     this.notification.success("Client Activated Successfully.")      
    }, error => {
      this.notification.error(error.error.message||error.message)
    });
  }
  editClient(){
    const cr = this.currentRowItem;
    this.router.navigate(['/rsa/setup-clients/'+cr._id], { skipLocationChange: true });      
      return;
    
  }
  openOrgView() {
    debugger
    const cr = this.currentRowItem;
    if(cr.IsDraft){
      this.router.navigate(['/rsa/setup-clients/'+cr._id])
      return;
    }else{
      this.orgViewRef = this.modalService.show(this.orgView, this.config);
      this.orgViewRef.setClass('modal-xlg');     
      this.countyFormReset=true; 
      this.cscData={Country:cr.Country,State:cr.State,City:cr.City};
      this.setValues(this.clientForm, cr);
      this.disableForm(this.clientForm);
    }
    

  }


  

onCSCSelect(data){
  this.clientForm.patchValue({City:data.City.name});
  this.clientForm.patchValue({Country:data.Country.name});
  this.clientForm.patchValue({State:data.State.name});
 
  
  }

  hideorgView() {
    this.orgViewRef.hide();
    this.emptyForm(this.clientForm);
  }

  getIndustries() {
    this.perfApp.route = "shared";
    this.perfApp.method = "GetIndustries",
      this.perfApp.requestBody = {}; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
      this.industries = c;
      console.table(c);
    }, error => {
      this.notification.error(error.error.message)
    });
  }
  //#region  update client related
  public updateClient() {
    if (this.clientForm.invalid) {
      return;
    }
    const organization = this.prepareOrgData('Update');
    this.perfApp.route = "app";
    this.perfApp.method = "UpdateOrganization",
      this.perfApp.requestBody = organization; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
      
      console.log('updated', c)
      this.resetForm();

    }, error => {
      
      console.log('eror while updating orgnaizartion :', error)

      //this.notification.error(error.error.message)
    });
  }
  //#endregion

  prepareOrgData(action) {
    var organization = this.clientForm.value;
    if (action === 'Create') {
      organization.IsActive = true;
      organization.UsageCount= organization.UsageType=='License'?0:organization.UsageCount;
      organization.CreatedBy = this.authService.getCurrentUser()._id;
      organization.CreatedOn = new Date();
    } else {
      
      organization.id = this.currentRowItem._id;
      organization.UpdatedBy = this.authService.getCurrentUser()._id;
      organization.UpdatedOn = new Date();
    }
    organization = this.setContactPersonData(organization);
    return organization;
  }

  setContactPersonData(organization) {
    if (this.clientForm.get('SameAsAdmin').value) {
      organization.ContactPersonFirstName = organization.AdminLastName;
      organization.ContactPersonMiddleName = organization.AdminMiddleName;
      organization.ContactPersonLastName = organization.AdminLastName;
      organization.ContactPersonPhone = organization.AdminPhone;
      organization.ContactPersonEmail = organization.AdminEmail;
    } else {
      organization.ContactPersonFirstName = this.contactPersonForm.value.ContactPersonLastName;
      organization.ContactPersonMiddleName = this.contactPersonForm.value.ContactPersonMiddleName;
      organization.ContactPersonLastName = this.contactPersonForm.value.ContactPersonLastName;
      organization.ContactPersonPhone = this.contactPersonForm.value.ContactPersonPhone;
      organization.ContactPersonEmail = this.contactPersonForm.value.ContactPersonEmail;
    }
    return organization;
  }


}
