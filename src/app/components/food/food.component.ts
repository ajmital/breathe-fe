import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import {FoodService} from '../../services/food.service';
import {NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date-struct';
import { HttpErrorResponse } from '@angular/common/http';

const now:Date = new Date();

@Component({
  selector: 'app-food',
  templateUrl: './food.component.html',
  styleUrls: ['./food.component.css']
})
export class FoodComponent implements OnInit {
  food_entries = {"breakfast": [], "lunch":[], "dinner":[], "snack":[]};
  periodList:string[] = ["breakfast", "lunch", "dinner", "snack"];
  foodList:Food[] = [];
  food_detail:Food = new Food();
  detail_loading = false;
  is_searching = false;
  minDate:NgbDateStruct = {year: 1900, month:1, day:1};
  maxDate:NgbDateStruct = {year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate()};
  modalRef:NgbModalRef = null;

  // Date picker model
  foodDate:NgbDateStruct = {year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate()};

  constructor(private userService:UserService, private foodService:FoodService, private modalService:NgbModal) {
  }

  ngOnInit() {
    // Retrieve user's previous food entries
    this.userService.getFood().subscribe((results) => {
      for (let i:number= 0; i < results["length"]; i++){
        let new_food:Food = new Food();
        new_food.brand_name = results[i]["brand_name"];
        new_food.food_name = results[i]["food_name"];
        new_food.nix_item_id = results[i]["nix_item_id"];
        new_food.thumbnail = results[i]["thumbnail"];
        new_food.period = results[i]["period"];
        new_food.calories = (+results[i]["calories"]);
        new_food.total_fiber = (+results[i]["total_fiber"]);
        new_food.sugar = (+results[i]["sugar"]);
        new_food.carbohydrates = (+results[i]["carbohydrates"]);
        new_food.protein = (+results[i]["protein"]);
        new_food.fat = (+results[i]["fat"]);
        new_food.quantity = (+results[i]["quantity"]);
        new_food.serving_unit = results[i]["serving_unit"];
        new_food.serving_quantity = (+results[i]["serving_quantity"]);

        this.food_entries[new_food.period].push(new_food);
      }
    });
  }

  search(query:string){
    // Clear previous search from results
    this.foodList = [];

    // Boolean value used to toggle loading animation
    this.is_searching = true;

    // Search for food
    this.foodService.search(query).subscribe(
      results => {
        // Branded results
        if (results["branded"] != null){
          results["branded"].forEach(item => {
            this.pushSearch(item);
          });
        }

        // Common results
        if (results["common"] != null){
          results["common"].forEach(item => {
            this.pushSearch(item);
          });
        }

        this.is_searching = false;
      },
      (err:HttpErrorResponse) => {
        console.error(err);
        this.is_searching = false;
      }
    );
  }
  
  getDetail(food:Food, modal){
    // Show loading animation while waiting
    this.detail_loading = true;

    this.food_detail = new Food();
    this.food_detail.food_name = food.food_name;
    this.food_detail.period = "auto";
    this.food_detail.brand_name = null;

    // Open Modal to display details
    this.modalRef = this.modalService.open(modal, {size: 'lg'});

    // Retrieve details from the item id for branded foods
    if (food.nix_item_id){
      this.foodService.getDetails(food.nix_item_id).subscribe(
        (results) =>{
      
          if (results["brand_name"] != null){
            this.food_detail.brand_name = results["brand_name"];
          }
          this.resultToDetail(results);
          // End loading animation
          this.detail_loading = false;
        },
       (err:HttpErrorResponse) => {
         console.error(err);
       }
     );
    }else{
      // Lookup common foods by name
      this.foodService.getCommon(food.food_name).subscribe(
        results => {
          this.resultToDetail(results);
          this.detail_loading = false;
        },
        (err:HttpErrorResponse) => {
          console.error(err);
        }
      );
    }
  }

  repeatFood(food:Food, event: MouseEvent){
    event.stopPropagation(); // Prevent parent from receiving click as well
    this.food_detail = new Food();
    this.food_detail.food_name = food.food_name;
    this.food_detail.period = "auto";
    this.food_detail.brand_name = null;

    // Retrieve details from the item id for branded foods
    if (food.nix_item_id){
      this.foodService.getDetails(food.nix_item_id).subscribe(
        (results) =>{
          if (results["brand_name"] != null){
            this.food_detail.brand_name = results["brand_name"];
          }
          this.resultToDetail(results);
          this.food_detail.quantity = food.quantity; // Repeat quantity
          this.addFood();
        },
       (err:HttpErrorResponse) => {
         console.error(err);
       }
     );
    }else{
      // Lookup common foods by name
      this.foodService.getCommon(food.food_name).subscribe(
        results => {
          this.resultToDetail(results);
          this.food_detail.quantity = food.quantity;
          this.addFood();
        },
        (err:HttpErrorResponse) => {
          console.error(err);
        }
      );
    }
  }


  addFood(){
    let timestamp = this.dateStructToTimestamp(this.foodDate);
    
    this.userService.postFood(this.food_detail, timestamp).subscribe(
      (results) => {
        if (this.modalRef){
          this.modalRef.close();
          this.modalRef = null;
        }
      },
      (err:HttpErrorResponse) => {
        console.error(err);
      }
    );
  }
  
  /* Utility methods */
  dateStructToTimestamp(dateStruct:NgbDateStruct){
    return dateStruct.year.toString() + "-" + dateStruct.month.toString().padStart(2, "0") + "-" + dateStruct.day.toString().padStart(2, "0") + 
    "T00:00:00Z";
  }
    
 // Converts search for food detail into the food_detail object
  resultToDetail(results){
    this.food_detail.total_fiber = (+results["nf_dietary_fiber"]);
    this.food_detail.serving_quantity = results["serving_qty"];
    this.food_detail.carbohydrates = (+results["nf_total_carbohydrate"]);
    this.food_detail.fat = (+results["nf_total_fat"]);
    this.food_detail.nix_item = results["nix_item_name"];
    this.food_detail.food_name = results["food_name"];
    this.food_detail.sugar = (+results["nf_sugars"]);
    this.food_detail.calories = (+results["nf_calories"]);
    this.food_detail.nix_item_id = results["nix_item_id"];
    if (results["photo"]["highres"]){
      this.food_detail.thumbnail = results["photo"]["highres"]; // Note this is not actually thumbnail
    }else{
      this.food_detail.thumbnail = results["photo"]["thumb"];
    }
    this.food_detail.serving_unit = results["serving_unit"];
    this.food_detail.protein = (+results["nf_protein"]);
    this.food_detail.quantity = 1;
    this.food_detail.water = 0;
  }
  
  // Pushes food search results to food_query object
  pushSearch(element){
    let new_food:Food = new Food();
    new_food.brand_name = element["brand_name"];
    new_food.food_name = element["food_name"];
    new_food.nix_item_id = element["nix_item_id"];
    new_food.thumbnail = element["photo"]["thumb"];
    if (!new_food.thumbnail){
      new_food.thumbnail = "https://d2eawub7utcl6.cloudfront.net/images/nix-apple-grey.png";
    }
    this.foodList.push(new_food);
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