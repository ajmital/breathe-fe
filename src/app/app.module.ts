import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Styling module
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

// Charting module
import {NgxChartsModule} from '@swimlane/ngx-charts';


import { AppComponent } from './app.component';
import { FoodComponent } from './components/food/food.component';

import { UserService } from './services/user.service';
import {FoodService} from './services/food.service';

import { MainComponent } from './components/main/main.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProgressComponent } from './components/progress/progress.component';
import { SettingsComponent } from './components/settings/settings.component';

/*const appRoutes: Routes = [
  { path: 'welcome', component: LandingPageComponent },
  { path: 'main', component: MainComponent },
  {path: 'food', component: FoodComponent},
  { path: 'register', component: RegisterComponent },
  { path: 'post-register', component: PostRegisterComponent },
  // Redirect invalid URLs to the welcome page
  { path:'**', redirectTo: 'main', }
]*/

@NgModule({
  declarations: [
    AppComponent,
    FoodComponent,
    MainComponent,
    DashboardComponent,
    ProgressComponent,
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
  providers: [UserService, FoodService],
  bootstrap: [AppComponent]
})
export class AppModule { }
