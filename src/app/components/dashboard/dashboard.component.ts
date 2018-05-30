import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date-struct';

const now:Date = new Date();


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  minDate:NgbDateStruct = {year: 1900, month:1, day:1};
  maxDate:NgbDateStruct = {year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate()};

  // Date picker model
  datePicker:NgbDateStruct = null;

  // User object used for editing
  user:User = new User();

  // Controls html that is shown
  editUser:boolean = false;
  userExists:boolean = false;
  heightError:boolean = false;

  weights:Weight[] = [];

  constructor(private userService:UserService) {
  }

  ngOnInit() {
    this.userService.getUser().subscribe(
      (user_data:any) => {
        this.user = user_data;
        this.userService.user = this.user;
      },
      err => console.log(err)
    );
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