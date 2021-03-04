

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { Constants } from '../AppConstants';
import { AlertDialog } from '../../Models/AlertDialog';
import { AlertComponent } from '../../shared/alert/alert.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Location } from '@angular/common';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  public resetForm: FormGroup;
  public hide = true;
  public pswHide = true;
  public curPswHide = false;
  showSpinner: boolean;
  formSubmitAttempt: boolean;
  passwordFarmat = "";
  has8char = false;
  hasUppercase = false;
  hasLowercase = false;
  hasNumber = false;
  hasSpecialChar = false;
  strength: string;
  showValidations: boolean;
  alert = new AlertDialog();
  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private snack: NotificationService,
    private location: Location) { }

  ngOnInit(): void {

    this.resetForm = this.fb.group({
      password: ['', [
        Validators.required]],
      confirm_password: ['', [Validators.required]],
      oldPassword: ['', [Validators.required]]
    }, {
      validator: [this.ConfirmedValidator('password', 'confirm_password'), this.ConfirmPattern('password')]
    })

  }

  get f() {
    return this.resetForm.controls;
  }

  ConfirmedValidator(controlName: string, matchingControlName: string) {
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

  onNewPasswordCick() {
    this.showValidations = true;
  }

  ConfirmPattern(controlName: string) {


    return (formGroup: FormGroup) => {
      this.passwordFarmat = "";
      this.passwordFarmat = "Must be at least "
      const control = formGroup.controls[controlName];
      var passw = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]))/;

      var numberOnly = /(?=.*\d)/;
      var smallLetters = /(?=.*[a-z])/;
      var capsLetters = /(?=.*[A-Z])/;
      var specialChars = /(?=.*[#$_-])/;


      if (control.value.length < 8) {
        this.passwordFarmat = this.passwordFarmat + "8 Characters "
        control.setErrors({ confirmPattern: true });
        this.has8char = false;
      } else this.has8char = true;

      if (!control.value.match(numberOnly)) {
        this.passwordFarmat = this.passwordFarmat + "one Number "
        control.setErrors({ confirmPattern: true });
        this.hasNumber = false;
      } else this.hasNumber = true;

      if (!control.value.match(smallLetters)) {
        this.passwordFarmat = this.passwordFarmat + "one in Small Case "
        control.setErrors({ confirmPattern: true });
        this.hasLowercase = false;
      } else this.hasLowercase = true;

      if (!control.value.match(capsLetters)) {
        this.passwordFarmat = this.passwordFarmat + "one in Capital Case "
        control.setErrors({ confirmPattern: true });
        this.hasUppercase = false;
      } else this.hasUppercase = true;
      if (!control.value.match(specialChars)) {
        this.passwordFarmat = this.passwordFarmat + "one of these Special Character(# $ _ - )"
        control.setErrors({ confirmPattern: true });
        this.hasSpecialChar = false;
      } else this.hasSpecialChar = true;

      var splCount = (control.value.match(/([#$_-])/g) || []).length;
      var numberCount = (control.value.match(/\d/g) || []).length;

      if (control.value.length >= 8 && splCount >= 1 && numberCount >= 1) {
        this.strength = 'Weak';
      }
      if (control.value.length >= 10 && splCount >= 2 && numberCount >= 2) {
        this.strength = "Medium";
      }
      if (control.value.length >= 12 && splCount >= 3 && numberCount >= 3) {
        this.strength = "Strong";
      }

    }
  }

  onPasswordUpdate() {
    this.formSubmitAttempt = true;

    if (this.resetForm.invalid) {
      return false;
    }

    this.alert.Title = "Alert";
    this.alert.Content = "Are you sure you want to change your password? Kindly note that once the password is changed, you will be logged out. Please use the new password to login again";
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
        this.onSubmit();
      } else {

      }
    })
  }

  async onSubmit() {
    try {
      this.showSpinner = true;
      const user = this.authService.getCurrentUser();

      const password = this.resetForm.get('password').value;
      const oldPassword = this.resetForm.get('oldPassword').value;
      const resetModel = { userId: user._id, password: password, oldPassword: oldPassword, isChangePassword: true};
      await this.authService.updatePassword(resetModel).subscribe(x => {

        this.snack.success("Password changed successfully.")

        this.router.navigate(['login']);

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

  onCancel() {
   // this.router.navigate(['dashboard']);
    this.location.back();
  }


}

