import { Injectable, ErrorHandler } from '@angular/core';
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'https://f4ef035d718e442697134636d64f9b0e@sentry.io/3218798'
});

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
  constructor() {}
  handleError(error) {
    const eventId = Sentry.captureException(error.originalError || error);
    throw error;
    // Sentry.showReportDialog({ eventId });
  }
}

export const environment = {
  production: true,
  graphqlUri: 'https://edfu.herokuapp.com/graphql',
  providers: [{ provide: ErrorHandler, useClass: SentryErrorHandler }]
};
