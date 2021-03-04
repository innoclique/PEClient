import {
  HttpHandler, HttpHeaderResponse, HttpInterceptor,
  HttpProgressEvent, HttpRequest, HttpResponse, HttpSentEvent, HttpUserEvent
} from '@angular/common/http';
import { LoaderService } from './loader.service';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { PerfAppService } from './perf-app.service';
import { url } from 'inspector';

@Injectable()

// Intercetpts http requests and loads spinner until http request is completed
export class LoaderInterceptor implements HttpInterceptor {
  loginUser: any;

  public constructor(private loaderService: LoaderService, private authService: AuthService, private perfApp: PerfAppService,) {
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpSentEvent | HttpHeaderResponse |
    HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {
   
    // this.loginUser = this.authService.getCurrentUser();
    // console.log(`[${dateStr}] : ${this.loginUser.Email} is accessing ${req.url} from ${window.location.pathname}`);
    var activity = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
    // console.log(`[${dateStr}] : is accessing ${req.url} from ${window.location.href}-${window.location.hostname}`, activity);
    if (req.url.indexOf('useractivity') == -1) {
      if (activity.indexOf('login') == -1) {
        this.loginUser = this.authService.getCurrentUser();
      }
      this.perfApp.route = "log/useractivity";
      this.perfApp.method = "";
      this.perfApp.requestBody = {
        email: this.loginUser ? this.loginUser.Email : '',
        activity: req.url.indexOf('Log_Out')>-1?'logOut':activity,
        url: req.url,
        createdOn: new Date()
      }
      this.perfApp.CallAPI().subscribe(apiResponse => {
        console.log('logged user activity ');
      });
    }

    // Disabled spinner for interval api calls
    if (req.url.indexOf('notifications') == -1 && req.url.indexOf('useractivity') == -1) {
      this.loaderService.show();
    }

    return next.handle(req).pipe(
      finalize(() => this.loaderService.hide())
    );

  }
}

