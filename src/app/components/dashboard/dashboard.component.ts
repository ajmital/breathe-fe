import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { FoodService } from '../../services/food.service';
import {NgbModal, ModalDismissReasons, NgbActiveModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date-struct';
import { HttpErrorResponse } from '@angular/common/http';

const now:Date = new Date();


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  minDate:NgbDateStruct = {year: 1900, month:1, day:1};
  maxDate:NgbDateStruct = {year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate()};

  // Date picker models
  resultsDate:NgbDateStruct = this.maxDate;
  weightDate:NgbDateStruct = this.maxDate;
  foodDate:NgbDateStruct = this.maxDate;

  // User's food's
  foodList:Food[] = [];

  // Variables for adding a food from the dashboard
  food_detail:Food = new Food();
  modalRef:NgbModalRef = null;
  detail_loading = false;
  period:string = "auto";

  // Current user's results
  result:Result = {id: "", username: "", email: "", timestamp: "", maintain: 0, gradual: 0, moderate: 0, aggressive: 0, training: "", co2: 0};

  // User's goal (varies by user)
  goal:number = 0;

  // Nutrition summary
  sugar:number = 0;
  carbs:number = 0;
  fiber:number = 0;
  protein:number = 0;
  fat:number = 0;
  calories:number = 0;

  weightAddSuccess:boolean = false;

  constructor(private userService:UserService, private foodService:FoodService, private modalService:NgbModal) {
  }

  ngOnInit() {
    // Load user if first time navigation
    if (!this.userService.user_loaded){
      this.userService.getUser();
    }
    // Load results every time (may have changed while on other pages)
    this.getResults();
    this.getFood();
  }

  update(){
    this.getResults();
    this.sugar = 0;
    this.carbs = 0;
    this.fiber = 0;
    this.protein = 0;
    this.fat = 0;
    this.calories = 0;
    this.getFood();
  }

  // Will need to call whenever resultsDate struct is updated
  getResults(){
    this.userService.getResults(this.dateStructToDateString(this.resultsDate)).subscribe(
      (response:any) => {
        this.result = response;
        switch(this.userService.user.weight_goal){
          case "maintain": {
            this.goal = this.result.maintain;
            break;
          }
          case "gradual": {
            this.goal = this.result.gradual;
            break;
          }
          case "moderate": {
            this.goal = this.result.moderate;
            break;
          }
          case "aggressive": {
            this.goal = this.result.aggressive;
            break;
          }
          default: {
            this.goal = this.result.maintain;
            break;
          }

        }

      },
      (err:HttpErrorResponse) => {
        console.error(err);
      }
    );
  }

  addWeight(value:number){
    let weight:Object = {value: value, email: this.userService.user.email, timestamp: this.dateStructToTimestamp(this.weightDate)};
    this.userService.addWeight(weight);
    this.weightAddSuccess = true;
  }

  // Gets food for the results date
  getFood(){
    this.foodList = [];
    this.userService.getFoodByDate(this.dateStructToDateString(this.resultsDate)).subscribe(
      (results:any) => {
        for (let i:number= 0; i < results["length"]; i++){
          let new_food:Food = new Food();
          new_food.brand_name = results[i]["brand_name"];
          new_food.food_name = results[i]["food_name"];
          new_food.nix_item_id = results[i]["nix_item_id"];
          new_food.thumbnail = results[i]["thumbnail"];
          new_food.period = results[i]["period"];
          new_food.calories = +results[i]["calories"];
          new_food.total_fiber = +results[i]["total_fiber"];
          new_food.sugar = +results[i]["sugar"];
          new_food.carbohydrates = +results[i]["carbohydrates"];
          new_food.protein = +results[i]["protein"];
          new_food.fat = +results[i]["fat"];

          this.calories += new_food.calories;
          this.fiber += new_food.total_fiber;
          this.sugar += new_food.sugar;
          this.carbs += new_food.carbohydrates;
          this.protein += new_food.protein;
          this.fat += new_food.fat;

          this.foodList.push(new_food);
        }

      },
      (err:HttpErrorResponse) => {
        console.error(err);
      }
    );
  }

  getDetail(food:Food, modal){
    // Show loading animation while waiting
    this.detail_loading = true;

    this.food_detail = new Food();
    let item_id = food.nix_item_id;
    this.food_detail.food_name = food.food_name;
    this.food_detail.brand_name = null;

    // Open Modal to display details
    this.modalRef = this.modalService.open(modal);

    // Retrieve details from the item id for branded foods
    if (food.nix_item_id){
      this.foodService.getDetails(food.nix_item_id).subscribe(
        (results) =>{
      
          if (results["brand_name"] != null){
            this.food_detail.brand_name = results["brand_name"];
          }
          this.foodToDetail(results);
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
          this.foodToDetail(results);
          this.detail_loading = false;
        },
        (err:HttpErrorResponse) => {
          console.error(err);
        }
      );
    }

  }

  addFood(){
    // These two values not useful in calculation, set to current time
    let hour = now.getHours();
    let minutes = now.getMinutes();

    let timestamp = this.dateStructToTimestamp(this.foodDate);

    console.log(this.period);
    this.food_detail.period = this.period.toLowerCase();
    
    this.userService.postFood(this.food_detail, timestamp).subscribe(
      (results) => {
        this.modalRef.close();
        this.update();
      },
      (err:HttpErrorResponse) => {
        console.error(err);
      }
    );
  }

  /* Utility functions */
  dateStructToDateString(dateStruct:NgbDateStruct){
    return dateStruct.year + "-" + dateStruct.month + "-" + dateStruct.day;
  }

  dateStructToTimestamp(dateStruct:NgbDateStruct){
    return dateStruct.year.toString() + "-" + dateStruct.month.toString().padStart(2, "0") + "-" + dateStruct.day.toString().padStart(2, "0") + 
    "T00:00:00Z";
  }

  // Converts search for food detail into the food_detail object
  foodToDetail(results){
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



}
class User{
  full_name:string;
  email:string;
  username:string;
  birth_year:number;
  birth_month:number;
  gender:string;
  feet:number;
  inches:number;
  weight:number;
  weight_goal:string;
  token_source:string;
  status:string;
  last_hr_sync:string;
  last_hr_sync_attempt:string;
  eula:string;
  eula_date:string;
  constructor(){}
}

interface Result{
  id:string;
  username:string;
  email:string;
  timestamp:string;
  maintain:number;
  gradual:number;
  moderate:number;
  aggressive:number;
  co2:number;
  training:string;
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
  constructor(){};
}