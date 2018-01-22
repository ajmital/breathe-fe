import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-data',
  templateUrl: './user-data.component.html',
  styleUrls: ['./user-data.component.css']
})

export class UserDataComponent implements OnInit {
  user:User = new User();
  editUser:boolean = false;
  userExists:boolean = false;

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
        this.userExists = true;
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

    this.userService.getFood().subscribe((results) => {
      console.log(results);
    });

    this.user = this.userService.user;
  }

  // Posts user details
  setUser(){
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

    let timestamp = date.getFullYear().toString() + "-" + month.toString().padStart(2, "0") + "-" + date.getDate().toString().padStart(2, "0") + 
      "T" + hour.toString() + ":" + date.getMinutes().toString().padStart(2, "0") + 
      ":" + date.getSeconds().toString().padStart(2, "0");
    this.userService.addWeight(weight, timestamp).subscribe((new_weight) =>{
        this.weights.push({email:new_weight["email"], timestamp:new_weight["timestamp"], id:new_weight["id"], value:new_weight["value"], created_on:new_weight["created_on"]});
    },
    (err) => console.log(err)
  );

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