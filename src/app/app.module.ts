import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

// Styling module
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { UserDataComponent } from './components/user-data/user-data.component';
import { FoodComponent } from './components/food/food.component';

import { UserService } from './services/user.service';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { MainComponent } from './components/main/main.component';

const appRoutes: Routes = [
  { path: 'welcome', component: LandingPageComponent },
  { path: 'main', component: MainComponent },
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
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    NgbModule.forRoot(),
    RouterModule.forRoot(appRoutes)
  ],
  providers: [UserService],
  bootstrap: [AppComponent]
})
export class AppModule { }
