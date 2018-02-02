import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

// Styling module
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { UserDataComponent } from './components/user-data/user-data.component';
import { FoodComponent } from './components/food/food.component';

import { UserService } from './services/user.service';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { MainComponent } from './components/main/main.component';
import { RegisterComponent } from './components/register/register.component';

const appRoutes: Routes = [
  { path: 'welcome', component: LandingPageComponent },
  { path: 'main', component: MainComponent },
  { path: 'register', component: RegisterComponent },
  // Redirect invalid URLs to the welcome page
  { path:'**', redirectTo: 'welcome', }
]

@NgModule({
  declarations: [
    AppComponent,
    UserDataComponent,
    FoodComponent,
    LandingPageComponent,
    MainComponent,
    RegisterComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NgbModule.forRoot(),
    RouterModule.forRoot(appRoutes)
  ],
  providers: [UserService],
  bootstrap: [AppComponent]
})
export class AppModule { }
