/* This service provides functions for all requests that require an
 authorized user (including logging out) */

import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

const api_url:string = "http://localhost:8000/";
const CSRF_COOKIE:string = "csrftoken";

@Injectable()
export class UserService {

  user:User = new User();
  weights:Weight[] = [];
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

  /* Profile-related methods */////////////////////////////
  getFood(){
    return this.http.get(
      api_url + "api/foods/",
      {headers: this.headers});
  }

  getWeights(){
    this.http.get(
      api_url + "api/weights/",
      {headers: this.headers}
    ).subscribe(
      (response:Weight[]) => {
        this.weights = response;
      },
      (err:HttpErrorResponse) =>{
        console.error(err);
      }
    );
  }

  addWeight(weight:Object){
    return this.http.post(
      api_url + "api/weights/",
      JSON.stringify(weight),
      {headers: this.headers}
    ).subscribe(
      (response:any) => {
        this.weights.push(response);
      },
      (err:HttpErrorResponse) => {
        console.error(err);
      });
  }

  getUser(){
    this.user_loaded = true;
    this.http.get(
      api_url + "api/users/me/",
      {headers: this.headers}
    ).subscribe(
      (user_data:any) => {
        this.user = user_data;
      },
      (err:HttpErrorResponse) => {
        console.error(err);
        if (err.status == 403){
          // Access denied, return to login page
          //window.location.href = window.location.protocol + "//" + window.location.host + "/google/oauth2/?device=browser";
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
      api_url + "api/users/me/",
      userObject,
      {headers: this.headers}
    );
  }

  getResults(date:string){
    return this.http.get(
      api_url + "api/results/me/?date=" + date,
      {headers: this.headers}
    );
  }

  postFood(food:Food, timestamp:string){
    return this.http.post(
      api_url + "api/foods/",
      {
        nix_item_id: food.nix_item_id,
        food_name: food.food_name,
        period: "auto",
        timestamp:timestamp
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

class Food{
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
  constructor(){}
}

interface Weight{
  id:string;
  email:string;
  value:number;
  timestamp:string;  
}