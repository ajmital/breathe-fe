import { Component, OnInit } from '@angular/core';
import { FoodService } from '../../services/food.service';

@Component({
  selector: 'app-food',
  templateUrl: './food.component.html',
  styleUrls: ['./food.component.css']
})
export class FoodComponent implements OnInit {

  food_query:Food[] = [];

  constructor(private foodService:FoodService) {
  }

  ngOnInit() {
  }

  search(query:string){
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
    });
  }
  
  getDetails(item_id:string){
    this.foodService.getDetails(item_id).subscribe((results) =>{
      console.log(results);
    });
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