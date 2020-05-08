import { Injectable } from '@angular/core';
import {
  ActionOnAlert,
  Alert,
  TypeOfActionOnAlert
} from '../alerts/alerts.typings';
import { handler } from 'rx-handler';
import { from, Observable } from 'rxjs';
import { scan } from 'rxjs/operators';
import { uiId } from '../utils/string.utils';

@Injectable({ providedIn: 'root' })
export class AlertChannelService {
  alertsHandler = handler<ActionOnAlert>();

  alerts$: Observable<Alert[]> = from(this.alertsHandler).pipe(
    scan((alerts: Alert[], action: ActionOnAlert) => {
      switch (action.type) {
        case TypeOfActionOnAlert.remove:
          return alerts.filter(a => a.uiId !== action.payload.id);
        case TypeOfActionOnAlert.add:
          const alert = action.payload.alert;
          alert.uiId = uiId();

          if (alerts.some(alrt => alrt.text === action.payload.alert.text)) {
            return alerts;
          }

          return alerts.concat([alert]);
        default:
          return alerts;
      }
    }, [])
  );

  push(alert: Alert) {
    this.alertsHandler({
      type: TypeOfActionOnAlert.add,
      payload: { alert }
    });
  }

  removeAlert(id: string) {
    this.alertsHandler({
      type: TypeOfActionOnAlert.remove,
      payload: { id: id }
    });
  }
}
