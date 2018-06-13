/* This service provides functions for all requests that require an
 authorized user (including logging out) */

import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

const CSRF_COOKIE:string = "csrftoken";
const PAYMENT_URL:string = "#";

@Injectable()
export class UserService {

  user:User = new User();
  user_loaded:boolean = false;
  csrf_tok:string = null;
  headers:HttpHeaders = null;

  
  constructor(private http:HttpClient) {
    let ca:Array<String> = document.cookie.split(';');
    for (let i:number = 0; i < ca.length; i += 1){
      if (ca[i].indexOf(CSRF_COOKIE) == 0){
        this.csrf_tok = ca[i].substring(CSRF_COOKIE.length + 1);
      }
    }

    // Redirect to login if no CSRF token found
    if (this.csrf_tok == null){
      document.location.href = "/fe/";
    }
      // Set token header
    this.headers = new HttpHeaders({"content-type": "application/json", "X-CSRFToken": this.csrf_tok});
  }

  /* Payment redirect *///////
  redirectToPayment(){
    this.http.put(
      "/api/account/token/",
      "",
      {headers: this.headers}).subscribe(
        (results) => {
          window.location.href = PAYMENT_URL;
        },
        (err:HttpErrorResponse) => {
          console.error(err);
        }
      );
  }

  /* Profile-related methods */////////////////////////////
  getFood(){
    return this.http.get(
      "/api/foods/",
      {headers: this.headers});
  }

  getFoodByDate(date:string){
    return this.http.get(
      "/api/foods/?date=" + date,
      {headers: this.headers});
  }

  getWeights(){
    return this.http.get(
      "/api/weights/",
      {headers: this.headers}
    );
  }

  addWeight(weight:Object){
    let addRequest = this.http.post(
      "/api/weights/",
      JSON.stringify(weight),
      {headers: this.headers}
    );
    addRequest.subscribe(
      (response:any) => {
      },
      (err:HttpErrorResponse) => {
        console.error(err);
    });

    return addRequest;
  }

  getUser(){
    this.http.get(
      "/api/users/me/",
      {headers: this.headers}
    ).subscribe(
      (user_data:any) => {
        this.user = user_data;
        this.user_loaded = true;
      },
      (err:HttpErrorResponse) => {
        console.error(err);
        if (err.status == 403){
          // Access denied, return to login page
          window.location.href = window.location.protocol + "//" + window.location.host + "/google/oauth2/?device=browser";
        }
      }
    );
  }

  setUser(){

    let userObject = {
      weight: this.user.weight,
      gender: this.user.gender,
      feet: this.user.feet,
      inches: this.user.inches,
      full_name: this.user.full_name,
      birth_month: this.user.birth_month,
      email: this.user.email,
      birth_year: this.user.birth_year
    };

    return this.http.put(
      "/api/users/me/",
      userObject,
      {headers: this.headers}
    );
  }

  getResults(date:string){
    return this.http.get(
      "/api/results/me/?date=" + date,
      {headers: this.headers}
    );
  }

  postFood(food:Food, timestamp:string){
    return this.http.post(
      "/api/foods/",
      {
        nix_item_id: food.nix_item_id,
        brand_name: food.brand_name,
        food_name: food.food_name,
        thumbnail: food.thumbnail,
        quantity: food.quantity,
        serving_unit: food.serving_unit,
        serving_quantity: food.serving_quantity,

        carbohydrates: food.carbohydrates,
        protein: food.protein,
        fat: food.fat,
        sugar: food.sugar,
        total_fiber: food.total_fiber,
        calories: food.calories,

        period: food.period,
        timestamp:timestamp,
      },
    {headers: this.headers}
    );
  }

}

// Class definitions
class User{
  full_name:string;
  email:string;
  username:string;
  birth_year:number;
  birth_month:number;
  gender:string;
  feet:number;
  inches:number;
  weight:number;
  weight_goal:string;
  token_source:string;
  status:string;
  last_hr_sync:string;
  last_hr_sync_attempt:string;
  eula:string;
  eula_date:string;
  constructor(){}
}

interface Food{
  brand_name:string;
  total_fiber:number;
  timestamp:string;
  serving_quantity:number;
  carbohydrates:number;
  fat:number;
  nix_item:string;
  food_name:string;
  sugar:number;
  quantity:number;
  calories:number;
  water:number;
  period:string;
  nix_item_id:string;
  created_on:string;
  thumbnail:string;
  serving_unit:string;
  protein:number;
}