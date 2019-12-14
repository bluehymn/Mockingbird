import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest
} from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd';

/** Pass untouched request through to the next request handler. */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  server = environment.server;
  constructor(private messageService: NzMessageService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      tap(
        () => {},
        error => {
          // TODO: Handling special exceptions
          let errorMessage = '';
          if (error.error instanceof ErrorEvent) {
            // client-side error
            errorMessage = `Error: ${error.error.message}`;
          } else {
            // server-side error
            errorMessage = `${error.error.error}`;
          }
        }
      )
    );
  }
}
