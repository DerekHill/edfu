import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { GraphQLModule } from './graphql.module';
import { RouterModule, Routes } from '@angular/router';
import { BasicComponent } from './basic/basic.component';
import { BasicModule } from './basic/basic.module';
import { SecondModule } from './second/second.module';
import { SecondComponent } from './second/second.component';

const appRoutes: Routes = [
  { path: 'basic', component: BasicComponent },
  {
    path: 'second',
    component: SecondComponent
  }
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BasicModule,
    SecondModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    BrowserModule,
    HttpClientModule,
    NoopAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    GraphQLModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
