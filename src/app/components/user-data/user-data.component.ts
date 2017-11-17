import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-data',
  templateUrl: './user-data.component.html',
  styleUrls: ['./user-data.component.css']
})

export class UserDataComponent implements OnInit {
  user:User = {
    email:null,
    weight:null,
    gender:null,
    age:null,
    height:null,
    full_name: null,
    birth_month:null,
    birth_year:null,
    maintain:null,
    gradual:null,
    moderate:null,
    aggressive:null,
    co2:null
  };
  editUser:boolean = false;
  userExists:boolean = false;

  weights:Weight[] = [];

  constructor(private userService:UserService) {

  }

  ngOnInit() {
    this.userService.getUser().subscribe((user_data) => {
      if (user_data["email"]){
        this.userExists = true;
        this.user.email = user_data["email"];
        this.user.weight = user_data["weight"];
        this.user.gender = user_data["gender"];
        this.user.age = user_data["age"];
        this.user.height = user_data["height"];
        this.user.full_name = user_data["full_name"];
        this.user.birth_month = user_data["birth_month"];
        this.user.birth_year = user_data["birth_year"];
      }
    });
    this.userService.getWeights().subscribe((weights) => {
      if (weights["weights"].length > 0){
        weights["weights"].forEach(element => {
            this.weights.push(element);
        });
      }
    });

    this.userService.getResults().subscribe((results) => {
      this.user.maintain = results["maintain"];
      this.user.gradual = results["gradual"];
      this.user.moderate = results["moderate"];
      this.user.aggressive = results["aggressive"];      
      this.user.co2 = results["co2"];
    });

  }

  setUser(){
    let userObject = {
      polynomial_coefficients: "string",
      bearer_token: "string",
      oauth_tokens: "string",
      weight: 210,
      processed_on: "string",
      gender: this.user.gender,
      age: this.user.age,
      token_source: "string",
      last_hr_sync: "string",
      height: this.user.height,
      last_calculations_ran_on: "string",
      token_str: "string",
      authorized: true,
      full_name: this.user.full_name,
      birth_month: this.user.birth_month,
      password: "password",
      email: this.user.email,
      birth_year: this.user.birth_year
    };

    return this.userService.setUser(userObject).subscribe((results) => {
      console.log(results);
    });
  }

  toggleEdit(){
    this.editUser = !this.editUser;
  }

  addWeight(weight:number){
    let date = new Date();
    let month = date.getMonth() + 1;
    let hour = date.getHours() + 1;

    let timestamp = date.getFullYear().toString() + "-" + month.toString() + "-" + date.getDay().toString() + 
      "T" + hour.toString() + ":" + date.getMinutes().toString().padStart(2, "0") + 
      ":" + date.getSeconds().toString().padStart(2, "0") + "." + date.getMilliseconds().toString();
    this.userService.addWeight(this.user.email, weight, timestamp).subscribe((status) =>{
        console.log(status);
    });

    this.weights.push({email:this.user.email, value:weight, timestamp:timestamp});
    return false;
  }

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

interface Weight{
  email:string;
  timestamp:string;
  value:number;
}