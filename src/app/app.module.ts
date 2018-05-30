import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Styling module
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { UserDataComponent } from './components/user-data/user-data.component';
import { FoodComponent } from './components/food/food.component';

import { UserService } from './services/user.service';
import {FoodService} from './services/food.service';

import { MainComponent } from './components/main/main.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProgressComponent } from './components/progress/progress.component';

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
    UserDataComponent,
    FoodComponent,
    MainComponent,
    DashboardComponent,
    ProgressComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NgbModule.forRoot()
  ],
  providers: [UserService, FoodService],
  bootstrap: [AppComponent]
})
export class AppModule { }
