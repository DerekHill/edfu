import { NgModule } from '@angular/core';
import { RemoveUnderscoresPipe } from './pipes/remove-underscores.pipe';
import { HighlightEntryPipe } from './pipes/highlight-entry.pipe';
import { OxIdThesaurusPipe } from './pipes/ox-id-thesaurus.pipe';
import { PlayerComponent } from './components/player/player.component';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './components/modal/modal.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    RemoveUnderscoresPipe,
    HighlightEntryPipe,
    OxIdThesaurusPipe,
    PlayerComponent,
    ModalComponent
  ],
  exports: [
    RemoveUnderscoresPipe,
    HighlightEntryPipe,
    OxIdThesaurusPipe,
    PlayerComponent,
    ModalComponent
  ]
})
export class SharedModule {}
