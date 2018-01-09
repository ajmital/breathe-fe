import { Component, OnInit } from '@angular/core';
import { FoodService } from '../../services/food.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-food',
  templateUrl: './food.component.html',
  styleUrls: ['./food.component.css']
})
export class FoodComponent implements OnInit {

  food_query:Food[] = [];
  food_detail:Food = new Food();
  detail_exists = false;
  is_searching = false;

  constructor(private foodService:FoodService, private userService:UserService) {
  }

  ngOnInit() {
  }

  search(query:string){
    this.is_searching = true;
    this.foodService.search(query).subscribe((results) => {
      if (results["branded"] != null){
        results["branded"].forEach(element => {
          let new_food:Food = new Food();
          new_food.brand_name = element["brand_name"];
          new_food.food_name = element["food_name"];
          new_food.nix_item_id = element["nix_item_id"];
          new_food.thumbnail = element["photo"]["thumb"];
          this.food_query.push(new_food);
        });
      }

      if (results["common"] != null){
        results["common"].forEach(element => {
          let new_food:Food = new Food();
          new_food.brand_name = "";
          new_food.food_name = element["food_name"];
          new_food.nix_item_id = "";
          new_food.thumbnail = element["photo"]["thumb"];
          this.food_query.push(new_food);
        });
      }
      this.is_searching = false;
    });
  }
  
  getDetails(item_id:string){
    this.foodService.getDetails(item_id).subscribe((results) =>{
      if (results["brand_name"] != null){
        this.food_detail.brand_name = results["brand_name"];
      }
      this.food_detail.total_fiber = results["nf_dietary_fiber"];
      this.food_detail.serving_quantity = results["serving_qty"];
      this.food_detail.carbohydrates = results["nf_total_carbohydrate"];
      this.food_detail.fat = results["nf_total_fat"];
      this.food_detail.nix_item = results["nix_item_name"];
      this.food_detail.food_name = results["food_name"];
      this.food_detail.sugar = results["nf_sugars"];
      this.food_detail.calories = results["nf_calories"];
      this.food_detail.nix_item_id = results["nix_item_id"];
      this.food_detail.thumbnail = results["photo"]["thumb"];
      this.food_detail.serving_unit = results["serving_unit"];
      this.food_detail.protein = results["nf_protein"];
      this.food_detail.quantity = 1;
      this.food_detail.water = 0;
      this.detail_exists = true;
    });
  }

  // TODO, allow user to select time
  addFood(){
    let date:Date = new Date();
    let month = date.getMonth() + 1;
    let hour = date.getHours();

    let timestamp = date.getFullYear().toString() + "-" + month.toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0") + 
    "T" + hour.toString() + ":" + date.getMinutes().toString().padStart(2, "0");

    this.foodService.postFood(this.food_detail, timestamp).subscribe((results) => {
      console.log(results);
    });
  }

// End class
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

interface User{
  email:string;
  weight:number;
  gender:string;
  age:number;
  height:number;
  full_name:string;
  birth_month:number;
  birth_year:number;
  maintain:number;
  gradual:number;
  moderate:number;
  aggressive:number;
  co2:number;
}