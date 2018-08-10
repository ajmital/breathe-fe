/* This service provides functions for all requests that require an
 authorized user (including logging out) */

import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import 'rxjs/add/operator/shareReplay';

const CSRF_COOKIE:string = "csrftoken";

@Injectable()
export class UserService {


  subscriptionStatus:string = null;
  
  user:User = new User();
  user_loaded:boolean = false;
  csrf_tok:string = null;
  headers:HttpHeaders = null;

  
  constructor(private http:HttpClient) {
    let ca:Array<String> = document.cookie.split(';');

    for (let i:number = 0; i < ca.length; i += 1){
      if (ca[i].indexOf(CSRF_COOKIE) == 0){
        if (this.csrf_tok){ // If duplicates, retry
          this.redirectToLogin();
        }
        this.csrf_tok = ca[i].substring(CSRF_COOKIE.length + 1);
      }
    }

    // Redirect to login if no CSRF token found
    if (this.csrf_tok == null){
      this.redirectToLogin();
    }
      // Set token header
    this.headers = new HttpHeaders({"content-type": "application/json", "X-CSRFToken": this.csrf_tok});
  }

  /* Login redirect *///////////
  redirectToLogin(){
    window.location.href = "/google/oauth2/?device=browser";
  }

  logout(){
    /* Slice CSRF token and redirect to login */
    /* Why is there not a logout endpoint on the server to clear its session? */
    document.cookie = CSRF_COOKIE + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/fe;";
    document.cookie = CSRF_COOKIE + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    this.redirectToLogin();
  }

  /* Profile-related methods */////////////////////////////
  getFood(){
    return this.http.get(
      "/api/foods/",
      {headers: this.headers}).shareReplay();
  }

  getFoodByDate(date:string){
    return this.http.get(
      "/api/foods/?date=" + date,
      {headers: this.headers}).shareReplay();
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
    ).shareReplay();
  }

  getWeights(){
    return this.http.get(
      "/api/weights/",
      {headers: this.headers}
    ).shareReplay();
  }

  addWeight(weight:Object){
    let addRequest = this.http.post(
      "/api/weights/",
      JSON.stringify(weight),
      {headers: this.headers}
    ).shareReplay();
    addRequest.subscribe(
      (response:any) => {
      },
      (err:HttpErrorResponse) => {
        console.error(err);
    });

    return addRequest;
  }

  getUser(){
    this.user_loaded = false;
    let request = this.http.get(
      "/api/users/me/",
      {headers: this.headers}
    ).shareReplay();
    request.subscribe(
      (user_data:any) => {
        this.user = user_data;
        this.user_loaded = true;
      },
      (err:HttpErrorResponse) => {
        console.error(err);
        if (err.status == 403){
          // Access denied, return to login page
          this.redirectToLogin();
        }
      }
    );
    return request;
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
      birth_year: this.user.birth_year,
      weight_goal: this.user.weight_goal,
      eula: this.user.eula,
      eula_date: this.user.eula_date
    };

    return this.http.put(
      "/api/users/me/",
      userObject,
      {headers: this.headers}
    ).shareReplay();
  }

  getResults(date:string){
    return this.http.get(
      "/api/results/me/?date=" + date,
      {headers: this.headers}
    ).shareReplay();
  }

}

// Class definitions
export class User{
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