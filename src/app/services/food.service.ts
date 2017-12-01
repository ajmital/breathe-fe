import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

const api_url:string = "http://localhost/cgi-bin/";

@Injectable()
export class FoodService {

  constructor(public http:Http) {
  }

  getUPC(upc:string){
    return this.http.post(api_url + "upc.py", {upc: upc}).map(res => res.json());
  }

  search(query_string:string){
    return this.http.post(api_url + "search.py", {query: query_string}).map(res => res.json());
  }

  getDetails(item_id:string){
    return this.http.post(api_url + "detail.py", {nix_item_id: item_id}).map(res => res.json());
  }

  postFood(food:Food, email:string){
    return this.http.post(api_url + "foods.py", {
      email: email,
      brand_name: food.brand_name,
      total_fiber: food.total_fiber,
      timestamp: food.timestamp,
      serving_quantity: food.serving_quantity,
      carbohydrates: food.carbohydrates,
      fat: food.fat,
      nix_item: food.nix_item,
      food_name: food.food_name,
      sugar: food.sugar,
      quantity: food.quantity,
      calories: food.calories,
      water: food.water,
      period: food.period,
      nix_item_id: food.nix_item_id,
      created_on: food.created_on,
      thumbnail: food.thumbnail,
      serving_unit: food.serving_unit,
      protein: food.protein
    }).map(res => res.json());
  }
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
