export enum AlertType {
  success = 'is-success',
  info = 'is-info',
  warning = 'is-warning',
  danger = 'is-danger',
  primary = 'is-primary',
  light = 'is-light',
  dark = 'is-dark'
}

export interface Alert {
  uiId?: string;
  type: AlertType;
  text: string;
  dismissible: boolean;
  selfCloseIn?: number;
}

export enum TypeOfActionOnAlert {
  add = 'ADD',
  remove = 'REMOVE'
}

export interface RemoveAlertAction {
  type: TypeOfActionOnAlert.remove;
  payload: { id: string };
}

export interface AddAlertAction {
  type: TypeOfActionOnAlert.add;
  payload: { alert: Alert };
}

export type ActionOnAlert = RemoveAlertAction | AddAlertAction;
