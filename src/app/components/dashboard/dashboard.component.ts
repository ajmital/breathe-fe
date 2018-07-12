import { Component, OnInit, ViewChild, TemplateRef, Output, EventEmitter } from '@angular/core';
import { UserService } from '../../services/user.service';
import { FoodService } from '../../services/food.service';
import {NgxChartsModule} from '@swimlane/ngx-charts'; // Do not remove this import even if "unused"!
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
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

  // Reference to weight modal
  @ViewChild('weightModal')
  weightModal:TemplateRef<any>;

  @Output() switchToFood = new EventEmitter();

  // User's food's
  foodList = {};
  periodList:string[] = ["breakfast", "lunch", "dinner", "snack"];

  // Variables for adding a food from the dashboard
  food_detail:Food = new Food();
  modalRef:NgbModalRef = null;
  detail_loading = false;
  period:string = "auto";
  multiSelect:boolean = false;
  selectedFood = [];

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

  // Weight chart options
  xLabel:string = "Date";
  yLabel:string = "Weight";

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  weightData = [
    {
      "name":"Weight",
      "series": []
    }
  ];

  latestWeight = {
    "timestamp": "N/A",
    "value": 0
  };

  constructor(private userService:UserService, 
    private foodService:FoodService, 
    private modalService:NgbModal) {
  }

  ngOnInit() {
    // Load user if first time navigation
    if (!this.userService.user_loaded){
      this.userService.getUser();
    }
    // Load results every time (may have changed while on other pages)
    this.update();

  }

  update(){
    this.getResults();
    this.getFood();
    this.getWeights();
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
    this.userService.addWeight(weight).subscribe(
      (results) => {},
      (err) => {},
      () => {
        // Update weights
        this.getWeights();
      }
    );
    this.modalRef.close();
    this.modalRef = null;
  }

  getWeights(){
    this.userService.getWeights().subscribe(
      (results:Weight[]) => {
        this.weightsToChartData(results);
        if (results.length > 0){
          this.latestWeight.timestamp = this.timestampToDateString(results[0].timestamp);
          this.latestWeight.value = results[0].value;
        }else{
          this.latestWeight.timestamp = "N/A"
          this.latestWeight.value = 0;

        }
      },
      (err:HttpErrorResponse) => {
        console.error(err);
        this.latestWeight.timestamp = "N/A"
        this.latestWeight.value = 0;
      },
    );
  }

  weightsToChartData (results:Weight[]) {
    this.weightData[0].series = [];
    for (let i = results.length - 1; i >= 0; i -= 1){    
      this.weightData[0].series.push({
        name: this.timestampToDateString(results[i].timestamp),
        value: results[i].value
      })
    }

    this.weightData = [...this.weightData];
  };

  openWeightModal(){
    this.modalRef = this.modalService.open(this.weightModal, {size: "lg"});
  }

  // Gets food for the results date
  getFood(){
    this.sugar = 0;
    this.carbs = 0;
    this.fiber = 0;
    this.protein = 0;
    this.fat = 0;
    this.calories = 0;
    this.foodList = {"breakfast": [], "lunch": [], "dinner": [], "snack": []};
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
          new_food.quantity = +results[i]["quantity"];
          new_food.serving_unit = results[i]["serving_unit"];
          new_food.serving_quantity = (+results[i]["serving_quantity"]);

          this.calories += new_food.calories;
          this.fiber += new_food.total_fiber;
          this.sugar += new_food.sugar;
          this.carbs += new_food.carbohydrates;
          this.protein += new_food.protein;
          this.fat += new_food.fat;
          this.foodList[new_food.period].push(new_food);
        }
        this.calories = Math.round(this.calories * 10)/10;
        this.fiber = Math.round(this.fiber * 10)/10;
        this.sugar = Math.round(this.sugar * 10)/10;
        this.carbs = Math.round(this.carbs * 10)/10;
        this.protein = Math.round(this.protein * 10)/10;
        this.fat = Math.round(this.fat * 10)/10;

      },
      (err:HttpErrorResponse) => {
        console.error(err);
      }
    );
  }

  getDetail(food:Food, modal){
    // Show loading animation while waiting
    this.detail_loading = true;
    this.food_detail = new Food(); // Prevent displaying old values

    // Open Modal to display details
    this.modalRef = this.modalService.open(modal, {size: 'lg'});
    let request:any;
    // Retrieve details from the item id for branded foods
    if (food.nix_item_id){
      request = this.foodService.getDetails(food.nix_item_id);
    }else{
      // Lookup common foods by name
      request = this.foodService.getCommon(food.food_name);
    }
    request.subscribe(
      (results) => {
        this.food_detail = this.resultToDetail(results);
        this.detail_loading = false;
      },
      (err:HttpErrorResponse) => {
        console.error(err);
      }
    );

  }

  repeatFood(food:Food, event: MouseEvent){
    event.stopPropagation(); // Prevent parent from receiving click as well
    let request:any;
    // Retrieve details from the item id for branded foods
    if (food.nix_item_id){
      request = this.foodService.getDetails(food.nix_item_id);
    }else{
      request = this.foodService.getCommon(food.food_name);
    }
    request.subscribe(
        (results) =>{
          this.food_detail = this.resultToDetail(results);

          this.food_detail.quantity = food.quantity; // Repeat quantity
          this.food_detail.period = food.period;
          this.foodDate = this.maxDate; // Assume repeat for current date
          this.addCurrentFood();
        },
       (err:HttpErrorResponse) => {
         console.error(err);
       }
     );
  }
  
  // Multiselect
  selectFood(e, food:Food){
    e.stopPropagation();
    if (e.target.checked){
      this.selectedFood.push(food);
    }else{
      let index = this.selectedFood.findIndex(
        (value:any, index:number, obj:any[]) => {
          return (value.brand_name === food.brand_name && value.food_name === food.food_name);
        }
      );
      if (index !== -1){
        this.selectedFood.splice(index, 1);
      }
    }

    this.multiSelect = (this.selectedFood.length !== 0);
  }

  // Adds foods from selectedFood
  addSelectedFoods(){
    this.foodDate = this.maxDate;
    let timestamp:string = this.dateStructToTimestamp(this.maxDate);
    while (this.selectedFood.length > 0){
      let currentFood = this.selectedFood.pop();
      let request:any;
      if (currentFood.nix_item_id){
        request = this.foodService.getDetails(currentFood.nix_item_id);
      }else{
        request = this.foodService.getCommon(currentFood.food_name)
      }

      request.subscribe(
          (results) => {
            let food:Food = this.resultToDetail(results);
            food.period = currentFood.period;
            food.quantity = currentFood.quantity;
            this.userService.postFood(food, timestamp).subscribe(
              (results) => {},
              (err:HttpErrorResponse) => {
                console.error(err);
              }
            )
          },
          (err:HttpErrorResponse) => {
            console.error(err);
          }
        );
    }
    // Deselect all checkboxes
    let checkboxes:NodeListOf<HTMLInputElement> = document.getElementsByTagName("input");
    for (let i = 0; i < checkboxes.length; i += 1){
      if (checkboxes[i].type == 'checkbox'){
        checkboxes[i].checked = false;
      }
    }
    this.multiSelect = false;
  }

  addCurrentFood(){
    let timestamp = this.dateStructToTimestamp(this.foodDate);
    
    this.userService.postFood(this.food_detail, timestamp).subscribe(
      (results) => {
        if (this.modalRef){
          this.modalRef.close();
          this.modalRef = null;
        }
        this.update();
      },
      (err:HttpErrorResponse) => {
        console.error(err);
      }
    );
  }

  /* Sends event to parent component (main) to redirect to the food page */
  addFood(){
    this.switchToFood.emit();
  }

  nextDay(){
    let tomorrow:Date = new Date();
    tomorrow.setFullYear(this.resultsDate.year);
    tomorrow.setMonth(this.resultsDate.month - 1); // Count from 0 vs 1
    tomorrow.setDate(this.resultsDate.day + 1);
    if (tomorrow <= now){
      this.resultsDate = {year: tomorrow.getFullYear(), month: tomorrow.getMonth() + 1, day: tomorrow.getDate()};
    }
    // Even though the model changed, does not trigger update unless click on calendar
    this.update();
  }

  previousDay(){
    let yesterday:Date = new Date();
    yesterday.setFullYear(this.resultsDate.year);
    yesterday.setMonth(this.resultsDate.month - 1); // Count from 0 vs 1
    yesterday.setDate(this.resultsDate.day - 1);    
    this.resultsDate = {year: yesterday.getFullYear(), month: yesterday.getMonth() + 1, day: yesterday.getDate()};
    this.update();
  }

  /* Utility functions */////////////

  stopPropogation(event:MouseEvent){
    event.stopPropagation();
  }

  dateStructToDateString(dateStruct:NgbDateStruct){
    return dateStruct.year + "-" + dateStruct.month + "-" + dateStruct.day;
  }

  dateStructToTimestamp(dateStruct:NgbDateStruct){
    return dateStruct.year.toString() + "-" + dateStruct.month.toString().padStart(2, "0") + "-" + dateStruct.day.toString().padStart(2, "0") + 
    "T" + now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0") + ":" + 
    now.getSeconds().toString().padStart(2, "0") + "Z";
  }

  timestampToDateString(timestamp:string){
    if (!timestamp) return "";
    let index:number = timestamp.indexOf('T');
    if (index != -1){
      timestamp = timestamp.substring(0, index);
    }

    let vals = timestamp.split('-');
  
    // Remove 0 padding
    for (let i = 0; i < vals.length; i = i + 1){
      if (vals[i].startsWith('0')){
        vals[i] = vals[i].substring(1);
      }
    }

    // Shorten year
    if (vals[0].length == 4){
      vals[0] = vals[0].substring(2);
    }

    return vals[1] + '/' + vals[2] + '/' + vals[0];

  }

  // Maps fields of nutritionix query to breathe food
  resultToDetail(results){
    let food:Food = new Food();
    food.total_fiber = (+results["nf_dietary_fiber"]);
    food.serving_quantity = results["serving_qty"];
    food.carbohydrates = (+results["nf_total_carbohydrate"]);
    food.fat = (+results["nf_total_fat"]);
    food.nix_item = results["nix_item_name"];
    food.food_name = results["food_name"];
    food.sugar = (+results["nf_sugars"]);
    food.calories = (+results["nf_calories"]);
    food.nix_item_id = results["nix_item_id"];
    if (results["photo"]["highres"]){
      food.thumbnail = results["photo"]["highres"]; // Note this is not actually thumbnail
    }else{
      food.thumbnail = results["photo"]["thumb"];
    }
    food.serving_unit = results["serving_unit"];
    food.protein = (+results["nf_protein"]);
    food.quantity = 1;
    food.water = 0;
    if (results["brand_name"]){
      food.brand_name = results["brand_name"];
    }
    food.period = "auto";

    return food;
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

interface Weight{
  id:string;
  email:string;
  value:number;
  timestamp:string;  
}