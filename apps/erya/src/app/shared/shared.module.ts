import { NgModule } from '@angular/core';
import { RemoveUnderscoresPipe } from './pipes/remove-underscores.pipe';
import { HighlightEntryPipe } from './pipes/highlight-entry.pipe';
import { OxIdThesaurusPipe } from './pipes/ox-id-thesaurus.pipe';
import { PlayerComponent } from './components/player/player.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule],
  declarations: [
    RemoveUnderscoresPipe,
    HighlightEntryPipe,
    OxIdThesaurusPipe,
    PlayerComponent
  ],
  exports: [
    RemoveUnderscoresPipe,
    HighlightEntryPipe,
    OxIdThesaurusPipe,
    PlayerComponent
  ]
})
export class SharedModule {}
