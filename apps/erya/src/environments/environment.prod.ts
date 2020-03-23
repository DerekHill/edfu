import { Injectable, ErrorHandler } from '@angular/core';
import * as Sentry from '@sentry/browser';
import { PRODUCTION_BASE_URL } from '@edfu/api-interfaces';

Sentry.init({
  dsn: 'https://f4ef035d718e442697134636d64f9b0e@sentry.io/3218798'
});

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor() {}
  handleError(error) {
    const eventId = Sentry.captureException(error.originalError || error);
    throw error; // TODO: remove when scale up
  }
}

export const environment = {
  production: true,
  apiUri: PRODUCTION_BASE_URL,
  providers: [{ provide: ErrorHandler, useClass: SentryErrorHandler }]
};
