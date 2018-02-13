import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date-struct';

const now:Date = new Date();

@Component({
  selector: 'app-user-data',
  templateUrl: './user-data.component.html',
  styleUrls: ['./user-data.component.css']
})

export class UserDataComponent implements OnInit {
  // Set min/max date for datepicker
  minDate:NgbDateStruct = {year: 1900, month:1, day:1};
  maxDate:NgbDateStruct = {year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate()};

  // Date picker model
  datePicker:NgbDateStruct = null;

  // User object used for editing
  user:User = new User();

  // Feet/inches for user
  feet:number = null;
  inches:number = null;


  // Controls html that is shown
  editUser:boolean = false;
  userExists:boolean = false;
  heightError:boolean = false;

  weights:Weight[] = [];

  constructor(private userService:UserService) {
  }

  ngOnInit() {
    // Retrieves user info
    this.userService.getUser().subscribe((user_data) => {
      if (user_data["email"]){
        this.userService.user.email = user_data["email"];
        this.userService.user.weight = user_data["weight"];
        this.userService.user.gender = user_data["gender"];
        this.userService.user.age = user_data["age"];
        this.userService.user.height = user_data["height"];
        this.userService.user.full_name = user_data["full_name"];
        this.userService.user.birth_month = user_data["birth_month"];
        this.userService.user.birth_year = user_data["birth_year"];
        this.datePicker = {year:this.userService.user.birth_year, month: this.userService.user.birth_month, day: 0};
        this.userExists = true;
        this.inches = this.userService.user.height % 12;
        this.feet = (this.userService.user.height - this.inches) / 12;
      }
    });
    
    // Retrieves list of weights
    this.userService.getWeights().subscribe((weights: any) => {
      this.weights = weights;
      if (weights.length > 0){
        weights.forEach(element => {
            this.weights.push(element);
        });
      }
    });

    // Gets latest results
    this.userService.getResults().subscribe((results) => {
      this.userService.user.maintain = results["maintain"];
      this.userService.user.gradual = results["gradual"];
      this.userService.user.moderate = results["moderate"];
      this.userService.user.aggressive = results["aggressive"];      
      this.userService.user.co2 = results["co2"];
    });

    this.user = this.userService.user;
  }

  // Posts user details
  setUser(){
   this.user.birth_month = this.datePicker.month;
   this.user.birth_year = this.datePicker.year;



    if (this.feet != null && this.inches != null){
      if (this.feet > 0 && this.inches >= 0 && this.inches < 12){
        this.user.height = this.feet * 12 + this.inches;
        this.heightError = false;
      }else{
        this.heightError = true;
      }
    }else{
      this.heightError = true;
    }

    this.userService.user = this.user;
    return this.userService.setUser().subscribe((results) => {
      console.log(results);
    });
  }

  // Toggles the edit form
  toggleEdit(){
    this.editUser = !this.editUser;
  }


  // Adds current weight to database
  addWeight(weight:number){
    let date = new Date();
    let month = date.getMonth() + 1;
    let hour = date.getHours();

    this.userService.user.weight = weight;
    this.user.weight = weight;

    let timestamp = date.getFullYear().toString() + "-" + month.toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0") + 
      "T" + hour.toString() + ":" + date.getMinutes().toString().padStart(2, "0") + 
      ":" + date.getSeconds().toString().padStart(2, "0");
    this.userService.addWeight(weight, timestamp).subscribe(
      (new_weight) =>{
        this.weights.push({email:new_weight["email"], timestamp:new_weight["timestamp"], id:new_weight["id"], value:new_weight["value"], created_on:new_weight["created_on"]});
      },
      (err) => console.log(err)
  );

  this.userService.setUser().subscribe((results) => {
    console.log(results);
  });

    return false;
  }

}

class User{
  email:string;
  weight:number;
  gender:string;
  age:number;
  height:number;
  full_name:string;
  birth_year:number;
  birth_month:number;
  maintain:number;
  gradual:number;
  moderate:number;
  aggressive:number;
  co2:number;
  constructor(){}
}

interface Weight{
  id:string;
  email:string;
  value:number;
  timestamp:string;  
  created_on:string;
}