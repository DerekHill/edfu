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
import { FirstModule } from './first/first.module';
import { FirstComponent } from './first/first.component';

const appRoutes: Routes = [
  {
    path: 'first',
    component: FirstComponent
  },
  { path: 'basic', component: BasicComponent }
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    BasicModule,
    FirstModule,
    RouterModule.forRoot(
      appRoutes
      //   { enableTracing: true } // <-- debugging purposes only
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
