import { NgModule } from '@angular/core';
import { RemoveUnderscoresPipe } from './pipes/remove-underscores.pipe';

@NgModule({
  imports: [],
  declarations: [RemoveUnderscoresPipe],
  exports: [RemoveUnderscoresPipe]
})
export class SharedModule {}
