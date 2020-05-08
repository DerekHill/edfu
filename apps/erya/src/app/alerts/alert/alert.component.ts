import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AlertChannelService } from '../alert-channel.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'edfu-alert',
  template: `
    <div
      class="notification is-light"
      [ngClass]="alert.type"
      *ngFor="let alert of alertService.alerts$ | async"
    >
      <button
        class="delete"
        (click)="alertService.removeAlert(alert.uiId)"
      ></button>
      <p>{{ alert.text }}</p>
    </div>
  `,
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent {
  constructor(public alertService: AlertChannelService) {}
}
