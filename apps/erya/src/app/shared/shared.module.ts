import { NgModule } from '@angular/core';
import { RemoveUnderscoresPipe } from './pipes/remove-underscores.pipe';
import { HighlightEntryPipe } from './pipes/highlight-entry.pipe';
import { OxIdThesaurusPipe } from './pipes/ox-id-thesaurus.pipe';
import { PlayerComponent } from './components/player/player.component';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './components/modal/modal.component';
import { IdToDatePipe } from './pipes/id-to-date.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [
    RemoveUnderscoresPipe,
    HighlightEntryPipe,
    OxIdThesaurusPipe,
    IdToDatePipe,
    TimeAgoPipe,
    PlayerComponent,
    ModalComponent
  ],
  exports: [
    RemoveUnderscoresPipe,
    HighlightEntryPipe,
    OxIdThesaurusPipe,
    IdToDatePipe,
    PlayerComponent,
    ModalComponent,
    TimeAgoPipe
  ]
})
export class SharedModule {}
