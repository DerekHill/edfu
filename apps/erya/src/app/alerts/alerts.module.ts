import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertComponent } from './alert/alert.component';
import { AlertChannelService } from './alert-channel.service';

@NgModule({
  imports: [
    // Angular
    CommonModule,

  ],
  declarations: [AlertComponent],
  exports: [AlertComponent]
})
export class AlertsModule {}
