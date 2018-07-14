import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import 'rxjs/add/operator/shareReplay';

const CSRF_COOKIE:string = "csrftoken";

@Injectable()
export class FoodService {

  csrf_tok:string = null;
  headers:HttpHeaders = null;

  constructor(private http:HttpClient) {
    let ca:Array<String> = document.cookie.split(';');
    for (let i:number = 0; i < ca.length; i += 1){
      if (ca[i].indexOf(CSRF_COOKIE) == 0){
        this.csrf_tok = ca[i].substring(CSRF_COOKIE.length + 1);
      }
    }

    // Set token header (if doesn't exist, UserService will cause a redirect)
    if (this.csrf_tok){
      this.headers = new HttpHeaders({"content-type": "application/json", "X-CSRFToken": this.csrf_tok});
    }
  }

  getUPC(upc:string){
    return this.http.post(
      "/api/nutritionix/upc/",
      {upc: upc},
      {headers: this.headers}
    ).shareReplay();
  }

  search(query_string:string){
    return this.http.post(
      "/api/nutritionix/search/",
      {query: query_string},
      {headers: this.headers}
    ).shareReplay();
  }

  getDetails(item_id:string){
    return this.http.post(
      "/api/nutritionix/item/?nix_item_id=" + item_id,
      {nix_item_id: item_id},
      {headers: this.headers}
    ).shareReplay();
  }

  getCommon(query:string){
    return this.http.post(
      "/api/nutritionix/common/",
      {query: query},
      {headers: this.headers}
    ).shareReplay();
  }

}

export class Food{
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