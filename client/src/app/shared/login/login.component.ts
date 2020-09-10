import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-login',
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
  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    public themeService: ThemeService,
    private snack: NotificationService,
    private perfApp: PerfAppService,
    public translate: TranslateService) { }


    get f(){
      return this.loginForm.controls;
    }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      // username: ['', Validators.required,Validators.email],
      // password: ['', Validators.required,Validators.minLength(8)]

      username: ['', Validators.email],
      password: ['', Validators.required]
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
    debugger
    try {
      this.showSpinner = true;
      const email = this.loginForm.get('username').value;
      const password = this.loginForm.get('password').value;
      const LoginModel = { Email: email, Password: password };

      await this.authService.login(LoginModel).subscribe(x => {

        if (!x.IsPswChangedOnFirstLogin) {
          this.router.navigate(['resetPassword']);
        } else {
          this.router.navigate(['dashboard']);
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
    this.alert.Title = "Terms and Conditions";
    this.alert.Content = `  <h3>Develop across all platforms</h3>
    <p>Learn one way to build applications with Angular and reuse your code and abilities to build
      apps for any deployment target. For web, mobile web, native mobile and native desktop.</p>
  
    <h3>Speed &amp; Performance</h3>
    <p>Achieve the maximum speed possible on the Web Platform today, and take it further, via Web
      Workers and server-side rendering. Angular puts you in control over scalability. Meet huge
      data requirements by building data models on RxJS, Immutable.js or another push-model.</p>
  
    <h3>Incredible tooling</h3>
    <p>Build features quickly with simple, declarative templates. Extend the template language with
      your own components and use a wide array of existing components. Get immediate Angular-specific
      help and feedback with nearly every IDE and editor. All this comes together so you can focus
      on building amazing apps rather than trying to make the code work.</p>
  
    <h3>Loved by millions</h3>
    <p>From prototype through global deployment, Angular delivers the productivity and scalable
      infrastructure that supports Google's largest applications.</p>
  
    <h3>What is Angular?</h3>
  
    <p>Angular is a platform that makes it easy to build applications with the web. Angular
      combines declarative templates, dependency injection, end to end tooling, and integrated
      best practices to solve development challenges. Angular empowers developers to build
      applications that live on the web, mobile, or the desktop</p>
  
    <h3>Architecture overview</h3>
  
    <p>Angular is a platform and framework for building client applications in HTML and TypeScript.
    Angular is itself written in TypeScript. It implements core and optional functionality as a
    set of TypeScript libraries that you import into your apps.</p>
  
    <p>The basic building blocks of an Angular application are NgModules, which provide a compilation
    context for components. NgModules collect related code into functional sets; an Angular app is
    defined by a set of NgModules. An app always has at least a root module that enables
    bootstrapping, and typically has many more feature modules.</p>
  
    <p>Components define views, which are sets of screen elements that Angular can choose among and
    modify according to your program logic and data. Every app has at least a root component.</p>
  
    <p>Components use services, which provide specific functionality not directly related to views.
    Service providers can be injected into components as dependencies, making your code modular,
    reusable, and efficient.</p>
  
    <p>Both components and services are simply classes, with decorators that mark their type and
    provide metadata that tells Angular how to use them.</p>
  
    <p>The metadata for a component class associates it with a template that defines a view. A
    template combines ordinary HTML with Angular directives and binding markup that allow Angular
    to modify the HTML before rendering it for display.</p>
  
    <p>The metadata for a service class provides the information Angular needs to make it available
    to components through Dependency Injection (DI).</p>
  
    <p>An app's components typically define many views, arranged hierarchically. Angular provides
    the Router service to help you define navigation paths among views. The router provides
    sophisticated in-browser navigational capabilities.</p>`;
    this.alert.ShowCancelButton = false;
    this.alert.ShowConfirmButton = true;
    this.alert.CancelButtonText = "Cancel";
    this.alert.ConfirmButtonText = "Agree & Submit";


    const dialogConfig = new MatDialogConfig()
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = this.alert;
    dialogConfig.height = "600px";
    dialogConfig.maxWidth = '100%';
    dialogConfig.minWidth = '40%';


    var dialogRef = this.dialog.open(AlertComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(resp => {
      this.perfApp.route = 'Shared';
      this.perfApp.method = "ConfirmTnC"
      this.perfApp.requestBody = {}
      this.perfApp.CallAPI().subscribe(res => {
        /**conforming TnC dialog */
      })
      console.log('alert dialog', resp);
    })
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
}
