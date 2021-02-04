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
  private redirectLink: string;
  showSpinner: boolean;
  public alert: AlertDialog;
  tncRef: BsModalRef;
  config = {
    backdrop: true,
    ignoreBackdropClick: true,

  };
  loginText:any = 'Login';
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
    private modalService: BsModalService,
    private activatedRoute: ActivatedRoute,
    ) { 
  
   this.activatedRoute.queryParams.subscribe(params => {
      if (params) {
        console.log('params from login ', params);
        if (params['redirectTo']) {
          this.redirectLink = params['redirectTo'];
        }
      }
    });
  }


  get f() {
    return this.loginForm.controls;
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
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
      this.loginSubmit();
    } catch (err) {
      this.snack.error(err.message)
      this.showSpinner = false;
    }


  }

  async loginSubmit(){
    this.showSpinner = true;
      const email = this.loginForm.get('username').value;
      const password = this.loginForm.get('password').value;
      const LoginModel = { Email: email, Password: password };


      
      await this.authService.login(LoginModel).subscribe(x => {
        var isLogin = localStorage.getItem("isLogged")
        var rdURL = localStorage.getItem("redirectUrl")
        console.log("LOGIN", isLogin)
        console.log("CURRENT URL", rdURL)
  
      //  debugger;
        if(isLogin=="1" && (rdURL.length>0 && !rdURL.includes("login")))
  {
    console.log("REDIRECTING TO ", rdURL)
    debugger;
    this.router.navigate([rdURL]);
    return
  }
    
//debugger;
        if (x.Error === Constants.DuplicateSession) {
          this.openDuplicateSessionDialog()
          return
        }
        debugger
        if (!x.User.TnCAccepted) {
          this.openTnCDialog();
          return;
        } else {
          this.logincallback(x)
        }

      }, error => {
        if (error.error.message === Constants.DuplicateSession) {
          this.openDuplicateSessionDialog()
       
        } if (error.error.message === Constants.InvalidCredentials) {

        }
        //alert(error.error.message)
       // this.snack.error(this.translate.instant('Login.InvalidCredentials'));
       //this.snack.error(this.translate.instant('Invalid Credentials'));
       this.snack.error(this.translate.instant(`${error.error.message || 'Invalid Credentials'}`));
       this.loginText = 'Login'
        this.showSpinner = false;
      });
  }
  openTnCDialog() {
    this.tncRef = this.modalService.show(this.tncModalView, this.config);
    this.tncRef.setClass('modal-xlg');
  }

  /**To alert user for duplicate sessions */
  openDuplicateSessionDialog() {
    this.alert.Title = "Alert";
    this.alert.Content = "You are already logged on another device(s). If you login here, you will be logged-off from all other devices. Any unsaved data will be lost. Are you sure you want to login here?";
    this.alert.ShowCancelButton = true;
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
    dialogRef.keydownEvents().subscribe(event => {

      if(event.key=='Enter'){
        this.authService.LogOut();
      //  console.log('alert dialog', resp);
        this.loginText = 'loading...'
        setTimeout(()=>{ 
          this.loginSubmit();
        }, 700);

      }
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp=='yes') {
      this.authService.LogOut();
      console.log('alert dialog', resp);
      this.loginText = 'loading...'
      setTimeout(()=>{ 
        this.loginSubmit();
      }, 700);
    }else{

    }
      
    })
  }
  acceptTnC() {
    this.perfApp.route = 'Shared';
    this.perfApp.method = "ConfirmTnC"
    this.perfApp.requestBody = {}
    this.perfApp.CallAPI().subscribe(res => {
      /**conforming TnC dialog */
      debugger
      this.authService.setLSObject("User",res);
      this.tncRef.hide();
      var currentUser = this.authService.getCurrentUser();
      this.logincallback({User:currentUser,Role:currentUser.Role})

    })
  }

  logincallback(x) {

    console.log('user ....', x)
    if (!x.User.TnCAccepted) {
      this.openTnCDialog();
      return;
    }
    if (!x.User.IsPswChangedOnFirstLogin) {
      this.router.navigate(['resetPassword']);
    } else {
       if (this.redirectLink) {
        console.log(' redirect Link found : ', this.redirectLink);
        this.router.navigate([this.redirectLink]);
      } else {
      if (x.Role === 'CSA') {
        //this.router.navigate(['csa']);
        
        
        let piInfo = this.authService.getPi();
        if(piInfo.initialPaymentRequired || piInfo.renewalRequired){
          this.router.navigate(['csa/payments']);
        }else{
          this.router.navigate(['dashboard']);
        }
        
      }
      if (x.Role === 'EA') {
        this.router.navigate(['ea']);
      } else if (x.Role === 'PSA') {
        this.router.navigate(['psa/dashboard']);
      }
      else if (x.Role === 'RSA') {
        this.router.navigate(['rsa/dashboard']);
      }
      else if (x.Role === 'EO') {
        /*if(x.SelectedRoles.indexOf("EA")!==-1){
          this.router.navigate(['ea/dashboard']);
        }else{
          this.router.navigate(['employee/dashboard']);
        }*/
        this.router.navigate(['dashboard']);
        //this.router.navigate(['em/dashboard']);
        
      }
    }
    }
  }
  
}
