import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { UserDataComponent } from './components/user-data/user-data.component';
import { FoodComponent } from './components/food/food.component';

import { UserService } from './services/user.service';
import { FoodService } from './services/food.service';

@NgModule({
  declarations: [
    AppComponent,
    UserDataComponent,
    FoodComponent,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
  ],
  providers: [UserService, FoodService],
  bootstrap: [AppComponent]
})
export class AppModule { }
