

import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service'
import { ActivatedRoute, Router } from '@angular/router';
// import { NotificationService } from 'src/app/services/notification.service';
import { Constants } from '../AppConstants';
import { NotificationService } from '../../services/notification.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  public resetForm: FormGroup;
  public hide=true;
  public pswHide=true;
  public curPswHide=false;
  showSpinner: boolean;
  formSubmitAttempt: boolean;
  passwordFarmat="";
  has8char=false;
  hasUppercase=false;
  hasLowercase=false;
  hasNumber=false;
  hasSpecialChar=false;
  strength: string;
  showValidations: boolean;
  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snack: NotificationService) { }

  ngOnInit(): void {

    this.resetForm = this.fb.group({
      password: ['',[
      Validators.required]],
      confirm_password: ['', [Validators.required]],
      oldPassword: ['', [Validators.required]]
    }, { 
      validator: [this.ConfirmedValidator('password', 'confirm_password'),this.ConfirmPattern('password')]
    })

  }

  get f(){
    return this.resetForm.controls;
  }

  ConfirmedValidator(controlName: string, matchingControlName: string){
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];
        if (matchingControl.errors && !matchingControl.errors.confirmedValidator) {
            return;
        }
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ confirmedValidator: true });
        } else {
            matchingControl.setErrors(null);
        }
    }
  }

  onNewPasswordCick(){
    this.showValidations=true;
  }

  ConfirmPattern(controlName: string) {
    
   
    return (formGroup: FormGroup) => {
      this.passwordFarmat="";
      this.passwordFarmat="Must be at least "
      const control = formGroup.controls[controlName];
      var passw = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]))/;

      var numberOnly = /(?=.*\d)/;
      var smallLetters =   /(?=.*[a-z])/;
      var capsLetters =  /(?=.*[A-Z])/;
      var specialChars =  /(?=.*[#$_-])/;

     
      if (control.value.length <8 ){
        this.passwordFarmat= this.passwordFarmat+"8 Characters "
        control.setErrors({ confirmPattern: true });
        this.has8char=false;
      }else this.has8char=true;

      if (!control.value.match(numberOnly)) {
        this.passwordFarmat= this.passwordFarmat+"one Number "
        control.setErrors({ confirmPattern: true });
        this.hasNumber=false;
      }else this.hasNumber=true;

      if (!control.value.match(smallLetters)) {
        this.passwordFarmat= this.passwordFarmat+"one in Small Case "
        control.setErrors({ confirmPattern: true });
        this.hasLowercase=false;
      }else this.hasLowercase=true;

      if (!control.value.match(capsLetters)) {
        this.passwordFarmat=  this.passwordFarmat+"one in Capital Case "
        control.setErrors({ confirmPattern: true });
        this.hasUppercase=false;
      }else this.hasUppercase=true;
      if (!control.value.match(specialChars)) {
        this.passwordFarmat=  this.passwordFarmat+"one of these Special Character(# $ _ - )"
        control.setErrors({ confirmPattern: true });
        this.hasSpecialChar=false;
      }else this.hasSpecialChar=true;

      var splCount = (control.value.match(/([#$_-])/g) || []).length;
      var numberCount = (control.value.match(/\d/g) || []).length;

      if ( control.value.length>=8&& splCount>=1 && numberCount>=1) {
        this.strength ='Weak';
      }  
      if (control.value.length>=10 && splCount>=2 && numberCount>=2) {
        this.strength="Medium";
      }
       if (control.value.length>=12 &&  splCount>=3 && numberCount>=3) {
        this.strength="Strong";
      }

    }
  }


  async onSubmit() {
    
    this.formSubmitAttempt = true;

    if (this.resetForm.invalid) {
      return false;
    }
    try {
      this.showSpinner = true;
      const user = this.authService.getLSObject('user');

      const password = this.resetForm.get('password').value;
      const oldPassword = this.resetForm.get('oldPassword').value;
      const resetModel = {userId : user.ID, password: password,oldPassword:oldPassword};
      await this.authService.updatePassword(resetModel).subscribe(x => {
        
        this.snack.success("Password updated successfully.")
        this.router.navigate(['first']);
      }, error => {
        if (error.error.message === Constants.InvalidOldPassword) {
         this.snack.error(error.error.message)
        } else if (error.error.message === Constants.NoUserFound) {
          this.snack.error(error.error.message)
         } 
        this.showSpinner = false;
      })
      
      

    } catch (err) {
      this.snack.error(err.message)
      this.showSpinner = false;

    }
  }


}

