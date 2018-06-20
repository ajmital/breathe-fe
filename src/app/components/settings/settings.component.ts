import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { HttpErrorResponse } from '@angular/common/http';

const now = new Date();

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  isLoading:boolean = false;
  showSuccess:boolean = false;
  birthError:boolean = false; // Controls alert for birth month/year input validation
  heightError:boolean = false;
  weightError:boolean = false;
  hrSync:string = null;
  syncAttempt:string = null;

  tempUser:User = new User();

  constructor(private userService:UserService) { }

  ngOnInit() {
    if (!this.userService.user_loaded){
      this.update();
    }else{
      this.tempUser = this.userService.user;
      this.hrSync = this.timestampToDateString(this.tempUser.last_hr_sync);
      this.syncAttempt = this.timestampToDateString(this.tempUser.last_hr_sync_attempt);
    }
  }

  save(){
    this.isLoading = true;
    this.birthError = false;
    this.heightError = false;
    this.weightError = false;
    // Input validation
    if (!this.tempUser.birth_month ||
      this.tempUser.birth_month < 1 || this.tempUser.birth_month > 12 ||
      !Number.isInteger(this.tempUser.birth_month) ||
      !this.tempUser.birth_year ||
      this.tempUser.birth_year > now.getFullYear() || this.tempUser.birth_year < 1900 ||
      !Number.isInteger(this.tempUser.birth_year)
    ){
      this.birthError = true;
    }

    if (!this.tempUser.inches){
      this.tempUser.inches = 0;
    }

    if (!this.tempUser.feet ||
      this.tempUser.feet < 0 ||
      !Number.isInteger(this.tempUser.feet) ||
      !this.tempUser.inches ||
      this.tempUser.inches < 0 || this.tempUser.inches > 11 ||
      !Number.isInteger(this.tempUser.inches)
    ){
      this.heightError = true;
    }

    if (!this.tempUser.weight || this.tempUser.weight < 0){
      this.weightError = true;
    }

    if (this.birthError || this.heightError || this.weightError){
      this.isLoading = false;
      return;
    }

    this.userService.user = this.tempUser;
    this.userService.setUser().subscribe(
      (results) => {
        this.showSuccess = true;
        setTimeout(() => this.showSuccess = false, 5000);
      },
      (err:HttpErrorResponse) => {
        console.error(err);
      },
      () => {
        this.isLoading = false;
      }
    )
  }

  cancel(){
    this.isLoading = true;
    this.birthError = false;
    this.heightError = false;
    this.weightError = false;
    this.update();
  }

  update(){
    this.userService.getUser().subscribe(
      (results:any) => {
        this.tempUser = results;
        this.hrSync = this.timestampToDateString(this.tempUser.last_hr_sync);
        this.syncAttempt = this.timestampToDateString(this.tempUser.last_hr_sync_attempt);
      },
      (err) => {},
      () => {
        this.isLoading = false;
      }
    );
  }

  /* Utility functions */
  timestampToDateString(timestamp:string){
    let index:number = timestamp.indexOf('T');
    let date:string;
    let time:string = '';
    if (index != -1){
      date = timestamp.substring(0, index);
      time = timestamp.substring(index  + 1);
    }else{
      date = timestamp;
    }

    let vals = date.split('-');
    if (vals.length < 3){
      return null;
    }

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

    return vals[1] + '/' + vals[2] + '/' + vals[0] + ' ' + time;
  }

}

// Class definitions
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