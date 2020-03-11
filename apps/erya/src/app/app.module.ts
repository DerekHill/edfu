import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GraphQLModule } from './graphql.module';
import { RouterModule, Routes } from '@angular/router';
import { ContributeComponent } from './contribute/contribute.component';
import { ContributeModule } from './contribute/contribute.module';
import { SearchModule } from './search/search.module';
import { SearchComponent } from './search/search.component';
import { HotkeyModule } from 'angular2-hotkeys';
import { NavbarModule } from './navbar/navbar.module';
import { MatButtonModule } from '@angular/material/button';
import { LoginComponent } from './login/login.component';
import { LoginModule } from './login/login.module';

const appRoutes: Routes = [
  {
    path: 'search/:oxIdLower',
    component: SearchComponent
  },
  {
    path: 'search',
    component: SearchComponent
  },
  { path: 'contribute', component: ContributeComponent },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/search', pathMatch: 'full' }
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    ContributeModule,
    LoginModule,
    SearchModule,
    NavbarModule,
    RouterModule.forRoot(
      appRoutes
      //   { enableTracing: true } // <-- debugging purposes only
    ),
    BrowserModule,
    HttpClientModule,
    NoopAnimationsModule,
    GraphQLModule,
    HotkeyModule.forRoot()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
