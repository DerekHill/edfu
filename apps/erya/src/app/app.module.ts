import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { GraphQLModule } from './graphql.module';
import { RouterModule, Routes } from '@angular/router';
import { ContributeComponent } from './contribute/contribute.component';
import { ContributeModule } from './contribute/contribute.module';
import { SearchModule } from './search/search.module';
import { SearchComponent } from './search/search.component';
import { HotkeyModule } from 'angular2-hotkeys';
import { MatButtonModule } from '@angular/material/button';

const appRoutes: Routes = [
  {
    path: 'search',
    component: SearchComponent
  },
  { path: 'contribute', component: ContributeComponent }
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    ContributeModule,
    SearchModule,
    RouterModule.forRoot(
      appRoutes
      //   { enableTracing: true } // <-- debugging purposes only
    ),
    BrowserModule,
    HttpClientModule,
    NoopAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    GraphQLModule,
    HotkeyModule.forRoot()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
