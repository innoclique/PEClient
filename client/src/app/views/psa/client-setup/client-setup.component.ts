import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';
import { PerfAppService } from '../../../services/perf-app.service';
import { CustomValidators } from '../../../shared/custom-validators';
@Component({
  selector: 'app-client-setup',
  templateUrl: './client-setup.component.html',
  styleUrls: ['./client-setup.component.css']
})
export class ClientSetupComponent implements OnInit {
  public clientForm: FormGroup;
  constructor(private dialog: MatDialog,    
    private formBuilder: FormBuilder,
    private perfApp: PerfAppService,
    ) { }

  ngOnInit(): void {
    this.getClients();
    this.clientForm = this.formBuilder.group({
      Email: ['', [Validators.required, Validators.email]],
      AdminEmail: ['', [Validators.required, Validators.email]],
      ContactEmail: ['', [Validators.required, Validators.email]],
      AdminName: [null, Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),
        Validators.minLength(2)])
      ],

      Name: [null, Validators.compose([
        Validators.required,
        CustomValidators.patternValidator(/(?=.*[).(-:])/, { hasNameSplChars: true }, 'hasNameSplChars'),
        CustomValidators.patternValidator(/^[a-zA-Z]{1}/, { hasFirstCharNum: true }, 'hasFirstCharNum'),

        Validators.minLength(2)])
      ],


      Address: [null, Validators.compose([
        Validators.required, Validators.minLength(4),
        CustomValidators.patternValidator(/(?=.*[#)&.(-:/])/, { hasAddressSplChars: true }, 'hasAddressSplChars'),
      ])
      ],

      PhoneNumber: [null, Validators.compose([
        Validators.required, Validators.minLength(6),
        CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      ContactPhone: [null, Validators.compose([
        Validators.required, Validators.minLength(6),
        CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      AdminPhone: [null, Validators.compose([
        Validators.required, Validators.minLength(6),
        CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      ExtNumber: [null, Validators.compose([
        Validators.minLength(6),
        CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],
      AltPhoneNumber: [null, Validators.compose([
        Validators.minLength(6),
        CustomValidators.patternValidator(/((?=.*\d)(?=.*[-]))/, { hasPhoneSplChars: true }, 'hasPhoneSplChars'),
      ])],

    });
  }

  get f() {
    return this.clientForm.controls;
  }

  public hasError = (controlName: string, errorName: string) =>{
    return this.clientForm.controls[controlName].hasError(errorName);
  }

  public createClient = () => {
    if (!this.clientForm.valid) {
      return;    
    }
    this.saveClient();
  }
  closeForm(){

  }

  public columnDefs = [
    {headerName: 'Client', field: 'Name', sortable: true, filter: true},
    {headerName: 'Type', field: 'OrganizationType', sortable: true, filter: true },
    {headerName: 'Industry', field: 'Industry', sortable: true, filter: true },
    {headerName: 'Usage Type', field: 'UsageType', sortable: true, filter: true },
    {headerName: 'Contact Person', field: 'ContactName', sortable: true, filter: true }
];

public clientData :any
getClients(){
  this.perfApp.route="app";
  this.perfApp.method="GetAllOrganizations",
  this.perfApp.requestBody={'id':'5f5929f56c16e542d823247b'}
  this.perfApp.CallAPI().subscribe(c=>{
    debugger
    console.log('lients data',c);
    if(c && c.length>0){
      
    }
    //this.clientData=c;
    //this.clientData.push()
    this.clientData=c.map(function (row) {
      
     return  {Name:row.Name
        ,OrganizationType:row.OrganizationType
        ,Industry:row.Industry
        ,UsageType:row.UsageType
        ,ContactName:row.ContactName
        ,RowData:row
      }
    }
    )
  })
}
saveClient(){
  this.perfApp.route="app";
  this.perfApp.method="CreateOrganization",
  this.perfApp.requestBody=this.clientForm.value; //fill body object with form 
  this.perfApp.CallAPI().subscribe(c=>{});  
}
}
