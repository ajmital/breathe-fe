import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date-struct';

const now:Date = new Date();

@Component({
  selector: 'app-food',
  templateUrl: './food.component.html',
  styleUrls: ['./food.component.css']
})
export class FoodComponent implements OnInit {
  period = "Auto";
  food_entries = {"auto": [], "breakfast": [], "lunch":[], "dinner":[], "snack":[]};
  food_query:Food[] = [];
  food_detail:Food = new Food();
  detail_loading = false;
  is_searching = false;
  minDate:NgbDateStruct = {year: 1900, month:1, day:1};
  maxDate:NgbDateStruct = {year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate()};

  // Date picker model
  datePicker:NgbDateStruct = {year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate()};

  constructor(private userService:UserService, private modalService:NgbModal) {
  }

  ngOnInit() {
    // Retrieve user's previous food entries
    this.userService.getFood().subscribe((results) => {
      console.log(this.food_entries);

      for (let i:number= 0; i < results["length"]; i++){
        let new_food:Food = new Food();
        new_food.brand_name = results[i]["brand_name"];
        new_food.food_name = results[i]["food_name"];
        new_food.nix_item_id = results[i]["nix_item_id"];
        new_food.thumbnail = results[i]["thumbnail"];
        new_food.period = results[i]["period"];
        this.food_entries[new_food.period].push(new_food);

      }
    });
  }

  search(query:string){
    // Clear previous search from results
    if (this.food_query.length > 0){
      this.food_query = [];
    }

    // Boolean value used to toggle loading animation
    this.is_searching = true;

    // Search for food
    this.userService.search(query).subscribe(
      results => {
        // Branded results
        if (results["branded"] != null){
          results["branded"].forEach(element => {
            this.pushSearch(element);
          });
        }

        // Common results
        if (results["common"] != null){
          results["common"].forEach(element => {
            this.pushSearch(element);
          });
        }

        // Set to false within subscribe, because this occurs asynchronously
        this.is_searching = false;
      },
      err => {
        console.log(err.body);
        this.is_searching = false;

      }
    );
  }
  
  getDetails(food:Food, modal){
    let item_id = food.nix_item_id;

    // Show loading animation while waiting
    this.detail_loading = true;
    // Open Modal to display details
    this.modalService.open(modal);

    // Retrieve details from the item id for branded foods
    if (food.brand_name){
      this.userService.getDetails(item_id).subscribe(
        (results) =>{
      
          if (results["brand_name"] != null){
            this.food_detail.brand_name = results["brand_name"];
          }
          this.resultToDetail(results);
          // End loading animation
          this.detail_loading = false;
        },
       err => {
         console.log(err.body);
       }
     );
    }else{
      // Lookup common foods by name
      this.userService.getCommon(food.food_name).subscribe(
        results => {
          this.resultToDetail(results);
          this.detail_loading = false;
        },
        err => {
          console.log(err.body);
        }
      );
    }
  }



  addFood(){
    // These two values not useful in calculation, set to current time
    let hour = now.getHours();
    let minutes = now.getMinutes();

    let timestamp = this.datePicker.year.toString() + "-" + this.datePicker.month.toString().padStart(2, "0") + "-" + this.datePicker.day.toString().padStart(2, "0") + 
    "T" + hour.toString() + ":" + minutes.toString().padStart(2, "0");

    this.food_detail.period = this.period.toLowerCase();
    
    this.userService.postFood(this.food_detail, timestamp).subscribe((results) => {
      console.log(results);
    });
  }

    /* Convenience methods to add results to class members *///////////////////
    
    // Converts search for food detail into the food_detail object
    resultToDetail(results){
      this.food_detail.total_fiber = results["nf_dietary_fiber"];
      this.food_detail.serving_quantity = results["serving_qty"];
      this.food_detail.carbohydrates = results["nf_total_carbohydrate"];
      this.food_detail.fat = results["nf_total_fat"];
      this.food_detail.nix_item = results["nix_item_name"];
      this.food_detail.food_name = results["food_name"];
      this.food_detail.sugar = results["nf_sugars"];
      this.food_detail.calories = results["nf_calories"];
      this.food_detail.nix_item_id = results["nix_item_id"];
      if (results["photo"]["highres"]){
        this.food_detail.thumbnail = results["photo"]["highres"]; // Note this is not actually thumbnail
      }else{
        this.food_detail.thumbnail = results["photo"]["thumb"];
      }
      this.food_detail.serving_unit = results["serving_unit"];
      this.food_detail.protein = results["nf_protein"];
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
      this.food_query.push(new_food);
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