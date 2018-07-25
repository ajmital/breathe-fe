import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UserService } from '../../services/user.service';
import {FoodService, Food} from '../../services/food.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date-struct';
import { HttpErrorResponse } from '@angular/common/http';

const now:Date = new Date();

@Component({
  selector: 'app-food',
  templateUrl: './food.component.html',
  styleUrls: ['./food.component.css']
})
export class FoodComponent implements OnInit {

  @Output() cancel = new EventEmitter();
  @Output() showSubscribeMessage = new EventEmitter();

  food_entries = {"breakfast": [], "lunch":[], "dinner":[], "snack":[]};
  periodList:string[] = ["breakfast", "lunch", "dinner", "snack"];
  foodList = {"common": [], "branded": []};
  food_detail:Food = new Food();
  detail_loading = false;
  is_searching = false;

  didSearch:boolean = false; // Did user perform a search yet?

  minDate:NgbDateStruct = {year: 1900, month:1, day:1};
  maxDate:NgbDateStruct = {year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate()};
  modalRef:NgbModalRef = null;

  // Date picker model
  foodDate:NgbDateStruct = {year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate()};

  // Multi-select
  selectedFood:Food[] = [];
  multiSelect:boolean = false;

  constructor(private userService:UserService, private foodService:FoodService, private modalService:NgbModal) {}

  ngOnInit() {}// Allow parent component to call update(), to prevent unecessary initial requests

  update(){
  // Retrieve user's previous food entries
  this.food_entries = {"breakfast": [], "lunch":[], "dinner":[], "snack":[]};

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

  round(x:number){
    return x.toFixed(2);
  }

  /* Is user subscribed */
  isSubscribed(){
    return this.userService.subscriptionStatus === 'active' || this.userService.subscriptionStatus === 'past_due' || this.userService.subscriptionStatus === 'trialing';
  }

  /* Shows message for operations that require a subscription */
  showSubscribe(){
    if (this.modalRef){
      this.modalRef.close();
    }
    this.showSubscribeMessage.emit();
  }

  search(query:string){
    this.didSearch = true;
    // Clear previous search from results
    this.foodList["common"] = [];
    this.foodList["branded"] = [];

    // Boolean value used to toggle loading animation
    this.is_searching = true;

    // Search for food
    this.foodService.search(query).subscribe(
      results => {
        // Branded results
        if (results["branded"] != null){
          results["branded"].forEach(item => {
            this.pushSearch(item, "branded");
          });
        }

        // Common results
        if (results["common"] != null){
          results["common"].forEach(item => {
            this.pushSearch(item, "common");
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
        if (food.period){
          this.food_detail.period = food.period;
        }
        this.detail_loading = false;
      },
      (err:HttpErrorResponse) => {
        console.error(err);
      }
    );
  }

  repeatFood(food:Food, event: MouseEvent){
    event.stopPropagation(); // Prevent parent from receiving click as well
    if (!this.isSubscribed()){
      this.showSubscribe();
      return;
    }

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
    if (!this.isSubscribed()){
      this.showSubscribe();
      return;
    }

    let timestamp:string = this.dateStructToTimestamp(this.foodDate);
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
    this.update();
  }

  addCurrentFood(){
    if (!this.isSubscribed()){
      this.showSubscribe();
      return;
    }

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
  
  /* Resets current date to present, navigates to dashboard */
  cancelEvent(){
    this.foodDate = this.maxDate;
    this.cancel.emit();
  }


  nextDay(){
    let tomorrow:Date = new Date();
    tomorrow.setFullYear(this.foodDate.year);
    tomorrow.setMonth(this.foodDate.month - 1); // Count from 0 vs 1
    tomorrow.setDate(this.foodDate.day + 1);
    if (tomorrow <= now){
      this.foodDate = {year: tomorrow.getFullYear(), month: tomorrow.getMonth() + 1, day: tomorrow.getDate()};
    }
    // Even though the model changed, does not trigger update unless click on calendar
    this.update();
  }

  previousDay(){
    let yesterday:Date = new Date();
    yesterday.setFullYear(this.foodDate.year);
    yesterday.setMonth(this.foodDate.month - 1); // Count from 0 vs 1
    yesterday.setDate(this.foodDate.day - 1);
    this.foodDate = {year: yesterday.getFullYear(), month: yesterday.getMonth() + 1, day: yesterday.getDate()};
    this.update();
  }

  /* Utility methods ******************************/
  stopPropogation(event:MouseEvent){
    event.stopPropagation();
  }

  dateStructToTimestamp(dateStruct:NgbDateStruct){
    return dateStruct.year.toString() + "-" + dateStruct.month.toString().padStart(2, "0") + "-" + dateStruct.day.toString().padStart(2, "0") + 
    "T00:00:00Z";
  }
    
 // Converts search for food detail into breathe food object
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
  
  // Pushes food search results to food_query object
  pushSearch(result, type:string){
    let new_food:Food = new Food();
    new_food.brand_name = result["brand_name"];
    new_food.food_name = result["food_name"];
    new_food.nix_item_id = result["nix_item_id"];
    new_food.thumbnail = result["photo"]["thumb"];
    if (!new_food.thumbnail){
      new_food.thumbnail = "https://d2eawub7utcl6.cloudfront.net/images/nix-apple-grey.png";
    }
    this.foodList[type].push(new_food);
  }

// End class
}