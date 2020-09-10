

import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service'
import { ActivatedRoute, Router } from '@angular/router';
import { Constants } from '../AppConstants';
import { NotificationService } from '../../services/notification.service';
// import { NotificationService } from 'src/app/services/notification.service';
@Component({
  selector: 'app-dashboard',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  public forgotPswForm: FormGroup;
  private formSubmitAttempt: boolean;
  showSpinner: boolean;
  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snack: NotificationService) { }

  ngOnInit(): void {
    this.forgotPswForm = this.fb.group({
      email: ['',[Validators.required, Validators.email]],
    });
  }

  get f() {
    return this.forgotPswForm.controls;
  }
  async onSubmit() {

    this.formSubmitAttempt = true;

    if (this.forgotPswForm.invalid) {
      return false;
    }
    try {
      this.showSpinner = true;
      const email = this.forgotPswForm.get('email').value;

      const resetModel = { Email: email };
      await this.authService.resetPassword(resetModel).subscribe(x => {

        this.snack.success("Password Reset Successfully");
        this.router.navigate(['login']);

      }, error => {
        if (error.error.message === Constants.NoUserFound) {
         this.snack.error(error.error.message)
        } 
        this.showSpinner = false;
      })
    } catch (err) {
      this.snack.error(err.message);
      this.showSpinner = false;

    }
  }


}

