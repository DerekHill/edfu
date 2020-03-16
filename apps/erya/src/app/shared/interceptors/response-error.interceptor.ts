// Partner to idea of ResponseSuccess & ResponseError per:
// https://github.com/marcomelilli/nestjs-email-authentication/blob/master/src/common/dto/response.dto.ts
// Not sure if this is best way to go, or best way to handle these errors
// Might be better to do at component level
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseErrorInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      map((res: any) => {
        if (res && res.body && res.body.success === false) {
          console.warn('ResponseError', res.body.message);
        }
        return res;
      })
    );
  }
}
