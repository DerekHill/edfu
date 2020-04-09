import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GraphQLModule } from './graphql.module';
import { RouterModule, Routes } from '@angular/router';
import { ContributeComponent } from './contribute/contribute.component';
import { ContributeModule } from './contribute/contribute.module';
import { SearchModule } from './search/search.module';
import { SearchComponent } from './search/search.component';
import { HotkeyModule } from 'angular2-hotkeys';
import { NavbarModule } from './navbar/navbar.module';
import { LoginComponent } from './login/login.component';
import { LoginModule } from './login/login.module';
import { JwtInterceptor } from './shared/interceptors/jwt.interceptor';
import { HttpErrorInterceptor } from './shared/interceptors/http-error.interceptor';
import { AuthGuard } from './auth/auth.guard';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { ResponseErrorInterceptor } from './shared/interceptors/response-error.interceptor';
import { SEARCH_COMPONENT_PATH } from './constants';
import { SyncServerVersionInterceptor } from './shared/interceptors/sync-server-version.interceptor';

const appRoutes: Routes = [
  {
    path: `${SEARCH_COMPONENT_PATH}/:oxIdLower`,
    component: SearchComponent
  },
  {
    path: SEARCH_COMPONENT_PATH,
    component: SearchComponent
  },
  {
    path: 'contribute',
    component: ContributeComponent,
    canActivate: [AuthGuard]
  },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: `/${SEARCH_COMPONENT_PATH}`, pathMatch: 'full' },
  {
    path: '**',
    redirectTo: `/${SEARCH_COMPONENT_PATH}`
  }
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
    HotkeyModule.forRoot(),
    DeviceDetectorModule.forRoot()
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ResponseErrorInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SyncServerVersionInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
