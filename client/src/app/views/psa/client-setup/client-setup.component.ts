import { Component, DoCheck, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';
import { Router ,ActivatedRoute} from '@angular/router';
import { GridOptions } from 'ag-grid-community';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from '../../../services/auth.service';

import { NotificationService } from '../../../services/notification.service';
import { PerfAppService } from '../../../services/perf-app.service';
import { CustomValidators } from '../../../shared/custom-validators';
import { TabsetComponent } from 'ngx-bootstrap/tabs';

@Component({
  selector: 'app-client-setup',
  templateUrl: './client-setup.component.html',
  styleUrls: ['./client-setup.component.css']
})
export class ClientSetupComponent implements OnInit,DoCheck {

  public clientForm: FormGroup;
  public contactPersonForm: FormGroup;
  public isFormSubmitted = false;
  errorOnSave = false;
  errorMessage: string = "";
  @ViewChild('closeModal') closeModal: ElementRef
  currentRowItem: any;
  orgViewRef: BsModalRef;
  @ViewChild('orgView') orgView: TemplateRef<any>;
  @ViewChild('resellerView') resellerView: TemplateRef<any>;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,

  };
  industries: any;
  appScores: any = [];
  kpiStatus: any = [];
  coachingRemDays: any = [];
  public resellerList: any[];
  public clientData: any[];
  public monthList = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"]
    public resellerGridApi:any;
    public clientGridColumnApi:any;
    public resellerGridColumnApi:any;
    
    public clientGridOptions: GridOptions = {
      columnDefs: this.getColDef()      
    }
    public resellerGridOptions: GridOptions = {
      columnDefs: this.getReColDef()      
    }
  currentUser: any;
  models: any = [];
  rangeList:any=[];
  cscData:any=undefined;
  countyFormReset: boolean;
  currentOrganization:any;
  activeTabIndex: any = 0;
  modelsList: any[];
  @ViewChild('staticTabs', { static: false }) staticTabs: TabsetComponent;
  constructor(
    private formBuilder: FormBuilder,
    private perfApp: PerfAppService,
    private notification: NotificationService,
    private modalService: BsModalService,
    public authService: AuthService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
  ) {

    this.currentUser = this.authService.getCurrentUser();
    this.currentOrganization = this.authService.getOrganization();
    this.activatedRoute.params.subscribe(params => {
      if (params['activeTab']) {
        this.activeTabIndex = params['activeTab'];
      }
    });
  }

  getReColDef(){
    return  [
      {
        headerName: 'Reseller', field: 'Name', tooltipField: 'Name', sortable: true,  suppressSizeToFit: true, filter: true,  
        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.value}</span>` }
      },      
      { headerName: '# of Clients (Employee)', field: 'EmpTypeCount',  sortable: true, filter: true },
      { headerName: '# of Clients (License)', field: 'LicenceTypeCount',  sortable: true, filter: true },
      { headerName: 'Active', field: 'IsActive', sortable: true, filter: true },
      {
        headerName: "Review/Modify",
        // suppressMenu: true,
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

  getColDef(){
    return  [
      {
        headerName: 'Client', field: 'Name', tooltipField: 'Name', sortable: true,  suppressSizeToFit: true, filter: true,  
        cellRenderer: (data) => { return `<span style="color:blue;cursor:pointer" data-action-type="orgView">${data.value}</span>` }
      },      
      { headerName: 'Industry', field: 'Industry', sortable: true, filter: true },
      { headerName: 'Usage Type', field: 'UsageType', sortable: true, filter: true },
      { headerName: 'Active', field: 'IsActive', sortable: true, filter: true },
      {
        headerName: "Review/Modify",
        // suppressMenu: true,
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
    this.router.navigate(['/psa/setup-clients'])
  }
  gotoResellerCreate(){
    this.router.navigate(['/psa/setup-reseller'])
  }

  ngDoCheck(): void {
    if(this.clientForm.get("SameAsAdmin").value==true)
  this.sameAsContactOnChange({target:{checked:true}});
  }

  ngOnInit(): void {
    this.getAllBasicData();
    this.getClients();
    this.initForm();
    // this.getIndustries();
    this.sameAsContactChange()
    this.currentUser=this.authService.getCurrentUser();
    let rangeOptions={
      UsageType:"License",
      "Type" : "Range",
      'ClientType': "Client"
    }
      this.getRangeList(rangeOptions);
    
    
  }
  selectTab(tabId: number) {
    this.staticTabs.tabs[tabId].active = true;
  }
  initForm() {
    this.clientForm = this.formBuilder.group({
      Name: [null, Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        
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
      Range:[null,[]],
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
        IsActive: ['', []],
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
    params.api.sizeColumnsToFit();
    this.clientGridOptions.api = params.api; // To access the grids API
    // this.clientGridOptions.api.setDomLayout("autoHeight");
    this.clientGridOptions.rowHeight = 34;
     
    // this.clientGridColumnApi = params.columnApi;
    // var allColumnIds = [];
    // this.clientGridColumnApi.getAllColumns().forEach(function (column) {
    //   allColumnIds.push(column.colId);
    // });
    // this.clientGridColumnApi.autoSizeColumns(allColumnIds, false);
  }
  onResellerGridReady(params) {
    params.api.sizeColumnsToFit();
    this.resellerGridOptions.api = params.api; // To access the grids API
    // this.resellerGridOptions.api.setDomLayout("autoHeight");
    this.resellerGridOptions.rowHeight = 34;
    
    // this.clientGridOptions.api.setDomLayout("autoHeight");

    // this.resellerGridColumnApi = params.columnApi;
    // var allColumnIds = [];
    // this.resellerGridColumnApi.getAllColumns().forEach(function (column) {
    //   allColumnIds.push(column.colId);
    // });
    // this.resellerGridColumnApi.autoSizeColumns(allColumnIds, false);
  }



  
  onGridSizeChanged(params) {
    params.api.sizeColumnsToFit();
}

  getClients() {
    this.perfApp.route = "app";
    this.perfApp.method = "GetAllOrganizations",
    //this.perfApp.requestBody = { 'id': '5f5929f56c16e542d823247b' }
    this.perfApp.requestBody = { 'companyId': this.currentOrganization._id }
    this.perfApp.CallAPI().subscribe(c => {
      
      this.clientData=[];
      this.resellerList=[];
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
              ,IsActive: row.IsActive?"Yes":"No"
            })
          }
          if(row.ClientType==='Reseller'){
            this.resellerList.push({
              Name: row.Name
              , OrganizationType: row.OrganizationType
              , LicenceTypeCount: row.LicenceTypeCount
              , EmpTypeCount: row.EmpTypeCount
              , UsageType: row.UsageType
              , IsActive: row.IsActive?"Yes":"No"
              , RowData: row
            })
          }        
        });
        
        this.clientGridOptions.api.setRowData(this.clientData);
       
        this.resellerGridOptions.api.setRowData(this.resellerList);
        
      }
      this.selectTab(this.activeTabIndex);
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
        // this.enableFields(contactForm);
        // this.addValidators(contactForm);
        }
      });
  }

  sameAsContactOnChange(value) {
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
  public onResellerRowClicked(e){
    if (e.event.target !== undefined) {
      let data = e.data;
      this.currentRowItem = data.RowData;

      let actionType = e.event.target.getAttribute("data-action-type");
      switch (actionType) {
        case "orgView":
          return this.openResellerview();
        case "suspendorg":
          return this.suspendOrg();
        case "edit":
        return this.editReseller();
      }
    }
  }


  getRangeList(options){
    //let ClientType = this.clientForm.get("ClientType").value;
   // options['ClientType'] = ClientType;

    this.perfApp.route = "payments";
    this.perfApp.method = "range/list";
    this.perfApp.requestBody = options;
    this.perfApp.CallAPI().subscribe(_rangeList => {
      this.rangeList = _rangeList;
    });
}


  suspendOrg() {
    debugger
    
    const cr = this.currentRowItem;
    const confirmSuspend=window.confirm('Are you sure you want to deactivate '+cr.Name);
    if(!confirmSuspend){
      return;
    }
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
    
      this.router.navigate(['/psa/setup-clients/'+cr._id])
      return;
    
  }
  editReseller(){
    const cr = this.currentRowItem;    
      this.router.navigate(['/psa/setup-reseller/'+cr._id])
      return;    
  }
  async openResellerview(){
    debugger
    const cr = this.currentRowItem;
    // if(cr.IsDraft){
    //   this.router.navigate(['/psa/setup-reseller/'+cr._id])
    //   return;
    // }else{

      let rangeOptions={
        UsageType:"License",
        "Type" : "Range",
        'ClientType': "Reseller"
      }
    await  this.getRangeList(rangeOptions);
      this.orgViewRef = this.modalService.show(this.orgView, this.config);
      this.orgViewRef.setClass('modal-xlg');  
      this.countyFormReset=true; 
      this.cscData={Country:cr.Country,State:cr.State,City:cr.City};
      this.models = cr.EvaluationModels;
      this.setValues(this.clientForm, cr);
      this.disableForm(this.clientForm);
    // }
    
  }
  async openOrgView() {
    debugger
    const cr = this.currentRowItem;
    // if(cr.IsDraft){
    //   this.router.navigate(['/psa/setup-clients/'+cr._id])
    //   return;
    // }else{
    
    
      let rangeOptions={
        UsageType:"License",
        "Type" : "Range",
        'ClientType': "Client"
      }
     await   this.getRangeList(rangeOptions);

    this.orgViewRef = this.modalService.show(this.orgView, this.config);
      this.orgViewRef.setClass('modal-xlg');     
      this.countyFormReset=true; 
      this.cscData={Country:cr.Country,State:cr.State,City:cr.City};
     
      this.setValues(this.clientForm, cr);
      this.getModels();
    
      this.disableForm(this.clientForm);
    // }
    

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

  prepareOrgData(action) {
    var organization = this.clientForm.value;
    if (action === 'Create') {
      organization.IsActive = true;
      organization.UsageCount= organization.UsageType =='License' ? 0 : organization.UsageCount;
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

  
  getModels() {
    this.perfApp.route = "shared";
    this.perfApp.method = "GetModelsByIndustry",
      this.perfApp.requestBody = { id: this.clientForm.controls["Industry"].value }; //fill body object with form 
    this.perfApp.CallAPI().subscribe(c => {
      this.modelsList = c;
      if (this.modelsList)
      this.models = this.modelsList.filter(m => this.currentRowItem.EvaluationModels.findIndex(em => em == m._id) > -1);
    }, error => {
      debugger
      console.log('models error ', error)
      this.notification.error(error.error.message)
    });
  }
}
