import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-client-setup',
  templateUrl: './client-setup.component.html',
  styleUrls: ['./client-setup.component.css']
})
export class ClientSetupComponent implements OnInit {
  public clientForm: FormGroup;
  constructor(private dialog: MatDialog,    
    private formBuilder: FormBuilder,) { }

  ngOnInit(): void {
    this.clientForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required, Validators.maxLength(60)]),
      phone: new FormControl('', [Validators.required, Validators.maxLength(10)]),
      dateOfBirth: new FormControl(new Date()),
      address: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      contactPerson:new FormControl('', [Validators.required, Validators.maxLength(60)]),
      contactname: new FormControl('', [Validators.required, Validators.maxLength(60)]),
      contactphone: new FormControl('', [Validators.required, Validators.maxLength(10)]),
      contactemail: new FormControl('', [Validators.required, Validators.maxLength(10)]),
      coachingRequired: new FormControl('', [Validators.required]),
      coachingphone: new FormControl('', [Validators.required, Validators.maxLength(10)]),
      coachingemail: new FormControl('', [Validators.required, Validators.maxLength(10)]),
      selectmodelRequired: new FormControl('', [Validators.required]),
      evaluationRequired: new FormControl('', [Validators.required]),


    });
  }

  public hasError = (controlName: string, errorName: string) =>{
    return this.clientForm.controls[controlName].hasError(errorName);
  }

  public createClient = () => {
    if (!this.clientForm.valid) {
      return;
     
    }
  }
  closeForm(){

  }
 
}
