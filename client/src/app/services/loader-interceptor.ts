import {
  HttpHandler, HttpHeaderResponse, HttpInterceptor,
  HttpProgressEvent, HttpRequest, HttpResponse, HttpSentEvent, HttpUserEvent
} from '@angular/common/http';
import { LoaderService } from './loader.service';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Injectable } from '@angular/core';

@Injectable()

// Intercetpts http requests and loads spinner until http request is completed
export class LoaderInterceptor implements HttpInterceptor {
  
  public constructor(private loaderService: LoaderService) {
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpSentEvent | HttpHeaderResponse |
    HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {
    this.loaderService.show();
    return next.handle(req).pipe(
      finalize(() => this.loaderService.hide())
    );

  }
}

