import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



import { RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {CustomMaterialModule} from '../custom-material/custom-material.module';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AlertComponent } from './alert/alert.component';

import { MatSpinnerOverlayComponent } from './mat-spinner-overlay/mat-spinner-overlay.component'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { LogoutComponent } from './logout/logout.component';
import { ModalModule } from 'ngx-bootstrap/modal';


@NgModule({
  declarations: [ 
    LoginComponent, 
    ForgotPasswordComponent, 
    ResetPasswordComponent,
    AlertComponent,
    MatSpinnerOverlayComponent,
    LogoutComponent
    ],
  imports: [    
    CommonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,    
    RouterModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoader,
        deps: [HttpClient]
      }
    }),
    CustomMaterialModule,
    ModalModule.forRoot()
  ],
  entryComponents:[AlertComponent],
  exports:[AlertComponent]
})
export class SharedModule { }
export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}