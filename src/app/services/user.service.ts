/* This service provides functions for all requests that require an
 authorized user */

import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import {Router} from '@angular/router';
import 'rxjs/add/operator/map';
import { ReactiveFormsModule } from '@angular/forms';

const api_url:string = "http://localhost:8000/api/";

@Injectable()
export class UserService {

  user:User = new User();
  user_tok:string = null;
  options:RequestOptions = null;


  
  constructor(private http:Http, private router:Router) {
    this.user_tok = localStorage.getItem('user');
    if (this.user_tok == null){
      this.user_tok = sessionStorage.getItem('user');
    }
    if (this.user_tok == null){
      this.router.navigateByUrl('/welcome');
    }else{
      // Set token header
      this.options = new RequestOptions({
        headers: new Headers({"content-type": "application/json", "Authorization": "Token " + this.user_tok})
      });

    }
  }

  /* Profile-related methods */////////////////////////////
  getFood(){
    return this.http.get(api_url + "foods/", this.options).map(res=> res.json());
  }

  getWeights(){
    return this.http.get(api_url + "weights/", this.options).map(res => res.json()); 
  }

  addWeight(weight:number, time:string){
    return this.http.post(api_url + "weights/", {"email":this.user.email, "value":weight, "timestamp":time}, this.options).map(res => res.json());
  }

  getUser(){
    return this.http.get(api_url + "users/retrieve/", this.options).map(res => res.json());
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

    return this.http.put(api_url + "users/update/", userObject, this.options).map(res => res.json());
  }

  getResults(){
    return this.http.get(api_url + "results/retrieve/", this.options).map(res => res.json());    
  }

  /* Non-profile-related methods *////////////////////////////
  getUPC(upc:string){
    return this.http.post(
      api_url + "nutritionix/upc/",
      {upc: upc},
      this.options
    ).map(res => res.json());
  }

  search(query_string:string){
    return this.http.post(
      api_url + "nutritionix/search/",
      {query: query_string},
      this.options
    ).map(res => res.json());
  }

  getDetails(item_id:string){
    return this.http.post(
      api_url + "nutritionix/item/?nix_item_id=" + item_id,
      {nix_item_id: item_id},
      this.options
    ).map(res => res.json());
  }

  postFood(food:Food, timestamp:string){
    return this.http.post(api_url + "foods/", {
      nix_item_id: food.nix_item_id,
      food_name: food.food_name,
      period: "auto",
      timestamp:timestamp
    }, this.options).map(res => res.json());
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