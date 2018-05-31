import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
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


  // Controls html that is shown
  editUser:boolean = false;
  userExists:boolean = false;
  heightError:boolean = false;

  // Current user's results
  result:Result = {id: "", username: "", email: "", timestamp: "", maintain: 0, gradual: 0, moderate: 0, aggressive: 0, training: "", co2: 0};

  // User's goal (varies by user)
  goal:number = 0;

  constructor(private userService:UserService) {
  }

  ngOnInit() {
    // Load user if first time navigation
    if (!this.userService.user_loaded){
      this.userService.getUser();
    }
    // Load results every time (may have changed while on other pages)
    this.getResults();
  }

  // Will need to call whenever resultsDate struct is updated
  getResults(){
    this.userService.getResults(this.resultsDate.year + "-" + this.resultsDate.month + "-" + this.resultsDate.day).subscribe(
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


  dateStructToTimestamp(dateStruct:NgbDateStruct){
    return dateStruct.year.toString() + "-" + dateStruct.month.toString().padStart(2, "0") + "-" + dateStruct.day.toString().padStart(2, "0") + 
    "T00:00:00Z";
  }

  addWeight(value:number){
    let weight:Object = {value: value, email: this.userService.user.email, timestamp: this.dateStructToTimestamp(this.weightDate)};
    this.userService.addWeight(weight);
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

interface Weight{
  id:string;
  email:string;
  value:number;
  timestamp:string;  
}