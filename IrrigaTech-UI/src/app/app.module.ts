import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MomentDateModule } from '@angular/material-moment-adapter';
import { MatNativeDateModule } from '@angular/material/core';
import {MatTabsModule} from '@angular/material/tabs'

import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { UserAuthComponent } from './components/user-auth/user-auth.component';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { HomeComponent } from './components/home/home.component';
import { HumidityStatusComponent } from './components/humidity-status/humidity-status.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { IonicModule } from '@ionic/angular';
import { WeatherWidgetMainComponent } from './components/weather-widget-main/weather-widget-main.component';
import { NavbarRwdComponent } from './components/navbar-rwd/navbar-rwd.component';
import { SchedulingComponent } from './components/scheduling/scheduling.component';
import { IrrigationDialogComponent } from './components/irrigation-dialog/irrigation-dialog.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SchedulingHistoryComponent } from './components/scheduling-history/scheduling-history.component';





@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UserAuthComponent,
    HomeComponent,
    HumidityStatusComponent,
    NavbarComponent,
    WeatherWidgetMainComponent,
    NavbarRwdComponent,
    SchedulingComponent,
    IrrigationDialogComponent,
    DashboardComponent,
    SchedulingHistoryComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatGridListModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right'
    }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    BrowserModule,
    IonicModule.forRoot(),
    
    
  ],
  providers: [
    HttpClient,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }, //hooking up our interceptor to modules
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
