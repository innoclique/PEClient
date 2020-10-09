import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth.service'
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AlertComponent } from '../alert/alert.component';
import { AlertDialog } from '../../Models/AlertDialog';
// import { ThemeService } from 'src/app/services/theme.service';
import { ThemeService } from '../../services/theme.service';
import { Constants } from '../AppConstants';
import { NotificationService } from '../../services/notification.service';
import { PerfAppService } from '../../services/perf-app.service'
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-dashboard',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public loginInvalid: boolean;
  private formSubmitAttempt: boolean;
  private returnUrl: string;
  showSpinner: boolean;
  public alert: AlertDialog;
  tncRef: BsModalRef;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,

  };
  @ViewChild('tncModal') tncModalView: TemplateRef<any>;
  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    public themeService: ThemeService,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService,
    private modalService: BsModalService,) { }


    get f(){
      return this.loginForm.controls;
    }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required,Validators.email]],
      password: ['', [Validators.required]]

     
    });
    this.alert = new AlertDialog();
  }
  /**Login Submit */
  async onSubmit() {
    this.formSubmitAttempt = true;
    if (this.loginForm.invalid) {
      this.loginInvalid = true;
      return false;
    }
    
    try {
      this.showSpinner = true;
      const email = this.loginForm.get('username').value;
      const password = this.loginForm.get('password').value;
      const LoginModel = { Email: email, Password: password };

      await this.authService.login(LoginModel).subscribe(x => {        
        if (x.Error === Constants.DuplicateSession) {
          this.openDuplicateSessionDialog()
          return 
        }
        console.log('user ....',x)
        if(!x.User.TnCAccepted){
          this.openTnCDialog();
          return;
          }
        if (!x.User.IsPswChangedOnFirstLogin) {
          this.router.navigate(['resetPassword']);
        } else {
          if(x.Role==='EA'){
            this.router.navigate(['ea']);
          }else if(x.Role==='PSA'){
          this.router.navigate(['psa/dashboard']);
          }
          else if(x.Role==='RSA'){
            this.router.navigate(['rsa/dashboard']);
            }
            else if(x.Role === 'EO'){
              this.router.navigate(['employee/dashboard']);
            }
        }
        
      }, error => {
        if (error.error.message === Constants.DuplicateSession) {
          this.openDuplicateSessionDialog()
        } if (error.error.message === Constants.InvalidCredentials) {

        }
        this.snack.error(this.translate.instant('Login.InvalidCredentials'));

        this.showSpinner = false;
      })

    } catch (err) {
      this.snack.error(err.message)
      this.showSpinner = false;
    }


  }
  openTnCDialog() {
    this.tncRef = this.modalService.show(this.tncModalView, this.config);
    this.tncRef.setClass('modal-xlg');
  }

  /**To alert user for duplicate sessions */
  openDuplicateSessionDialog() {
    this.alert.Title = "Secure Alert";
    this.alert.Content = "We found that you have already logged in some where. Please logout from other session, to continue click on logout";
    this.alert.ShowCancelButton = false;
    this.alert.ShowConfirmButton = true;
    this.alert.CancelButtonText = "Cancel";
    this.alert.ConfirmButtonText = "Logout";


    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = this.alert;
    dialogConfig.height = "300px";
    dialogConfig.maxWidth = '100%';
    dialogConfig.minWidth = '40%';


    var dialogRef = this.dialog.open(AlertComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(resp => {
      this.authService.LogOut()
      console.log('alert dialog', resp);
    })
  }
  acceptTnC(){    
    this.perfApp.route = 'Shared';
      this.perfApp.method = "ConfirmTnC"
      this.perfApp.requestBody = {}
      this.perfApp.CallAPI().subscribe(res => {
        /**conforming TnC dialog */
        this.tncRef.hide();
        var currentUser=this.authService.getCurrentUser();
        if(currentUser.Role==='EA'){
          this.router.navigate(['ea']);
        }else{
        this.router.navigate(['dashboard']);
        }
      })
  }
}
