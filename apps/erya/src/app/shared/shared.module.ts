import { NgModule } from '@angular/core';
import { RemoveUnderscoresPipe } from './pipes/remove-underscores.pipe';
import { HighlightEntryPipe } from './pipes/highlight-entry.pipe';
import { OxIdThesaurusPipe } from './pipes/ox-id-thesaurus.pipe';

@NgModule({
  imports: [],
  declarations: [RemoveUnderscoresPipe, HighlightEntryPipe, OxIdThesaurusPipe],
  exports: [RemoveUnderscoresPipe, HighlightEntryPipe, OxIdThesaurusPipe]
})
export class SharedModule {}
