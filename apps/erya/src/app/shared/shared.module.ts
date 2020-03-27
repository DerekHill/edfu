import { NgModule } from '@angular/core';
import { RemoveUnderscoresPipe } from './pipes/remove-underscores.pipe';
import { HighlightEntryPipe } from './pipes/highlight-entry.pipe';

@NgModule({
  imports: [],
  declarations: [RemoveUnderscoresPipe, HighlightEntryPipe],
  exports: [RemoveUnderscoresPipe, HighlightEntryPipe]
})
export class SharedModule {}
