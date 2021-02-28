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
import { SelectCheckAllComponent } from './select-check-all/select-check-all.component';
import { DateAgoPipe } from '../pipes/DateAgoPipe';
import { RemoveHtml } from '../pipes/RemoveHtml';
import { TimeAgoPipe } from '../pipes/TimeAgoPipe';
import { LoaderComponent } from './loader/loader.component';
import { ChangePasswordComponent } from './change-password/change-password.component';



@NgModule({
  declarations: [ 
    LoginComponent, 
    ForgotPasswordComponent,
    ChangePasswordComponent,
    ResetPasswordComponent,
    AlertComponent,
    MatSpinnerOverlayComponent,
    LogoutComponent,
    SelectCheckAllComponent,
    RemoveHtml,
    DateAgoPipe,
    TimeAgoPipe,
    LoaderComponent
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
  providers: [  ],
  exports: [AlertComponent, SelectCheckAllComponent, DateAgoPipe, RemoveHtml, TimeAgoPipe, LoaderComponent]
})
export class SharedModule { }
export function httpTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http);
}
