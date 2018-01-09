import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

const api_url:string = "http://localhost:8000/api/";



@Injectable()
export class FoodService {
  
  options:RequestOptions = new RequestOptions(
    {
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": "Token 3293f8cbbe16515a56d77ce352421d26241e80ae"
      })
    }
  );

  constructor(public http:Http) {
  }

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
