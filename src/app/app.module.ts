import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Styling module
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

// Charting module
import {NgxChartsModule} from '@swimlane/ngx-charts';


import { AppComponent } from './app.component';
import { FoodComponent } from './components/food/food.component';

import { UserService } from './services/user.service';
import {FoodService} from './services/food.service';
import {PaymentService} from './services/payment.service';

import { MainComponent } from './components/main/main.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SettingsComponent } from './components/settings/settings.component';

@NgModule({
  declarations: [
    AppComponent,
    FoodComponent,
    MainComponent,
    DashboardComponent,
    SettingsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    NgbModule.forRoot(),
    NgxChartsModule
  ],
  providers: [UserService, FoodService, PaymentService],
  bootstrap: [AppComponent]
})
export class AppModule { }
