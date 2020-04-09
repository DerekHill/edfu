import { Observable } from 'rxjs';
import {
  HttpEvent,
  HttpEventType,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { NO_VERSION_FOUND, GET_VERSION_REGEX } from '@edfu/api-interfaces';

let localVersion: string;

try {
  localVersion = Array.from(document.scripts)
    .map(x => x.src.match(GET_VERSION_REGEX))
    .find(x => !!x)[0]
    .split('.')[1];
} catch {
  localVersion = NO_VERSION_FOUND;
}

@Injectable()
export class SyncServerVersionInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      map(r => {
        if (r.type === HttpEventType.Response) {
          const remoteVersion =
            r.headers.get('SERVER_VERSION') || NO_VERSION_FOUND;
          if (
            remoteVersion === NO_VERSION_FOUND ||
            localVersion === NO_VERSION_FOUND
          ) {
            return r;
          }

          if (remoteVersion !== localVersion) {
            setTimeout(() => {
              console.log(
                `Reloading to replace SPA version ${localVersion} with ${remoteVersion}...`
              );

              location.reload();
            }, 10000);
          }
        }

        return r;
      })
    );
  }
}
