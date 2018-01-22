/* This service provides functions for all requests that require an
 authorized user (including logging out) */

import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

const api_url:string = "http://localhost:8000/";

@Injectable()
export class UserService {

  user:User = new User();
  user_tok:string = null;
  headers:HttpHeaders = null;

  
  constructor(private http:HttpClient, private router:Router) {
    this.user_tok = localStorage.getItem('user');
    if (this.user_tok == null){
      this.user_tok = sessionStorage.getItem('user');
    }
    if (this.user_tok == null){
      this.router.navigateByUrl('/welcome');
    }else{
      // Set token header
      this.headers = new HttpHeaders({"content-type": "application/json", "Authorization": "Token " + this.user_tok});
    }
  }

  /* Logout method *////////////////////////////////////
  logout(){
    this.http.post(api_url + "rest-auth/logout/", {headers: this.headers}).subscribe(
      response => {
        // Remove locally stored information
        localStorage.clear();
        sessionStorage.clear();

        // Navigate to the welcome page
        this.router.navigateByUrl('/welcome');
      }
    )
  }

  /* Profile-related methods */////////////////////////////
  getFood(){
    return this.http.get(
      api_url + "api/foods/",
      {headers: this.headers});
  }

  getWeights(){
    return this.http.get(
      api_url + "api/weights/",
      {headers: this.headers}
    );
  }

  addWeight(weight:number, time:string){
    return this.http.post(
      api_url + "api/weights/",
      {"email":this.user.email,"value":weight, "timestamp":time},
      {headers: this.headers}
    );
  }

  getUser(){
    return this.http.get(
      api_url + "api/users/retrieve/",
      {headers: this.headers}
    );
  }

  setUser(){

    let userObject = {
      weight: this.user.weight,
      gender: this.user.gender,
      height: this.user.height,
      full_name: this.user.full_name,
      birth_month: this.user.birth_month,
      email: this.user.email,
      birth_year: this.user.birth_year
    };

    return this.http.put(
      api_url + "api/users/update/",
      userObject,
      {headers: this.headers}
    );
  }

  getResults(){
    return this.http.get(
      api_url + "api/results/retrieve/",
      {headers: this.headers}
    );    
  }

  /* Non-profile-related methods *////////////////////////////
  getUPC(upc:string){
    return this.http.post(
      api_url + "api/nutritionix/upc/",
      {upc: upc},
      {headers: this.headers}
    );
  }

  search(query_string:string){
    return this.http.post(
      api_url + "api/nutritionix/search/",
      {query: query_string},
      {headers: this.headers}
    );
  }

  getDetails(item_id:string){
    return this.http.post(
      api_url + "api/nutritionix/item/?nix_item_id=" + item_id,
      {nix_item_id: item_id},
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
  email:string;
  weight:number;
  gender:string;
  age:number;
  height:number;
  full_name:string;
  birth_year:number;
  birth_month:number;
  maintain:number;
  gradual:number;
  moderate:number;
  aggressive:number;
  co2:number;
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