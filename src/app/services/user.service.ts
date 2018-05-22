/* This service provides functions for all requests that require an
 authorized user (including logging out) */

import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

const api_url:string = "http://localhost:8000/";
const CSRF_COOKIE:string = "csrftoken";

@Injectable()
export class UserService {

  user:User = new User();
  csrf_tok:string = null;
  headers:HttpHeaders = null;

  
  constructor(private http:HttpClient) {
    let ca:Array<String> = document.cookie.split(';');
    for (let i:number = 0; i < ca.length; i += 1){
      if (ca[i].indexOf(CSRF_COOKIE) == 0){
        this.csrf_tok = ca[i].substring(CSRF_COOKIE.length + 1);
      }
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

  getCommon(query:string){
    return this.http.post(
      api_url + "api/nutritionix/common/",
      {query: query},
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